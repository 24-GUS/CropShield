import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { voiceApi } from '../services/api';
import { Mic, MicOff, Volume2, X, Send, Sparkles, Camera, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({ isOpen, onClose }) => {
  const { language, t, speak, isSpeaking, stopSpeaking } = useLanguage();
  const navigate = useNavigate();

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [typedQuestion, setTypedQuestion] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [recognitionSupported, setRecognitionSupported] = useState(true);

  // Quick preset sample questions in active language
  const sampleQuestions: Record<string, string[]> = {
    en: [
      "My tomato leaves are turning yellow. What should I do?",
      "How to control rice blast disease in paddy?",
      "What is the recommended treatment for arecanut fruit rot?"
    ],
    kn: [
      "ನನ್ನ ಟೊಮೆಟೊ ಎಲೆಗಳು ಹಳದಿಯಾಗುತ್ತಿವೆ, ಏನು ಮಾಡಬೇಕು?",
      "ಭತ್ತದ ಬೆಂಕಿ ರೋಗಕ್ಕೆ ಶಿಫಾರಸು ಮಾಡಿದ ಔಷಧಿ ಯಾವುದು?",
      "ಅಡಿಕೆ ಕೊಳೆ ರೋಗ ತಡೆಗಟ್ಟಲು ಬೋರ್ಡೋ ದ್ರಾವಣ ಹೇಗೆ ಬಳಸಬೇಕು?"
    ],
    ml: [
      "തക്കാളിയിലകൾ മഞ്ഞളിക്കുന്നു, എന്താണ് ചെയ്യേണ്ടത്?",
      "നെല്ലിലെ ബ്ലാസ്റ്റ് രോഗം എങ്ങനെ നിയന്ത്രിക്കാം?",
      "അടയ്ക്കയിലെ കൊളെരോഗത്തിന് എന്താണ് പ്രതിവിധി?"
    ],
    hi: [
      "टमाटर की पत्तियां पीली पड़ रही हैं, क्या उपाय करें?",
      "धान में ब्लास्ट रोग की रोकथाम कैसे करें?",
      "सुपारी में फल सड़न रोकने के लिए क्या करें?"
    ]
  };

  const currentSamples = sampleQuestions[language] || sampleQuestions['en'];

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setRecognitionSupported(false);
    }
  }, []);

  const startListening = () => {
    stopSpeaking();
    setResponse(null);
    setTranscript('');

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported by this browser. Please type your query below.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      const langCodes: Record<string, string> = {
        en: 'en-IN',
        kn: 'kn-IN',
        ml: 'ml-IN',
        hi: 'hi-IN'
      };
      recognition.lang = langCodes[language] || 'en-IN';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        setTypedQuestion(text);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        if (transcript) {
          handleAskQuestion(transcript);
        }
      };

      recognition.start();
    } catch (err) {
      console.error('Error starting recognition:', err);
      setIsListening(false);
    }
  };

  const handleAskQuestion = async (queryText: string) => {
    if (!queryText.trim()) return;
    setIsLoading(true);
    setResponse(null);
    try {
      const res = await voiceApi.query(queryText, language);
      const answer = res.answer;
      setResponse(answer);
      // Automatically speak the answer aloud in user's language!
      speak(answer);
    } catch (err) {
      setResponse("Unable to connect to knowledge base. Please check internet connection.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-forest-100 relative overflow-hidden">
        {/* Subtle decorative background gradient */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-leaf-200/50 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-earth-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-forest-600 text-white flex items-center justify-center shadow-md shadow-forest-600/30">
              <Sparkles className="w-5 h-5 text-leaf-300" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-forest-950">{t('voiceAssistant')}</h3>
              <p className="text-xs text-earth-500">Grounded ICAR & KAU Agricultural Guidance</p>
            </div>
          </div>
          <button
            onClick={() => {
              stopSpeaking();
              onClose();
            }}
            className="p-2 rounded-xl text-earth-400 hover:text-earth-700 hover:bg-earth-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Microphone Soundwave Animation Area */}
        <div className="my-6 text-center">
          <div className="relative inline-flex items-center justify-center">
            {isListening && (
              <>
                <span className="animate-ping absolute inline-flex h-24 w-24 rounded-full bg-forest-400 opacity-60"></span>
                <span className="animate-pulse absolute inline-flex h-20 w-20 rounded-full bg-forest-300 opacity-40"></span>
              </>
            )}
            <button
              onClick={isListening ? () => setIsListening(false) : startListening}
              className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-lg ${
                isListening
                  ? 'bg-red-500 text-white shadow-red-500/40 ring-4 ring-red-200'
                  : 'bg-gradient-to-tr from-forest-600 to-leaf-500 text-white shadow-forest-600/30 hover:scale-105 active:scale-95'
              }`}
            >
              {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
            </button>
          </div>

          <p className="mt-3 text-sm font-semibold text-earth-800">
            {isListening ? t('listening') : 'Tap microphone to speak in your language'}
          </p>
          <p className="text-xs text-earth-500 mt-0.5">
            Supported: Kannada (ಕನ್ನಡ), Malayalam (മലയാളം), Hindi (हिन्दी), English
          </p>
        </div>

        {/* Live Recognized Speech or Typed Question */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={typedQuestion}
              onChange={(e) => setTypedQuestion(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAskQuestion(typedQuestion)}
              placeholder="Or type your agricultural question here..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-earth-200 bg-earth-50 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-forest-500 transition-all"
            />
            <button
              onClick={() => handleAskQuestion(typedQuestion)}
              disabled={isLoading || !typedQuestion.trim()}
              className="px-4 py-2.5 rounded-xl bg-forest-600 hover:bg-forest-700 disabled:opacity-50 text-white transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          {/* Quick preset questions */}
          <div className="pt-2">
            <p className="text-[11px] font-semibold text-earth-400 mb-1.5 uppercase tracking-wider">Example questions:</p>
            <div className="flex flex-wrap gap-1.5">
              {currentSamples.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setTypedQuestion(q);
                    handleAskQuestion(q);
                  }}
                  className="text-left text-xs bg-forest-50 hover:bg-forest-100 text-forest-800 border border-forest-200/60 px-3 py-1.5 rounded-xl transition-colors"
                >
                  "{q}"
                </button>
              ))}
            </div>
          </div>

          {/* Response Box */}
          {isLoading && (
            <div className="p-4 bg-earth-50 rounded-2xl flex items-center justify-center gap-3 text-forest-700 text-sm">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-forest-600 border-t-transparent" />
              Consulting verified agricultural knowledge base...
            </div>
          )}

          {response && (
            <div className="mt-4 p-4 rounded-2xl bg-forest-50/80 border border-forest-200 animate-in fade-in">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-forest-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-forest-600" />
                  CropShield Advice
                </span>
                <button
                  onClick={() => speak(response)}
                  className="text-xs text-forest-700 hover:text-forest-900 flex items-center gap-1 font-medium"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  Play Voice
                </button>
              </div>
              <p className="text-sm text-earth-800 leading-relaxed font-normal whitespace-pre-line">
                {response}
              </p>

              {/* Call to Action for Visual Photo Scan */}
              <div className="mt-3 pt-3 border-t border-forest-200/60 flex items-center justify-between">
                <span className="text-xs text-forest-800 font-medium">Need visual verification?</span>
                <button
                  onClick={() => {
                    stopSpeaking();
                    onClose();
                    navigate('/scanner');
                  }}
                  className="text-xs font-semibold bg-forest-600 hover:bg-forest-700 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-xs transition-colors"
                >
                  <Camera className="w-3.5 h-3.5" />
                  Open AI Scanner
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
