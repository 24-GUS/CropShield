# ==============================================================================
# CropShield AI - Production Cloud & Multi-Platform Container
# Multi-Stage Build:
#   Stage 1: Node.js 20 builds the React Vite TypeScript Frontend SPA
#   Stage 2: Python 3.10-slim runtime hosts FastAPI + 62-Dim ML Model + SQLite
# ==============================================================================

# ----------------------------------------------------
# Stage 1: Build Frontend Assets
# ----------------------------------------------------
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

# Install dependencies
COPY frontend/package*.json ./
RUN npm ci

# Copy frontend source and build static distribution
COPY frontend/ ./
RUN npm run build

# ----------------------------------------------------
# Stage 2: Production Python Runtime & Static Serving
# ----------------------------------------------------
FROM python:3.10-slim

# Prevent Python from writing .pyc files & enable unbuffered logging
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000

# Install system libraries needed by OpenCV and image processing
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application backend, models, database, and configuration
COPY backend/ ./backend/
COPY cropshield.db ./cropshield.db
COPY .env.example ./.env

# Copy compiled frontend assets from Stage 1 into frontend/dist
COPY --from=frontend-builder /app/frontend/dist/ ./frontend/dist/

# Ensure runtime directories exist
RUN mkdir -p uploads backend/uploads backend/models

# Expose default HTTP port
EXPOSE 8000

# Healthcheck targeting dynamic port
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:${PORT:-8000}/api/health || exit 1

# Start full-stack unified server (FastAPI serves REST API + ML inference + SPA)
WORKDIR /app/backend
CMD ["sh", "-c", "python -m uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
