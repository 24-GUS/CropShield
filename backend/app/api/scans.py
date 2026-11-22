import os
import uuid
import json
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Request
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.database.session import get_db
from app.database.models import User, Crop, CropDisease, DiseaseScan
from app.schemas.scans import ScanResponse, ScanFeedback, ExpertVerificationRequest
from app.api.deps import get_current_user, get_current_expert
from app.ml.inference import predictor
from app.core.config import settings
from app.core.rate_limiter import rate_limiter

router = APIRouter(prefix="/scans", tags=["AI Disease Detection"])

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}

@router.post("/analyze")
async def analyze_crop_image(
    request: Request,
    crop_id: int = Form(...),
    image: UploadFile = File(...),
    weather_json: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Core AI Image Classification Endpoint:
    1. Validates format, extension, and resolution
    2. Runs quality and plant tissue check
    3. Runs calibrated machine learning inference
    4. Enforces confidence thresholds (abstention on low confidence)
    5. Saves diagnosis in farmer's scan history
    """
    # Rate limit: 30 image inference requests per minute per IP to prevent compute exhaustion
    rate_limiter.check_rate_limit(request, max_requests=30, window_seconds=60)

    crop = db.query(Crop).filter(Crop.id == crop_id).first()
    if not crop:
        raise HTTPException(status_code=404, detail="Selected crop not found")

    # Read image bytes
    image_bytes = await image.read()
    if len(image_bytes) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    if len(image_bytes) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size exceeds maximum limit of 10MB")

    # Validate file extension against whitelist
    file_ext = os.path.splitext(image.filename)[1].lower() if image.filename else ".jpg"
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400, 
            detail=f"Unsupported file extension '{file_ext}'. Allowed types: {', '.join(sorted(ALLOWED_EXTENSIONS))}"
        )

    # Save uploaded image to disk with secure randomized UUID filename
    unique_filename = f"scan_{uuid.uuid4().hex[:12]}{file_ext}"
    file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)
    with open(file_path, "wb") as f:
        f.write(image_bytes)
    
    relative_image_url = f"/uploads/{unique_filename}"

    # Run AI Prediction
    prediction = predictor.predict_image(
        image_bytes=image_bytes,
        selected_crop_name=crop.name,
        language=current_user.language_pref
    )

    weather_data = None
    if weather_json:
        try:
            weather_data = json.loads(weather_json)
        except Exception:
            pass

    # Handle Quality or Non-plant failure
    if not prediction.get("success", False):
        # Save scan with failed status for audit
        scan = DiseaseScan(
            user_id=current_user.id,
            crop_id=crop.id,
            image_url=relative_image_url,
            confidence=0.0,
            severity="None",
            status=prediction.get("status", "invalid_image"),
            symptoms_detected=prediction.get("error", "Invalid photograph"),
            treatment_advice="Please capture a well-lit, steady photograph showing the leaf or affected plant part.",
            weather_context=weather_data
        )
        db.add(scan)
        db.commit()
        db.refresh(scan)

        return {
            "success": False,
            "status": prediction.get("status"),
            "scan_id": scan.id,
            "message": prediction.get("error"),
            "image_url": relative_image_url,
            "requires_expert": False
        }

    # If uncertain prediction (Abstention)
    if prediction.get("status") == "uncertain_prediction":
        scan = DiseaseScan(
            user_id=current_user.id,
            crop_id=crop.id,
            image_url=relative_image_url,
            confidence=prediction.get("confidence", 0.0),
            severity="Moderate",
            status="uncertain",
            symptoms_detected="Ambiguous or overlapping symptoms detected by neural model.",
            treatment_advice="Prediction confidence below safety threshold. Please request agricultural expert verification.",
            weather_context=weather_data
        )
        db.add(scan)
        db.commit()
        db.refresh(scan)

        return {
            "success": True,
            "status": "uncertain",
            "scan_id": scan.id,
            "image_url": relative_image_url,
            "confidence": prediction.get("confidence"),
            "confidence_pct": prediction.get("confidence_pct"),
            "message": prediction.get("message"),
            "top3_predictions": prediction.get("top3_predictions"),
            "requires_expert": True
        }

    # If Crop Mismatch
    if prediction.get("status") == "crop_mismatch":
        return {
            "success": False,
            "status": "crop_mismatch",
            "image_url": relative_image_url,
            "message": prediction.get("message"),
            "detected_crop": prediction.get("detected_crop"),
            "requires_expert": False
        }

    # Successful prediction
    disease_code = prediction.get("disease_code")
    disease = db.query(CropDisease).filter(CropDisease.disease_code == disease_code).first()

    scan = DiseaseScan(
        user_id=current_user.id,
        crop_id=crop.id,
        predicted_disease_id=disease.id if disease else None,
        image_url=relative_image_url,
        confidence=prediction.get("confidence", 0.95),
        severity=disease.severity_level if disease else "Low",
        status="completed",
        symptoms_detected=disease.symptoms if disease else "Symptoms detected by model",
        treatment_advice=disease.recommended_treatment if disease else "Consult local agricultural extension.",
        weather_context=weather_data
    )
    db.add(scan)
    db.commit()
    db.refresh(scan)

    return {
        "success": True,
        "status": "completed",
        "scan_id": scan.id,
        "image_url": relative_image_url,
        "crop_name": crop.name,
        "crop_scientific_name": crop.scientific_name,
        "disease_name": disease.disease_name if disease else "Identified Condition",
        "disease_scientific_name": disease.scientific_name if disease else None,
        "is_healthy": disease.is_healthy if disease else False,
        "confidence": prediction.get("confidence"),
        "confidence_pct": prediction.get("confidence_pct"),
        "confidence_level": prediction.get("confidence_level"),
        "pathology_stage": prediction.get("pathology_stage", "Active Lesion"),
        "treatment_urgency": prediction.get("treatment_urgency", "Standard"),
        "severity": disease.severity_level if disease else "Low",
        "symptoms": disease.symptoms if disease else "",
        "common_causes": disease.common_causes if disease else "",
        "environmental_conditions": disease.environmental_conditions if disease else "",
        "ipm_measures": disease.ipm_measures if disease else "",
        "recommended_treatment": disease.recommended_treatment if disease else "",
        "safety_precautions": disease.safety_precautions if disease else "",
        "expert_references": disease.expert_references if disease else "",
        "translations": disease.translations if disease else {},
        "top3_predictions": prediction.get("top3_predictions"),
        "requires_expert": prediction.get("requires_expert", False),
        "created_at": scan.created_at.isoformat()
    }

@router.get("/history")
def get_scan_history(
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(DiseaseScan).order_by(DiseaseScan.created_at.desc())
    if current_user.role == "farmer":
        query = query.filter(DiseaseScan.user_id == current_user.id)
    scans = query.limit(limit).all()

    result = []
    for s in scans:
        crop = db.query(Crop).filter(Crop.id == s.crop_id).first()
        disease = db.query(CropDisease).filter(CropDisease.id == s.predicted_disease_id).first() if s.predicted_disease_id else None
        expert = db.query(User).filter(User.id == s.verified_by_expert_id).first() if s.verified_by_expert_id else None
        result.append({
            "id": s.id,
            "crop_name": crop.name if crop else "Unknown",
            "disease_name": disease.disease_name if disease else ("Healthy" if s.status == "completed" and s.confidence > 0.8 else "Uncertain"),
            "scientific_name": disease.scientific_name if disease else "",
            "is_healthy": disease.is_healthy if disease else False,
            "confidence": s.confidence,
            "confidence_pct": round(s.confidence * 100, 1),
            "severity": s.severity,
            "status": s.status,
            "image_url": s.image_url,
            "created_at": s.created_at.isoformat(),
            "expert_verdict": s.expert_verdict,
            "expert_notes": s.expert_notes,
            "expert_name": expert.full_name if expert else None,
            "farmer_feedback": s.farmer_feedback
        })
    return result

@router.get("/{scan_id}")
def get_scan_detail(
    scan_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    scan = db.query(DiseaseScan).filter(DiseaseScan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan record not found")
    
    if current_user.role == "farmer" and scan.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized access to scan record")

    crop = db.query(Crop).filter(Crop.id == scan.crop_id).first()
    disease = db.query(CropDisease).filter(CropDisease.id == scan.predicted_disease_id).first() if scan.predicted_disease_id else None
    expert = db.query(User).filter(User.id == scan.verified_by_expert_id).first() if scan.verified_by_expert_id else None

    return {
        "id": scan.id,
        "crop_name": crop.name if crop else "Unknown",
        "crop_scientific_name": crop.scientific_name if crop else "",
        "disease_name": disease.disease_name if disease else "Uncertain",
        "disease_scientific_name": disease.scientific_name if disease else "",
        "is_healthy": disease.is_healthy if disease else False,
        "confidence": scan.confidence,
        "confidence_pct": round(scan.confidence * 100, 1),
        "severity": scan.severity,
        "status": scan.status,
        "image_url": scan.image_url,
        "symptoms": disease.symptoms if disease else scan.symptoms_detected,
        "common_causes": disease.common_causes if disease else "",
        "environmental_conditions": disease.environmental_conditions if disease else "",
        "prevention_methods": disease.prevention_methods if disease else "",
        "ipm_measures": disease.ipm_measures if disease else "",
        "recommended_treatment": disease.recommended_treatment if disease else scan.treatment_advice,
        "safety_precautions": disease.safety_precautions if disease else "",
        "expert_references": disease.expert_references if disease else "",
        "translations": disease.translations if disease else {},
        "pathology_stage": "Healthy Botanical Tissue" if (disease and disease.is_healthy) else ("Active Necrotic / Pathogen Infection" if scan.severity in ["High", "Severe"] else "Early Foliar Lesion"),
        "treatment_urgency": "Routine Preventive Maintenance" if (disease and disease.is_healthy) else ("Immediate Intervention (Within 24-48 Hours)" if scan.severity in ["High", "Severe"] else "Prompt Protective Spray Recommended"),
        "expert_verdict": scan.expert_verdict,
        "expert_notes": scan.expert_notes,
        "expert_name": expert.full_name if expert else None,
        "farmer_feedback": scan.farmer_feedback,
        "created_at": scan.created_at.isoformat()
    }

@router.post("/{scan_id}/feedback")
def submit_scan_feedback(
    scan_id: int,
    feedback: ScanFeedback,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    scan = db.query(DiseaseScan).filter(DiseaseScan.id == scan_id, DiseaseScan.user_id == current_user.id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan record not found")
    scan.farmer_feedback = feedback.rating
    db.commit()
    return {"message": "Feedback submitted successfully", "rating": feedback.rating}

@router.post("/{scan_id}/verify")
def expert_verify_scan(
    scan_id: int,
    verification: ExpertVerificationRequest,
    current_user: User = Depends(get_current_expert),
    db: Session = Depends(get_db)
):
    scan = db.query(DiseaseScan).filter(DiseaseScan.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan record not found")
    
    scan.verified_by_expert_id = current_user.id
    scan.expert_verdict = verification.verdict
    scan.expert_notes = verification.notes
    if verification.corrected_disease_id:
        scan.predicted_disease_id = verification.corrected_disease_id

    db.commit()
    return {"message": "Scan reviewed and verified by agricultural expert", "verdict": verification.verdict}
