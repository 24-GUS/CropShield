from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    email: str
    role: str
    full_name: str
    language_pref: str

class UserCreate(BaseModel):
    email: str
    password: str
    full_name: str
    phone: Optional[str] = None
    role: str = "farmer"  # farmer, expert, admin
    language_pref: str = "en"
    state: str = "Karnataka"
    district: str = "Shivamogga"
    # Expert fields
    specialization: Optional[str] = None
    institution: Optional[str] = None
    # Farmer fields
    farm_name: Optional[str] = None
    primary_crop: Optional[str] = None
    area_acres: Optional[float] = 2.5

class UserLogin(BaseModel):
    email: str
    password: str

class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    phone: Optional[str] = None
    role: str
    language_pref: str
    state: str
    district: str
    specialization: Optional[str] = None
    institution: Optional[str] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    language_pref: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    specialization: Optional[str] = None
    institution: Optional[str] = None
