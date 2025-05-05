from datetime import datetime
from enum import Enum
from typing import Optional

from sqlmodel import Field, SQLModel, Relationship


class MessageRole(str, Enum):
    """Chat message roles"""
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"


class ChatMessageBase(SQLModel):
    """Base chat message model"""
    content: str
    role: MessageRole
    document_id: int = Field(foreign_key="document.id")
    user_id: int = Field(foreign_key="user.id")


class ChatMessage(ChatMessageBase, table=True):
    """Chat message model for database"""
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    document: "Document" = Relationship(back_populates="chat_messages")


class ChatMessageCreate(ChatMessageBase):
    """Chat message creation model"""
    pass


class ChatMessageRead(ChatMessageBase):
    """Chat message read model"""
    id: int
    created_at: datetime
