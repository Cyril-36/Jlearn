"""Tests for judging logic, per-user isolation, and submission history."""
import models
from tests.conftest import TestSessionLocal


def _seed_topic_and_question(db):
    topic = models.Topic(id="t1", title="Basics", description="Basics", order=1)
    question = models.Question(
        id="q1",
        topic_id="t1",
        title="Hello World",
        difficulty="Easy",
        problem_statement="Print 'Hello, World!'",
        sample_input="",
        sample_output="Hello, World!",
    )
    tc = models.TestCase(question_id="q1", input_data="", expected_output="Hello, World!", is_hidden=False)
    db.add_all([topic, question, tc])
    db.commit()


def test_submit_success(client, registered_user, auth_headers):
    with TestSessionLocal() as db:
        _seed_topic_and_question(db)

    code = 'public class Solution { public static void main(String[] args) { System.out.println("Hello, World!"); } }'
    res = client.post("/api/submit", json={"question_id": "q1", "code": code}, headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["passed"] == data["total"]


def test_submit_wrong_output(client, registered_user, auth_headers):
    with TestSessionLocal() as db:
        _seed_topic_and_question(db)

    code = 'public class Solution { public static void main(String[] args) { System.out.println("Wrong!"); } }'
    res = client.post("/api/submit", json={"question_id": "q1", "code": code}, headers=auth_headers)
    assert res.status_code == 200
    assert res.json()["success"] is False
    assert res.json()["passed"] == 0


def test_submit_compile_error(client, registered_user, auth_headers):
    with TestSessionLocal() as db:
        _seed_topic_and_question(db)

    code = "this is not valid java"
    res = client.post("/api/submit", json={"question_id": "q1", "code": code}, headers=auth_headers)
    assert res.status_code == 200
    assert res.json()["success"] is False


def test_submit_requires_auth(client):
    code = 'public class Solution { public static void main(String[] args) {} }'
    res = client.post("/api/submit", json={"question_id": "q1", "code": code})
    assert res.status_code == 401


def test_per_user_submission_isolation(client, registered_user, auth_headers):
    """User A should not see user B's submissions."""
    with TestSessionLocal() as db:
        _seed_topic_and_question(db)

    # Register second user
    res2 = client.post("/api/auth/register", json={
        "name": "User B",
        "email": "userb@example.com",
        "password": "password123",
    })
    headers_b = {"Authorization": f"Bearer {res2.json()['access_token']}"}

    code = 'public class Solution { public static void main(String[] args) { System.out.println("Hello, World!"); } }'

    # Submit as user A
    client.post("/api/submit", json={"question_id": "q1", "code": code}, headers=auth_headers)

    # User B should see 0 submissions
    subs_b = client.get("/api/submissions", headers=headers_b)
    assert subs_b.status_code == 200
    assert len(subs_b.json()) == 0

    # User A sees their own submission
    subs_a = client.get("/api/submissions", headers=auth_headers)
    assert len(subs_a.json()) == 1


def test_stats_update_after_solve(client, registered_user, auth_headers):
    with TestSessionLocal() as db:
        _seed_topic_and_question(db)

    code = 'public class Solution { public static void main(String[] args) { System.out.println("Hello, World!"); } }'
    client.post("/api/submit", json={"question_id": "q1", "code": code}, headers=auth_headers)

    stats = client.get("/api/stats", headers=auth_headers)
    assert stats.status_code == 200
    assert stats.json()["problems_solved"] == 1
    assert stats.json()["total_submissions"] == 1


def test_duplicate_solve_not_double_counted(client, registered_user, auth_headers):
    with TestSessionLocal() as db:
        _seed_topic_and_question(db)

    code = 'public class Solution { public static void main(String[] args) { System.out.println("Hello, World!"); } }'
    client.post("/api/submit", json={"question_id": "q1", "code": code}, headers=auth_headers)
    client.post("/api/submit", json={"question_id": "q1", "code": code}, headers=auth_headers)

    stats = client.get("/api/stats", headers=auth_headers)
    # Solved twice but only counted once
    assert stats.json()["problems_solved"] == 1
    assert stats.json()["total_submissions"] == 2


def test_hidden_test_case_output_not_leaked(client, registered_user, auth_headers):
    with TestSessionLocal() as db:
        topic = models.Topic(id="t1", title="Basics", description="", order=1)
        question = models.Question(id="q1", topic_id="t1", title="Q", difficulty="Easy",
                                   problem_statement="", sample_input="", sample_output="ok")
        hidden_tc = models.TestCase(question_id="q1", input_data="", expected_output="secret", is_hidden=True)
        db.add_all([topic, question, hidden_tc])
        db.commit()

    code = 'public class Solution { public static void main(String[] args) { System.out.println("wrong"); } }'
    res = client.post("/api/submit", json={"question_id": "q1", "code": code}, headers=auth_headers)
    details = res.json()["details"]
    for d in details:
        if d.get("hidden"):
            assert d.get("expected") == "HIDDEN"
            assert d.get("actual") == "HIDDEN"
