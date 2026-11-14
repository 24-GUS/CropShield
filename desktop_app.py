"""
CropShield AI - Standalone Desktop Application
Launches CropShield AI as a dedicated single-window desktop app (like Chrome/Edge PWA)
with no address bar, no tabs, and full native desktop windowing.
"""
import os
import sys
import time
import subprocess
import urllib.request

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
BACKEND_DIR = os.path.join(BASE_DIR, "backend")
PROFILE_DIR = os.path.join(BASE_DIR, ".desktop_app_profile")
PORT = 8000
TARGET_URL = f"http://127.0.0.1:{PORT}"

def is_server_running():
    try:
        req = urllib.request.Request(f"{TARGET_URL}/api/health", headers={"User-Agent": "CropShieldDesktop"})
        with urllib.request.urlopen(req, timeout=1.5) as r:
            return r.status == 200
    except Exception:
        return False

def start_backend():
    print("[1/2] Starting CropShield AI Engine in background...")
    cmd = [
        sys.executable,
        "-m", "uvicorn",
        "app.main:app",
        "--host", "127.0.0.1",
        "--port", str(PORT)
    ]
    # Hide subprocess console window on Windows
    startupinfo = None
    creationflags = 0
    if sys.platform == "win32":
        creationflags = getattr(subprocess, "CREATE_NO_WINDOW", 0x08000000)

    backend_proc = subprocess.Popen(
        cmd,
        cwd=BACKEND_DIR,
        creationflags=creationflags
    )
    return backend_proc

def find_app_browser():
    candidates = [
        # Chrome paths
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
        os.path.expandvars(r"%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe"),
        # Edge paths
        r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
        r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
        os.path.expandvars(r"%LOCALAPPDATA%\Microsoft\Edge\Application\msedge.exe"),
        # Brave / Other Chromium paths
        r"C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe",
    ]
    for c in candidates:
        if os.path.exists(c):
            return c
    return None

def main():
    backend_proc = None
    if not is_server_running():
        backend_proc = start_backend()
        # Wait up to 10 seconds for backend to be ready
        for _ in range(20):
            time.sleep(0.5)
            if is_server_running():
                break

    os.makedirs(PROFILE_DIR, exist_ok=True)
    browser_exe = find_app_browser()

    if browser_exe:
        print(f"[2/2] Launching dedicated application window via {os.path.basename(browser_exe)}...")
        app_cmd = [
            browser_exe,
            f"--app={TARGET_URL}",
            "--window-size=1280,820",
            "--window-position=100,60",
            f"--user-data-dir={PROFILE_DIR}",
            "--disable-extensions",
            "--no-first-run",
            "--no-default-browser-check"
        ]
        try:
            window_proc = subprocess.Popen(app_cmd)
            window_proc.wait()
        except KeyboardInterrupt:
            pass
    else:
        # Fallback to default browser if no Chromium app engine found
        import webbrowser
        webbrowser.open(TARGET_URL)

    # Clean shutdown
    if backend_proc:
        try:
            backend_proc.terminate()
        except Exception:
            pass

if __name__ == "__main__":
    main()
