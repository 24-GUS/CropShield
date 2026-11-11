# CropShield AI - Architectural Specification
**AI-Powered Early Crop Disease Detection, Prediction and Agricultural Assistance Platform**

---

## 1. High-Level System Architecture

CropShield AI follows a modern, decoupled client-server architecture designed for high availability, low mobile latency, and offline-tolerant field operations.

```mermaid
flowchart TD
    User["Farmer / Expert / Admin Mobile & Web Client"]
    Vite["React 18 + TypeScript + Tailwind CSS (Vite Frontend)"]
    API["FastAPI REST Backend (Python 3.10)"]
    DB[("Relational Database - SQLite / Supabase PostgreSQL")]
    ML["Calibrated Machine Learning Engine (MobileNetV2 / ExtraTrees Ensemble)"]
    Weather["Open-Meteo Meteorological Feed"]
    Voice["Web Speech Recognition & Synthesis Engine"]

    User -->|HTTPS / WSS| Vite
    Vite -->|REST JSON / Multipart| API
    Vite -->|Audio I/O| Voice
    API -->|SQLAlchemy ORM| DB
    API -->|In-Memory Inference| ML
    API -->|HTTP REST| Weather
```

---

## 2. Machine Learning Diagnostic Flow & Guardrails

CropShield enforces a multi-tiered validation pipeline before returning a diagnosis to prevent erroneous pesticide applications:

```mermaid
flowchart TD
    Upload["Input Photograph Uploaded"] --> Step1["Step 1: Format & Resolution Validation"]
    Step1 -->|Pass| Step2["Step 2: Botanical & Chlorophyll Check (ExG & HSV Foliage)"]
    Step1 -->|Fail| Err1["Reject: Low Resolution / Corrupt File"]

    Step2 -->|Vegetation Detected| Step3["Step 3: Sharpness & Exposure Check (Laplacian Variance)"]
    Step2 -->|No Plant Tissue| Err2["Reject: Non-Plant Object Detected"]

    Step3 -->|Pass| Step4["Step 4: Botanical Feature Extraction & Neural Embedding"]
    Step3 -->|Too Blurry / Overexposed| Err3["Reject: Blurry or Underexposed Photo"]

    Step4 --> Step5["Step 5: Calibrated Multi-Class Probability Output"]
    Step5 --> Step6{"Confidence & Entropy Check"}

    Step6 -->|Confidence >= 85%| HighConf["Confirmed Diagnosis & Immediate IPM Action"]
    Step6 -->|65% <= Confidence < 85%| MedConf["Qualified Diagnosis & Expert Review Prompt"]
    Step6 -->|Confidence < 65% or High Entropy| Abstain["Scientific Abstention: 'Unable to confidently identify disease'"]

    Step5 --> Step7{"Crop Consistency Check"}
    Step7 -->|Mismatch Detected| MismatchErr["Flag Crop Mismatch (e.g. Tomato uploaded for Paddy)"]
```

---

## 3. Role-Based Access Control (RBAC)

| Capability / Module | Farmer | Agricultural Expert | System Administrator |
|---|:---:|:---:|:---:|
| 1-Click Demo Account Access | Yes | Yes | Yes |
| Run AI Disease Scanner | Yes | Yes | Yes |
| View Own Farm Scan History | Yes | Yes | Yes |
| Request Expert Consultation | Yes | N/A | Yes |
| Audit & Verify AI Predictions | Read-only | **Verify / Correct** | Full Access |
| Answer Farmer Questions | View Only | **Formulate Advice** | Full Access |
| Report Community Outbreak | **Anonymous Alert** | **Verify Outbreak** | Full Access |
| View Outbreak Map | Fuzzy (~200m) | Verified Status | Full Telemetry |
| Access Model Benchmarks | View | View | Full Telemetry |
| Multilingual Voice Assistant | Yes | Yes | Yes |

---

## 4. Privacy & Location Fuzzing

In compliance with agricultural privacy standards:
- Exact GPS coordinates of farm plots are never stored in public outbreak tables.
- Coordinate fuzzing applies a random jitter offset ($\pm 200$ meters) at report creation.
- Public map queries group incidents by Taluk and District.
- Farmer phone numbers and personal contact information are strictly kept private.
