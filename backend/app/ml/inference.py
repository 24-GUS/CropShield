import os
import io
import json
import joblib
import numpy as np
from PIL import Image
from typing import Dict, Any, Optional

from app.ml.quality_checker import ImageQualityChecker
from app.ml.train_pipeline import extract_botanical_features, CLASSES, CROP_CLASS_MAP

MODEL_PATH = os.path.join(os.path.dirname(__file__), "../../models/cropshield_calibrated_model.joblib")
METRICS_PATH = os.path.join(os.path.dirname(__file__), "../../models/evaluation_metrics.json")

class DiseasePredictor:
    def __init__(self):
        self.model = None
        self.metrics = None
        self._load_model()

    def _load_model(self):
        try:
            if os.path.exists(MODEL_PATH):
                self.model = joblib.load(MODEL_PATH)
            if os.path.exists(METRICS_PATH):
                with open(METRICS_PATH, "r") as f:
                    self.metrics = json.load(f)
        except Exception as e:
            print(f"Warning: Could not load model: {e}")

    def predict_image(
        self,
        image_bytes: bytes,
        selected_crop_name: Optional[str] = None,
        language: str = "en"
    ) -> Dict[str, Any]:
        """
        Executes end-to-end validated inference pipeline:
        1. Image format, resolution, blur & botanical plant check
        2. Deep feature extraction
        3. Calibrated multi-class classification
        4. Confidence thresholding (Abstention on low confidence)
        5. Crop-disease consistency validation
        """
        # Step 1: Quality & Botanical Relevance Check
        is_valid, quality_msg, quality_details = ImageQualityChecker.check_image(image_bytes)
        if not is_valid:
            return {
                "status": "invalid_image" if quality_details.get("reason") != "non_plant_detected" else "non_plant",
                "success": False,
                "error": quality_msg,
                "quality_details": quality_details,
                "confidence": 0.0,
                "requires_expert": False
            }

        # Step 2: Ensure Model is loaded
        if self.model is None:
            self._load_model()
            if self.model is None:
                return {
                    "status": "model_unavailable",
                    "success": False,
                    "error": "CropShield AI diagnosis model is temporarily unavailable. Please retry in a few moments.",
                    "requires_expert": True
                }

        # Step 3: Feature Extraction
        try:
            pil_img = Image.open(io.BytesIO(image_bytes))
            features = extract_botanical_features(pil_img)
            feat_arr = features.reshape(1, -1)
        except Exception as e:
            return {
                "status": "processing_error",
                "success": False,
                "error": f"Error during image feature extraction: {str(e)}"
            }

        # Step 4: Calibrated Probability Prediction
        probabilities = self.model.predict_proba(feat_arr)[0]
        entropy = -np.sum(probabilities * np.log(probabilities + 1e-9))

        # Determine crop candidate classes if selected_crop_name is specified
        candidate_classes = None
        if selected_crop_name:
            for crop_name, disease_list in CROP_CLASS_MAP.items():
                if crop_name.lower() == selected_crop_name.lower():
                    candidate_classes = disease_list
                    selected_crop_name = crop_name
                    break

        if candidate_classes:
            # Condition probabilities on candidate diseases of the selected crop
            cand_indices = [CLASSES.index(c) for c in candidate_classes if c in CLASSES]
            crop_prob_sum = float(sum(probabilities[idx] for idx in cand_indices))

            # Check if there is an extreme crop mismatch
            global_top_idx = int(np.argmax(probabilities))
            global_top_class = CLASSES[global_top_idx]
            global_top_prob = float(probabilities[global_top_idx])

            global_crop = None
            for cname, dlist in CROP_CLASS_MAP.items():
                if global_top_class in dlist:
                    global_crop = cname
                    break

            if crop_prob_sum < 0.08 and global_top_prob > 0.85 and global_crop and global_crop.lower() != selected_crop_name.lower():
                return {
                    "status": "crop_mismatch",
                    "success": True,
                    "selected_crop": selected_crop_name,
                    "detected_crop": global_crop,
                    "disease_code": global_top_class,
                    "confidence": round(global_top_prob, 4),
                    "message": (
                        f"Selected crop is '{selected_crop_name}', but the photograph appears to be '{global_crop}'. "
                        f"Please confirm the crop selection or upload the photograph corresponding to {selected_crop_name}."
                    ),
                    "top3_predictions": [
                        {"class_code": global_top_class, "confidence": round(global_top_prob, 4), "confidence_pct": round(global_top_prob * 100, 2)}
                    ],
                    "requires_expert": False
                }

            # Normalize probabilities across candidate diseases
            eps = 1e-7
            normalized_crop_mass = max(crop_prob_sum, eps)
            cand_probs = [(c, float(probabilities[CLASSES.index(c)] / normalized_crop_mass)) for c in candidate_classes if c in CLASSES]
            cand_probs.sort(key=lambda x: x[1], reverse=True)

            top1_class = cand_probs[0][0]
            top1_prob = cand_probs[0][1]
            detected_crop = selected_crop_name

            top3_predictions = [
                {
                    "class_code": c,
                    "confidence": round(p, 4),
                    "confidence_pct": round(p * 100, 2)
                }
                for c, p in cand_probs[:3]
            ]
        else:
            top_indices = np.argsort(probabilities)[::-1]
            top1_idx = int(top_indices[0])
            top1_class = CLASSES[top1_idx]
            top1_prob = float(probabilities[top1_idx])
            detected_crop = None
            for crop_name, disease_list in CROP_CLASS_MAP.items():
                if top1_class in disease_list:
                    detected_crop = crop_name
                    break

            top3_predictions = [
                {
                    "class_code": CLASSES[int(idx)],
                    "confidence": round(float(probabilities[int(idx)]), 4),
                    "confidence_pct": round(float(probabilities[int(idx)]) * 100, 2)
                }
                for idx in top_indices[:3]
            ]

        # Step 5: Scientific Abstention Threshold
        if top1_prob < 0.35:
            return {
                "status": "uncertain_prediction",
                "success": True,
                "disease_code": top1_class,
                "confidence": round(top1_prob, 4),
                "confidence_pct": round(top1_prob * 100, 1),
                "entropy": round(float(entropy), 3),
                "message": (
                    "Unable to confidently identify the disease with high certainty. "
                    "The symptoms are ambiguous or multiple leaf conditions overlap. "
                    "Please upload a clearer photograph with direct daylight or consult an agricultural expert."
                ),
                "top3_predictions": top3_predictions,
                "requires_expert": True
            }

        # Step 6: Confidence Qualification & Advanced Clinical Diagnosis
        confidence_level = "High" if top1_prob >= 0.70 else "Moderate"
        is_healthy = "healthy" in top1_class

        # Determine Advanced Pathology Indicators
        if is_healthy:
            pathology_stage = "Healthy Botanical Tissue"
            treatment_urgency = "Routine Preventive Maintenance"
            severity_code = "None"
        elif "blight" in top1_class or "koleroga" in top1_class or "rot" in top1_class or "wilt" in top1_class:
            pathology_stage = "Active Necrotic / Pathogen Infection"
            treatment_urgency = "Immediate Intervention (Within 24-48 Hours)"
            severity_code = "High"
        elif "virus" in top1_class:
            pathology_stage = "Systemic Viral / Vector Infestation"
            treatment_urgency = "Immediate Vector Quarantine"
            severity_code = "Severe"
        else:
            pathology_stage = "Early Foliar Lesion Development"
            treatment_urgency = "Prompt Protective Spray Recommended"
            severity_code = "Moderate"

        return {
            "status": "completed",
            "success": True,
            "disease_code": top1_class,
            "detected_crop": detected_crop,
            "is_healthy": is_healthy,
            "confidence": round(top1_prob, 4),
            "confidence_pct": round(top1_prob * 100, 1),
            "confidence_level": confidence_level,
            "uncertainty_entropy": round(float(entropy), 3),
            "pathology_stage": pathology_stage,
            "treatment_urgency": treatment_urgency,
            "severity_code": severity_code,
            "top3_predictions": top3_predictions,
            "quality_details": quality_details,
            "requires_expert": confidence_level == "Moderate"
        }

predictor = DiseasePredictor()
