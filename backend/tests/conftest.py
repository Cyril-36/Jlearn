"""
Shared fixtures for all JLearn backend tests.
Uses an in-memory SQLite DB so tests never touch jlearn.db.
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Override DATABASE_URL before importing app
import os
os.environ["DATABASE_URL"] = "sqlite:///:memory:"
os.environ["JWT_SECRET"] = "test-secret"
os.environ["CORS_ORIGINS"] = "http://localhost:5173"

from database import Base, get_db  # noqa: E402
from main import app, _rl_store    # noqa: E402


TEST_ENGINE = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=TEST_ENGINE)


@pytest.fixture(scope="function", autouse=True)
def reset_db():
    """Re-create all tables before every test, drop after. Also clear rate-limiter state."""
    Base.metadata.create_all(bind=TEST_ENGINE)
    _rl_store.clear()
    yield
    Base.metadata.drop_all(bind=TEST_ENGINE)
    _rl_store.clear()


def override_get_db():
    db = TestSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def registered_user(client):
    """Register a test user and return the auth response JSON."""
    res = client.post("/api/auth/register", json={
        "name": "Test User",
        "email": "test@example.com",
        "password": "password123",
    })
    assert res.status_code == 200
    return res.json()


@pytest.fixture
def auth_headers(registered_user):
    token = registered_user["access_token"]
    return {"Authorization": f"Bearer {token}"}
