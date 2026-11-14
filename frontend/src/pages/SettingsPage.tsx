import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Settings, Globe, Volume2, ShieldCheck, Check, Info } from 'lucide-react';
import { Language } from '../types';

export const SettingsPage: React.FC = () => {
  const { language, setLanguage, speak } = useLanguage();
  const { user } = useAuth();
  const [voiceVolume, setVoiceVolume] = useState('1.0');
  const [autoPlayAudio, setAutoPlayAudio] = useState(true);
  const [savedNotice, setSavedNotice] = useState(false);

  const languages: { code: Language; label: string; native: string; desc: string }[] = [
    { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ', desc: 'ಕರ್ನಾಟಕದ ರೈತರಿಗಾಗಿ ಪ್ರಾದೇಶಿಕ ಭಾಷಾ ಬೆಂಬಲ' },
    { code: 'ml', label: 'Malayalam', native: 'മലയാളം', desc: 'കേരളത്തിലെ കർഷകർക്കായുള്ള പ്രാദേശിക ഭാഷ' },
    { code: 'hi', label: 'Hindi', native: 'हिन्दी', desc: 'अखिल भारतीय किसानों के लिए राष्ट्रभाषा समर्थन' },
    { code: 'en', label: 'English', native: 'English', desc: 'Standard Agricultural Extension Terminology' },
  ];

  const handleLanguageChange = (code: Language) => {
    setLanguage(code);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
    // Voice feedback
    if (code === 'kn') speak('ಕ್ರಾಪ್‌ಶೀಲ್ಡ್ ಭಾಷೆಯನ್ನು ಕನ್ನಡಕ್ಕೆ ಹೊಂದಿಸಲಾಗಿದೆ.', 'kn');
    else if (code === 'ml') speak('ക്രോപ്പ്ഷീൽഡ് ഭാഷ മലയാളത്തിലേക്ക് മാറ്റി.', 'ml');
    else if (code === 'hi') speak('क्रॉपशील्ड भाषा को हिन्दी में सेट किया गया है।', 'hi');
    else speak('CropShield language set to English.', 'en');
  };

  return (
    <div className="space-y-6 pb-16 max-w-3xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-earth-200">
        <h1 className="text-2xl font-black text-forest-950 flex items-center gap-2.5">
          <Settings className="w-7 h-7 text-forest-600" />
          Settings & Language Customization
        </h1>
        <p className="text-xs text-earth-500 mt-1">
          Configure regional dialect preferences, audio voice synthesizer, and platform settings.
        </p>
      </div>

      {savedNotice && (
        <div className="p-3.5 rounded-2xl bg-green-50 border border-green-200 text-green-800 text-xs flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-green-600" />
          <span>Language and preferences saved successfully!</span>
        </div>
      )}

      {/* Language Selection Grid */}
      <div className="bg-white p-6 rounded-3xl border border-earth-200 shadow-soft space-y-4">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-forest-600" />
          <h2 className="text-base font-bold text-forest-950">Select Preferred Language</h2>
        </div>
        <p className="text-xs text-earth-500">
          The entire interface, voice assistant, and treatment instructions will adapt to your choice:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {languages.map((l) => (
            <button
              key={l.code}
              onClick={() => handleLanguageChange(l.code)}
              className={`p-4 rounded-2xl border text-left transition-all ${
                language === l.code
                  ? 'border-forest-600 bg-forest-50/80 ring-2 ring-forest-500/20 shadow-xs'
                  : 'border-earth-200 hover:border-forest-300 hover:bg-forest-50/20'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-extrabold text-base text-forest-950">{l.native}</span>
                {language === l.code && (
                  <span className="text-[10px] font-bold bg-forest-600 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Check className="w-3 h-3" /> Active
                  </span>
                )}
              </div>
              <div className="text-xs text-forest-700 font-semibold">{l.label}</div>
              <p className="text-[11px] text-earth-400 mt-1">{l.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Voice Synthesizer & Speech Settings */}
      <div className="bg-white p-6 rounded-3xl border border-earth-200 shadow-soft space-y-4">
        <div className="flex items-center gap-2">
          <Volume2 className="w-5 h-5 text-forest-600" />
          <h2 className="text-base font-bold text-forest-950">Voice & Speech Assistant</h2>
        </div>

        <div className="space-y-3 text-xs">
          <label className="flex items-center justify-between p-3 bg-earth-50 rounded-2xl border border-earth-100 cursor-pointer">
            <div>
              <span className="font-bold text-earth-900 block">Automatic Audio Reading</span>
              <span className="text-[11px] text-earth-500">Automatically speak diagnosis and treatments aloud</span>
            </div>
            <input
              type="checkbox"
              checked={autoPlayAudio}
              onChange={(e) => setAutoPlayAudio(e.target.checked)}
              className="rounded text-forest-600 focus:ring-forest-500 w-4 h-4"
            />
          </label>

          <div className="p-3 bg-earth-50 rounded-2xl border border-earth-100 flex items-center justify-between">
            <div>
              <span className="font-bold text-earth-900 block">Test Voice Playback</span>
              <span className="text-[11px] text-earth-500">Listen to an audio sample in currently active language</span>
            </div>
            <button
              onClick={() => speak('CropShield AI agricultural voice assistant is active and operational.')}
              className="px-3.5 py-1.5 rounded-xl bg-forest-600 text-white text-xs font-semibold hover:bg-forest-700 transition-colors shadow-xs"
            >
              Test Voice
            </button>
          </div>
        </div>
      </div>

      {/* About & Standards Box */}
      <div className="bg-earth-50 p-6 rounded-3xl border border-earth-200 text-xs space-y-2">
        <h3 className="font-bold text-forest-950 text-sm flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-forest-600" />
          CropShield AI — Hackathon Release v1.4
        </h3>
        <p className="text-earth-600 leading-relaxed">
          Built for the National AI Agricultural Innovation Hackathon. Compliant with ICAR, University of Agricultural Sciences (UAS Bangalore & Dharwad), and Kerala Agricultural University (KAU) agronomic standards.
        </p>
      </div>
    </div>
  );
};
