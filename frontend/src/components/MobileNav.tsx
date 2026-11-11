import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Scan, CloudSun, MapPin, MessageSquare } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const MobileNav: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-earth-200 shadow-elevated px-2 py-1.5 safe-area-bottom">
      <div className="flex items-center justify-around">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex flex-col items-center py-1 px-2 text-[10px] font-medium transition-colors ${
              isActive ? 'text-forest-700 font-bold' : 'text-earth-500 hover:text-earth-800'
            }`
          }
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span>{t('navDashboard')}</span>
        </NavLink>

        <NavLink
          to="/weather"
          className={({ isActive }) =>
            `flex flex-col items-center py-1 px-2 text-[10px] font-medium transition-colors ${
              isActive ? 'text-forest-700 font-bold' : 'text-earth-500 hover:text-earth-800'
            }`
          }
        >
          <CloudSun className="w-5 h-5 mb-0.5" />
          <span>{t('navWeather')}</span>
        </NavLink>

        {/* Central Prominent AI Scan Button */}
        <NavLink
          to="/scanner"
          className="flex flex-col items-center -mt-5 group"
        >
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-forest-700 to-leaf-500 text-white flex items-center justify-center shadow-lg shadow-forest-700/30 ring-4 ring-white group-active:scale-95 transition-transform p-3">
            <Scan className="w-6 h-6 animate-pulse" />
          </div>
          <span className="text-[10px] font-bold text-forest-800 mt-1">Scan Crop</span>
        </NavLink>

        <NavLink
          to="/map"
          className={({ isActive }) =>
            `flex flex-col items-center py-1 px-2 text-[10px] font-medium transition-colors ${
              isActive ? 'text-forest-700 font-bold' : 'text-earth-500 hover:text-earth-800'
            }`
          }
        >
          <MapPin className="w-5 h-5 mb-0.5" />
          <span>{t('navMap')}</span>
        </NavLink>

        <NavLink
          to="/consult"
          className={({ isActive }) =>
            `flex flex-col items-center py-1 px-2 text-[10px] font-medium transition-colors ${
              isActive ? 'text-forest-700 font-bold' : 'text-earth-500 hover:text-earth-800'
            }`
          }
        >
          <MessageSquare className="w-5 h-5 mb-0.5" />
          <span>{t('navConsult')}</span>
        </NavLink>
      </div>
    </div>
  );
};
