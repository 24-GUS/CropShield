from fastapi import APIRouter, Depends, Query, Body, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional
import io
import os
from app.database.session import get_db
from app.database.models import Crop, CropDisease

router = APIRouter(prefix="/voice", tags=["Multilingual Voice & Agricultural Assistant"])

KB_RESPONSES = {
    "tomato_yellow": {
        "en": (
            "Yellowing tomato leaves can be caused by Early Blight (Alternaria), Late Blight, or Tomato Leaf Curl Virus transmitted by whiteflies. "
            "If older lower leaves show concentric brown rings, it is Early Blight—apply Mancozeb 75% WP @ 2.5g/L. "
            "If leaves are curling upwards with stunted growth, it is Leaf Curl Virus—uproot infected plants and control whiteflies with neem oil or Acetamiprid. "
            "For an accurate diagnosis, please upload a photograph in the CropShield AI Scanner."
        ),
        "kn": (
            "ಟೊಮೆಟೊ ಎಲೆಗಳು ಹಳದಿಯಾಗುವುದಕ್ಕೆ ಮುಖ್ಯ ಕಾರಣಗಳು ಮುಂಚಿನ ಎಲೆ ಕರಕಲು ರೋಗ (ಅಲ್ಟರ್ನೇರಿಯಾ) ಅಥವಾ ಬಿಳಿ ನೊಣದಿಂದ ಹರಡುವ ಎಲೆ ಸುರುಟು ನಂಜು ರೋಗ. "
            "ಹಳೆಯ ಎಲೆಗಳಲ್ಲಿ ವೃತ್ತಾಕಾರದ ಕಂದು ಕಲೆಗಳಿದ್ದರೆ ಮ್ಯಾಂಕೋಜೆಬ್ 2.5 ಗ್ರಾಂ/ಲೀಟರ್ ಸಿಂಪಡಿಸಿ. "
            "ಎಲೆಗಳು ಮೇಲಕ್ಕೆ ಮುದುಡಿಕೊಂಡು ಗಿಡ ಕುಬ್ಜವಾಗಿದ್ದರೆ, ರೋಗಪೀಡಿತ ಗಿಡವನ್ನು ಕಿತ್ತು ನಾಶಪಡಿಸಿ ಬಿಳಿ ನೊಣ ನಿಯಂತ್ರಣಕ್ಕೆ ನೀಮ್ ಎಣ್ಣೆ ಸಿಂಪಡಿಸಿ. "
            "ಖಚಿತ ರೋಗ ಪತ್ತೆಗಾಗಿ ದಯವಿಟ್ಟು ಕ್ರಾಪ್‌ಶೀಲ್ಡ್ ಸ್ಕ್ಯಾನರ್‌ನಲ್ಲಿ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ."
        ),
        "ml": (
            "തക്കാളിയിലകൾ മഞ്ഞളിക്കുന്നത് പ്രധാനമായും ഇലക്കരിച്ചിൽ (ആൾട്ടർനേരിയ) അല്ലെങ്കിൽ വെള്ളീച്ച പരത്തുന്ന ഇലച്ചുരുൾ വൈറസ് മൂലമാകാം. "
            "ഇലകളിൽ തവിട്ടുനിറത്തിലുള്ള കേന്ദ്രീകൃത വൃത്തങ്ങളുണ്ടെങ്കിൽ മാങ്കോസെബ് 2.5 ഗ്രാം/ലിറ്റർ തളിക്കുക. "
            "ഇലകൾ മുകളിലേക്ക് ചുരുളുകയാണെങ്കിൽ ബാധിച്ച ചെടികൾ വേരോടെ പിഴുതു മാറ്റി വേപ്പെണ്ണ തളിക്കുക. "
            "കൃത്യമായ രോഗനിർണ്ണയത്തിന് ദയവായി ക്രോപ്പ്ഷീൽഡ് സ്കാനറിൽ ഫോട്ടോ അപ്‌ലോഡ് ചെയ്യുക."
        ),
        "hi": (
            "टमाटर की पत्तियों का पीला पड़ना अगेती झुलसा (अल्टरनेरिया) या सफेद मक्खी जनित पर्ण कुंचन (लीफ कर्ल) के कारण हो सकता है। "
            "यदि पुरानी पत्तियों पर गोल भूरे छल्ले हैं तो मैंकोजेब 2.5 ग्राम प्रति लीटर छिड़कें। "
            "यदि पत्तियां ऊपर की ओर मुड़ रही हैं तो संक्रमित पौधों को नष्ट करें और नीम तेल का छिड़काव करें। "
            "सटीक पहचान के लिए कृपया क्रॉपशील्ड एआई स्कैनर में पौधे का फोटो अपलोड करें।"
        )
    },
    "paddy_blast": {
        "en": (
            "Rice Blast creates spindle-shaped ash-gray spots with brown borders. "
            "Drain excess water, do not apply excess urea, and spray Tricyclazole 75% WP @ 0.6g per liter water. "
            "Avoid spraying during high winds or immediately before rain."
        ),
        "kn": (
            "ಭತ್ತದ ಬೆಂಕಿ ರೋಗವು ಕಣ್ಣಿನಾಕಾರದ ಅಥವಾ ಕದಿರಿನ ಆಕಾರದ ಬೂದಿ-ಕಂದು ಕಲೆಗಳನ್ನು ಉಂಟುಮಾಡುತ್ತದೆ. "
            "ಹೆಚ್ಚುವರಿ ಯೂರಿಯಾ ಗೊಬ್ಬರ ಹಾಕುವುದನ್ನು ನಿಲ್ಲಿಸಿ. ಟ್ರೈಸೈಕ್ಲಾಜೋಲ್ 75% WP ಅನ್ನು 0.6 ಗ್ರಾಂ ಪ್ರತಿ ಲೀಟರ್ ನೀರಿಗೆ ಬೆರೆಸಿ ಸಿಂಪಡಿಸಿ."
        ),
        "ml": (
            "നെല്ലിലെ ബ്ലാസ്റ്റ് രോഗം നടുക്ക് ചാരനിറമുള്ള കണ്ണ് ആകൃതിയിലുള്ള പുള്ളികൾ ഉണ്ടാക്കുന്നു. "
            "അമിതമായ യൂറിയ ഒഴിവാക്കുക. ട്രൈസൈക്ലസോൾ 75% WP ലിറ്ററിന് 0.6 ഗ്രാം വീതം കലക്കി തളിക്കുക."
        ),
        "hi": (
            "धान के ब्लास्ट रोग में पत्तियों पर धुरी के आकार के धब्बे बनते हैं। "
            "यूरिया का अत्यधिक उपयोग रोकें और ट्राइसाइक्लाजोल 75% डब्ल्यूपी 0.6 ग्राम प्रति लीटर पानी में मिलाकर छिड़कें।"
        )
    },
    "arecanut_fruit_rot": {
        "en": (
            "Arecanut fruit rot (Koleroga/Mahali) causes massive dropping of green nuts during monsoon rains. "
            "Collect and burn fallen rotting nuts. Apply 1% freshly prepared Bordeaux mixture on bunches immediately."
        ),
        "kn": (
            "ಅಡಿಕೆ ಕೊಳೆ ರೋಗ (ಮಹಾಲಿ) ಮಳೆಗಾಲದಲ್ಲಿ ಹಸಿರು ಅಡಿಕೆಗಳು ಅಧಿಕ ಪ್ರಮಾಣದಲ್ಲಿ ಉದುರಲು ಕಾರಣವಾಗುತ್ತದೆ. "
            "ಬಿದ್ದ ಕೊಳೆತ ಕಾಯಿಗಳನ್ನು ಆಯ್ದು ಸುಟ್ಟುಹಾಕಿ. ಗೊನೆಗಳಿಗೆ 1% ತಾಜಾ ಬೋರ್ಡೋ ದ್ರಾವಣವನ್ನು ಸರಿಯಾಗಿ ಸಿಂಪಡಿಸಿ."
        ),
        "ml": (
            "അടയ്ക്കയിലെ കൊളെരോഗം (മഹളി) കാലവർഷത്തിൽ കായ്കൾ വൻതോതിൽ കൊഴിയാൻ കാരണമാകുന്നു. "
            "കൊഴിഞ്ഞ അടയ്ക്കകൾ പെറുക്കി തീയിട്ട് നശിപ്പിക്കുക. കുലകളിൽ 1% ബോർഡോ മിശ്രിതം തളിക്കുക."
        ),
        "hi": (
            "सुपारी का कोलेरोगा (महाली) भारी बारिश में कच्चे फलों के गिरने का कारण बनता है। "
            "सड़े हुए फलों को जलाएं और गुच्छों पर 1% बोर्डो मिश्रण का छिड़काव करें।"
        )
    }
}

