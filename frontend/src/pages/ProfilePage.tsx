import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { authApi } from '../services/api';
import { User, Mail, Phone, MapPin, Globe, ShieldCheck, Check, AlertCircle } from 'lucide-react';

import { Language } from '../types';

export const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { setLanguage } = useLanguage();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [district, setDistrict] = useState(user?.district || 'Shivamogga');
  const [state, setState] = useState(user?.state || 'Karnataka');
  const [languagePref, setLanguagePref] = useState<Language>(user?.language_pref || 'kn');
  const [isUpdating, setIsUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setSuccessMsg(false);
    try {
      await authApi.updateProfile({
        full_name: fullName,
        phone,
        district,
        state,
        language_pref: languagePref
      });
      setLanguage(languagePref as any);
      await refreshUser();
      setSuccessMsg(true);
    } catch {
      alert('Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6 pb-16 max-w-3xl mx-auto">
      <div className="pb-4 border-b border-earth-200">
        <h1 className="text-2xl font-black text-forest-950 flex items-center gap-2.5">
          <User className="w-7 h-7 text-forest-600" />
          Farmer Account & Profile
        </h1>
        <p className="text-xs text-earth-500 mt-1">
          Manage your personal credentials, farm location, and local language preferences.
        </p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-earth-200 shadow-soft space-y-6">
        {/* Profile Card Header */}
        <div className="flex items-center gap-4 pb-6 border-b border-earth-100">
          <div className="w-16 h-16 rounded-2xl bg-forest-100 text-forest-800 font-black text-2xl flex items-center justify-center border border-forest-200 shadow-sm">
            {user?.full_name?.charAt(0).toUpperCase() || 'F'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-forest-950">{user?.full_name}</h2>
            <p className="text-xs text-earth-500">{user?.email}</p>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-forest-700 bg-forest-50 px-2.5 py-0.5 rounded-full mt-1 border border-forest-200 capitalize">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified {user?.role} Account
            </span>
          </div>
        </div>

        {successMsg && (
          <div className="p-3.5 rounded-2xl bg-green-50 border border-green-200 text-green-800 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-green-600" />
            <span>Profile and language preferences updated successfully!</span>
          </div>
        )}

        {/* Update Form */}
        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-earth-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-earth-200 bg-earth-50 text-xs focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-earth-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-earth-200 bg-earth-50 text-xs focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-earth-700 mb-1">State</label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-earth-200 bg-earth-50 text-xs focus:bg-white"
              >
                <option value="Karnataka">Karnataka</option>
                <option value="Kerala">Kerala</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-earth-700 mb-1">District</label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-earth-200 bg-earth-50 text-xs focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-earth-700 mb-1">Preferred Language</label>
              <select
                value={languagePref}
                onChange={(e) => setLanguagePref(e.target.value as Language)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-earth-200 bg-earth-50 text-xs focus:bg-white"
              >
                <option value="kn">ಕನ್ನಡ (Kannada)</option>
                <option value="ml">മലയാളം (Malayalam)</option>
                <option value="hi">हिन्दी (Hindi)</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>

          <div className="pt-3 flex justify-end">
            <button
              type="submit"
              disabled={isUpdating}
              className="px-6 py-2.5 rounded-xl bg-forest-600 hover:bg-forest-700 text-white font-bold text-xs shadow-md shadow-forest-600/20 transition-all disabled:opacity-50"
            >
              {isUpdating ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
