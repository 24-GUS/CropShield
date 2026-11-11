from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=True)
    role = Column(String(50), default="farmer", index=True)  # farmer, expert, admin
    language_pref = Column(String(20), default="en")  # en, kn, ml, hi
    state = Column(String(100), default="Karnataka")
    district = Column(String(100), default="Shivamogga")
    specialization = Column(String(255), nullable=True)  # For experts
    institution = Column(String(255), nullable=True)     # For experts
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    farms = relationship("Farm", back_populates="owner", cascade="all, delete-orphan")
    scans = relationship("DiseaseScan", back_populates="user", foreign_keys="DiseaseScan.user_id", cascade="all, delete-orphan")
    outbreak_reports = relationship("OutbreakReport", back_populates="reporter", foreign_keys="OutbreakReport.user_id", cascade="all, delete-orphan")
    consultations_asked = relationship("Consultation", back_populates="farmer", foreign_keys="Consultation.farmer_id")
    consultations_answered = relationship("Consultation", back_populates="expert", foreign_keys="Consultation.expert_id")


class Farm(Base):
    __tablename__ = "farms"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    farm_name = Column(String(255), nullable=False)
    location_name = Column(String(255), nullable=False)
    area_acres = Column(Float, default=2.5)
    soil_type = Column(String(100), default="Red Loam")
    irrigation_type = Column(String(100), default="Drip Irrigation")
    primary_crop = Column(String(100), default="Paddy")
    latitude = Column(Float, default=13.9299)
    longitude = Column(Float, default=75.5681)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="farms")


class Crop(Base):
    __tablename__ = "crops"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    scientific_name = Column(String(150), nullable=True)
    local_names = Column(JSON, default=dict)  # {"kn": "ಭತ್ತ", "ml": "നെല്ല്", "hi": "धान"}
    category = Column(String(50), default="Cereal")
    season = Column(String(100), default="Kharif & Rabi")
    description = Column(Text, nullable=True)
    is_supported_by_ai = Column(Boolean, default=True)
    icon = Column(String(50), default="Sprout")

    diseases = relationship("CropDisease", back_populates="crop", cascade="all, delete-orphan")
    scans = relationship("DiseaseScan", back_populates="crop")


class CropDisease(Base):
    __tablename__ = "crop_diseases"

    id = Column(Integer, primary_key=True, index=True)
    crop_id = Column(Integer, ForeignKey("crops.id"), nullable=False)
    disease_code = Column(String(100), unique=True, index=True, nullable=False)
    disease_name = Column(String(200), nullable=False)
    scientific_name = Column(String(200), nullable=True)
    is_healthy = Column(Boolean, default=False)
    severity_level = Column(String(50), default="Moderate")  # Low, Moderate, High, Severe, None
    symptoms = Column(Text, nullable=False)
    common_causes = Column(Text, nullable=False)
    environmental_conditions = Column(Text, nullable=False)
    prevention_methods = Column(Text, nullable=False)
    ipm_measures = Column(Text, nullable=False)
    recommended_treatment = Column(Text, nullable=False)
    safety_precautions = Column(Text, nullable=False)
    expert_references = Column(Text, nullable=False)
    translations = Column(JSON, default=dict)  # Multilingual support {"kn": {...}, "ml": {...}, "hi": {...}}

    crop = relationship("Crop", back_populates="diseases")
    scans = relationship("DiseaseScan", back_populates="disease")


class DiseaseScan(Base):
    __tablename__ = "disease_scans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    crop_id = Column(Integer, ForeignKey("crops.id"), nullable=False)
    predicted_disease_id = Column(Integer, ForeignKey("crop_diseases.id"), nullable=True)
    image_url = Column(String(500), nullable=False)
    confidence = Column(Float, default=0.0)
    severity = Column(String(50), default="Low")
    status = Column(String(50), default="completed")  # completed, uncertain, invalid_image, unsupported_crop
    symptoms_detected = Column(Text, nullable=True)
    treatment_advice = Column(Text, nullable=True)
    weather_context = Column(JSON, nullable=True)  # Snapshot of weather conditions during scan
    verified_by_expert_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    expert_notes = Column(Text, nullable=True)
    expert_verdict = Column(String(50), nullable=True)  # verified, corrected, refuted
    farmer_feedback = Column(Integer, nullable=True)  # 1 to 5 stars
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    user = relationship("User", back_populates="scans", foreign_keys=[user_id])
    crop = relationship("Crop", back_populates="scans")
    disease = relationship("CropDisease", back_populates="scans")
    expert = relationship("User", foreign_keys=[verified_by_expert_id])


