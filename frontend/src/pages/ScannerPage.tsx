import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { cropsApi, scansApi, weatherApi } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import { Crop } from '../types';
import {
  Scan,
  Upload,
  Camera,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Image as ImageIcon
} from 'lucide-react';

export const ScannerPage: React.FC = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const [crops, setCrops] = useState<Crop[]>([]);
  const [selectedCropId, setSelectedCropId] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Preloaded Demo Samples for 1-click Hackathon Testing
  const demoSamples = [
    { label: 'Paddy Blast', cropName: 'Paddy', file: '/demo_samples/paddy_blast.jpg', tag: 'High Risk' },
    { label: 'Paddy Bacterial Blight', cropName: 'Paddy', file: '/demo_samples/paddy_bacterial_blight.jpg', tag: 'Severe' },
    { label: 'Tomato Early Blight', cropName: 'Tomato', file: '/demo_samples/tomato_early_blight.jpg', tag: 'Common' },
    { label: 'Tomato Healthy', cropName: 'Tomato', file: '/demo_samples/tomato_healthy.jpg', tag: 'Healthy' },
    { label: 'Arecanut Fruit Rot', cropName: 'Arecanut', file: '/demo_samples/arecanut_koleroga.jpg', tag: 'Severe' },
    { label: 'Banana Sigatoka', cropName: 'Banana', file: '/demo_samples/banana_sigatoka.jpg', tag: 'Leaf Spot' },
    { label: 'Coconut Bud Rot', cropName: 'Coconut', file: '/demo_samples/coconut_bud_rot.jpg', tag: 'High Risk' },
    { label: 'Black Pepper Quick Wilt', cropName: 'Black Pepper', file: '/demo_samples/pepper_quick_wilt.jpg', tag: 'Foot Rot' },
    { label: 'Non-Plant Image (Validation Test)', cropName: 'Paddy', file: '/demo_samples/invalid_non_plant.jpg', tag: 'Rejection Test' },
  ];

  useEffect(() => {
    const fetchCrops = async () => {
      try {
        const res = await cropsApi.getAllCrops();
        setCrops(res);
        if (res.length > 0) {
          setSelectedCropId(res[0].id);
        }
      } catch (err) {
        console.error('Error fetching crops:', err);
      }
    };
    fetchCrops();
  }, []);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setScanError(null);
    setErrorDetails(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  // Load a demo benchmark sample directly into preview
  const handleLoadSample = async (sample: typeof demoSamples[0]) => {
    try {
      const resp = await fetch(sample.file);
      const blob = await resp.blob();
      const file = new File([blob], `${sample.label.toLowerCase().replace(/\s+/g, '_')}.jpg`, { type: 'image/jpeg' });
      
      const targetCrop = crops.find(c => c.name.toLowerCase() === sample.cropName.toLowerCase());
      if (targetCrop) {
        setSelectedCropId(targetCrop.id);
      }
      handleFileSelect(file);
    } catch (err) {
      console.error('Failed to load sample:', err);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedCropId || !selectedFile) {
      setScanError('Please select a crop category and upload an image.');
      return;
    }

    setIsScanning(true);
    setScanError(null);
    setErrorDetails(null);

    try {
      // Fetch live weather snapshot for context
      let weatherContext = null;
      try {
        weatherContext = await weatherApi.getCurrent(13.9299, 75.5681, 'Shivamogga, Karnataka');
      } catch {
        // Continue even if weather service unavailable
      }

      const res = await scansApi.analyzeImage(selectedCropId, selectedFile, weatherContext);

      // Handle quality / non-plant rejection
      if (!res.success && res.status === 'non_plant') {
        setScanError('Image Rejected: No plant or leaf tissue detected in this photo. Please upload a clear photo of an agricultural plant leaf or fruit.');
        setErrorDetails({ reason: 'non_plant' });
        setIsScanning(false);
        return;
      }

      if (!res.success && res.status === 'invalid_image') {
        setScanError(`Image Quality Error: ${res.message || 'Please upload a clearer, well-lit photograph.'}`);
        setErrorDetails({ reason: 'quality_failure' });
        setIsScanning(false);
        return;
      }

      if (res.status === 'crop_mismatch') {
        setScanError(res.message);
        setErrorDetails({ reason: 'crop_mismatch', detected: res.detected_crop });
        setIsScanning(false);
        return;
      }

      if (res.status === 'uncertain') {
        // Navigate to result page showing scientific uncertainty & abstention notice
        navigate(`/diagnosis/${res.scan_id}`);
        return;
      }

      // Successful diagnosis
      navigate(`/diagnosis/${res.scan_id}`);
    } catch (err: any) {
      setScanError(err.message || 'Error occurred during AI analysis. Please retry.');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="pb-4 border-b border-earth-200">
        <h1 className="text-2xl font-black text-forest-950 flex items-center gap-2.5">
          <Scan className="w-7 h-7 text-forest-600 animate-pulse" />
          {t('scanTitle')}
        </h1>
        <p className="text-xs text-earth-500 mt-1 max-w-2xl leading-relaxed">
          {t('scanSubtitle')}
        </p>
      </div>

      {/* Main Scanner Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Crop Selection & Upload Canvas */}
        <div className="lg:col-span-2 space-y-5">
          {/* Step 1: Select Crop */}
          <div className="bg-white p-5 rounded-3xl border border-earth-200 shadow-soft">
            <label className="block text-xs font-bold text-forest-950 mb-3 flex items-center gap-1.5 uppercase tracking-wider">
              <span className="w-5 h-5 rounded-full bg-forest-600 text-white flex items-center justify-center text-[11px] font-bold">1</span>
              {t('selectCropPrompt')}
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {crops.map((crop) => (
                <button
                  key={crop.id}
                  type="button"
                  onClick={() => setSelectedCropId(crop.id)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    selectedCropId === crop.id
                      ? 'border-forest-600 bg-forest-50/80 ring-2 ring-forest-500/30 shadow-xs'
                      : 'border-earth-200 hover:border-forest-300 hover:bg-forest-50/30'
                  }`}
                >
                  <div className="font-bold text-xs text-forest-950">{crop.name}</div>
                  <div className="text-[10px] text-earth-500 italic mt-0.5">{crop.scientific_name}</div>
                  {crop.local_names && (
                    <div className="text-[10px] text-forest-700 font-medium mt-1">
                      {crop.local_names['kn'] || crop.local_names['ml']}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Upload or Capture Canvas */}
          <div className="bg-white p-5 rounded-3xl border border-earth-200 shadow-soft">
            <label className="block text-xs font-bold text-forest-950 mb-3 flex items-center gap-1.5 uppercase tracking-wider">
              <span className="w-5 h-5 rounded-full bg-forest-600 text-white flex items-center justify-center text-[11px] font-bold">2</span>
              {t('choosePhoto')}
            </label>

            {previewUrl ? (
              <div className="relative rounded-2xl overflow-hidden border-2 border-forest-500/40 bg-earth-900 group">
                <img
                  src={previewUrl}
                  alt="Crop specimen"
                  className="w-full h-80 object-contain mx-auto"
                />
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl(null);
                    setScanError(null);
                  }}
                  className="absolute top-3 right-3 px-3 py-1.5 bg-black/70 hover:bg-black/90 text-white rounded-xl text-xs font-semibold backdrop-blur-xs flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Change Photo
                </button>
              </div>
            ) : (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="border-2 border-dashed border-earth-300 hover:border-forest-500 rounded-2xl p-8 text-center bg-earth-50/50 hover:bg-forest-50/20 transition-all cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-14 h-14 rounded-2xl bg-forest-100 text-forest-700 flex items-center justify-center mx-auto mb-3 shadow-xs">
                  <Upload className="w-7 h-7" />
                </div>
                <h3 className="text-sm font-bold text-forest-950">
                  {t('dragDropPhoto')}
                </h3>
                <p className="text-xs text-earth-500 mt-1">
                  Supports High-Resolution JPEG, PNG, WEBP (Up to 10MB)
                </p>

                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="px-3.5 py-2 rounded-xl bg-forest-600 hover:bg-forest-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5"
                  >
                    <ImageIcon className="w-4 h-4" />
                    Browse Device Files
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      cameraInputRef.current?.click();
                    }}
                    className="px-3.5 py-2 rounded-xl bg-white border border-earth-300 hover:bg-earth-100 text-earth-800 text-xs font-semibold shadow-xs flex items-center gap-1.5"
                  >
                    <Camera className="w-4 h-4 text-forest-600" />
                    {t('captureCamera')}
                  </button>
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            />

            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            />

            {/* Error Message Box */}
            {scanError && (
              <div className="mt-4 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-3 animate-in fade-in">
                <AlertCircle className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold block">Validation Alert:</span>
                  <p className="leading-relaxed">{scanError}</p>
                  {errorDetails?.reason === 'non_plant' && (
                    <p className="text-[11px] text-red-700 italic">
                      Rule Enforced: The AI engine never diagnoses non-plant objects. Only plant leaves and fruits are processed.
                    </p>
                  )}
                  {errorDetails?.reason === 'crop_mismatch' && (
                    <p className="text-[11px] text-red-700 italic">
                      Tip: Please select "{errorDetails.detected}" in Step 1 to diagnose this specimen.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Analyze Action Button */}
            <div className="mt-5">
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={isScanning || !selectedFile}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-forest-600 to-forest-700 hover:from-forest-700 hover:to-forest-800 text-white font-bold text-sm shadow-md shadow-forest-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 hover:scale-[1.01] active:scale-95"
              >
                {isScanning ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    <span>{t('analyzing')}</span>
                  </>
                ) : (
                  <>
                    <Scan className="w-4 h-4 text-leaf-300" />
                    <span>{t('analyzeBtn')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: 1-Click Benchmark Samples for Hackathon Judges */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-forest-200 shadow-soft">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-forest-600" />
              <h3 className="text-sm font-bold text-forest-950 uppercase tracking-wider">
                1-Click Benchmark Samples
              </h3>
            </div>
            <p className="text-xs text-earth-500 mb-4 leading-relaxed">
              Click any verified specimen below to load and test the calibrated model inference instantly:
            </p>

            <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
              {demoSamples.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleLoadSample(sample)}
                  className="w-full p-2.5 rounded-xl border border-earth-200 hover:border-forest-400 bg-earth-50/60 hover:bg-forest-50/50 text-left transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={sample.file}
                      alt={sample.label}
                      className="w-10 h-10 rounded-lg object-cover border border-earth-200 shrink-0"
                    />
                    <div>
                      <div className="text-xs font-bold text-forest-950 group-hover:text-forest-700 transition-colors">
                        {sample.label}
                      </div>
                      <div className="text-[10px] text-earth-500">
                        Crop: {sample.cropName}
                      </div>
                    </div>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${
                    sample.tag === 'Healthy'
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : sample.tag === 'Rejection Test'
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : 'bg-orange-50 text-orange-700 border-orange-200'
                  }`}>
                    {sample.tag}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Model Trust Guarantee */}
          <div className="bg-forest-50 p-4 rounded-2xl border border-forest-200 text-xs">
            <h4 className="font-bold text-forest-900 mb-1 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-forest-600" />
              Safety & Abstention Threshold
            </h4>
            <p className="text-[11px] text-earth-600 leading-relaxed">
              If prediction confidence falls below <strong>65%</strong>, the system abstains from diagnosis and recommends expert verification to prevent inaccurate pesticide applications.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
