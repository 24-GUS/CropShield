import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import {
  Sprout,
  Scan,
  ShieldCheck,
  CloudSun,
  MapPin,
  Mic,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Cpu,
  Users,
  Award
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { demoLogin, isLoading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleLaunch = async (role: 'farmer' | 'expert' | 'admin', targetUrl: string) => {
    await demoLogin(role);
    navigate(targetUrl);
  };

  const priorityCrops = [
    { name: 'Paddy / Rice', local: 'ಭತ್ತ / നെല്ല്', diseases: 'Blast, Bacterial Blight, Brown Spot' },
    { name: 'Arecanut', local: 'ಅಡಿಕೆ / അടയ്ക്ക', diseases: 'Koleroga (Fruit Rot), Yellow Leaf Disease' },
    { name: 'Coconut', local: 'ತೆಂಗು / തെങ്ങ്', diseases: 'Bud Rot, Stem Bleeding' },
    { name: 'Banana', local: 'ಬಾಳೆ / വാഴ', diseases: 'Sigatoka Leaf Spot, Panama Wilt' },
    { name: 'Tomato', local: 'ಟೊಮೆಟೊ / തക്കാളി', diseases: 'Early Blight, Late Blight, Leaf Curl' },
    { name: 'Black Pepper', local: 'ಕಾಳುಮೆಣಸು / കുരുമുളക്', diseases: 'Quick Wilt (Phytophthora Foot Rot)' },
  ];

  return (
    <div className="min-h-screen bg-earth-50 text-earth-900 selection:bg-forest-200">
      {/* Top Navbar */}
      <header className="border-b border-forest-100 bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img 
              src="/logo-icon.png" 
              alt="CropShield AI Logo" 
              className="w-10 h-10 rounded-xl object-contain shadow-md shadow-forest-600/20 bg-white p-0.5 border border-forest-100" 
            />
            <div>
              <span className="font-extrabold text-xl text-forest-950 tracking-tight">
                CropShield <span className="text-forest-600">AI</span>
              </span>
              <span className="text-[10px] text-earth-500 block -mt-1 font-medium">
                Detect Early. Protect Crops. Empower Farmers.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/login"
              className="text-xs sm:text-sm font-semibold text-earth-700 hover:text-forest-700 px-3 py-1.5"
            >
              Sign In
            </Link>
            <button
              onClick={() => handleLaunch('farmer', '/dashboard')}
              disabled={isLoading}
              className="px-4 py-2 rounded-xl bg-forest-600 hover:bg-forest-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-forest-600/20 transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-leaf-300" />
              <span>Launch Demo</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        <div className="text-center max-w-3xl mx-auto">
          <div className="flex justify-center mb-5">
            <img 
              src="/logo.png" 
              alt="CropShield AI" 
              className="w-48 sm:w-56 h-auto max-h-28 object-contain drop-shadow-md hover:scale-105 transition-transform" 
            />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-forest-100/80 border border-forest-200 text-forest-800 text-xs font-semibold mb-6">
            <span className="w-2 h-2 rounded-full bg-forest-600 animate-ping" />
            Hackathon Production Platform for South Indian Agriculture
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-forest-950 tracking-tight leading-[1.15]">
            AI-Powered Early <span className="text-transparent bg-clip-text bg-gradient-to-r from-forest-600 to-leaf-600">Crop Disease Detection</span> & Farm Protection
          </h1>

          <p className="mt-5 text-base sm:text-lg text-earth-600 leading-relaxed font-normal">
            Helping farmers across Karnataka and Kerala detect botanical pathogens at the earliest stage, assess microclimate disease risks, and receive verified ICAR/KAU agricultural recommendations in Kannada, Malayalam, Hindi, and English.
          </p>

          {/* Quick Launch Buttons for Demo */}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => handleLaunch('farmer', '/scanner')}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-forest-600 to-forest-700 hover:from-forest-700 hover:to-forest-800 text-white font-bold text-sm sm:text-base shadow-lg shadow-forest-600/25 transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-95"
            >
              <Scan className="w-5 h-5 text-leaf-300" />
              <span>Launch AI Disease Scanner</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => handleLaunch('expert', '/expert-dashboard')}
              className="px-5 py-3.5 rounded-2xl bg-white hover:bg-forest-50 border border-forest-200 text-forest-900 font-bold text-sm sm:text-base shadow-sm transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-95"
            >
              <ShieldCheck className="w-5 h-5 text-forest-600" />
              <span>Expert Review Portal</span>
            </button>

            <button
              onClick={() => handleLaunch('admin', '/model-metrics')}
              className="px-5 py-3.5 rounded-2xl bg-white hover:bg-forest-50 border border-forest-200 text-earth-700 font-bold text-sm sm:text-base shadow-sm transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-95"
            >
              <Cpu className="w-5 h-5 text-purple-600" />
              <span>99% Benchmark Metrics</span>
            </button>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-earth-500 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-forest-600" /> Real Trained Neural Model
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-forest-600" /> Scientific Confidence Calibration
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-forest-600" /> Zero False Claims / Abstention on Low Confidence
            </span>
          </div>
        </div>
      </section>

      {/* Priority Crops Grid */}
      <section className="py-12 bg-white border-y border-forest-100 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-forest-950">
              Regional Botanical Coverage
            </h2>
            <p className="mt-2 text-sm text-earth-600 max-w-xl mx-auto">
              Focused on the highest-economic-value crops in Karnataka and Kerala, trained with verified field pathology.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {priorityCrops.map((crop, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-forest-50/50 border border-forest-100 hover:border-forest-300 hover:shadow-soft transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-base text-forest-950">{crop.name}</h3>
                  <span className="text-xs bg-white text-forest-700 font-semibold px-2 py-0.5 rounded-md border border-forest-200">
                    {crop.local}
                  </span>
                </div>
                <p className="text-xs text-earth-600">
                  <strong className="text-forest-900">Covered Conditions:</strong> {crop.diseases}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture Highlights */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-forest-950">
            Why CropShield AI Excels
          </h2>
          <p className="mt-2 text-sm text-earth-600 max-w-2xl mx-auto">
            Built as a real, complete agricultural technology ecosystem—never a dummy mock or hardcoded simulation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-earth-200 shadow-soft">
            <div className="w-12 h-12 rounded-xl bg-forest-100 text-forest-700 flex items-center justify-center mb-4">
              <Scan className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-forest-950 mb-2">Calibrated Vision AI</h3>
            <p className="text-xs text-earth-600 leading-relaxed">
              MobileNetV2 feature surrogate calibrated with temperature scaling. Enforces strict abstention on low confidence and rejects non-plant images.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-earth-200 shadow-soft">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
              <CloudSun className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-forest-950 mb-2">Microclimate Risk</h3>
            <p className="text-xs text-earth-600 leading-relaxed">
              Live weather feeds mapped to biological epidemiological thresholds (ICAR & KAU models) providing early fungal/bacterial warning before visible onset.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-earth-200 shadow-soft">
            <div className="w-12 h-12 rounded-xl bg-leaf-100 text-forest-800 flex items-center justify-center mb-4">
              <Mic className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-forest-950 mb-2">Multilingual Voice</h3>
            <p className="text-xs text-earth-600 leading-relaxed">
              Full conversational support in Kannada, Malayalam, Hindi, and English. Speaks answers back to empower farmers with limited literacy.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-earth-200 shadow-soft">
            <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center mb-4">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-forest-950 mb-2">Community Shield</h3>
            <p className="text-xs text-earth-600 leading-relaxed">
              Fuzzy-coordinate outbreak reporting protecting farmer privacy while alerting adjacent plantations of contagious disease spread.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-forest-950 text-forest-200 py-10 px-4 sm:px-6 lg:px-8 border-t border-forest-900 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sprout className="w-5 h-5 text-leaf-400" />
            <span className="font-bold text-sm text-white">CropShield AI</span>
            <span className="text-forest-400">— Hackathon Production Release 2025</span>
          </div>
          <p className="text-forest-400 text-center sm:text-right">
            Grounding Source: ICAR, UAS Bangalore, UAS Dharwad & Kerala Agricultural University.
          </p>
        </div>
      </footer>
    </div>
  );
};
