from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.core.auth import get_current_active_user
from app.core.database import get_session
from app.models.profile import (
    CompanyProfile, 
    CompanyProfileCreate, 
    CompanyProfileRead, 
    CompanyProfileUpdate
)
from app.models.user import User

router = APIRouter()


@router.get("", response_model=CompanyProfileRead)
async def get_profile(
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[Session, Depends(get_session)]
):
    """Get the current user's company profile"""
    profile = db.exec(
        select(CompanyProfile).where(CompanyProfile.user_id == current_user.id)
    ).first()
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    return profile


@router.post("", response_model=CompanyProfileRead, status_code=status.HTTP_201_CREATED)
async def create_profile(
    profile_create: CompanyProfileCreate,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[Session, Depends(get_session)]
):
    """Create a new company profile for the current user"""
    # Check if user already has a profile
    existing_profile = db.exec(
        select(CompanyProfile).where(CompanyProfile.user_id == current_user.id)
    ).first()
    
    if existing_profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already has a profile"
        )
    
    # Create new profile
    db_profile = CompanyProfile(**profile_create.model_dump(), user_id=current_user.id)
    
    db.add(db_profile)
    db.commit()
    db.refresh(db_profile)
    
    return db_profile


@router.put("", response_model=CompanyProfileRead)
async def update_profile(
    profile_update: CompanyProfileUpdate,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[Session, Depends(get_session)]
):
    """Update the current user's company profile"""
    # Get existing profile
    profile = db.exec(
        select(CompanyProfile).where(CompanyProfile.user_id == current_user.id)
    ).first()
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    # Update profile with non-None values
    profile_data = profile_update.model_dump(exclude_unset=True)
    for key, value in profile_data.items():
        setattr(profile, key, value)
    
    profile.updated_at = profile.updated_at  # Trigger update of updated_at field
    
    db.add(profile)
    db.commit()
    db.refresh(profile)
    
    return profile
