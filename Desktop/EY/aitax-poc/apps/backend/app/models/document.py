from datetime import datetime
from enum import Enum
from typing import List, Optional

from sqlmodel import Field, SQLModel, Relationship


class DocumentType(str, Enum):
    """Document types"""
    PDF = "pdf"
    TXT = "txt"


class DocumentBase(SQLModel):
    """Base document model"""
    title: str
    description: Optional[str] = None
    file_path: str
    file_type: DocumentType
    file_size: int  # Size in bytes
    user_id: int = Field(foreign_key="user.id")


class Document(DocumentBase, table=True):
    """Document model for database"""
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    notes: List["Note"] = Relationship(back_populates="document")
    chat_messages: List["ChatMessage"] = Relationship(back_populates="document")


class DocumentCreate(DocumentBase):
    """Document creation model"""
    pass


class DocumentRead(DocumentBase):
    """Document read model"""
    id: int
    created_at: datetime


class DocumentUpdate(SQLModel):
    """Document update model"""
    title: Optional[str] = None
    description: Optional[str] = None
