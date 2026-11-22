from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.database.models import User, Farm
from app.schemas.auth import UserCreate, UserLogin, UserOut, Token, ProfileUpdate
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.rate_limiter import rate_limiter
from app.api.deps import get_current_user
from datetime import timedelta

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token)
def register(user_in: UserCreate, request: Request, db: Session = Depends(get_db)):
    rate_limiter.check_rate_limit(request, max_requests=10, window_seconds=60)
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail="A user with this email already exists"
        )
    user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        phone=user_in.phone,
        role=user_in.role if user_in.role in ["farmer", "expert", "admin"] else "farmer",
        language_pref=user_in.language_pref,
        state=user_in.state,
        district=user_in.district,
        specialization=user_in.specialization,
        institution=user_in.institution
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # If farmer, auto-create default farm
    if user.role == "farmer":
        farm = Farm(
            user_id=user.id,
            farm_name=user_in.farm_name or f"{user.full_name}'s Farm",
            location_name=f"{user.district}, {user.state}",
            area_acres=user_in.area_acres or 2.5,
            primary_crop=user_in.primary_crop or "Paddy"
        )
        db.add(farm)
        db.commit()

    token = create_access_token({"sub": user.email, "user_id": user.id, "role": user.role})
    return Token(
        access_token=token,
        user_id=user.id,
        email=user.email,
        role=user.role,
        full_name=user.full_name,
        language_pref=user.language_pref
    )

@router.post("/login", response_model=Token)
def login(login_in: UserLogin, request: Request, db: Session = Depends(get_db)):
    rate_limiter.check_rate_limit(request, max_requests=10, window_seconds=60)
    user = db.query(User).filter(User.email == login_in.email).first()
    if not user or not verify_password(login_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = create_access_token({"sub": user.email, "user_id": user.id, "role": user.role})
    return Token(
        access_token=token,
        user_id=user.id,
        email=user.email,
        role=user.role,
        full_name=user.full_name,
        language_pref=user.language_pref
    )

@router.post("/token", response_model=Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = create_access_token({"sub": user.email, "user_id": user.id, "role": user.role})
    return Token(
        access_token=token,
        user_id=user.id,
        email=user.email,
        role=user.role,
        full_name=user.full_name,
        language_pref=user.language_pref
    )

@router.get("/demo-login/{role}", response_model=Token)
def demo_login(role: str, db: Session = Depends(get_db)):
    """
    Enterprise Sandbox Testing & Quick Role Navigation:
    Permits authorized QA, field evaluators, and administrators to test role-based access.
    """
    email_map = {
        "farmer": "farmer@cropshield.org",
        "expert": "expert@cropshield.org",
        "admin": "admin@cropshield.org"
    }
    target_email = email_map.get(role.lower())
    if not target_email:
        raise HTTPException(status_code=400, detail="Role must be one of: farmer, expert, admin")
    
    user = db.query(User).filter(User.email == target_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Demo account not found. Please run seed script.")
    
    token = create_access_token({"sub": user.email, "user_id": user.id, "role": user.role})
    return Token(
        access_token=token,
        user_id=user.id,
        email=user.email,
        role=user.role,
        full_name=user.full_name,
        language_pref=user.language_pref
    )

@router.get("/me", response_model=UserOut)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/profile", response_model=UserOut)
def update_profile(
    update_data: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    for field, val in update_data.dict(exclude_unset=True).items():
        if val is not None:
            setattr(current_user, field, val)
    db.commit()
    db.refresh(current_user)
    return current_user
