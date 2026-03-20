import os
import logging
import time
from collections import defaultdict
from datetime import datetime, timezone
from typing import Optional

import httpx
from fastapi import Depends, FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session

import auth
import models
import sandbox
import observability
import email_service
from database import engine, get_db

logger = logging.getLogger("jlearn")

# ─── App ─────────────────────────────────────────────────────────

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="JLearn API")
observability.setup(app)  # JSON logging + Sentry + request middleware

_cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in _cors_origins],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Simple in-memory rate limiter ───────────────────────────────

_rl_store: dict[str, list[float]] = defaultdict(list)


def rate_limit(max_calls: int, window_seconds: int):
    """FastAPI dependency: raise 429 if client exceeds max_calls in window_seconds."""
    def _check(request: Request):
        key = request.client.host if request.client else "unknown"
        now = time.time()
        window_start = now - window_seconds
        calls = _rl_store[key]
        calls[:] = [t for t in calls if t > window_start]
        if len(calls) >= max_calls:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Rate limit exceeded: max {max_calls} requests per {window_seconds}s.",
            )
        calls.append(now)
    return _check


# ─── Request / Response Schemas ──────────────────────────────────

class ExecuteRequest(BaseModel):
    code: str
    test_input: str = ""


class SubmitRequest(BaseModel):
    question_id: str
    code: str
    test_input: str = ""


class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

class VerifyEmailRequest(BaseModel):
    token: str

class TopicCreate(BaseModel):
    id: str
    title: str
    description: str
    difficulty: str = "Beginner"
    order: int = 0


class QuestionCreate(BaseModel):
    id: str
    topic_id: str
    title: str
    difficulty: str
    problem_statement: str
    input_format: str = ""
    output_format: str = ""
    sample_input: str = ""
    sample_output: str = ""
    constraints: str = "Time Limit: 2.0s, Memory: 256MB"


class LessonCreate(BaseModel):
    id: str
    topic_id: str
    title: str
    order: int = 0
    concept: str = ""
    syntax: str = ""
    example_code: str = ""
    expected_output: str = ""
    key_notes: str = ""
    common_mistakes: str = ""


# ─── Auth Endpoints ───────────────────────────────────────────────

@app.post("/api/auth/register")
def register(req: auth.RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == req.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = models.User(
        name=req.name,
        email=req.email,
        hashed_password=auth.hash_password(req.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    logger.info("New user registered: %s (id=%s)", user.email, user.id)

    access_token = auth.create_access_token({"sub": str(user.id)})
    refresh_token = auth.create_refresh_token(db, user.id)
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {"id": user.id, "name": user.name, "email": user.email, "avatar_url": user.avatar_url, "is_admin": user.is_admin},
    }


@app.post("/api/auth/login")
def login(req: auth.LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == req.email).first()
    if not user or not user.hashed_password:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not auth.verify_password(req.password, user.hashed_password):
        logger.warning("Failed login attempt for email: %s", req.email)
        raise HTTPException(status_code=401, detail="Invalid email or password")

    access_token = auth.create_access_token({"sub": str(user.id)})
    refresh_token = auth.create_refresh_token(db, user.id)
    logger.info("User logged in: %s (id=%s)", user.email, user.id)
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {"id": user.id, "name": user.name, "email": user.email, "avatar_url": user.avatar_url, "is_admin": user.is_admin},
    }


@app.post("/api/auth/google")
async def google_login(req: auth.GoogleLoginRequest, db: Session = Depends(get_db)):
    async with httpx.AsyncClient() as client:
        resp = await client.get(f"https://oauth2.googleapis.com/tokeninfo?id_token={req.credential}")

    if resp.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid Google token")

    google_data = resp.json()
    google_id = google_data.get("sub")
    email = google_data.get("email")
    name = google_data.get("name", email.split("@")[0] if email else "User")
    avatar = google_data.get("picture", "")

    user = db.query(models.User).filter(
        (models.User.google_id == google_id) | (models.User.email == email)
    ).first()

    if user:
        if not user.google_id:
            user.google_id = google_id
        if avatar and not user.avatar_url:
            user.avatar_url = avatar
        db.commit()
    else:
        user = models.User(name=name, email=email, google_id=google_id, avatar_url=avatar)
        db.add(user)
        db.commit()
        db.refresh(user)
        logger.info("New Google user: %s (id=%s)", email, user.id)

    access_token = auth.create_access_token({"sub": str(user.id)})
    refresh_token = auth.create_refresh_token(db, user.id)
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": {"id": user.id, "name": user.name, "email": user.email, "avatar_url": user.avatar_url, "is_admin": user.is_admin},
    }


