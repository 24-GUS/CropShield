import os
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.database.session import engine, Base
from app.database.seed_data import seed_database
from app.api import auth, crops, scans, weather, outbreaks, consultations, analytics, voice

# Ensure database tables exist
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="AI-Powered Early Crop Disease Detection, Prediction and Agricultural Assistance Platform"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security Hardening Headers Middleware (OWASP Security Standards)
@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response

# Static files for uploaded scan images and demo samples
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

demo_samples_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../frontend/public/demo_samples"))
if os.path.exists(demo_samples_dir):
    app.mount("/demo_samples", StaticFiles(directory=demo_samples_dir), name="demo_samples")

# Register API Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(crops.router, prefix=settings.API_V1_STR)
app.include_router(scans.router, prefix=settings.API_V1_STR)
app.include_router(weather.router, prefix=settings.API_V1_STR)
app.include_router(outbreaks.router, prefix=settings.API_V1_STR)
app.include_router(consultations.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)
app.include_router(voice.router, prefix=settings.API_V1_STR)

# Frontend Distribution Directory (for zero-dependency standalone hosting)
frontend_dist_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../frontend/dist"))
if os.path.exists(frontend_dist_dir):
    assets_dir = os.path.join(frontend_dist_dir, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="frontend-assets")

@app.on_event("startup")
def startup_event():
    # Automatically verify and seed database if empty
    try:
        seed_database()
    except Exception as e:
        print(f"Startup check: {e}")

@app.get("/")
def root(request: Request):
    index_file = os.path.join(frontend_dist_dir, "index.html")
    accept = request.headers.get("accept", "")
    if os.path.exists(index_file) and ("text/html" in accept or "*/*" in accept):
        return FileResponse(index_file)
    return {
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "operational",
        "docs_url": "/docs",
        "api_v1": settings.API_V1_STR
    }

@app.get("/health")
@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "CropShield AI Backend API"}

# SPA Fallback Route for Client-Side Routing
@app.get("/{full_path:path}")
def serve_spa_route(full_path: str):
    if full_path.startswith("api/") or full_path.startswith("docs") or full_path.startswith("openapi.json"):
        raise HTTPException(status_code=404, detail="Endpoint not found")
    
    file_path = os.path.join(frontend_dist_dir, full_path)
    if os.path.isfile(file_path):
        return FileResponse(file_path)
    
    index_file = os.path.join(frontend_dist_dir, "index.html")
    if os.path.isfile(index_file):
        return FileResponse(index_file)
    
    raise HTTPException(status_code=404, detail="Page not found")
