import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-earth-200/80 bg-white/60 backdrop-blur-xs py-6 px-4 sm:px-6 lg:px-8 text-xs text-earth-500">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand & Attribution */}
        <div className="flex items-center gap-2">
          <Sprout className="w-4 h-4 text-forest-600" />
          <span className="font-bold text-forest-950">CropShield AI</span>
          <span className="text-earth-400">| Enterprise Precision Agrotechnology</span>
        </div>

        {/* Legal Links */}
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 font-medium">
          <Link to="/terms" className="hover:text-forest-700 transition-colors">
            Terms of Service
          </Link>
          <Link to="/privacy" className="hover:text-forest-700 transition-colors">
            Privacy Policy
          </Link>
          <Link to="/compliance" className="hover:text-forest-700 transition-colors">
            CIB&RC & Pesticide Safety
          </Link>
          <Link to="/model-metrics" className="hover:text-forest-700 transition-colors">
            Model Benchmarks
          </Link>
        </div>

        {/* Copyright */}
        <div className="text-[11px] text-earth-400 text-center md:text-right">
          © {new Date().getFullYear()} CropShield AI Technologies. Grounded in ICAR, UAS Bangalore & KAU Practices.
        </div>
      </div>
    </footer>
  );
};
