from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class WeatherRiskFactor(BaseModel):
    crop_name: str
    disease_name: str
    risk_level: str  # Low, Moderate, High
    explanation: str
    recommended_prophylaxis: str

class WeatherData(BaseModel):
    location: str
    latitude: float
    longitude: float
    temperature_c: float
    humidity_pct: float
    rainfall_mm: float
    wind_speed_kmh: float
    condition: str
    forecast: List[Dict[str, Any]]
    overall_risk_level: str
    risk_factors: List[WeatherRiskFactor]
    timestamp: datetime
