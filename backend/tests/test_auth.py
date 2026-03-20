"""Tests for authentication endpoints."""


def test_register_success(client):
    res = client.post("/api/auth/register", json={
        "name": "Alice",
        "email": "alice@example.com",
        "password": "securepass",
    })
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["user"]["email"] == "alice@example.com"
    assert data["user"]["is_admin"] is False


def test_register_duplicate_email(client):
    payload = {"name": "Bob", "email": "bob@example.com", "password": "pass1234"}
    client.post("/api/auth/register", json=payload)
    res = client.post("/api/auth/register", json=payload)
    assert res.status_code == 400
    assert "already registered" in res.json()["detail"]


def test_register_short_password(client):
    res = client.post("/api/auth/register", json={
        "name": "Charlie",
        "email": "charlie@example.com",
        "password": "short",
    })
    assert res.status_code == 422  # pydantic validation error


def test_register_empty_name(client):
    res = client.post("/api/auth/register", json={
        "name": "  ",
        "email": "noname@example.com",
        "password": "password123",
    })
    assert res.status_code == 422


def test_login_success(client, registered_user):
    res = client.post("/api/auth/login", json={
        "email": "test@example.com",
        "password": "password123",
    })
    assert res.status_code == 200
    assert "access_token" in res.json()
    assert "refresh_token" in res.json()


def test_login_wrong_password(client, registered_user):
    res = client.post("/api/auth/login", json={
        "email": "test@example.com",
        "password": "wrongpassword",
    })
    assert res.status_code == 401


def test_login_unknown_email(client):
    res = client.post("/api/auth/login", json={
        "email": "nobody@example.com",
        "password": "doesnotmatter",
    })
    assert res.status_code == 401


def test_get_me(client, registered_user, auth_headers):
    res = client.get("/api/auth/me", headers=auth_headers)
    assert res.status_code == 200
    assert res.json()["email"] == "test@example.com"


def test_get_me_unauthenticated(client):
    res = client.get("/api/auth/me")
    assert res.status_code == 401


def test_refresh_token(client, registered_user):
    refresh = registered_user["refresh_token"]
    res = client.post("/api/auth/refresh", json={"refresh_token": refresh})
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    # New refresh token should be different (rotation)
    assert data["refresh_token"] != refresh


def test_refresh_token_replay_rejected(client, registered_user):
    """After rotation, the old refresh token must be rejected."""
    old_refresh = registered_user["refresh_token"]
    client.post("/api/auth/refresh", json={"refresh_token": old_refresh})
    # Replaying old token should fail
    res = client.post("/api/auth/refresh", json={"refresh_token": old_refresh})
    assert res.status_code == 401


def test_logout(client, registered_user, auth_headers):
    refresh = registered_user["refresh_token"]
    res = client.post("/api/auth/logout", json={"refresh_token": refresh})
    assert res.status_code == 200
    # After logout, refresh token should no longer work
    res2 = client.post("/api/auth/refresh", json={"refresh_token": refresh})
    assert res2.status_code == 401
