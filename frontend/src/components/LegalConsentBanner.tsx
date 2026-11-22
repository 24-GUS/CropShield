import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Check, X } from 'lucide-react';

export const LegalConsentBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cropshield_legal_consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cropshield_legal_consent', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 bg-forest-950/95 backdrop-blur-md text-white border-t border-forest-800 shadow-2xl p-3 sm:p-4 animate-in slide-in-from-bottom">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-forest-800 text-leaf-300 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <p className="text-forest-200 leading-snug">
            CropShield AI delivers AI-assisted agronomic advisory grounded in <strong>ICAR</strong> & <strong>CIB&RC</strong> pesticide safety standards. By using this service, you agree to our{' '}
            <Link to="/terms" className="text-leaf-300 underline font-semibold hover:text-white">
              Terms of Service
            </Link>
            ,{' '}
            <Link to="/privacy" className="text-leaf-300 underline font-semibold hover:text-white">
              Privacy Policy
            </Link>
            , and{' '}
            <Link to="/compliance" className="text-leaf-300 underline font-semibold hover:text-white">
              Chemical Safety Guidelines
            </Link>
            .
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
          <button
            onClick={handleAccept}
            className="px-4 py-2 rounded-xl bg-forest-600 hover:bg-forest-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors w-full sm:w-auto justify-center"
          >
            <Check className="w-3.5 h-3.5" />
            Accept & Continue
          </button>
        </div>
      </div>
    </div>
  );
};
