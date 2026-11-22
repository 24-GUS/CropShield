import os
from pydantic_settings import BaseSettings
from typing import List

BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../.."))
DEFAULT_DB_FILE = os.path.join(BACKEND_DIR, "cropshield.db").replace("\\", "/")
DEFAULT_DB_URL = f"sqlite:///{DEFAULT_DB_FILE}"

class Settings(BaseSettings):
    PROJECT_NAME: str = "CropShield AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "cropshield-super-secret-production-key-2025-secure")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Database: SQLite by default for zero-setup local execution; PostgreSQL / Supabase URI via env in production
    DATABASE_URL: str = os.getenv("DATABASE_URL", DEFAULT_DB_URL)

    # CORS settings
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]

    # Weather API (Open-Meteo is free & no key needed, fallback to OpenWeatherMap if key set)
    OPENWEATHER_API_KEY: str = os.getenv("OPENWEATHER_API_KEY", "")

    # Storage paths
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", os.path.join(BACKEND_DIR, "uploads"))
    MODEL_DIR: str = os.getenv("MODEL_DIR", os.path.join(BACKEND_DIR, "models"))

    class Config:
        case_sensitive = True

settings = Settings()
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.MODEL_DIR, exist_ok=True)
