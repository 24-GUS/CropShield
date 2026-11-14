#!/usr/bin/env bash
echo "============================================================"
echo "  CropShield AI - 1-Click Zero-Friction Platform Launcher"
echo "  Detect Early. Protect Crops. Empower Farmers."
echo "============================================================"
cd "$(dirname "$0")"

# 1. Check Python
if ! command -v python3 &> /dev/null; then
    echo "[ERROR] Python 3.10+ is required to run CropShield AI."
    exit 1
fi

# 2. Auto-install dependencies if not present
python3 -c "import fastapi, uvicorn, sqlalchemy, PIL, cv2, joblib, sklearn" >/dev/null 2>&1 || {
    echo "[INFO] First-time setup detected. Automatically installing dependencies..."
    python3 -m pip install -r requirements.txt
}

# 3. Launch unified server
python3 entrypoint.py
