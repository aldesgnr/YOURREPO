from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel, Relationship


class NoteBase(SQLModel):
    """Base note model"""
    content: str
    user_id: int = Field(foreign_key="user.id")
    news_id: Optional[int] = Field(default=None, foreign_key="news.id")
    document_id: Optional[int] = Field(default=None, foreign_key="document.id")


class Note(NoteBase, table=True):
    """Note model for database"""
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    news: Optional["News"] = Relationship(back_populates="notes")
    document: Optional["Document"] = Relationship(back_populates="notes")


class NoteCreate(NoteBase):
    """Note creation model"""
    pass


class NoteRead(NoteBase):
    """Note read model"""
    id: int
    created_at: datetime


class NoteUpdate(SQLModel):
    """Note update model"""
    content: Optional[str] = None
