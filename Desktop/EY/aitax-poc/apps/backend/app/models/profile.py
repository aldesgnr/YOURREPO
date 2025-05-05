from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import Field, validator
from sqlmodel import SQLModel, Relationship


class CompanyType(str, Enum):
    """Company legal form types"""
    SP_ZOO = "Sp. z o.o."
    SA = "S.A."
    JDG = "JDG"
    OTHER = "Inna"


class RevenueRange(str, Enum):
    """Revenue range options"""
    BELOW_200K = "<200 k"
    ABOVE_200K = ">200 k"


class CompanyProfileBase(SQLModel):
    """Base company profile model"""
    name: str
    nip: str = Field(min_length=10, max_length=10)
    vat_id: Optional[str] = Field(default=None, regex=r"^PL\d{10}$")
    industry: Optional[str] = None
    company_type: Optional[CompanyType] = None
    pkd_code: Optional[str] = Field(default=None, regex=r"^\d{2}\.\d{2}\.[A-Z]$")
    
    # Tax specific fields
    cit_rate_reduced: Optional[bool] = False
    estonian_cit: Optional[bool] = False
    revenue_range: Optional[RevenueRange] = None
    related_party_transactions: Optional[bool] = False
    rd_relief: Optional[bool] = False
    
    # Financial data
    employee_count: Optional[int] = Field(default=None, ge=0, le=9999)
    annual_revenue: Optional[int] = Field(default=None, ge=0, le=2000000000)


class CompanyProfile(CompanyProfileBase, table=True):
    """Company profile model for database"""
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    user: "User" = Relationship(back_populates="profile")


class CompanyProfileCreate(CompanyProfileBase):
    """Company profile creation model"""
    pass


class CompanyProfileRead(CompanyProfileBase):
    """Company profile read model"""
    id: int
    user_id: int
    created_at: datetime


class CompanyProfileUpdate(SQLModel):
    """Company profile update model"""
    name: Optional[str] = None
    nip: Optional[str] = None
    vat_id: Optional[str] = None
    industry: Optional[str] = None
    company_type: Optional[CompanyType] = None
    pkd_code: Optional[str] = None
    cit_rate_reduced: Optional[bool] = None
    estonian_cit: Optional[bool] = None
    revenue_range: Optional[RevenueRange] = None
    related_party_transactions: Optional[bool] = None
    rd_relief: Optional[bool] = None
    employee_count: Optional[int] = None
    annual_revenue: Optional[int] = None
