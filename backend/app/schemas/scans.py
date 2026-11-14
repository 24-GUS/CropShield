from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.schemas.crops import CropOut, CropDiseaseOut

class ScanResponse(BaseModel):
    id: int
    user_id: int
    crop_id: int
    predicted_disease_id: Optional[int] = None
    image_url: str
    confidence: float
    confidence_pct: float
    severity: str
    status: str
    symptoms_detected: Optional[str] = None
    treatment_advice: Optional[str] = None
    crop: Optional[CropOut] = None
    disease: Optional[CropDiseaseOut] = None
    weather_context: Optional[Dict[str, Any]] = None
    verified_by_expert_id: Optional[int] = None
    expert_notes: Optional[str] = None
    expert_verdict: Optional[str] = None
    farmer_feedback: Optional[int] = None
    created_at: datetime
    # Diagnostic extra metadata
    entropy: Optional[float] = None
    top3_predictions: Optional[List[Dict[str, Any]]] = None
    requires_expert: Optional[bool] = False

    class Config:
        from_attributes = True

class ScanFeedback(BaseModel):
    rating: int  # 1 to 5
    comment: Optional[str] = None

class ExpertVerificationRequest(BaseModel):
    scan_id: int
    verdict: str  # verified, corrected, refuted
    notes: str
    corrected_disease_id: Optional[int] = None
