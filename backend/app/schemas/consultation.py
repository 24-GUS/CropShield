from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ConsultationCreate(BaseModel):
    crop_name: str
    subject: str
    question: str
    scan_id: Optional[int] = None

class ConsultationAnswer(BaseModel):
    answer: str

class ConsultationOut(BaseModel):
    id: int
    farmer_id: int
    expert_id: Optional[int] = None
    scan_id: Optional[int] = None
    crop_name: str
    subject: str
    question: str
    image_url: Optional[str] = None
    answer: Optional[str] = None
    status: str
    farmer_rating: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    farmer_name: Optional[str] = None
    expert_name: Optional[str] = None

    class Config:
        from_attributes = True
