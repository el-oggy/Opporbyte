"""Candidate Facts and Verification API Endpoints."""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.fact import FactCreate, FactExtractRequest, FactResponse, FactUpdate
from app.services.facts.fact_service import fact_service

router = APIRouter()


@router.get("", response_model=List[FactResponse])
def get_facts(
    category: Optional[str] = Query(None, description="Filter by category"),
    verified_only: bool = Query(False, description="Filter verified facts only"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve all candidate facts for the authenticated user."""
    return fact_service.get_facts_for_user(
        db=db,
        user_id=current_user.id,
        category=category,
        verified_only=verified_only,
    )


@router.post("", response_model=FactResponse, status_code=status.HTTP_201_CREATED)
def create_fact(
    data: FactCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new candidate fact."""
    return fact_service.create_fact(db=db, user_id=current_user.id, data=data)


@router.put("/{fact_id}", response_model=FactResponse)
def update_fact(
    fact_id: str,
    data: FactUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update or verify an existing candidate fact."""
    fact = fact_service.update_fact(
        db=db, user_id=current_user.id, fact_id=fact_id, data=data
    )
    if not fact:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Fact not found",
        )
    return fact


@router.delete("/{fact_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_fact(
    fact_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a candidate fact."""
    success = fact_service.delete_fact(
        db=db, user_id=current_user.id, fact_id=fact_id
    )
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Fact not found",
        )


@router.post("/extract", response_model=List[FactResponse])
def extract_facts(
    payload: FactExtractRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Extract candidate facts from master resume or CV text for human review."""
    return fact_service.extract_facts_from_text(
        db=db,
        user_id=current_user.id,
        text=payload.text_content,
        source=payload.source,
    )


@router.post("/seed", response_model=List[FactResponse])
def seed_default_facts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Seed curated starter facts for Semiconductor and Software tracks."""
    return fact_service.seed_default_facts(db=db, user_id=current_user.id)
