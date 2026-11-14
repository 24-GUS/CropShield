import random
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.database.session import get_db
from app.database.models import User, Crop, CropDisease, OutbreakReport
from app.schemas.outbreak import OutbreakReportCreate, OutbreakReportOut
from app.api.deps import get_current_user, get_current_expert

router = APIRouter(prefix="/outbreaks", tags=["Community Outbreak Map"])

@router.get("", response_model=List[OutbreakReportOut])
def get_outbreak_reports(
    crop_name: Optional[str] = None,
    verified_only: bool = False,
    db: Session = Depends(get_db)
):
    query = db.query(OutbreakReport).order_by(OutbreakReport.created_at.desc())
    if verified_only:
        query = query.filter(OutbreakReport.is_verified == True)
    
    reports = query.all()
    results = []
    for r in reports:
        crop = db.query(Crop).filter(Crop.id == r.crop_id).first()
        disease = db.query(CropDisease).filter(CropDisease.id == r.disease_id).first() if r.disease_id else None
        
        if crop_name and crop and crop.name.lower() != crop_name.lower():
            continue

        # Add minor privacy jitter to coordinates (~200m) to protect exact farm privacy
        lat_jitter = r.approx_latitude
        lng_jitter = r.approx_longitude

        results.append(OutbreakReportOut(
            id=r.id,
            user_id=r.user_id,
            crop_id=r.crop_id,
            disease_id=r.disease_id,
            disease_name_custom=r.disease_name_custom,
            description=r.description,
            approx_latitude=round(lat_jitter, 4),
            approx_longitude=round(lng_jitter, 4),
            district=r.district,
            state=r.state,
            severity=r.severity,
            affected_acres=r.affected_acres,
            is_verified=r.is_verified,
            verified_by_expert_id=r.verified_by_expert_id,
            created_at=r.created_at,
            crop_name=crop.name if crop else "General",
            disease_name=disease.disease_name if disease else (r.disease_name_custom or "Suspected Outbreak")
        ))
    return results

@router.post("", response_model=OutbreakReportOut)
def report_outbreak(
    report_in: OutbreakReportCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Fuzz coordinates slightly at submission time to protect exact location privacy
    fuzzed_lat = report_in.approx_latitude + random.uniform(-0.005, 0.005)
    fuzzed_lng = report_in.approx_longitude + random.uniform(-0.005, 0.005)

    report = OutbreakReport(
        user_id=current_user.id,
        crop_id=report_in.crop_id,
        disease_id=report_in.disease_id,
        disease_name_custom=report_in.disease_name_custom,
        description=report_in.description,
        approx_latitude=round(fuzzed_lat, 4),
        approx_longitude=round(fuzzed_lng, 4),
        district=report_in.district,
        state=report_in.state,
        severity=report_in.severity,
        affected_acres=report_in.affected_acres,
        is_verified=False
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    crop = db.query(Crop).filter(Crop.id == report.crop_id).first()
    disease = db.query(CropDisease).filter(CropDisease.id == report.disease_id).first() if report.disease_id else None

    return OutbreakReportOut(
        id=report.id,
        user_id=report.user_id,
        crop_id=report.crop_id,
        disease_id=report.disease_id,
        disease_name_custom=report.disease_name_custom,
        description=report.description,
        approx_latitude=report.approx_latitude,
        approx_longitude=report.approx_longitude,
        district=report.district,
        state=report.state,
        severity=report.severity,
        affected_acres=report.affected_acres,
        is_verified=report.is_verified,
        verified_by_expert_id=report.verified_by_expert_id,
        created_at=report.created_at,
        crop_name=crop.name if crop else "General",
        disease_name=disease.disease_name if disease else (report.disease_name_custom or "Suspected Outbreak")
    )

@router.post("/{report_id}/verify")
def verify_outbreak(
    report_id: int,
    current_user: User = Depends(get_current_expert),
    db: Session = Depends(get_db)
):
    report = db.query(OutbreakReport).filter(OutbreakReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Outbreak report not found")
    report.is_verified = True
    report.verified_by_expert_id = current_user.id
    db.commit()
    return {"message": "Outbreak report confirmed and verified by agricultural expert", "report_id": report_id}
