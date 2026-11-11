import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Language } from '../types';
import {
  Sprout,
  Mic,
  Globe,
  LogOut,
  User as UserIcon,
  Menu,
  X,
  Volume2,
  ShieldCheck,
  Activity,
  ChevronDown
} from 'lucide-react';

interface NavbarProps {
  onOpenVoice: () => void;
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenVoice, onToggleSidebar }) => {
  const { user, role, logout } = useAuth();
  const { language, setLanguage, t, isSpeaking, stopSpeaking } = useLanguage();
  const navigate = useNavigate();
  const [langDropdown, setLangDropdown] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);

  const languages: { code: Language; label: string; native: string }[] = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
    { code: 'ml', label: 'Malayalam', native: 'മലയാളം' },
    { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  ];

  const currentLangObj = languages.find((l) => l.code === language) || languages[0];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-forest-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand Logo & Sidebar Toggle */}
          <div className="flex items-center gap-3">
            {onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className="p-2 rounded-lg text-earth-600 hover:text-forest-700 hover:bg-forest-50 lg:hidden"
                aria-label="Toggle Navigation"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            <Link to={role === 'expert' ? '/expert-dashboard' : role === 'admin' ? '/admin-dashboard' : '/dashboard'} className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-forest-700 to-leaf-500 flex items-center justify-center text-white shadow-md shadow-forest-600/20 group-hover:scale-105 transition-transform">
                <Sprout className="w-6 h-6" />
              </div>
              <div>
                <span className="font-extrabold text-xl text-forest-950 tracking-tight flex items-center gap-1.5">
                  CropShield <span className="text-forest-600">AI</span>
                </span>
                <span className="text-[10px] text-earth-500 hidden sm:block font-medium -mt-1 tracking-wide">
                  Karnataka & Kerala Agri-Shield
                </span>
              </div>
            </Link>

            {/* Role Badge */}
            <span className={`hidden md:inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
              role === 'farmer'
                ? 'bg-forest-50 text-forest-700 border-forest-200'
                : role === 'expert'
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-purple-50 text-purple-700 border-purple-200'
            }`}>
              <ShieldCheck className="w-3 h-3" />
              {t(role)}
            </span>
          </div>

          {/* Right Action Icons & Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Audio Speech Status indicator */}
            {isSpeaking && (
              <button
                onClick={stopSpeaking}
                className="flex items-center gap-1 text-xs bg-leaf-100 text-forest-800 px-2.5 py-1 rounded-full animate-pulse border border-leaf-300"
                title="Stop Audio Speech"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Speaking... (Click to stop)</span>
              </button>
            )}

            {/* Multilingual Voice Assistant Button */}
            <button
              onClick={onOpenVoice}
              className="flex items-center gap-1.5 bg-gradient-to-r from-forest-600 to-forest-700 hover:from-forest-700 hover:to-forest-800 text-white px-3 py-1.5 rounded-xl font-medium text-xs sm:text-sm shadow-sm transition-all hover:shadow-md hover:scale-[1.02] active:scale-95 ring-2 ring-forest-500/20"
              title={t('askByVoice')}
            >
              <Mic className="w-4 h-4 text-leaf-300 animate-bounce" />
              <span className="hidden sm:inline font-semibold">{t('askByVoice')}</span>
            </button>

            {/* Language Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setLangDropdown(!langDropdown)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-earth-200 bg-white text-earth-700 hover:bg-forest-50 hover:border-forest-200 text-xs sm:text-sm font-medium transition-colors"
              >
                <Globe className="w-4 h-4 text-forest-600" />
                <span>{currentLangObj.native}</span>
                <ChevronDown className="w-3.5 h-3.5 text-earth-400" />
              </button>

              {langDropdown && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-elevated border border-earth-100 py-1.5 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-1 text-[11px] font-semibold text-earth-400 uppercase tracking-wider">
                    Select Language
                  </div>
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLanguage(l.code);
                        setLangDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs sm:text-sm flex items-center justify-between hover:bg-forest-50 transition-colors ${
                        language === l.code ? 'text-forest-700 font-semibold bg-forest-50/60' : 'text-earth-700'
                      }`}
                    >
                      <span>{l.native}</span>
                      <span className="text-[11px] text-earth-400 font-normal">{l.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* User Profile / Menu or Sign In */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdown(!userDropdown)}
                  className="flex items-center gap-2 p-1 rounded-xl hover:bg-forest-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-forest-100 text-forest-800 font-bold text-xs flex items-center justify-center border border-forest-200">
                    {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                  </div>
                </button>

                {userDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-elevated border border-earth-100 py-2 z-50">
                    <div className="px-4 py-2 border-b border-earth-100">
                      <p className="text-sm font-semibold text-earth-900 truncate">{user?.full_name}</p>
                      <p className="text-xs text-earth-500 truncate">{user?.email}</p>
                      <p className="text-[10px] text-forest-600 font-medium capitalize mt-0.5">{user?.district}, {user?.state}</p>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setUserDropdown(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-earth-700 hover:bg-forest-50 hover:text-forest-800"
                    >
                      <UserIcon className="w-4 h-4" />
                      Farmer Profile
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setUserDropdown(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-earth-700 hover:bg-forest-50 hover:text-forest-800"
                    >
                      <Activity className="w-4 h-4" />
                      Settings & Language
                    </Link>
                    <button
                      onClick={() => {
                        setUserDropdown(false);
                        logout();
                        navigate('/login');
                      }}
                      className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4" />
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-forest-600 hover:bg-forest-700 text-white text-xs font-bold shadow-sm transition-all"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