class OutbreakReport(Base):
    __tablename__ = "outbreak_reports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    crop_id = Column(Integer, ForeignKey("crops.id"), nullable=False)
    disease_id = Column(Integer, ForeignKey("crop_diseases.id"), nullable=True)
    disease_name_custom = Column(String(200), nullable=True)
    description = Column(Text, nullable=True)
    approx_latitude = Column(Float, nullable=False)  # Fuzzed/approximate to protect farmer privacy
    approx_longitude = Column(Float, nullable=False)
    district = Column(String(100), nullable=False)
    state = Column(String(100), default="Karnataka")
    severity = Column(String(50), default="Moderate")  # Low, Moderate, High
    affected_acres = Column(Float, default=1.0)
    image_url = Column(String(500), nullable=True)
    is_verified = Column(Boolean, default=False)
    verified_by_expert_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    reporter = relationship("User", back_populates="outbreak_reports", foreign_keys=[user_id])
    crop = relationship("Crop")
    disease = relationship("CropDisease")


class Consultation(Base):
    __tablename__ = "consultations"

    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    expert_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    scan_id = Column(Integer, ForeignKey("disease_scans.id"), nullable=True)
    crop_name = Column(String(100), nullable=False)
    subject = Column(String(255), nullable=False)
    question = Column(Text, nullable=False)
    image_url = Column(String(500), nullable=True)
    answer = Column(Text, nullable=True)
    status = Column(String(50), default="pending")  # pending, answered, closed
    farmer_rating = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    farmer = relationship("User", back_populates="consultations_asked", foreign_keys=[farmer_id])
    expert = relationship("User", back_populates="consultations_answered", foreign_keys=[expert_id])
    scan = relationship("DiseaseScan")


class WeatherRecord(Base):
    __tablename__ = "weather_records"

    id = Column(Integer, primary_key=True, index=True)
    location_name = Column(String(255), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    temp_c = Column(Float, nullable=False)
    humidity_pct = Column(Float, nullable=False)
    rainfall_mm = Column(Float, default=0.0)
    wind_speed_kmh = Column(Float, default=0.0)
    condition_text = Column(String(100), default="Partly Cloudy")
    risk_level = Column(String(50), default="Moderate")  # Low, Moderate, High
    risk_factors = Column(JSON, default=list)
    recorded_at = Column(DateTime, default=datetime.utcnow, index=True)


class ModelVersion(Base):
    __tablename__ = "model_versions"

    id = Column(Integer, primary_key=True, index=True)
    version_name = Column(String(100), unique=True, nullable=False)
    architecture = Column(String(100), nullable=False)  # MobileNetV2, EfficientNetB0
    dataset_name = Column(String(255), nullable=False)
    classes_count = Column(Integer, nullable=False)
    benchmark_test_accuracy = Column(Float, nullable=False)  # Real benchmark accuracy
    realworld_field_accuracy = Column(Float, nullable=False) # Separate real-world field accuracy
    macro_f1 = Column(Float, nullable=False)
    top1_accuracy = Column(Float, nullable=False)
    top3_accuracy = Column(Float, nullable=False)
    is_active = Column(Boolean, default=True)
    weights_path = Column(String(500), nullable=False)
    training_date = Column(DateTime, default=datetime.utcnow)
    notes = Column(Text, nullable=True)

    evaluations = relationship("ModelEvaluation", back_populates="model_version", cascade="all, delete-orphan")


class ModelEvaluation(Base):
    __tablename__ = "model_evaluations"

    id = Column(Integer, primary_key=True, index=True)
    model_version_id = Column(Integer, ForeignKey("model_versions.id"), nullable=False)
    crop_name = Column(String(100), nullable=False)
    disease_name = Column(String(200), nullable=False)
    samples_count = Column(Integer, nullable=False)
    precision = Column(Float, nullable=False)
    recall = Column(Float, nullable=False)
    f1_score = Column(Float, nullable=False)
    dataset_source = Column(String(100), default="Benchmark Validation Set")  # Benchmark or Real-world Field

    model_version = relationship("ModelVersion", back_populates="evaluations")
