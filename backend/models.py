from sqlalchemy import Column, Integer, String, Text, ForeignKey, Float, DateTime, Boolean
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=True)  # nullable for Google-only users
    google_id = Column(String, unique=True, nullable=True)
    avatar_url = Column(String, nullable=True)
    is_admin = Column(Boolean, default=False)
    email_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    refresh_tokens = relationship("RefreshToken", back_populates="user", cascade="all, delete-orphan")


class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    token = Column(String, unique=True, index=True, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    used = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class EmailVerification(Base):
    __tablename__ = "email_verifications"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    token = Column(String, unique=True, index=True, nullable=False)
    verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    token = Column(String, unique=True, index=True, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="refresh_tokens")



class Topic(Base):
    __tablename__ = "topics"

    id = Column(String, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String)
    progress = Column(Float, default=0.0)
    difficulty = Column(String, default="Beginner")
    total_lessons = Column(Integer, default=0)
    total_questions = Column(Integer, default=0)
    order = Column(Integer, default=0)

    questions = relationship("Question", back_populates="topic")
    lessons = relationship("Lesson", back_populates="topic")


class Question(Base):
    __tablename__ = "questions"

    id = Column(String, primary_key=True, index=True)
    topic_id = Column(String, ForeignKey("topics.id"))
    title = Column(String, index=True)
    difficulty = Column(String)
    problem_statement = Column(Text)
    input_format = Column(String)
    output_format = Column(String)
    sample_input = Column(Text)
    sample_output = Column(Text)
    constraints = Column(Text, default="Time Limit: 2.0s, Memory: 256MB")
    status = Column(String, default="Unsolved")

    topic = relationship("Topic", back_populates="questions")
    submissions = relationship("Submission", back_populates="question")
    test_cases = relationship("TestCase", back_populates="question")


class TestCase(Base):
    __tablename__ = "test_cases"

    id = Column(Integer, primary_key=True, autoincrement=True)
    question_id = Column(String, ForeignKey("questions.id"))
    input_data = Column(Text, default="")
    expected_output = Column(Text, nullable=False)
    is_hidden = Column(Boolean, default=False)  # hidden test cases not shown to user

    question = relationship("Question", back_populates="test_cases")


class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(String, primary_key=True, index=True)
    topic_id = Column(String, ForeignKey("topics.id"))
    title = Column(String, index=True)
    order = Column(Integer, default=0)
    concept = Column(Text)
    syntax = Column(Text)
    example_code = Column(Text)
    expected_output = Column(Text)
    key_notes = Column(Text)
    common_mistakes = Column(Text)
    completed = Column(Boolean, default=False)

    topic = relationship("Topic", back_populates="lessons")


class Submission(Base):
    __tablename__ = "submissions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    question_id = Column(String, ForeignKey("questions.id"))
    code = Column(Text)
    status = Column(String)  # "success", "error", "timeout"
    output = Column(Text)
    execution_time_ms = Column(Integer)
    passed_test_cases = Column(Integer, default=0)
    total_test_cases = Column(Integer, default=0)
    submitted_at = Column(DateTime, default=datetime.utcnow)

    question = relationship("Question", back_populates="submissions")


class UserStats(Base):
    __tablename__ = "user_stats"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    problems_solved = Column(Integer, default=0)
    topics_completed = Column(Integer, default=0)
    lessons_completed = Column(Integer, default=0)
    total_submissions = Column(Integer, default=0)
    accuracy = Column(Float, default=0.0)
    streak = Column(Integer, default=0)
    focus_hours = Column(Float, default=0.0)
    last_active = Column(DateTime, default=datetime.utcnow)


class ReviewItem(Base):
    __tablename__ = "review_items"

    id = Column(Integer, primary_key=True, autoincrement=True)
    topic_id = Column(String, ForeignKey("topics.id"))
    priority = Column(String)  # "High", "Medium", "Low"
    reason = Column(Text)
    question_count = Column(Integer, default=0)
    difficulty_mix = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