@app.post("/api/auth/refresh")
def refresh_token(req: auth.RefreshRequest, db: Session = Depends(get_db)):
    result = auth.rotate_refresh_token(db, req.refresh_token)
    if not result:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")
    new_refresh_token, user = result
    access_token = auth.create_access_token({"sub": str(user.id)})
    return {
        "access_token": access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer",
    }


@app.post("/api/auth/logout")
def logout(req: auth.RefreshRequest, db: Session = Depends(get_db)):
    record = db.query(models.RefreshToken).filter(models.RefreshToken.token == req.refresh_token).first()
    if record:
        db.delete(record)
        db.commit()
    return {"message": "Logged out"}


@app.post("/api/auth/forgot-password")
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    import secrets
    from datetime import timedelta
    user = db.query(models.User).filter(models.User.email == req.email).first()
    # Always return 200 to avoid email enumeration
    if not user or not user.hashed_password:
        return {"message": "If that email exists, a reset link has been sent."}
    token = secrets.token_urlsafe(32)
    expires = datetime.now(timezone.utc) + timedelta(hours=1)
    db.add(models.PasswordResetToken(user_id=user.id, token=token, expires_at=expires))
    db.commit()
    email_service.send_password_reset(user.email, token)
    return {"message": "If that email exists, a reset link has been sent."}


@app.post("/api/auth/reset-password")
def reset_password(req: ResetPasswordRequest, db: Session = Depends(get_db)):
    if len(req.new_password) < 8:
        raise HTTPException(status_code=422, detail="Password must be at least 8 characters")
    record = db.query(models.PasswordResetToken).filter(
        models.PasswordResetToken.token == req.token,
        models.PasswordResetToken.used == False,
    ).first()
    if not record:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    if record.expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Reset token has expired")
    user = db.query(models.User).filter(models.User.id == record.user_id).first()
    user.hashed_password = auth.hash_password(req.new_password)
    record.used = True
    db.commit()
    logger.info("Password reset for user_id=%s", user.id)
    return {"message": "Password updated successfully"}


@app.post("/api/auth/send-verification")
def send_verification(db: Session = Depends(get_db), user: models.User = Depends(auth.require_auth)):
    import secrets
    if user.email_verified:
        return {"message": "Email already verified"}
    existing = db.query(models.EmailVerification).filter(models.EmailVerification.user_id == user.id).first()
    token = secrets.token_urlsafe(32)
    if existing:
        existing.token = token
        existing.verified = False
    else:
        db.add(models.EmailVerification(user_id=user.id, token=token))
    db.commit()
    email_service.send_verification_email(user.email, token)
    return {"message": "Verification email sent"}


@app.post("/api/auth/verify-email")
def verify_email(req: VerifyEmailRequest, db: Session = Depends(get_db)):
    record = db.query(models.EmailVerification).filter(
        models.EmailVerification.token == req.token,
        models.EmailVerification.verified == False,
    ).first()
    if not record:
        raise HTTPException(status_code=400, detail="Invalid or already used verification token")
    user = db.query(models.User).filter(models.User.id == record.user_id).first()
    user.email_verified = True
    record.verified = True
    db.commit()
    return {"message": "Email verified successfully"}


@app.get("/api/auth/me")
def get_me(user: models.User = Depends(auth.require_auth)):
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "avatar_url": user.avatar_url,
        "is_admin": user.is_admin,
        "email_verified": user.email_verified,
    }


# ─── Topic Endpoints ─────────────────────────────────────────────

@app.get("/api/topics")
def get_topics(db: Session = Depends(get_db), user: Optional[models.User] = Depends(auth.get_current_user)):
    topics = db.query(models.Topic).order_by(models.Topic.order).all()
    if not topics:
        seed_data(db)
        topics = db.query(models.Topic).order_by(models.Topic.order).all()

    if user:
        for topic in topics:
            question_ids = [q.id for q in db.query(models.Question.id).filter(models.Question.topic_id == topic.id).all()]
            if not question_ids:
                topic.progress = 0
                continue
            solved_count = db.query(models.Submission.question_id).filter(
                models.Submission.user_id == user.id,
                models.Submission.question_id.in_(question_ids),
                models.Submission.status == "success",
            ).distinct().count()
            topic.progress = int((solved_count / len(question_ids)) * 100)

    return topics


