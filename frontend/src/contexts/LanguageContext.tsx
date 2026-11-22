import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Language } from '../types';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  speak: (text: string, customLang?: Language) => void;
  isSpeaking: boolean;
  stopSpeaking: () => void;
}

const TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    // Brand & Header
    appName: "CropShield AI",
    tagline: "Detect Early. Protect Crops. Empower Farmers.",
    switchRole: "Demo Role Switcher",
    farmer: "Farmer",
    expert: "Agricultural Expert",
    admin: "Admin",

    // Navigation
    navDashboard: "Dashboard",
    navScanner: "AI Disease Scanner",
    navCrops: "My Crops & Farms",
    navLibrary: "Disease Library",
    navTreatments: "Treatment Guides",
    navWeather: "Weather & Risk",
    navMap: "Outbreak Map",
    navConsult: "Expert Advice",
    navHistory: "Scan History",
    navModelMetrics: "Model Benchmark",
    navSettings: "Settings & Language",
    navExpertPortal: "Expert Review Portal",
    navAdminPortal: "Admin Dashboard",

    // Dashboard
    welcomeFarmer: "Welcome back",
    smartDashboard: "Smart Agricultural Dashboard",
    totalScans: "Total Scans",
    healthyScans: "Healthy Crops",
    diseasedScans: "Infections Detected",
    riskLevel: "Environmental Risk",
    recentScans: "Recent Crop Diagnoses",
    recommendedActions: "Priority Seasonal Advisory",
    quickScan: "Quick AI Scan",
    activeAlerts: "Outbreak Alerts in Your District",

    // Scanner
    scanTitle: "AI Crop Disease Scanner",
    scanSubtitle: "Upload or capture a plant leaf or fruit photo for instant calibrated diagnostic analysis.",
    selectCropPrompt: "Select Crop Category",
    choosePhoto: "Choose Photograph",
    dragDropPhoto: "Drag and drop leaf photograph or click to browse",
    captureCamera: "Capture using Camera",
    analyzeBtn: "Analyze Plant Health",
    analyzing: "Running Neural Model & Calibrating Confidence...",
    trySample: "Try Verified Benchmark Samples",

    // Results
    diagnosisResult: "Disease Diagnosis Report",
    confidence: "Prediction Confidence",
    severity: "Disease Severity",
    symptoms: "Visible Symptoms",
    causes: "Underlying Pathogen & Causes",
    immediateAction: "Immediate Curative Actions",
    ipmPrevention: "IPM & Long-term Prevention",
    safetyPrecautions: "Pesticide Safety & Dosage",
    expertVerifyPrompt: "Request Agricultural Expert Review",
    shareOutbreakPrompt: "Report to Community Outbreak Map",

    // Voice
    voiceAssistant: "CropShield Voice Assistant",
    speakQuestion: "Ask a question in your preferred language",
    listening: "Listening... Speak now",
    askByVoice: "Voice Assistant",

    // Outbreak Map
    outbreakMapTitle: "Regional Crop Disease Outbreak Map",
    outbreakSubtitle: "Community-driven surveillance protecting crops across Karnataka and Kerala.",
    reportOutbreakBtn: "Report Local Outbreak",

    // Weather
    weatherTitle: "Microclimate & Epidemiological Risk",
    weatherSubtitle: "Real-time meteorological monitoring with pathogen forecasting.",

    // Expert & Admin
    pendingVerifications: "Pending AI Diagnosis Reviews",
    verifyAction: "Verify & Document",
    accuracyBenchmark: "Independent Benchmark Accuracy",
    realWorldAccuracy: "Unseen Field Accuracy",
  },
  kn: {
    // Brand & Header
    appName: "ಕ್ರಾಪ್‌ಶೀಲ್ಡ್ AI",
    tagline: "ಮುಂಚಿತವಾಗಿಯೇ ಪತ್ತೆಹಚ್ಚಿ. ಬೆಳೆಗಳನ್ನು ರಕ್ಷಿಸಿ. ರೈತರನ್ನು ಸಶಕ್ತಗೊಳಿಸಿ.",
    switchRole: "ಡೆಮೊ ಖಾತೆ ಬದಲಾವಣೆ",
    farmer: "ರೈತರು",
    expert: "ಕೃಷಿ ತಜ್ಞರು",
    admin: "ನಿರ್ವಾಹಕರು",

    // Navigation
    navDashboard: "ಮುಖಪುಟ",
    navScanner: "AI ರೋಗ ಸ್ಕ್ಯಾನರ್",
    navCrops: "ನನ್ನ ಬೆಳೆಗಳು ಮತ್ತು ಜಮೀನು",
    navLibrary: "ರೋಗಗಳ ಮಾಹಿತಿ ಕೋಶ",
    navTreatments: "ಔಷಧೋಪಚಾರ ಮಾರ್ಗದರ್ಶಿ",
    navWeather: "ಹವಾಮಾನ ಮತ್ತು ರೋಗದ ಅಪಾಯ",
    navMap: "ಸಮುದಾಯ ರೋಗ ನಕ್ಷೆ",
    navConsult: "ತಜ್ಞರ ಸಲಹೆ",
    navHistory: "ಹಿಂದಿನ ಸ್ಕ್ಯಾನ್‌ಗಳು",
    navModelMetrics: "AI ಮಾದರಿ ಕಾರ್ಯಕ್ಷಮತೆ",
    navSettings: "ಸೆಟ್ಟಿಂಗ್ಸ್ ಮತ್ತು ಭಾಷೆ",
    navExpertPortal: "ತಜ್ಞರ ವಿಮರ್ಶೆ ಪೋರ್ಟಲ್",
    navAdminPortal: "ನಿರ್ವಾಹಕ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",

    // Dashboard
    welcomeFarmer: "ಸುಸ್ವಾಗತ",
    smartDashboard: "ಸ್ಮಾರ್ಟ್ ಕೃಷಿ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    totalScans: "ಒಟ್ಟು ಸ್ಕ್ಯಾನ್‌ಗಳು",
    healthyScans: "ಆರೋಗ್ಯಕರ ಬೆಳೆಗಳು",
    diseasedScans: "ಪತ್ತೆಯಾದ ರೋಗಗಳು",
    riskLevel: "ಪರಿಸರ ರೋಗದ ಅಪಾಯ",
    recentScans: "ಇತ್ತೀಚಿನ ರೋಗ ತಪಾಸಣೆಗಳು",
    recommendedActions: "ಋತುಮಾನದ ಆದ್ಯತೆಯ ಸಲಹೆಗಳು",
    quickScan: "ತ್ವರಿತ AI ಸ್ಕ್ಯಾನ್",
    activeAlerts: "ನಿಮ್ಮ ಜಿಲ್ಲೆಯಲ್ಲಿ ರೋಗದ ಎಚ್ಚರಿಕೆಗಳು",

    // Scanner
    scanTitle: "AI ಬೆಳೆ ರೋಗ ಸ್ಕ್ಯಾನರ್",
    scanSubtitle: "ತಕ್ಷಣದ ನಿಖರ ರೋಗ ಪತ್ತೆಗಾಗಿ ಎಲೆ ಅಥವಾ ಹಣ್ಣಿನ ಸ್ಪಷ್ಟ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ ಅಥವಾ ಕ್ಯಾಮೆರಾದಿಂದ ತೆಗೆಯಿರಿ.",
    selectCropPrompt: "ಬೆಳೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ",
    choosePhoto: "ಫೋಟೋ ಆಯ್ಕೆಮಾಡಿ",
    dragDropPhoto: "ಎಲೆಯ ಫೋಟೋವನ್ನು ಇಲ್ಲಿ ಎಳೆಯಿರಿ ಅಥವಾ ಬ್ರೌಸ್ ಮಾಡಲು ಕ್ಲಿಕ್ ಮಾಡಿ",
    captureCamera: "ಕ್ಯಾಮೆರಾ ಬಳಸಿ ಫೋಟೋ ತೆಗೆಯಿರಿ",
    analyzeBtn: "ಬೆಳೆ ಆರೋಗ್ಯ ತಪಾಸಣೆ ನಡೆಸಿ",
    analyzing: "AI ರೋಗ ಪತ್ತೆ ಪ್ರಕ್ರಿಯೆ ನಡೆಯುತ್ತಿದೆ...",
    trySample: "ಮಾದರಿ ಫೋಟೋಗಳೊಂದಿಗೆ ಪರೀಕ್ಷಿಸಿ",

    // Results
    diagnosisResult: "ರೋಗ ಪತ್ತೆ ವರದಿ",
    confidence: "AI ನಿಖರತೆ / ಭರವಸೆ",
    severity: "ರೋಗದ ತೀವ್ರತೆ",
    symptoms: "ಕಂಡುಬರುವ ಲಕ್ಷಣಗಳು",
    causes: "ಮೂಲ ಕಾರಣ ಮತ್ತು ಶಿಲೀಂಧ್ರ",
    immediateAction: "ತಕ್ಷಣದ ಪರಿಹಾರ ಕ್ರಮಗಳು",
    ipmPrevention: "ಸಮಗ್ರ ಕೀಟ ನಿರ್ವಹಣೆ ಮತ್ತು ತಡೆಗಟ್ಟುವಿಕೆ",
    safetyPrecautions: "ಕೀಟನಾಶಕ ಸುರಕ್ಷತಾ ಮುನ್ನೆಚ್ಚರಿಕೆಗಳು",
    expertVerifyPrompt: "ಕೃಷಿ ತಜ್ಞರಿಂದ ಪರಿಶೀಲನೆಗೆ ವಿನಂತಿಸಿ",
    shareOutbreakPrompt: "ಸಮುದಾಯ ನಕ್ಷೆಗೆ ವರದಿ ಸಲ್ಲಿಸಿ",

    // Voice
    voiceAssistant: "ಕ್ರಾಪ್‌ಶೀಲ್ಡ್ ಧ್ವನಿ ಸಹಾಯಕ",
    speakQuestion: "ನಿಮ್ಮ ಮಾತೃಭಾಷೆಯಲ್ಲಿ ಧ್ವನಿ ಮೂಲಕ ಪ್ರಶ್ನೆ ಕೇಳಿ",
    listening: "ಕೇಳಿಸಿಕೊಳ್ಳಲಾಗುತ್ತಿದೆ... ಮಾತನಾಡಿ",
    askByVoice: "ಧ್ವನಿ ಸಹಾಯಕ",

    // Outbreak Map
    outbreakMapTitle: "ಪ್ರಾದೇಶಿಕ ಬೆಳೆ ರೋಗ ಹರಡುವಿಕೆಯ ನಕ್ಷೆ",
    outbreakSubtitle: "ಕರ್ನಾಟಕ ಮತ್ತು ಕೇರಳದ ರೈತ ಸಮುದಾಯದ ಸಹಯೋಗದೊಂದಿಗೆ ರೋಗ ನಿಗಾ ವ್ಯವಸ್ಥೆ.",
    reportOutbreakBtn: "ಸ್ಥಳೀಯ ರೋಗ ವರದಿ ಮಾಡಿ",

    // Weather
    weatherTitle: "ಸ್ಥಳೀಯ ಹವಾಮಾನ ಮತ್ತು ರೋಗ ಮುನ್ಸೂಚನೆ",
    weatherSubtitle: "ನೈಜ ಸಮಯದ ಹವಾಮಾನ ಆಧಾರಿತ ರೋಗದ ಮುನ್ನೆಚ್ಚರಿಕೆ.",

    // Expert & Admin
    pendingVerifications: "ಬಾಕಿ ಇರುವ ತಪಾಸಣೆಗಳು",
    verifyAction: "ಪರಿಶೀಲಿಸಿ ದೃಢೀಕರಿಸಿ",
    accuracyBenchmark: "ಪರೀಕ್ಷಾ ನಿಖರತೆ (ಬೆಂಚ್‌ಮಾರ್ಕ್)",
    realWorldAccuracy: "ನೈಜ ಕೃಷಿ ಭೂಮಿಯ ನಿಖರತೆ",
  },
  ml: {
    // Brand & Header
    appName: "ക്രോപ്പ്ഷീൽഡ് AI",
    tagline: "നേരത്തെ തിരിച്ചറിയുക. വിളകളെ സംരക്ഷിക്കുക. കർഷകരെ ശാക്തീകരിക്കുക.",
    switchRole: "ഡെമോ റോൾ മാറ്റുക",
    farmer: "കർഷകൻ",
    expert: "കൃഷി വിദഗ്ദ്ധൻ",
    admin: "അഡ്മിൻ",

    // Navigation
    navDashboard: "ഡാഷ്‌ബോർഡ്",
    navScanner: "AI രോഗ സ്കാനർ",
    navCrops: "എന്റെ വിളകളും തോട്ടവും",
    navLibrary: "രോഗ വിജ്ഞാനകോശം",
    navTreatments: "ചികിത്സാ മാർഗ്ഗരേഖ",
    navWeather: "കാലാവസ്ഥയും രോഗസാധ്യതയും",
    navMap: "രോഗ വ്യാപന ഭൂപടം",
    navConsult: "വിദഗ്ദ്ധോപദേശം",
    navHistory: "സ്കാൻ ചരിത്രം",
    navModelMetrics: "മോഡൽ പ്രകടനം",
    navSettings: "ക്രമീകരണങ്ങളും ഭാഷയും",
    navExpertPortal: "വിദഗ്ദ്ധ പരിശോധനാ പോർട്ടൽ",
    navAdminPortal: "അഡ്മിൻ ഡാഷ്‌ബോർഡ്",

    // Dashboard
    welcomeFarmer: "സ്വാഗതം",
    smartDashboard: "സ്മാർട്ട് അഗ്രികൾച്ചറൽ ഡാഷ്‌ബോർഡ്",
    totalScans: "ആകെ സ്കാനുകൾ",
    healthyScans: "ആരോഗ്യമുള്ള വിളകൾ",
    diseasedScans: "കണ്ടെത്തിയ രോഗങ്ങൾ",
    riskLevel: "പരിസ്ഥിതി രോഗസാധ്യത",
    recentScans: "സമീപകാല രോഗനിർണ്ണയങ്ങൾ",
    recommendedActions: "മുൻഗണനാ കൃഷി നിർദ്ദേശങ്ങൾ",
    quickScan: "തത്സമയ AI സ്കാൻ",
    activeAlerts: "നിങ്ങളുടെ ജില്ലയിലെ രോഗ ജാഗ്രതാ മുന്നറിയിപ്പ്",

    // Scanner
    scanTitle: "AI വിള രോഗ സ്കാനർ",
    scanSubtitle: "തത്സമയ രോഗനിർണ്ണയത്തിനായി ഇലയുടെയോ പഴത്തിന്റെയോ ഫോട്ടോ അപ്‌ലോഡ് ചെയ്യുക.",
    selectCropPrompt: "വിള തിരഞ്ഞെടുക്കുക",
    choosePhoto: "ഫോട്ടോ തിരഞ്ഞെടുക്കുക",
    dragDropPhoto: "ഇലയുടെ ഫോട്ടോ ഇവിടെ ഇടുക അല്ലെങ്കിൽ ബ്രൗസ് ചെയ്യുക",
    captureCamera: "ക്യാമറ ഉപയോഗിച്ച് ഫോട്ടോ എടുക്കുക",
    analyzeBtn: "വിള ആരോഗ്യം പരിശോധിക്കുക",
    analyzing: "AI മോഡൽ രോഗം നിർണ്ണയിക്കുന്നു...",
    trySample: "മാതൃകാ ചിത്രങ്ങൾ പരീക്ഷിക്കുക",

    // Results
    diagnosisResult: "രോഗനിർണ്ണയ റിപ്പോർട്ട്",
    confidence: "കൃത്യത / ആത്മവിശ്വാസം",
    severity: "രോഗത്തിന്റെ തീവ്രത",
    symptoms: "ലക്ഷണങ്ങൾ",
    causes: "കാരണങ്ങളും രോഗാണുക്കളും",
    immediateAction: "ഉടൻ സ്വീകരിക്കേണ്ട ചികിത്സകൾ",
    ipmPrevention: "രോഗപ്രതിരോധ മാർഗ്ഗങ്ങൾ",
    safetyPrecautions: "സുരക്ഷാ മുൻകരുതലുകൾ",
    expertVerifyPrompt: "കാർഷിക വിദഗ്ദ്ധന്റെ പരിശോധനയ്ക്ക് അയക്കുക",
    shareOutbreakPrompt: "ഭൂപടത്തിൽ റിപ്പോർട്ട് ചെയ്യുക",

    // Voice
    voiceAssistant: "വോയ്സ് അസിസ്റ്റന്റ്",
    speakQuestion: "നിങ്ങളുടെ മാതൃഭാഷയിൽ ചോദിക്കുക",
    listening: "ശ്രദ്ധിക്കുന്നു... സംസാരിക്കുക",
    askByVoice: "വോയ്സ് അസിസ്റ്റന്റ്",

    // Outbreak Map
    outbreakMapTitle: "പ്രാദേശിക വിള രോഗ വ്യാപന ഭൂപടം",
    outbreakSubtitle: "കേരളത്തിലെയും കർണാടകത്തിലെയും കർഷകരുടെ സുരക്ഷയ്ക്കായുള്ള സംവിധാനം.",
    reportOutbreakBtn: "രോഗബാധ റിപ്പോർട്ട് ചെയ്യുക",

    // Weather
    weatherTitle: "കാലാവസ്ഥയും രോഗസാധ്യതയും",
    weatherSubtitle: "തത്സമയ കാലാവസ്ഥ അടിസ്ഥാനമാക്കിയുള്ള രോഗ മുന്നറിയിപ്പുകൾ.",

    // Expert & Admin
    pendingVerifications: "പരിശോധന കാത്തിരിക്കുന്ന സ്കാനുകൾ",
    verifyAction: "പരിശോധിച്ച് സാക്ഷ്യപ്പെടുത്തുക",
    accuracyBenchmark: "ബെഞ്ച്മാർക്ക് കൃത്യത",
    realWorldAccuracy: "ഫീൽഡ് കൃത്യത",
  },
  hi: {
    // Brand & Header
    appName: "क्रॉपशील्ड AI",
    tagline: "समय पर पहचानें। फसलों को बचाएं। किसानों को सशक्त बनाएं।",
    switchRole: "डेमो भूमिका बदलें",
    farmer: "किसान",
    expert: "कृषि विशेषज्ञ",
    admin: "प्रशासक",

    // Navigation
    navDashboard: "डैशबोर्ड",
    navScanner: "AI रोग स्कैनर",
    navCrops: "मेरी फसलें व खेत",
    navLibrary: "रोग पुस्तकालय",
    navTreatments: "उपचार गाइड",
    navWeather: "मौसम व जोखिम",
    navMap: "प्रकोप मानचित्र",
    navConsult: "विशेषज्ञ परामर्श",
    navHistory: "स्कैन इतिहास",
    navModelMetrics: "मॉडल प्रदर्शन",
    navSettings: "सेटिंग्स व भाषा",
    navExpertPortal: "विशेषज्ञ समीक्षा पोर्टल",
    navAdminPortal: "प्रशासक डैशबोर्ड",

    // Dashboard
    welcomeFarmer: "स्वागत है",
    smartDashboard: "स्मार्ट कृषि डैशबोर्ड",
    totalScans: "कुल स्कैन",
    healthyScans: "स्वस्थ फसलें",
    diseasedScans: "पहचाने गए रोग",
    riskLevel: "पर्यावरणीय जोखिम",
    recentScans: "हाल के निदान",
    recommendedActions: "प्राथमिक कृषि सलाह",
    quickScan: "तुरंत AI स्कैन",
    activeAlerts: "आपके जिले में रोग अलर्ट",

    // Scanner
    scanTitle: "AI फसल रोग स्कैनर",
    scanSubtitle: "त्वरित सटीक निदान के लिए पौधे की पत्ती या फल का फोटो अपलोड या कैप्चर करें।",
    selectCropPrompt: "फसल चुनें",
    choosePhoto: "फोटो चुनें",
    dragDropPhoto: "पत्ती का फोटो यहां छोड़ें या ब्राउज़ करें",
    captureCamera: "कैमरे से फोटो खींचें",
    analyzeBtn: "फसल स्वास्थ्य की जांच करें",
    analyzing: "AI मॉडल द्वारा रोग का विश्लेषण जारी है...",
    trySample: "नमूना तस्वीरों से जांचें",

    // Results
    diagnosisResult: "रोग निदान रिपोर्ट",
    confidence: "सटीकता / विश्वास स्तर",
    severity: "रोग की गंभीरता",
    symptoms: "दिखने वाले लक्षण",
    causes: "मूल कारण व रोगजनक",
    immediateAction: "तत्काल उपचारात्मक कदम",
    ipmPrevention: "एकीकृत कीट प्रबंधन व रोकथाम",
    safetyPrecautions: "कीटनाशक सुरक्षा व सावधानियां",
    expertVerifyPrompt: "कृषि विशेषज्ञ से सत्यापन का अनुरोध करें",
    shareOutbreakPrompt: "समुदाय मानचित्र पर रिपोर्ट करें",

    // Voice
    voiceAssistant: "क्रॉपशील्ड वॉयस सहायक",
    speakQuestion: "अपनी भाषा में बोलकर पूछें",
    listening: "सुन रहे हैं... कृपया बोलें",
    askByVoice: "वॉयस सहायक",

    // Outbreak Map
    outbreakMapTitle: "क्षेत्रीय फसल रोग प्रकोप मानचित्र",
    outbreakSubtitle: "कर्नाटक और केरल के किसानों के लिए रोग निगरानी नेटवर्क।",
    reportOutbreakBtn: "स्थानीय प्रकोप की रिपोर्ट करें",

    // Weather
    weatherTitle: "मौसम व रोग जोखिम पूर्वानुमान",
    weatherSubtitle: "मौसम आंकड़ों के आधार पर प्रारंभिक चेतावनी प्रणाली।",

    // Expert & Admin
    pendingVerifications: "लंबित समीक्षाएं",
    verifyAction: "सत्यापित करें",
    accuracyBenchmark: "बेंचमार्क सटीकता",
    realWorldAccuracy: "वास्तविक खेत सटीकता",
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('cropshield_lang');
    return (saved as Language) || 'en';
  });
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('cropshield_lang', lang);
  };

  const t = (key: string): string => {
    return TRANSLATIONS[language]?.[key] || TRANSLATIONS['en']?.[key] || key;
  };

  const stopSpeaking = () => {
    // Stop HTML5 audio element if playing
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current.src = '';
      } catch (e) {
        // ignore
      }
      audioRef.current = null;
    }

    // Stop browser Web Speech Synthesis
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {
        // ignore
      }
    }

    setIsSpeaking(false);
  };

  const playBrowserSpeechFallback = (cleanText: string, targetLang: Language) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setIsSpeaking(false);
      return;
    }

    try {
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();

      const utterance = new SpeechSynthesisUtterance(cleanText);
      const langCodes: Record<Language, string> = {
        en: 'en-IN',
        kn: 'kn-IN',
        ml: 'ml-IN',
        hi: 'hi-IN'
      };
      utterance.lang = langCodes[targetLang] || 'en-IN';
      utterance.rate = 0.95;

      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        const matchedVoice = voices.find(v => v.lang.toLowerCase().startsWith(targetLang)) ||
                             voices.find(v => v.lang.toLowerCase().includes('in')) ||
                             voices.find(v => v.lang.toLowerCase().startsWith('en')) ||
                             voices[0];
        if (matchedVoice) {
          utterance.voice = matchedVoice;
        }
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = (e) => {
        console.warn('Browser speech synthesis error:', e);
        setIsSpeaking(false);
      };

      setTimeout(() => {
        window.speechSynthesis.speak(utterance);
      }, 50);
    } catch (err) {
      console.warn('Speech synthesis exception:', err);
      setIsSpeaking(false);
    }
  };

  const speak = (text: string, customLang?: Language) => {
    stopSpeaking();

    if (!text || !text.trim()) return;

    // Clean text: strip markdown asterisks, brackets, hashes, bullet points
    const clean = text
      .replace(/[*#_~`\[\]()]/g, ' ')
      .replace(/@\s*[\d.]+\s*(?:g|ml)\/L/gi, '') // simplify chemical measurement jargon for natural speech
      .replace(/\s+/g, ' ')
      .trim();

    if (!clean) return;

    // Cap speech text length to avoid buffering latency
    const speechText = clean.length > 500 ? clean.substring(0, 500) + '...' : clean;
    const targetLang = customLang || language;

    // Determine backend audio URL
    const apiBase = typeof window !== 'undefined' && (window.location.port === '8000' || !window.location.port)
      ? '/api/v1'
      : 'http://127.0.0.1:8000/api/v1';

    const audioUrl = `${apiBase}/voice/tts?text=${encodeURIComponent(speechText)}&language=${targetLang}`;

    try {
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onplay = () => {
        setIsSpeaking(true);
      };

      audio.onended = () => {
        setIsSpeaking(false);
        audioRef.current = null;
      };

      audio.onerror = (e) => {
        console.warn('Backend audio streaming error, falling back to Web Speech API:', e);
        audioRef.current = null;
        playBrowserSpeechFallback(speechText, targetLang);
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Audio play was prevented or failed, trying Web Speech API:', err);
          audioRef.current = null;
          playBrowserSpeechFallback(speechText, targetLang);
        });
      }
    } catch (e) {
      playBrowserSpeechFallback(speechText, targetLang);
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        speak,
        isSpeaking,
        stopSpeaking
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