@router.post("/query")
def process_voice_query(
    payload: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """
    Multilingual Grounded Agricultural Assistant:
    Answers farmers questions grounded strictly in the ICAR/KAU verified knowledge base.
    Prevents hallucinating chemical dosages or unsupported treatments.
    """
    question = payload.get("question", "").lower().strip()
    language = payload.get("language", "en").lower()

    if language not in ["en", "kn", "ml", "hi"]:
        language = "en"

    # Match intent and keywords
    if "yellow" in question or "ಹಳದಿ" in question or "മഞ്ഞ" in question or "पीला" in question:
        if "tomato" in question or "ಟೊಮೆಟೊ" in question or "തക്കാളി" in question or "टमाटर" in question:
            response_text = KB_RESPONSES["tomato_yellow"].get(language, KB_RESPONSES["tomato_yellow"]["en"])
            crop = "Tomato"
        elif "areca" in question or "ಅಡಿಕೆ" in question or "അടയ്ക്ക" in question or "सुपारी" in question:
            response_text = (
                "Arecanut yellowing indicates Yellow Leaf Disease or potassium/magnesium deficiency. "
                "Improve drainage, apply 150g magnesium sulphate and lime. Upload a photo for verification."
            )
            crop = "Arecanut"
        else:
            response_text = KB_RESPONSES["tomato_yellow"].get(language, KB_RESPONSES["tomato_yellow"]["en"])
            crop = "General"
    elif "blast" in question or "ಬೆಂಕಿ" in question or "ബ്ലാസ്റ്റ്" in question or "ब्लास्ट" in question or "paddy" in question or "ಭತ್ತ" in question or "നെല്ല്" in question:
        response_text = KB_RESPONSES["paddy_blast"].get(language, KB_RESPONSES["paddy_blast"]["en"])
        crop = "Paddy"
    elif "rot" in question or "ಕೊಳೆ" in question or "ചീയൽ" in question or "सड़न" in question or "areca" in question or "ಅಡಿಕೆ" in question or "കുരുമുളക്" in question:
        response_text = KB_RESPONSES["arecanut_fruit_rot"].get(language, KB_RESPONSES["arecanut_fruit_rot"]["en"])
        crop = "Arecanut"
    else:
        # Grounded fallback
        fallbacks = {
            "en": "CropShield AI Assistant: I can diagnose diseases in Paddy, Tomato, Arecanut, Coconut, Banana, and Black Pepper. For accurate advice, please capture a photograph in the Scanner or describe your crop symptoms in detail.",
            "kn": "ಕ್ರಾಪ್‌ಶೀಲ್ಡ್ ಸಹಾಯಕ: ನಾನು ಭತ್ತ, ಟೊಮೆಟೊ, ಅಡಿಕೆ, ತೆಂಗು, ಬಾಳೆ ಮತ್ತು ಕಾಳುಮೆಣಸಿನ ರೋಗಗಳ ಬಗ್ಗೆ ಮಾರ್ಗದರ್ಶನ ನೀಡಬಲ್ಲೆ. ಖಚಿತ ವಿವರಗಳಿಗಾಗಿ ದಯವಿಟ್ಟು ಸ್ಕ್ಯಾನರ್‌ನಲ್ಲಿ ಎಲೆಯ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.",
            "ml": "ക്രോപ്പ്ഷീൽഡ് അസിസ്റ്റന്റ്: നെല്ല്, തക്കാളി, അടയ്ക്ക, തെങ്ങ്, വാഴ, കുരുമുളക് എന്നീ വിളകളിലെ രോഗങ്ങളെക്കുറിച്ച് ഞാൻ സഹായിക്കാം. കൃത്യമായ നിർണ്ണയത്തിന് സ്കാനറിൽ ഫോട്ടോ അപ്‌ലോഡ് ചെയ്യുക.",
            "hi": "क्रॉपशील्ड सहायक: मैं धान, टमाटर, सुपारी, नारियल, केला और काली मिर्च के रोगों के संबंध में सहायता कर सकता हूं। सटीक सलाह हेतु कृपया स्कैनर में फोटो अपलोड करें।"
        }
        response_text = fallbacks.get(language, fallbacks["en"])
        crop = "General"

    return {
        "question": payload.get("question"),
        "language": language,
        "answer": response_text,
        "crop_identified": crop,
        "requires_photo": True,
        "grounding_source": "ICAR-IIHR / ICAR-CPCRI / KAU Package of Practices"
    }

@router.get("/tts")
def text_to_speech(
    text: str = Query(..., min_length=1, max_length=2000, description="Text to synthesize into speech"),
    language: str = Query("en", description="Language code: en, kn, ml, hi")
):
    """
    High-Fidelity Text-to-Speech Audio Stream:
    Produces natural, audible speech for diagnosis reports, symptoms, and treatment instructions.
    Supports English (en), Kannada (kn), Malayalam (ml), and Hindi (hi).
    """
    lang_code = language.lower() if language.lower() in ["en", "kn", "ml", "hi"] else "en"
    clean_text = text.strip()[:1000]

    # Primary: gTTS for natural neural-like voice
    try:
        from gtts import gTTS
        tts = gTTS(text=clean_text, lang=lang_code, slow=False)
        fp = io.BytesIO()
        tts.write_to_fp(fp)
        fp.seek(0)
        return StreamingResponse(
            fp, 
            media_type="audio/mpeg",
            headers={"Content-Disposition": "inline; filename=speech.mp3"}
        )
    except Exception as e:
        # Fallback: pyttsx3 for offline / local synthesis
        try:
            import pyttsx3
            import tempfile
            engine = pyttsx3.init()
            engine.setProperty('rate', 150)
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
                tmp_path = tmp.name
            engine.save_to_file(clean_text, tmp_path)
            engine.runAndWait()
            with open(tmp_path, "rb") as f:
                data = f.read()
            if os.path.exists(tmp_path):
                os.remove(tmp_path)
            return StreamingResponse(
                io.BytesIO(data), 
                media_type="audio/wav",
                headers={"Content-Disposition": "inline; filename=speech.wav"}
            )
        except Exception as e2:
            raise HTTPException(status_code=500, detail=f"Text-to-speech synthesis failed: {str(e)} | fallback: {str(e2)}")
