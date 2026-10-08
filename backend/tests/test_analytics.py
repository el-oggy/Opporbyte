"""Unit and integration tests for Career Analytics and System Telemetry."""

import pytest
from app.core.config import settings
from app.models.task import TaskRun


def test_analytics_summary_and_tasks(client, auth_headers, db_session):
    """Verify analytics telemetry endpoint and task execution log."""
    # Seed a task run
    task = TaskRun(
        task_type="job_discovery_sync",
        status="success",
        parameters={"provider": "greenhouse", "board_token": "stripe"},
        result={"new_jobs": 14, "duplicates_skipped": 2},
    )
    db_session.add(task)
    db_session.commit()

    # Query analytics summary
    summary_res = client.get(
        f"{settings.API_V1_STR}/analytics/summary?profile_type=semiconductor",
        headers=auth_headers,
    )
    assert summary_res.status_code == 200
    data = summary_res.json()

    assert "total_jobs" in data
    assert "source_distribution" in data
    assert "application_pipeline" in data
    assert "recent_tasks" in data
    assert len(data["recent_tasks"]) >= 1
    assert data["recent_tasks"][0]["task_type"] == "job_discovery_sync"

    # Query task runs endpoint
    tasks_res = client.get(f"{settings.API_V1_STR}/analytics/tasks", headers=auth_headers)
    assert tasks_res.status_code == 200
    assert len(tasks_res.json()) >= 1
