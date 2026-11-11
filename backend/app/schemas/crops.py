from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class CropDiseaseOut(BaseModel):
    id: int
    crop_id: int
    disease_code: str
    disease_name: str
    scientific_name: Optional[str] = None
    is_healthy: bool
    severity_level: str
    symptoms: str
    common_causes: str
    environmental_conditions: str
    prevention_methods: str
    ipm_measures: str
    recommended_treatment: str
    safety_precautions: str
    expert_references: str
    translations: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True

class CropOut(BaseModel):
    id: int
    name: str
    scientific_name: Optional[str] = None
    category: str
    season: str
    description: Optional[str] = None
    is_supported_by_ai: bool
    icon: str
    local_names: Optional[Dict[str, str]] = None
    diseases: Optional[List[CropDiseaseOut]] = []

    class Config:
        from_attributes = True
