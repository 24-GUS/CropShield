import pytest
import os
import io
from fastapi.testclient import TestClient
from PIL import Image

import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../backend")))

from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_demo_login():
    # Test Farmer demo login
    res_farmer = client.get("/api/v1/auth/demo-login/farmer")
    assert res_farmer.status_code == 200
    data_farmer = res_farmer.json()
    assert "access_token" in data_farmer
    assert data_farmer["role"] == "farmer"

    # Test Expert demo login
    res_expert = client.get("/api/v1/auth/demo-login/expert")
    assert res_expert.status_code == 200
    assert res_expert.json()["role"] == "expert"

    # Test Admin demo login
    res_admin = client.get("/api/v1/auth/demo-login/admin")
    assert res_admin.status_code == 200
    assert res_admin.json()["role"] == "admin"

def test_get_crops_and_diseases():
    response = client.get("/api/v1/crops")
    assert response.status_code == 200
    crops = response.json()
    assert len(crops) >= 6
    crop_names = [c["name"] for c in crops]
    assert "Paddy" in crop_names
    assert "Tomato" in crop_names
    assert "Arecanut" in crop_names

    # Check diseases library
    res_dis = client.get("/api/v1/crops/diseases/all")
    assert res_dis.status_code == 200
    diseases = res_dis.json()
    assert len(diseases) >= 15

def test_weather_and_disease_risk():
    response = client.get("/api/v1/weather/current?lat=13.9299&lng=75.5681&location_name=Shivamogga")
    assert response.status_code == 200
    data = response.json()
    assert "temperature_c" in data
    assert "humidity_pct" in data
    assert "overall_risk_level" in data
    assert len(data["risk_factors"]) >= 3

def test_multilingual_voice_assistant():
    # English Query
    res_en = client.post("/api/v1/voice/query", json={"question": "My tomato leaves are turning yellow, what should I do?", "language": "en"})
    assert res_en.status_code == 200
    assert "tomato" in res_en.json()["answer"].lower() or "blight" in res_en.json()["answer"].lower()

    # Kannada Query
    res_kn = client.post("/api/v1/voice/query", json={"question": "ಟೊಮೆಟೊ ಎಲೆಗಳು ಹಳದಿಯಾಗುತ್ತಿವೆ", "language": "kn"})
    assert res_kn.status_code == 200
    assert res_kn.json()["language"] == "kn"
    assert "ಟೊಮೆಟೊ" in res_kn.json()["answer"]

def test_invalid_image_rejection():
    # Log in as farmer
    res_login = client.get("/api/v1/auth/demo-login/farmer")
    token = res_login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Upload invalid metallic / non-plant image
    invalid_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../frontend/public/demo_samples/invalid_non_plant.jpg"))
    if os.path.exists(invalid_path):
        with open(invalid_path, "rb") as f:
            files = {"image": ("test.jpg", f, "image/jpeg")}
            data = {"crop_id": 1}
            response = client.post("/api/v1/scans/analyze", headers=headers, files=files, data=data)
            assert response.status_code == 200
            res_data = response.json()
            assert res_data["success"] is False
            assert res_data["status"] == "non_plant"

def test_real_plant_image_scan():
    # Log in as farmer
    res_login = client.get("/api/v1/auth/demo-login/farmer")
    token = res_login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Get Paddy crop id
    crops = client.get("/api/v1/crops").json()
    paddy_id = next(c["id"] for c in crops if c["name"] == "Paddy")

    # Upload Paddy blast sample
    blast_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../frontend/public/demo_samples/paddy_blast.jpg"))
    if os.path.exists(blast_path):
        with open(blast_path, "rb") as f:
            files = {"image": ("paddy_blast.jpg", f, "image/jpeg")}
            data = {"crop_id": paddy_id}
            response = client.post("/api/v1/scans/analyze", headers=headers, files=files, data=data)
            assert response.status_code == 200
            res_data = response.json()
            assert res_data["success"] is True
            assert "blast" in res_data["disease_name"].lower()
            assert res_data["confidence"] > 0.8
