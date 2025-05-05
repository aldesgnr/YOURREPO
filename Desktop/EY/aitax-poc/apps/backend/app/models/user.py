from datetime import datetime
from typing import Optional

from pydantic import EmailStr
from sqlmodel import Field, SQLModel, Relationship


class UserBase(SQLModel):
    """Base user model"""
    email: EmailStr = Field(unique=True, index=True)
    is_active: bool = Field(default=True)
    is_admin: bool = Field(default=False)


class User(UserBase, table=True):
    """User model for database"""
    id: Optional[int] = Field(default=None, primary_key=True)
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    profile: Optional["CompanyProfile"] = Relationship(back_populates="user")


class UserCreate(UserBase):
    """User creation model"""
    password: str


class UserRead(UserBase):
    """User read model"""
    id: int
    created_at: datetime


class UserUpdate(SQLModel):
    """User update model"""
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None
