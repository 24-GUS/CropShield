from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class OutbreakReportCreate(BaseModel):
    crop_id: int
    disease_id: Optional[int] = None
    disease_name_custom: Optional[str] = None
    description: str
    approx_latitude: float
    approx_longitude: float
    district: str
    state: str = "Karnataka"
    severity: str = "Moderate"
    affected_acres: float = 1.0

class OutbreakReportOut(BaseModel):
    id: int
    user_id: int
    crop_id: int
    disease_id: Optional[int] = None
    disease_name_custom: Optional[str] = None
    description: Optional[str] = None
    approx_latitude: float
    approx_longitude: float
    district: str
    state: str
    severity: str
    affected_acres: float
    is_verified: bool
    verified_by_expert_id: Optional[int] = None
    created_at: datetime
    crop_name: Optional[str] = None
    disease_name: Optional[str] = None

    class Config:
        from_attributes = True