@app.get("/api/topic/{topic_id}")
def get_topic(topic_id: str, db: Session = Depends(get_db)):
    topic = db.query(models.Topic).filter(models.Topic.id == topic_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    return topic


# ─── Question Endpoints ──────────────────────────────────────────

@app.get("/api/questions/{topic_id}")
def get_questions(topic_id: str, db: Session = Depends(get_db), user: Optional[models.User] = Depends(auth.get_current_user)):
    questions = db.query(models.Question).filter(models.Question.topic_id == topic_id).all()
    if not questions:
        raise HTTPException(status_code=404, detail="Topic not found or contains no questions")

    for q in questions:
        q.status = "Unsolved"
        if user:
            solved = db.query(models.Submission).filter(
                models.Submission.user_id == user.id,
                models.Submission.question_id == q.id,
                models.Submission.status == "success",
            ).first()
            if solved:
                q.status = "Solved"

    return questions


@app.get("/api/question/{question_id}")
def get_question(question_id: str, db: Session = Depends(get_db), user: Optional[models.User] = Depends(auth.get_current_user)):
    question = db.query(models.Question).filter(models.Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    visible_tc = db.query(models.TestCase).filter(
        models.TestCase.question_id == question_id,
        models.TestCase.is_hidden == False,
    ).all()

    q_status = "Unsolved"
    if user:
        solved = db.query(models.Submission).filter(
            models.Submission.user_id == user.id,
            models.Submission.question_id == question_id,
            models.Submission.status == "success",
        ).first()
        if solved:
            q_status = "Solved"

    return {
        "id": question.id,
        "topic_id": question.topic_id,
        "title": question.title,
        "difficulty": question.difficulty,
        "problem_statement": question.problem_statement,
        "input_format": question.input_format,
        "output_format": question.output_format,
        "sample_input": question.sample_input,
        "sample_output": question.sample_output,
        "constraints": question.constraints,
        "status": q_status,
        "test_cases": [{"input": tc.input_data, "expected_output": tc.expected_output} for tc in visible_tc],
    }


# ─── Lesson Endpoints ────────────────────────────────────────────

@app.get("/api/lessons/{topic_id}")
def get_lessons_by_topic(topic_id: str, db: Session = Depends(get_db)):
    lessons = db.query(models.Lesson).filter(models.Lesson.topic_id == topic_id).order_by(models.Lesson.order).all()
    if not lessons:
        seed_lessons(db)
        lessons = db.query(models.Lesson).filter(models.Lesson.topic_id == topic_id).order_by(models.Lesson.order).all()
    return lessons


@app.get("/api/lesson/{lesson_id}")
def get_lesson(lesson_id: str, db: Session = Depends(get_db)):
    lesson = db.query(models.Lesson).filter(models.Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return lesson


@app.post("/api/lesson/{lesson_id}/complete")
def complete_lesson(lesson_id: str, db: Session = Depends(get_db), user: models.User = Depends(auth.require_auth)):
    lesson = db.query(models.Lesson).filter(models.Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    stats = get_or_create_stats(db, user.id)
    stats.lessons_completed += 1
    db.commit()
    return {"message": "Lesson marked as complete", "lesson_id": lesson_id}


# ─── Code Execution ──────────────────────────────────────────────

@app.post("/api/execute")
def execute_code(
    request: ExecuteRequest,
    user: models.User = Depends(auth.require_auth),
    _rl=Depends(rate_limit(max_calls=20, window_seconds=60)),
):
    logger.info("Execute request from user_id=%s", user.id)
    result = sandbox.execute_java_code(request.code, request.test_input)
    return result


@app.post("/api/submit")
def submit_code(
    request: SubmitRequest,
    db: Session = Depends(get_db),
    user: models.User = Depends(auth.require_auth),
    _rl=Depends(rate_limit(max_calls=10, window_seconds=60)),
):
    question = db.query(models.Question).filter(models.Question.id == request.question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    test_cases = db.query(models.TestCase).filter(models.TestCase.question_id == request.question_id).all()
    if not test_cases:
        test_cases = [models.TestCase(input_data=question.sample_input, expected_output=question.sample_output)]

    passed = 0
    total = len(test_cases)
    total_time = 0
    results_detail = []
    first_failure_output = ""

    for i, tc in enumerate(test_cases):
        result = sandbox.execute_java_code(request.code, tc.input_data)
        exec_time = result.get("execution_time_ms", 0)
        total_time += exec_time

        actual_output = result.get("output", "").strip()
        expected_output = tc.expected_output.strip()

        if result.get("success") and actual_output == expected_output:
            passed += 1
            results_detail.append({"case": i + 1, "status": "passed", "time_ms": exec_time})
        else:
            status_str = "error" if not result.get("success") else "failed"
            results_detail.append({
                "case": i + 1,
                "status": status_str,
                "time_ms": exec_time,
                "expected": expected_output if not tc.is_hidden else "HIDDEN",
                "actual": (actual_output if result.get("success") else result.get("output", "")) if not tc.is_hidden else "HIDDEN",
                "hidden": tc.is_hidden,
            })
            if not first_failure_output:
                if not result.get("success"):
                    first_failure_output = result.get("output", "Compilation/Runtime Error")
                elif tc.is_hidden:
                    first_failure_output = f"Test case {i + 1} (hidden) failed."
                else:
                    first_failure_output = f"Test case {i+1} failed.\nExpected:\n{expected_output}\nGot:\n{actual_output}"

    all_passed = passed == total
    output_msg = f"✓ All {total} test cases passed!" if all_passed else f"✗ {passed}/{total} test cases passed.\n\n{first_failure_output}"

    submission = models.Submission(
        user_id=user.id,
        question_id=request.question_id,
        code=request.code,
        status="success" if all_passed else "error",
        output=output_msg,
        execution_time_ms=total_time,
        passed_test_cases=passed,
        total_test_cases=total,
    )
    db.add(submission)

    stats = get_or_create_stats(db, user.id)
    stats.total_submissions += 1

    if all_passed:
        previously_solved = db.query(models.Submission).filter(
            models.Submission.user_id == user.id,
            models.Submission.question_id == request.question_id,
            models.Submission.status == "success",
            models.Submission.id != submission.id,
        ).first()
        if not previously_solved:
            stats.problems_solved += 1

    success_count = db.query(models.Submission).filter(
        models.Submission.user_id == user.id,
        models.Submission.status == "success",
    ).count()
    stats.accuracy = round((success_count / stats.total_submissions) * 100, 1)

    now = datetime.now(timezone.utc)
    if stats.last_active:
        last = stats.last_active.replace(tzinfo=timezone.utc) if stats.last_active.tzinfo is None else stats.last_active
        delta = (now.date() - last.date()).days
        if delta == 1:
            stats.streak = (stats.streak or 0) + 1
        elif delta > 1:
            stats.streak = 1
        # delta == 0 means same day, keep streak
    else:
        stats.streak = 1

    stats.last_active = now
    db.commit()

    logger.info("Submit: user_id=%s question_id=%s passed=%s/%s", user.id, request.question_id, passed, total)

    return {
        "success": all_passed,
        "output": output_msg,
        "execution_time_ms": total_time,
        "passed": passed,
        "total": total,
        "details": results_detail,
        "submission_id": submission.id,
        "question_status": "Solved" if all_passed else "Attempted",
    }


# ─── Stats / Analytics ───────────────────────────────────────────

@app.get("/api/stats")
def get_stats(db: Session = Depends(get_db), user: models.User = Depends(auth.require_auth)):
    stats = get_or_create_stats(db, user.id)
    return {
        "problems_solved": stats.problems_solved,
        "topics_completed": stats.topics_completed,
        "lessons_completed": stats.lessons_completed,
        "total_submissions": stats.total_submissions,
        "accuracy": stats.accuracy,
        "streak": stats.streak,
        "focus_hours": stats.focus_hours,
    }


@app.get("/api/progress")
def get_progress(db: Session = Depends(get_db), user: Optional[models.User] = Depends(auth.get_current_user)):
    topics = db.query(models.Topic).order_by(models.Topic.order).all()
    result = []
    for t in topics:
        question_ids = [q.id for q in db.query(models.Question.id).filter(models.Question.topic_id == t.id).all()]
        total_q = len(question_ids)
        solved_q = 0
        if user and question_ids:
            solved_q = db.query(models.Submission.question_id).filter(
                models.Submission.user_id == user.id,
                models.Submission.question_id.in_(question_ids),
                models.Submission.status == "success",
            ).distinct().count()
        total_l = db.query(models.Lesson).filter(models.Lesson.topic_id == t.id).count()
        result.append({
            "topic_id": t.id,
            "topic_title": t.title,
            "progress": int((solved_q / total_q * 100)) if total_q else 0,
            "total_questions": total_q,
            "solved_questions": solved_q,
            "total_lessons": total_l,
            "completed_lessons": 0,  # per-user lesson tracking not yet implemented
        })
    return result


# ─── Smart Review ─────────────────────────────────────────────────

@app.get("/api/reviews")
def get_reviews(db: Session = Depends(get_db)):
    reviews = db.query(models.ReviewItem).order_by(models.ReviewItem.priority.desc()).all()
    if not reviews:
        seed_reviews(db)
        reviews = db.query(models.ReviewItem).all()
    result = []
    for r in reviews:
        topic = db.query(models.Topic).filter(models.Topic.id == r.topic_id).first()
        result.append({
            "id": r.id,
            "topic_id": r.topic_id,
            "topic_title": topic.title if topic else "Unknown",
            "priority": r.priority,
            "reason": r.reason,
            "question_count": r.question_count,
            "difficulty_mix": r.difficulty_mix,
        })
    return result


# ─── Submission History ───────────────────────────────────────────

@app.get("/api/submissions")
def get_submissions(limit: int = 20, db: Session = Depends(get_db), user: models.User = Depends(auth.require_auth)):
    subs = db.query(models.Submission).filter(
        models.Submission.user_id == user.id,
    ).order_by(models.Submission.submitted_at.desc()).limit(limit).all()
    result = []
    for s in subs:
        q = db.query(models.Question).filter(models.Question.id == s.question_id).first()
        result.append({
            "id": s.id,
            "question_id": s.question_id,
            "question_title": q.title if q else "Unknown",
            "status": s.status,
            "passed_test_cases": s.passed_test_cases,
            "total_test_cases": s.total_test_cases,
            "execution_time_ms": s.execution_time_ms,
            "submitted_at": s.submitted_at.isoformat() if s.submitted_at else None,
        })
    return result


# ─── Admin Endpoints ─────────────────────────────────────────────

@app.get("/api/admin/users")
def admin_list_users(db: Session = Depends(get_db), _: models.User = Depends(auth.require_admin)):
    users = db.query(models.User).all()
    return [{"id": u.id, "name": u.name, "email": u.email, "is_admin": u.is_admin, "created_at": u.created_at} for u in users]


@app.post("/api/admin/topic", status_code=201)
def admin_create_topic(req: TopicCreate, db: Session = Depends(get_db), _: models.User = Depends(auth.require_admin)):
    if db.query(models.Topic).filter(models.Topic.id == req.id).first():
        raise HTTPException(status_code=400, detail="Topic ID already exists")
    topic = models.Topic(**req.model_dump())
    db.add(topic)
    db.commit()
    db.refresh(topic)
    return topic


@app.put("/api/admin/topic/{topic_id}")
def admin_update_topic(topic_id: str, req: TopicCreate, db: Session = Depends(get_db), _: models.User = Depends(auth.require_admin)):
    topic = db.query(models.Topic).filter(models.Topic.id == topic_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    for k, v in req.model_dump().items():
        setattr(topic, k, v)
    db.commit()
    return topic


@app.delete("/api/admin/topic/{topic_id}", status_code=204)
def admin_delete_topic(topic_id: str, db: Session = Depends(get_db), _: models.User = Depends(auth.require_admin)):
    topic = db.query(models.Topic).filter(models.Topic.id == topic_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    db.delete(topic)
    db.commit()


@app.post("/api/admin/question", status_code=201)
def admin_create_question(req: QuestionCreate, db: Session = Depends(get_db), _: models.User = Depends(auth.require_admin)):
    if db.query(models.Question).filter(models.Question.id == req.id).first():
        raise HTTPException(status_code=400, detail="Question ID already exists")
    question = models.Question(**req.model_dump())
    db.add(question)
    db.commit()
    db.refresh(question)
    return question


@app.put("/api/admin/question/{question_id}")
def admin_update_question(question_id: str, req: QuestionCreate, db: Session = Depends(get_db), _: models.User = Depends(auth.require_admin)):
    question = db.query(models.Question).filter(models.Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    for k, v in req.model_dump().items():
        setattr(question, k, v)
    db.commit()
    return question


@app.delete("/api/admin/question/{question_id}", status_code=204)
def admin_delete_question(question_id: str, db: Session = Depends(get_db), _: models.User = Depends(auth.require_admin)):
    question = db.query(models.Question).filter(models.Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    db.delete(question)
    db.commit()


@app.post("/api/admin/lesson", status_code=201)
def admin_create_lesson(req: LessonCreate, db: Session = Depends(get_db), _: models.User = Depends(auth.require_admin)):
    if db.query(models.Lesson).filter(models.Lesson.id == req.id).first():
        raise HTTPException(status_code=400, detail="Lesson ID already exists")
    lesson = models.Lesson(**req.model_dump())
    db.add(lesson)
    db.commit()
    db.refresh(lesson)
    return lesson


@app.delete("/api/admin/lesson/{lesson_id}", status_code=204)
def admin_delete_lesson(lesson_id: str, db: Session = Depends(get_db), _: models.User = Depends(auth.require_admin)):
    lesson = db.query(models.Lesson).filter(models.Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    db.delete(lesson)
    db.commit()


# ─── Helpers ─────────────────────────────────────────────────────

def get_or_create_stats(db: Session, user_id: int) -> models.UserStats:
    stats = db.query(models.UserStats).filter(models.UserStats.user_id == user_id).first()
    if not stats:
        stats = models.UserStats(user_id=user_id, streak=0, focus_hours=0)
        db.add(stats)
        db.commit()
        db.refresh(stats)
    return stats


# ─── Seed Data ────────────────────────────────────────────────────

def seed_data(db: Session):
    import seed
    db.add_all(seed.get_topics())
    db.add_all(seed.get_questions())
    db.commit()
    db.add_all(seed.get_test_cases())
    db.commit()


def seed_lessons(db: Session):
    lessons = [
        models.Lesson(id="l1", topic_id="t1", title="Variables and Data Types", order=1,
            concept="Java is a statically-typed language. Every variable must be declared with a type before use.",
            syntax="int x = 10;\nString name = \"JLearn\";\ndouble pi = 3.14;\nboolean isActive = true;",
            example_code="public class Solution {\n    public static void main(String[] args) {\n        int age = 25;\n        String name = \"Developer\";\n        System.out.println(name + \" is \" + age + \" years old.\");\n    }\n}",
            expected_output="Developer is 25 years old.",
            key_notes="Java has 8 primitive types: byte, short, int, long, float, double, char, boolean.",
            common_mistakes="Forgetting to initialize a variable before use will cause a compile-time error."),
        models.Lesson(id="l2", topic_id="t1", title="Operators and Expressions", order=2,
            concept="Java supports arithmetic, relational, logical, bitwise, and assignment operators.",
            syntax="int sum = a + b;\nboolean result = (a > b) && (c < d);\nint remainder = a % b;",
            example_code="public class Solution {\n    public static void main(String[] args) {\n        int a = 10, b = 3;\n        System.out.println(\"Sum: \" + (a + b));\n        System.out.println(\"Mod: \" + (a % b));\n        System.out.println(\"Equal: \" + (a == b));\n    }\n}",
            expected_output="Sum: 13\nMod: 1\nEqual: false",
            key_notes="The == operator compares primitive values. For objects, use .equals().",
            common_mistakes="Using = instead of == in conditions. Using == for String comparison instead of .equals()."),
        models.Lesson(id="l3", topic_id="t1", title="Input and Output", order=3,
            concept="Java uses Scanner for reading input and System.out for output.",
            syntax="Scanner sc = new Scanner(System.in);\nint n = sc.nextInt();\nSystem.out.println(n);",
            example_code="import java.util.Scanner;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        System.out.print(\"Enter name: \");\n        String name = sc.nextLine();\n        System.out.println(\"Hello, \" + name);\n    }\n}",
            expected_output="Enter name: Dev\nHello, Dev",
            key_notes="Always close Scanner after use to prevent resource leaks.",
            common_mistakes="Mixing nextInt() and nextLine() causes input skipping. Call nextLine() after nextInt() to consume the newline."),
        models.Lesson(id="l4", topic_id="t2", title="If-Else and Switch", order=1,
            concept="Conditional statements allow branching logic based on boolean expressions.",
            syntax="if (condition) { ... } else if (cond2) { ... } else { ... }\nswitch(x) { case 1: ...; break; default: ...; }",
            example_code="public class Solution {\n    public static void main(String[] args) {\n        int score = 85;\n        if (score >= 90) System.out.println(\"A\");\n        else if (score >= 80) System.out.println(\"B\");\n        else System.out.println(\"C\");\n    }\n}",
            expected_output="B",
            key_notes="Switch statements work with int, char, String, and enum types in Java.",
            common_mistakes="Forgetting break in switch cases causes fall-through behavior."),
        models.Lesson(id="l5", topic_id="t2", title="Loops: For, While, Do-While", order=2,
            concept="Loops repeat a block of code while a condition is true.",
            syntax="for (int i = 0; i < n; i++) { ... }\nwhile (condition) { ... }\ndo { ... } while (condition);",
            example_code="public class Solution {\n    public static void main(String[] args) {\n        for (int i = 1; i <= 5; i++) {\n            System.out.print(i + \" \");\n        }\n}\n}",
            expected_output="1 2 3 4 5 ",
            key_notes="Use enhanced for-each loop for iterating arrays: for (int x : arr) {}",
            common_mistakes="Infinite loops from missing increment/decrement. Off-by-one errors with loop bounds."),
        models.Lesson(id="l6", topic_id="t3", title="Classes and Objects", order=1,
            concept="A class is a blueprint for creating objects. Objects are instances of classes with attributes and methods.",
            syntax="class Car {\n    String brand;\n    void display() { ... }\n}\nCar c = new Car();",
            example_code="public class Solution {\n    String brand;\n    int speed;\n\n    void display() {\n        System.out.println(brand + \" at \" + speed + \" km/h\");\n    }\n\n    public static void main(String[] args) {\n        Solution car = new Solution();\n        car.brand = \"Tesla\";\n        car.speed = 200;\n        car.display();\n    }\n}",
            expected_output="Tesla at 200 km/h",
            key_notes="Every Java program must have a main method as the entry point.",
            common_mistakes="Forgetting to instantiate with 'new' keyword results in NullPointerException."),
        models.Lesson(id="l7", topic_id="t3", title="Inheritance", order=2,
            concept="Inheritance allows a class to acquire properties and methods of another class using 'extends'.",
            syntax="class Dog extends Animal {\n    @Override\n    void speak() { ... }\n}",
            example_code="class Animal {\n    void speak() { System.out.println(\"...\"); }\n}\nclass Dog extends Animal {\n    void speak() { System.out.println(\"Woof!\"); }\n}\npublic class Solution {\n    public static void main(String[] args) {\n        Dog d = new Dog();\n        d.speak();\n    }\n}",
            expected_output="Woof!",
            key_notes="Java supports single inheritance only. Use interfaces for multiple inheritance.",
            common_mistakes="Not calling super() in constructor when parent class requires it."),
        models.Lesson(id="l8", topic_id="t3", title="Polymorphism", order=3,
            concept="Polymorphism lets you treat objects of different classes through a common interface.",
            syntax="Animal a = new Dog();\na.speak(); // calls Dog's speak()",
            example_code="class Animal {\n    void speak() { System.out.println(\"...\"); }\n}\nclass Cat extends Animal {\n    void speak() { System.out.println(\"Meow!\"); }\n}\npublic class Solution {\n    public static void main(String[] args) {\n        Animal a = new Cat();\n        a.speak();\n    }\n}",
            expected_output="Meow!",
            key_notes="Method overriding enables runtime polymorphism. Method overloading enables compile-time polymorphism.",
            common_mistakes="Confusing overloading (same name, different params) with overriding (same signature in subclass)."),
        models.Lesson(id="l9", topic_id="t3", title="Abstract Classes and Interfaces", order=4,
            concept="Abstract classes cannot be instantiated. Interfaces define contracts that classes must implement.",
            syntax="abstract class Shape { abstract double area(); }\ninterface Drawable { void draw(); }",
            example_code="abstract class Shape {\n    abstract double area();\n}\nclass Circle extends Shape {\n    double r;\n    Circle(double r) { this.r = r; }\n    double area() { return Math.PI * r * r; }\n}\npublic class Solution {\n    public static void main(String[] args) {\n        Circle c = new Circle(5);\n        System.out.printf(\"%.2f%n\", c.area());\n    }\n}",
            expected_output="78.54",
            key_notes="From Java 8+, interfaces can have default and static methods.",
            common_mistakes="Trying to instantiate an abstract class directly will cause a compile-time error."),
        models.Lesson(id="l10", topic_id="t4", title="ArrayList", order=1,
            concept="ArrayList is a resizable array implementation of the List interface.",
            syntax="ArrayList<String> list = new ArrayList<>();\nlist.add(\"item\");\nlist.get(0);",
            example_code="import java.util.ArrayList;\n\npublic class Solution {\n    public static void main(String[] args) {\n        ArrayList<Integer> nums = new ArrayList<>();\n        nums.add(3); nums.add(1); nums.add(2);\n        java.util.Collections.sort(nums);\n        System.out.println(nums);\n    }\n}",
            expected_output="[1, 2, 3]",
            key_notes="ArrayList allows duplicates and maintains insertion order.",
            common_mistakes="ConcurrentModificationException when modifying a list while iterating with for-each."),
        models.Lesson(id="l11", topic_id="t4", title="HashMap", order=2,
            concept="HashMap stores key-value pairs with O(1) average lookup time.",
            syntax="HashMap<String, Integer> map = new HashMap<>();\nmap.put(\"key\", 1);\nmap.get(\"key\");",
            example_code="import java.util.HashMap;\n\npublic class Solution {\n    public static void main(String[] args) {\n        HashMap<String, Integer> scores = new HashMap<>();\n        scores.put(\"Java\", 95);\n        scores.put(\"Python\", 90);\n        scores.forEach((k, v) -> System.out.println(k + \": \" + v));\n    }\n}",
            expected_output="Java: 95\nPython: 90",
            key_notes="HashMap does not maintain insertion order. Use LinkedHashMap if order matters.",
            common_mistakes="Using mutable objects as keys can cause issues if hashCode changes."),
        models.Lesson(id="l12", topic_id="t4", title="HashSet and Iterators", order=3,
            concept="HashSet stores unique elements. Iterators allow sequential traversal.",
            syntax="HashSet<Integer> set = new HashSet<>();\nset.add(1);\nIterator<Integer> it = set.iterator();",
            example_code="import java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        HashSet<Integer> set = new HashSet<>(Arrays.asList(1, 2, 2, 3, 3));\n        Iterator<Integer> it = set.iterator();\n        while (it.hasNext()) System.out.print(it.next() + \" \");\n    }\n}",
            expected_output="1 2 3 ",
            key_notes="HashSet uses hashCode() and equals() to determine uniqueness.",
            common_mistakes="Assuming HashSet maintains insertion order. It does not."),
        models.Lesson(id="l13", topic_id="t5", title="Try-Catch-Finally", order=1,
            concept="Exception handling prevents program crashes by catching and handling errors gracefully.",
            syntax="try { ... } catch (ExceptionType e) { ... } finally { ... }",
            example_code="public class Solution {\n    public static void main(String[] args) {\n        try {\n            int[] arr = {1, 2, 3};\n            System.out.println(arr[5]);\n        } catch (ArrayIndexOutOfBoundsException e) {\n            System.out.println(\"Error: \" + e.getMessage());\n        } finally {\n            System.out.println(\"Cleanup done.\");\n        }\n    }\n}",
            expected_output="Error: Index 5 out of bounds for length 3\nCleanup done.",
            key_notes="The finally block always executes, even if an exception is thrown.",
            common_mistakes="Catching generic Exception instead of specific exceptions makes debugging harder."),
        models.Lesson(id="l14", topic_id="t5", title="Custom Exceptions", order=2,
            concept="You can create custom exception classes by extending Exception or RuntimeException.",
            syntax="class MyException extends Exception {\n    MyException(String msg) { super(msg); }\n}",
            example_code="class InvalidAgeException extends Exception {\n    InvalidAgeException(String msg) { super(msg); }\n}\npublic class Solution {\n    static void checkAge(int age) throws InvalidAgeException {\n        if (age < 0) throw new InvalidAgeException(\"Age cannot be negative\");\n    }\n    public static void main(String[] args) {\n        try { checkAge(-5); }\n        catch (InvalidAgeException e) { System.out.println(e.getMessage()); }\n    }\n}",
            expected_output="Age cannot be negative",
            key_notes="Checked exceptions must be declared with 'throws'. Unchecked exceptions extend RuntimeException.",
            common_mistakes="Overusing checked exceptions. Use RuntimeException for programming errors."),
        models.Lesson(id="l15", topic_id="t6", title="Reading Files", order=1,
            concept="Java provides BufferedReader and FileReader for efficient file reading.",
            syntax="BufferedReader br = new BufferedReader(new FileReader(\"file.txt\"));\nString line = br.readLine();",
            example_code="import java.io.*;\n\npublic class Solution {\n    public static void main(String[] args) throws IOException {\n        System.out.println(\"Line 1: Hello\");\n        System.out.println(\"Line 2: World\");\n    }\n}",
            expected_output="Line 1: Hello\nLine 2: World",
            key_notes="Always use try-with-resources to auto-close file handles.",
            common_mistakes="Not handling FileNotFoundException when the file path is wrong."),
        models.Lesson(id="l16", topic_id="t6", title="Java Streams API", order=2,
            concept="Streams API (Java 8+) provides functional-style operations on collections.",
            syntax="list.stream().filter(x -> x > 5).map(x -> x * 2).collect(Collectors.toList());",
            example_code="import java.util.*;\nimport java.util.stream.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        List<String> words = Arrays.asList(\"apple\", \"banana\", \"avocado\", \"blueberry\");\n        List<String> result = words.stream()\n            .filter(w -> w.startsWith(\"a\"))\n            .map(String::toUpperCase)\n            .collect(Collectors.toList());\n        System.out.println(result);\n    }\n}",
            expected_output="[APPLE, AVOCADO]",
            key_notes="Streams are lazy: intermediate operations are not executed until a terminal operation is called.",
            common_mistakes="Trying to reuse a stream after a terminal operation. Streams can only be consumed once."),
    ]
    db.add_all(lessons)
    db.commit()


def seed_reviews(db: Session):
    reviews = [
        models.ReviewItem(topic_id="t3", priority="High", reason="Failed 3 test cases related to runtime polymorphism.", question_count=4, difficulty_mix="2 Medium, 2 Hard"),
        models.ReviewItem(topic_id="t4", priority="Medium", reason="Memory limits exceeded in recent input parsing logic.", question_count=2, difficulty_mix="1 Easy, 1 Medium"),
        models.ReviewItem(topic_id="t1", priority="Low", reason="Time since last review > 14 days.", question_count=3, difficulty_mix="3 Easy"),
    ]
    db.add_all(reviews)
    db.commit()
