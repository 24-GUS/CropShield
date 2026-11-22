# CropShield AI - REST API Documentation
**Version:** 1.0.0 | **Base URL:** `/api/v1`

---

## 1. Authentication Endpoints (`/api/v1/auth`)

### `POST /auth/register`
Creates a new user account (Farmer, Agricultural Expert, or Administrator).

**Request Body:**
```json
{
  "email": "farmer@example.com",
  "password": "SecurePassword123",
  "full_name": "Basavaraj Gowda",
  "phone": "+91 98451 23456",
  "role": "farmer",
  "language_pref": "kn",
  "state": "Karnataka",
  "district": "Shivamogga",
  "farm_name": "Sahyadri Plantation",
  "primary_crop": "Paddy",
  "area_acres": 3.5
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsIn...",
  "token_type": "bearer",
  "user_id": 1,
  "email": "farmer@example.com",
  "role": "farmer",
  "full_name": "Basavaraj Gowda",
  "language_pref": "kn"
}
```

### `GET /auth/demo-login/{role}`
Quick role-based access for sandbox testing:
- Roles: `farmer`, `expert`, `admin`.

---

## 2. Crops & Disease Library (`/api/v1/crops`)

### `GET /crops`
Returns all supported regional crops with botanical classifications, seasons, and local names.

### `GET /crops/diseases/all`
Query parameters:
- `crop_name`: filter by crop (e.g. `Paddy`, `Tomato`, `Arecanut`)
- `severity`: filter by severity (`Low`, `Moderate`, `High`, `Severe`)
- `search`: search term across symptoms, scientific name, and pathogen

---

## 3. AI Disease Detection (`/api/v1/scans`)

### `POST /scans/analyze`
Executes end-to-end neural diagnosis.

**Form Data:**
- `crop_id`: Integer ID of the crop
- `image`: Binary image file (multipart/form-data)
- `weather_json`: (Optional) JSON string of local weather context

**Success Response:**
```json
{
  "success": true,
  "status": "completed",
  "scan_id": 14,
  "crop_name": "Paddy",
  "disease_name": "Rice Blast (Leaf & Neck Blast)",
  "confidence": 0.978,
  "confidence_pct": 97.8,
  "confidence_level": "High",
  "severity": "Severe",
  "symptoms": "Spindle-shaped lesions with ash-gray center...",
  "recommended_treatment": "Spray Tricyclazole 75% WP @ 0.6g/L...",
  "top3_predictions": [
    { "class_code": "paddy_blast", "confidence": 0.978, "confidence_pct": 97.8 },
    { "class_code": "paddy_brown_spot", "confidence": 0.015, "confidence_pct": 1.5 },
    { "class_code": "paddy_healthy", "confidence": 0.007, "confidence_pct": 0.7 }
  ],
  "requires_expert": false
}
```

### `POST /scans/{scan_id}/verify` (Expert Only)
Allows agricultural scientist to confirm or correct AI diagnosis.

---

## 4. Meteorological Disease Forecasting (`/api/v1/weather`)

### `GET /weather/current`
Query parameters: `lat`, `lng`, `location_name`.
Returns current temperature, humidity, rainfall, wind, 5-day forecast, and biological epidemiological risks for Arecanut Koleroga, Paddy Blast, Tomato Late Blight, and Pepper Foot Rot.

---

## 5. Community Outbreak Surveillance (`/api/v1/outbreaks`)

### `GET /outbreaks`
Returns regional disease clusters with privacy-fuzzed coordinates.

### `POST /outbreaks`
Submits an anonymous outbreak report.

---

## 6. Multilingual Grounded Voice Assistant (`/api/v1/voice`)

### `POST /voice/query`
Receives questions in Kannada, Malayalam, Hindi, or English. Returns answers strictly grounded in ICAR/KAU verified agronomic protocols.
