"""Exercise additive upgrade on a populated baseline and PostgreSQL SQL generation."""
import os
from pathlib import Path
import subprocess
import sys
from sqlalchemy import create_engine, inspect, select
from sqlalchemy.orm import Session
from app.models.user import User

BACKEND = Path(__file__).resolve().parents[1]


def migrate(url, *args):
    env = dict(os.environ, DATABASE_URL=url)
    return subprocess.run([sys.executable, "-m", "alembic", *args], cwd=BACKEND, env=env,
                          text=True, capture_output=True, check=True, timeout=30)


def test_upgrade_preserves_existing_user_and_metadata(tmp_path):
    url = "sqlite:///" + (tmp_path / "migration-fixture.db").as_posix()
    migrate(url, "upgrade", "822038d85abc")
    engine = create_engine(url)
    with Session(engine) as db:
        user = User(email="migration-fixture@example.com", hashed_password="fixture-only")
        db.add(user); db.commit(); user_id = user.id
    migrate(url, "upgrade", "head")
    with Session(engine) as db:
        assert db.get(User, user_id).email == "migration-fixture@example.com"
    assert {"sync_sources", "sync_runs"} <= set(inspect(engine).get_table_names())
    migrate(url, "check")
    engine.dispose()


def test_postgres_migration_sql_generates_without_connecting():
    sql = migrate("postgresql+psycopg://fixture:fixture@localhost/unused", "upgrade", "head", "--sql").stdout
    assert "CREATE TABLE sync_sources" in sql and "CREATE TABLE sync_runs" in sql
    assert "uq_sync_user_key" in sql
