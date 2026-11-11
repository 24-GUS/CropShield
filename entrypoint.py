"""
CropShield AI - Standalone Production Entrypoint
Runs the complete full-stack platform (Frontend + Backend + ML + DB) on port 8000.
Zero external dependencies required.
"""
import os
import sys
import webbrowser
import threading
import time

# Ensure proper paths when running or frozen with PyInstaller
if getattr(sys, 'frozen', False):
    BASE_DIR = os.path.dirname(sys.executable)
    BUNDLE_DIR = getattr(sys, '_MEIPASS', BASE_DIR)
else:
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    BUNDLE_DIR = BASE_DIR

# Ensure backend directory is in sys.path
backend_path = os.path.join(BUNDLE_DIR, "backend")
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

import uvicorn
from app.main import app

def open_browser(port=8000):
    time.sleep(1.8)
    url = f"http://127.0.0.1:{port}"
    print(f"\n[INFO] Opening CropShield AI in browser: {url}")
    try:
        webbrowser.open(url)
    except Exception:
        pass

def main():
    print("=" * 64)
    print("  CropShield AI - Autonomous Agricultural Technology Platform")
    print("  Detect Early. Protect Crops. Empower Farmers.")
    print("=" * 64)
    print("  Serving Full-Stack Application on http://127.0.0.1:8000 ...")
    print("=" * 64 + "\n")
    
    threading.Thread(target=open_browser, args=(8000,), daemon=True).start()
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info")

if __name__ == "__main__":
    main()
