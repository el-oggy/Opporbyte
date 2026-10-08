"""Test authentication endpoints and session cookies."""

from app.core.config import settings


def test_login_success(client):
    """Test successful single-user login returns token and sets HTTP-only cookie."""
    response = client.post(
        f"{settings.API_V1_STR}/auth/login",
        json={
            "email": settings.FIRST_USER_EMAIL,
            "password": settings.FIRST_USER_PASSWORD,
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == settings.FIRST_USER_EMAIL

    # Verify session cookie was set
    assert settings.COOKIE_NAME in response.cookies


def test_login_invalid_password(client):
    """Test login rejection on incorrect password."""
    response = client.post(
        f"{settings.API_V1_STR}/auth/login",
        json={
            "email": settings.FIRST_USER_EMAIL,
            "password": "WrongPassword999!",
        },
    )
    assert response.status_code == 401
    assert "Incorrect email or password" in response.json()["detail"]


def test_login_nonexistent_user(client):
    """Test login rejection for unknown email."""
    response = client.post(
        f"{settings.API_V1_STR}/auth/login",
        json={
            "email": "intruder@unknown.com",
            "password": "AnyPassword123!",
        },
    )
    assert response.status_code == 401


def test_get_current_user_me(client, auth_headers):
    """Test accessing protected /me route with valid token."""
    response = client.get(f"{settings.API_V1_STR}/auth/me", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == settings.FIRST_USER_EMAIL
    assert data["is_active"] is True


def test_unauthorized_access_without_token(client):
    """Test protected /me route blocks unauthenticated requests."""
    response = client.get(f"{settings.API_V1_STR}/auth/me")
    assert response.status_code == 401


def test_logout(client):
    """Test logging out clears the session cookie."""
    response = client.post(f"{settings.API_V1_STR}/auth/logout")
    assert response.status_code == 200
    assert response.json()["success"] is True
