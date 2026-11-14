"""
CropShield AI - 1-Click Application Launcher
Detect Early. Protect Crops. Empower Farmers.
"""
import os
import sys
import subprocess
import webbrowser
import time

def main():
    print("=" * 64)
    print("  CropShield AI - Launching Agricultural Technology Platform")
    print("  Detect Early. Protect Crops. Empower Farmers.")
    print("=" * 64)
    
    base_dir = os.path.abspath(os.path.dirname(__file__))
    backend_dir = os.path.join(base_dir, "backend")
    frontend_dir = os.path.join(base_dir, "frontend")

    # 1. Start FastAPI backend
    backend_cmd = [sys.executable, "-m", "uvicorn", "app.main:app", "--port", "8000", "--host", "127.0.0.1"]
    print("\n[1/3] Starting FastAPI Backend on http://127.0.0.1:8000 ...")
    backend_proc = subprocess.Popen(backend_cmd, cwd=backend_dir)
    
    time.sleep(2)
    
    # 2. Start Vite frontend
    print("[2/3] Starting Vite React Frontend on http://127.0.0.1:5173 ...")
    npm_cmd = "npm.cmd" if sys.platform == "win32" else "npm"
    frontend_proc = subprocess.Popen([npm_cmd, "run", "dev", "--", "--host", "127.0.0.1", "--port", "5173"], cwd=frontend_dir)
    
    time.sleep(2)
    
    # 3. Open browser
    target_url = "http://127.0.0.1:5173"
    print(f"[3/3] Opening {target_url} in your browser...")
    try:
        webbrowser.open(target_url)
    except Exception:
        pass
    
    print("\n" + "=" * 64)
    print("  CropShield AI is LIVE & RUNNING!")
    print(f"  • Web Application:     {target_url}")
    print("  • Backend REST API:    http://127.0.0.1:8000/docs")
    print("  • API Health:          http://127.0.0.1:8000/api/health")
    print("  Press Ctrl+C to terminate all services.")
    print("=" * 64 + "\n")
    
    try:
        backend_proc.wait()
    except KeyboardInterrupt:
        print("\nShutting down CropShield AI services cleanly...")
        backend_proc.terminate()
        frontend_proc.terminate()
        print("Shutdown complete.")

if __name__ == "__main__":
    main()
