# Multi-Platform Zero-Dependency Container for CropShield AI
FROM python:3.10-slim

# Prevent Python from writing .pyc files & enable unbuffered logging
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install system dependencies required for OpenCV and image processing
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application backend, models, database, and pre-built frontend distribution
COPY backend/ ./backend/
COPY cropshield.db ./cropshield.db
COPY frontend/dist/ ./frontend/dist/
COPY .env.example ./.env

# Create uploads directory
RUN mkdir -p uploads backend/uploads

# Expose unified port 8000
EXPOSE 8000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/api/health || exit 1

# Start full-stack unified application (Frontend + Backend + ML on port 8000)
WORKDIR /app/backend
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
