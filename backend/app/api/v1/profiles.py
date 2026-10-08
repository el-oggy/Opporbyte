"""Career Profile management endpoints for Semiconductor and Software domains."""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.common import APIResponse
from app.schemas.profile import (
    ProfileResponse,
    ProfileTypeEnum,
    ProfileUpdate,
)
from app.services.profile_service import ProfileService

router = APIRouter()


@router.get("", response_model=List[ProfileResponse])
def get_profiles(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Retrieve all career profiles associated with the current user."""
    profiles = ProfileService.get_profiles_for_user(db, user_id=current_user.id)
    # If user has no profiles yet, auto-ensure default profiles
    if not profiles:
        profiles = ProfileService.ensure_default_profiles(db, user_id=current_user.id)
    return [ProfileResponse.model_validate(p) for p in profiles]


@router.get("/{profile_type}", response_model=ProfileResponse)
def get_profile_by_type(
    profile_type: ProfileTypeEnum,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Fetch a specific career profile by domain (semiconductor or software)."""
    profile = ProfileService.get_profile_by_type(
        db, user_id=current_user.id, profile_type=profile_type.value
    )
    if not profile:
        # Auto-create if missing for current user
        ProfileService.ensure_default_profiles(db, user_id=current_user.id)
        profile = ProfileService.get_profile_by_type(
            db, user_id=current_user.id, profile_type=profile_type.value
        )
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Profile '{profile_type.value}' not found",
        )
    return ProfileResponse.model_validate(profile)


@router.put("/{profile_type}", response_model=ProfileResponse)
def update_profile(
    profile_type: ProfileTypeEnum,
    data: ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Update editable preferences and qualifications for a specific career profile."""
    # Ensure profile exists
    existing = ProfileService.get_profile_by_type(
        db, user_id=current_user.id, profile_type=profile_type.value
    )
    if not existing:
        ProfileService.ensure_default_profiles(db, user_id=current_user.id)

    updated = ProfileService.update_profile(
        db, user_id=current_user.id, profile_type=profile_type.value, data=data
    )
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Failed to update profile '{profile_type.value}'",
        )
    return ProfileResponse.model_validate(updated)


@router.post("/seed", response_model=APIResponse[List[ProfileResponse]])
def seed_profiles(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Explicitly verify and bootstrap Semiconductor and Software profiles."""
    profiles = ProfileService.ensure_default_profiles(db, user_id=current_user.id)
    return APIResponse[List[ProfileResponse]](
        success=True,
        message="Default Semiconductor and Software profiles initialized successfully",
        data=[ProfileResponse.model_validate(p) for p in profiles],
    )
