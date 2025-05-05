from typing import Annotated, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.core.auth import get_current_active_user
from app.core.database import get_session
from app.models.news import News, NewsCreate, NewsRead, NewsUpdate
from app.models.profile import CompanyProfile
from app.models.user import User
from app.services.ai import generate_personalized_summary

router = APIRouter()


@router.get("", response_model=List[NewsRead])
async def get_all_news(
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[Session, Depends(get_session)],
    skip: int = 0,
    limit: int = 10
):
    """Get all news items with pagination"""
    news = db.exec(select(News).offset(skip).limit(limit)).all()
    return news


@router.get("/{news_id}", response_model=NewsRead)
async def get_news(
    news_id: int,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[Session, Depends(get_session)]
):
    """Get a specific news item by ID"""
    news = db.get(News, news_id)
    if not news:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="News not found"
        )
    return news


@router.get("/{news_id}/personalized", response_model=dict)
async def get_personalized_news(
    news_id: int,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[Session, Depends(get_session)]
):
    """Get a personalized summary of why a news item is relevant to the user"""
    # Get the news item
    news = db.get(News, news_id)
    if not news:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="News not found"
        )
    
    # Get user's company profile
    profile = db.exec(
        select(CompanyProfile).where(CompanyProfile.user_id == current_user.id)
    ).first()
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User profile not found. Please complete your profile first."
        )
    
    # Generate personalized summary using AI
    personalized_summary = await generate_personalized_summary(news, profile)
    
    return {
        "news_id": news_id,
        "original_summary": news.summary,
        "personalized_summary": personalized_summary
    }


@router.post("", response_model=NewsRead, status_code=status.HTTP_201_CREATED)
async def create_news(
    news_create: NewsCreate,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[Session, Depends(get_session)]
):
    """Create a new news item (admin only)"""
    # Check if user is admin
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to create news"
        )
    
    # Create new news item
    db_news = News(**news_create.model_dump())
    
    db.add(db_news)
    db.commit()
    db.refresh(db_news)
    
    return db_news


@router.put("/{news_id}", response_model=NewsRead)
async def update_news(
    news_id: int,
    news_update: NewsUpdate,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[Session, Depends(get_session)]
):
    """Update a news item (admin only)"""
    # Check if user is admin
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update news"
        )
    
    # Get existing news
    news = db.get(News, news_id)
    if not news:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="News not found"
        )
    
    # Update news with non-None values
    news_data = news_update.model_dump(exclude_unset=True)
    for key, value in news_data.items():
        setattr(news, key, value)
    
    news.updated_at = news.updated_at  # Trigger update of updated_at field
    
    db.add(news)
    db.commit()
    db.refresh(news)
    
    return news


@router.delete("/{news_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_news(
    news_id: int,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[Session, Depends(get_session)]
):
    """Delete a news item (admin only)"""
    # Check if user is admin
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete news"
        )
    
    # Get existing news
    news = db.get(News, news_id)
    if not news:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="News not found"
        )
    
    # Delete news
    db.delete(news)
    db.commit()
    
    return None
