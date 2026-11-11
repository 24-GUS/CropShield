import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { ShieldCheck, UserCheck, ShieldAlert, Sparkles } from 'lucide-react';
import { UserRole } from '../types';

export const DemoBanner: React.FC = () => {
  const { role, user, demoLogin, isLoading } = useAuth();
  const { t } = useLanguage();

  const handleRoleChange = async (targetRole: UserRole) => {
    if (role === targetRole || isLoading) return;
    await demoLogin(targetRole);
  };

  return (
    <div className="bg-gradient-to-r from-forest-900 via-forest-800 to-forest-950 text-white text-xs py-1.5 px-3 border-b border-forest-700/50 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-leaf-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-leaf-500"></span>
          </span>
          <span className="font-semibold tracking-wide flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-leaf-300" />
            Hackathon Live Evaluation Mode:
          </span>
          <span className="hidden sm:inline text-forest-200">
            Active: <strong className="text-white capitalize">{role}</strong> ({user?.full_name || 'Demo User'})
          </span>
        </div>

        {/* 1-Click Role Switcher */}
        <div className="flex items-center gap-1.5 bg-forest-950/60 p-1 rounded-lg border border-forest-700/60">
          <span className="text-[10px] text-forest-300 font-medium px-1.5 hidden md:inline">Quick Switch:</span>
          
          <button
            onClick={() => handleRoleChange('farmer')}
            disabled={isLoading}
            className={`px-2.5 py-1 rounded-md font-medium flex items-center gap-1 transition-all ${
              role === 'farmer'
                ? 'bg-forest-600 text-white shadow-sm ring-1 ring-leaf-400'
                : 'text-forest-200 hover:text-white hover:bg-forest-800'
            }`}
          >
            <UserCheck className="w-3 h-3" />
            Farmer
          </button>

          <button
            onClick={() => handleRoleChange('expert')}
            disabled={isLoading}
            className={`px-2.5 py-1 rounded-md font-medium flex items-center gap-1 transition-all ${
              role === 'expert'
                ? 'bg-forest-600 text-white shadow-sm ring-1 ring-leaf-400'
                : 'text-forest-200 hover:text-white hover:bg-forest-800'
            }`}
          >
            <ShieldCheck className="w-3 h-3" />
            Expert
          </button>

          <button
            onClick={() => handleRoleChange('admin')}
            disabled={isLoading}
            className={`px-2.5 py-1 rounded-md font-medium flex items-center gap-1 transition-all ${
              role === 'admin'
                ? 'bg-forest-600 text-white shadow-sm ring-1 ring-leaf-400'
                : 'text-forest-200 hover:text-white hover:bg-forest-800'
            }`}
          >
            <ShieldAlert className="w-3 h-3" />
            Admin
          </button>
        </div>
      </div>
    </div>
  );
};
