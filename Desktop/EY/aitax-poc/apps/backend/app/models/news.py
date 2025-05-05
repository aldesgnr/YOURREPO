from datetime import datetime
from enum import Enum
from typing import List, Optional

from sqlmodel import Field, SQLModel, Relationship


class TaxCategory(str, Enum):
    """Tax categories for news items"""
    VAT = "VAT"
    CIT = "CIT"
    PIT = "PIT"
    TRANSFER_PRICING = "Transfer Pricing"
    TAX_PROCEDURE = "Tax Procedure"
    INTERNATIONAL_TAX = "International Tax"
    OTHER = "Other"


class NewsBase(SQLModel):
    """Base news model"""
    title: str
    content: str
    summary: str
    category: TaxCategory
    source_url: Optional[str] = None
    published_date: datetime


class News(NewsBase, table=True):
    """News model for database"""
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    notes: List["Note"] = Relationship(back_populates="news")


class NewsCreate(NewsBase):
    """News creation model"""
    pass


class NewsRead(NewsBase):
    """News read model"""
    id: int
    created_at: datetime


class NewsUpdate(SQLModel):
    """News update model"""
    title: Optional[str] = None
    content: Optional[str] = None
    summary: Optional[str] = None
    category: Optional[TaxCategory] = None
    source_url: Optional[str] = None
    published_date: Optional[datetime] = None
