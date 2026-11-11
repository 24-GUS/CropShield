from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.database.session import get_db
from app.database.models import User, Consultation, DiseaseScan
from app.schemas.consultation import ConsultationCreate, ConsultationAnswer, ConsultationOut
from app.api.deps import get_current_user, get_current_expert

router = APIRouter(prefix="/consultations", tags=["Expert Consultation"])

@router.get("", response_model=List[ConsultationOut])
def get_consultations(
    status: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Consultation).order_by(Consultation.created_at.desc())
    if current_user.role == "farmer":
        query = query.filter(Consultation.farmer_id == current_user.id)
    elif current_user.role == "expert":
        if status == "pending":
            query = query.filter(Consultation.status == "pending")

    consultations = query.all()
    results = []
    for c in consultations:
        farmer = db.query(User).filter(User.id == c.farmer_id).first()
        expert = db.query(User).filter(User.id == c.expert_id).first() if c.expert_id else None
        results.append(ConsultationOut(
            id=c.id,
            farmer_id=c.farmer_id,
            expert_id=c.expert_id,
            scan_id=c.scan_id,
            crop_name=c.crop_name,
            subject=c.subject,
            question=c.question,
            image_url=c.image_url,
            answer=c.answer,
            status=c.status,
            farmer_rating=c.farmer_rating,
            created_at=c.created_at,
            updated_at=c.updated_at,
            farmer_name=farmer.full_name if farmer else "Farmer",
            expert_name=expert.full_name if expert else None
        ))
    return results

@router.post("", response_model=ConsultationOut)
def ask_expert(
    consult_in: ConsultationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    image_url = None
    if consult_in.scan_id:
        scan = db.query(DiseaseScan).filter(DiseaseScan.id == consult_in.scan_id).first()
        if scan:
            image_url = scan.image_url

    c = Consultation(
        farmer_id=current_user.id,
        scan_id=consult_in.scan_id,
        crop_name=consult_in.crop_name,
        subject=consult_in.subject,
        question=consult_in.question,
        image_url=image_url,
        status="pending"
    )
    db.add(c)
    db.commit()
    db.refresh(c)

    return ConsultationOut(
        id=c.id,
        farmer_id=c.farmer_id,
        expert_id=c.expert_id,
        scan_id=c.scan_id,
        crop_name=c.crop_name,
        subject=c.subject,
        question=c.question,
        image_url=c.image_url,
        answer=c.answer,
        status=c.status,
        farmer_rating=c.farmer_rating,
        created_at=c.created_at,
        updated_at=c.updated_at,
        farmer_name=current_user.full_name,
        expert_name=None
    )

@router.post("/{consultation_id}/answer")
def answer_consultation(
    consultation_id: int,
    answer_in: ConsultationAnswer,
    current_user: User = Depends(get_current_expert),
    db: Session = Depends(get_db)
):
    c = db.query(Consultation).filter(Consultation.id == consultation_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Consultation not found")
    c.expert_id = current_user.id
    c.answer = answer_in.answer
    c.status = "answered"
    c.updated_at = datetime.utcnow()
    db.commit()
    return {"message": "Answer submitted to farmer successfully", "consultation_id": consultation_id}

@router.post("/{consultation_id}/rate")
def rate_consultation(
    consultation_id: int,
    rating: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    c = db.query(Consultation).filter(Consultation.id == consultation_id, Consultation.farmer_id == current_user.id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Consultation not found")
    c.farmer_rating = max(1, min(5, rating))
    db.commit()
    return {"message": "Rating recorded", "rating": c.farmer_rating}
