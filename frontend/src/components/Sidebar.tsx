import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import {
  LayoutDashboard,
  Scan,
  Sprout,
  BookOpen,
  Stethoscope,
  CloudSun,
  MapPin,
  MessageSquare,
  History,
  Cpu,
  Settings,
  ShieldCheck,
  ShieldAlert,
  HelpCircle
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  to: string;
  label: string;
  icon: any;
  badge?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { role } = useAuth();
  const { t } = useLanguage();

  const farmerNavItems: NavItem[] = [
    { to: '/dashboard', label: t('navDashboard'), icon: LayoutDashboard },
    { to: '/scanner', label: t('navScanner'), icon: Scan, badge: 'AI' },
    { to: '/crops', label: t('navCrops'), icon: Sprout },
    { to: '/library', label: t('navLibrary'), icon: BookOpen },
    { to: '/treatments', label: t('navTreatments'), icon: Stethoscope },
    { to: '/weather', label: t('navWeather'), icon: CloudSun },
    { to: '/map', label: t('navMap'), icon: MapPin },
    { to: '/consult', label: t('navConsult'), icon: MessageSquare },
    { to: '/history', label: t('navHistory'), icon: History },
    { to: '/model-metrics', label: t('navModelMetrics'), icon: Cpu },
    { to: '/settings', label: t('navSettings'), icon: Settings },
  ];

  const expertNavItems: NavItem[] = [
    { to: '/expert-dashboard', label: t('navExpertPortal'), icon: ShieldCheck },
    { to: '/scanner', label: 'AI Review Scanner', icon: Scan },
    { to: '/consult', label: 'Farmer Questions', icon: MessageSquare },
    { to: '/map', label: t('navMap'), icon: MapPin },
    { to: '/library', label: t('navLibrary'), icon: BookOpen },
    { to: '/model-metrics', label: t('navModelMetrics'), icon: Cpu },
    { to: '/settings', label: t('navSettings'), icon: Settings },
  ];

  const adminNavItems: NavItem[] = [
    { to: '/admin-dashboard', label: t('navAdminPortal'), icon: ShieldAlert },
    { to: '/model-metrics', label: t('navModelMetrics'), icon: Cpu },
    { to: '/map', label: t('navMap'), icon: MapPin },
    { to: '/library', label: t('navLibrary'), icon: BookOpen },
    { to: '/treatments', label: t('navTreatments'), icon: Stethoscope },
    { to: '/settings', label: t('navSettings'), icon: Settings },
  ];

  const navItems = role === 'expert' ? expertNavItems : role === 'admin' ? adminNavItems : farmerNavItems;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/40 z-30 lg:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-30 w-64 bg-white border-r border-earth-200 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col`}
      >
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-bold text-earth-400 uppercase tracking-wider">
            {role === 'farmer' ? 'Farmer Tools' : role === 'expert' ? 'Expert Console' : 'System Administration'}
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-forest-50 text-forest-800 shadow-xs border border-forest-200/80 font-semibold'
                      : 'text-earth-600 hover:text-forest-700 hover:bg-forest-50/50'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-forest-600" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] bg-leaf-400 text-forest-950 font-bold px-1.5 py-0.5 rounded-md">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Advisory Box at Bottom */}
        <div className="p-3 border-t border-earth-200 bg-earth-50/60">
          <div className="bg-forest-50 rounded-xl p-2.5 border border-forest-200 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-forest-800 mb-1">
              <HelpCircle className="w-3.5 h-3.5 text-forest-600" />
              <span>Agri-Helpline</span>
            </div>
            <p className="text-[11px] text-earth-600 leading-relaxed">
              Kisan Call Center: <strong className="text-forest-900">1800-180-1551</strong> (Toll Free)
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
