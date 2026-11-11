# CropShield AI - Deployment Guide

## 1. Zero-Setup Local Execution (Development Mode)

### Prerequisites:
- Python 3.10+
- Node.js v18+ and npm

### Step 1: Backend Setup
```bash
# Navigate to backend directory
cd backend

# Seed the database and generate initial demo models
python -m app.database.seed_data
python -m app.ml.train_pipeline

# Start the FastAPI server
python -m uvicorn app.main:app --reload --port 8000
```
Backend API will be live at `http://127.0.0.1:8000` with interactive Swagger docs at `http://127.0.0.1:8000/docs`.

### Step 2: Frontend Setup
In a new terminal:
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies (if not already done)
npm install

# Start Vite dev server
npm run dev
```
Frontend application will be live at `http://localhost:5173`.

---

## 2. Production Database Setup (Supabase PostgreSQL)

CropShield AI uses SQLite out-of-the-box for zero-setup execution. For enterprise multi-tenant deployment:
1. Create a free project on [Supabase](https://supabase.com).
2. Copy your PostgreSQL connection string from Database Settings.
3. Set the environment variable:
   ```bash
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
   ```
4. Run `python -m app.database.seed_data`. SQLAlchemy models will automatically provision all schemas, foreign keys, and indexes on Supabase.

---

## 3. Production Cloud Hosting

### Frontend (Vercel):
- Framework Preset: `Vite`
- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: `dist`
- Environment Variable: `VITE_API_BASE_URL=https://your-backend-api.onrender.com/api/v1`

### Backend (Render / Linux VPS):
- Environment: Python 3.10
- Build Command: `pip install -r requirements.txt`
- Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
