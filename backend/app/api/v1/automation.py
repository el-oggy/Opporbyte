"""Authenticated manual source sync; no external queue or auto-submission."""
from typing import Literal
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api.deps import get_current_active_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.analytics import TaskRunResponse
from app.schemas.automation import SourceConfiguration, SyncRequest
from app.services.automation import SyncConflict, automation_service

router = APIRouter()


@router.get("/sources")
def list_sources(db: Session = Depends(get_db), user: User = Depends(get_current_active_user)):
    automation_service.recover_expired(db, user.id)
    return automation_service.sources(db, user.id)


@router.post("/sources")
def configure_source(req: SourceConfiguration, db: Session = Depends(get_db), user: User = Depends(get_current_active_user)):
    try:
        return automation_service.configure(db, user.id, req)
    except SyncConflict as exc:
        raise HTTPException(exc.status, str(exc)) from exc


@router.get("/syncs", response_model=list[TaskRunResponse])
def list_syncs(profile_type: Literal["software", "semiconductor"] | None = None,
               db: Session = Depends(get_db), user: User = Depends(get_current_active_user)):
    automation_service.recover_expired(db, user.id)
    return automation_service.tasks(db, user.id, profile_type)


@router.post("/syncs", response_model=TaskRunResponse)
async def sync_source(req: SyncRequest, db: Session = Depends(get_db), user: User = Depends(get_current_active_user)):
    try:
        task, execute = automation_service.prepare(db, user.id, req)
        return await automation_service.execute(db, task.id) if execute else task
    except SyncConflict as exc:
        raise HTTPException(exc.status, str(exc)) from exc


@router.get("/syncs/{task_id}", response_model=TaskRunResponse)
def get_sync(task_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_active_user)):
    automation_service.recover_expired(db, user.id)
    task = automation_service.task(db, user.id, task_id)
    if not task:
        raise HTTPException(404, "Sync not found.")
    return task


@router.post("/syncs/{task_id}/cancel", response_model=TaskRunResponse)
def cancel_sync(task_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_active_user)):
    task = automation_service.cancel(db, user.id, task_id)
    if not task:
        raise HTTPException(404, "Sync not found.")
    return task
