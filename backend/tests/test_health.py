"""Test health check and root endpoints."""

from app.core.config import settings


def test_root_endpoint(client):
    """Test public root service metadata endpoint."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["app"] == settings.APP_NAME
    assert data["version"] == settings.VERSION


def test_health_check_endpoint(client):
    """Test /health endpoint and database connectivity flag."""
    response = client.get(f"{settings.API_V1_STR}/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["database_connected"] is True
    assert data["app_name"] == settings.APP_NAME
