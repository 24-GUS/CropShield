from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.session import get_db
from app.database.models import Crop, CropDisease, Farm
from app.schemas.crops import CropOut, CropDiseaseOut
from app.api.deps import get_current_user
from app.database.models import User

router = APIRouter(prefix="/crops", tags=["Crops & Pathology Library"])

@router.get("", response_model=List[CropOut])
def get_all_crops(db: Session = Depends(get_db)):
    crops = db.query(Crop).all()
    return crops

@router.get("/farms")
def get_farmer_farms(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    farms = db.query(Farm).filter(Farm.user_id == current_user.id).all()
    return farms

@router.post("/farms")
def create_farmer_farm(
    farm_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    farm = Farm(
        user_id=current_user.id,
        farm_name=farm_data.get("farm_name", "My Farm"),
        location_name=farm_data.get("location_name", "Local Plot"),
        area_acres=float(farm_data.get("area_acres", 2.0)),
        soil_type=farm_data.get("soil_type", "Red Loam"),
        irrigation_type=farm_data.get("irrigation_type", "Drip"),
        primary_crop=farm_data.get("primary_crop", "Paddy"),
        latitude=float(farm_data.get("latitude", 13.9299)),
        longitude=float(farm_data.get("longitude", 75.5681))
    )
    db.add(farm)
    db.commit()
    db.refresh(farm)
    return farm

@router.get("/{crop_id}", response_model=CropOut)
def get_crop_by_id(crop_id: int, db: Session = Depends(get_db)):
    crop = db.query(Crop).filter(Crop.id == crop_id).first()
    if not crop:
        raise HTTPException(status_code=404, detail="Crop not found")
    return crop

@router.get("/diseases/all", response_model=List[CropDiseaseOut])
def get_all_diseases(
    crop_name: Optional[str] = None,
    severity: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    # Sanitize literal 'undefined' or 'null' sent by client-side URLSearchParams
    if crop_name in ["undefined", "null", ""]:
        crop_name = None
    if severity in ["undefined", "null", ""]:
        severity = None
    if search in ["undefined", "null", ""]:
        search = None

    query = db.query(CropDisease).join(Crop)
    if crop_name:
        query = query.filter(Crop.name.ilike(f"%{crop_name}%"))
    if severity:
        query = query.filter(CropDisease.severity_level.ilike(f"%{severity}%"))
    if search:
        query = query.filter(
            (CropDisease.disease_name.ilike(f"%{search}%")) |
            (CropDisease.symptoms.ilike(f"%{search}%")) |
            (CropDisease.scientific_name.ilike(f"%{search}%"))
        )
    return query.all()

@router.get("/diseases/{disease_id}", response_model=CropDiseaseOut)
def get_disease_by_id(disease_id: int, db: Session = Depends(get_db)):
    disease = db.query(CropDisease).filter(CropDisease.id == disease_id).first()
    if not disease:
        raise HTTPException(status_code=404, detail="Disease record not found")
    return disease
