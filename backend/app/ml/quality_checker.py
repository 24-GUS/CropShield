import cv2
import numpy as np
from PIL import Image
import io
from typing import Tuple, Dict, Any

class ImageQualityChecker:
    """
    Validates input image quality, resolution, blurriness, and botanical/plant relevance.
    Prevents diagnosing non-plants, dark/blank images, or severely blurred photos.
    """
    MIN_WIDTH = 100
    MIN_HEIGHT = 100
    BLUR_THRESHOLD = 4.0  # Laplacian variance threshold (supports natural mobile macro focus)
    MIN_GREEN_RATIO = 0.07  # Minimum vegetation/chlorophyll pixel ratio
    MIN_CONTRAST = 10.0

    @classmethod
    def check_image(cls, image_bytes: bytes) -> Tuple[bool, str, Dict[str, Any]]:
        try:
            # 0. Magic Header Signature Verification (Strict File Typing)
            is_jpeg = image_bytes.startswith(b'\xff\xd8\xff')
            is_png = image_bytes.startswith(b'\x89PNG\r\n\x1a\n')
            is_webp = len(image_bytes) > 12 and image_bytes[:4] == b'RIFF' and image_bytes[8:12] == b'WEBP'

            if not (is_jpeg or is_png or is_webp):
                return False, "File format rejected: Invalid image magic signature. Only authentic JPEG, PNG, or WEBP photos are allowed.", {
                    "reason": "invalid_magic_signature"
                }

            # 1. Decode image using PIL
            pil_img = Image.open(io.BytesIO(image_bytes))
            if pil_img.mode != 'RGB':
                pil_img = pil_img.convert('RGB')
            
            width, height = pil_img.size
            if width < cls.MIN_WIDTH or height < cls.MIN_HEIGHT:
                return False, f"Image resolution ({width}x{height}) is too small. Minimum required is {cls.MIN_WIDTH}x{cls.MIN_HEIGHT} pixels.", {
                    "reason": "low_resolution", "width": width, "height": height
                }

            # Convert to numpy array for OpenCV analysis
            img_arr = np.array(pil_img)
            gray = cv2.cvtColor(img_arr, cv2.COLOR_RGB2GRAY)

            # 2. Check Blurriness via Laplacian Variance
            laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
            if laplacian_var < cls.BLUR_THRESHOLD:
                return False, f"Image is too blurry (sharpness score {laplacian_var:.1f} < {cls.BLUR_THRESHOLD}). Please hold camera steady in good lighting.", {
                    "reason": "blurry_image", "laplacian_var": float(laplacian_var)
                }

            # 3. Check Contrast & Exposure
            contrast = gray.std()
            brightness = gray.mean()
            if contrast < cls.MIN_CONTRAST:
                return False, f"Image has insufficient contrast (score {contrast:.1f}). Please capture with better background distinction.", {
                    "reason": "low_contrast", "contrast": float(contrast)
                }
            if brightness < 20:
                return False, "Photograph is too dark. Please take photo under adequate daylight.", {
                    "reason": "underexposed", "brightness": float(brightness)
                }
            if brightness > 245:
                return False, "Photograph is overexposed/blown out with light. Please shield from direct glare.", {
                    "reason": "overexposed", "brightness": float(brightness)
                }

            # 4. Botanical / Plant Relevance Check (Excess Green Index & HSV Foliage Hue detection)
            # R, G, B channels
            r = img_arr[:, :, 0].astype(np.float32)
            g = img_arr[:, :, 1].astype(np.float32)
            b = img_arr[:, :, 2].astype(np.float32)

            # Convert to HSV to check saturation and hue
            hsv = cv2.cvtColor(img_arr, cv2.COLOR_RGB2HSV)
            h = hsv[:, :, 0]
            s = hsv[:, :, 1]

            # Excess Green Index: 2G - R - B
            exg = 2 * g - r - b
            # Authentic green botanical foliage (H between 24 and 85, S > 25, V > 25)
            green_foliage_mask = (h >= 24) & (h <= 85) & (s > 25) & (img_arr[:, :, 2] < 220)

            # Chlorotic / diseased leaf tissue (yellow/brown margins and halos)
            chlorosis_mask = (h >= 12) & (h < 24) & (s > 40) & (exg > 0)

            combined_plant_mask = green_foliage_mask | chlorosis_mask
            plant_ratio = np.sum(combined_plant_mask) / (width * height)

            if plant_ratio < cls.MIN_GREEN_RATIO:
                return False, "No plant or leaf tissue detected in this image. Please upload a clear photo of an agricultural plant leaf or fruit.", {
                    "reason": "non_plant_detected", "plant_score": float(plant_ratio)
                }

            return True, "Image quality verified", {
                "width": width,
                "height": height,
                "sharpness": float(laplacian_var),
                "contrast": float(contrast),
                "brightness": float(brightness),
                "plant_score": float(plant_ratio)
            }

        except Exception as e:
            return False, f"Failed to process image format: {str(e)}", {"reason": "corrupted_file"}
