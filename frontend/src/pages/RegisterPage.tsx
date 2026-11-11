import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authApi, setAuthToken } from '../services/api';
import { Sprout, Mail, Lock, User, Phone, MapPin, AlertCircle, ArrowRight, Check } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { refreshUser } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState<'farmer' | 'expert'>('farmer');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [state, setState] = useState('Karnataka');
  const [district, setDistrict] = useState('Shivamogga');
  const [languagePref, setLanguagePref] = useState('kn');
  const [farmName, setFarmName] = useState('');
  const [primaryCrop, setPrimaryCrop] = useState('Paddy');
  const [areaAcres, setAreaAcres] = useState('3.0');
  const [specialization, setSpecialization] = useState('Plant Pathology');
  const [institution, setInstitution] = useState('UAS Bangalore');

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const payload: any = {
        full_name: fullName,
        email,
        password,
        phone,
        role,
        state,
        district,
        language_pref: languagePref,
      };

      if (role === 'farmer') {
        payload.farm_name = farmName || `${fullName}'s Farm`;
        payload.primary_crop = primaryCrop;
        payload.area_acres = parseFloat(areaAcres) || 2.5;
      } else {
        payload.specialization = specialization;
        payload.institution = institution;
      }

      const res: any = await authApi.register(payload);
      setAuthToken(res.access_token);
      await refreshUser();
      if (role === 'expert') {
        navigate('/expert-dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-earth-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-forest-700 to-leaf-500 flex items-center justify-center text-white shadow-md">
              <Sprout className="w-6 h-6" />
            </div>
            <span className="font-extrabold text-2xl text-forest-950">CropShield AI</span>
          </Link>
          <h2 className="mt-3 text-2xl font-bold text-earth-900">Create Your Account</h2>
          <p className="text-xs text-earth-500">Join Karnataka & Kerala's AI-Powered Crop Protection Network</p>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-earth-200 shadow-soft">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Role Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-earth-100 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => setRole('farmer')}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                role === 'farmer' ? 'bg-white text-forest-800 shadow-xs' : 'text-earth-600 hover:text-earth-900'
              }`}
            >
              Farmer Account
            </button>
            <button
              type="button"
              onClick={() => setRole('expert')}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                role === 'expert' ? 'bg-white text-forest-800 shadow-xs' : 'text-earth-600 hover:text-earth-900'
              }`}
            >
              Agricultural Expert
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-earth-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-earth-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={role === 'farmer' ? 'Basavaraj Gowda' : 'Dr. Radhika Menon'}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-earth-200 bg-earth-50 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-forest-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-earth-700 mb-1">Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-earth-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="farmer@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-earth-200 bg-earth-50 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-forest-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-earth-700 mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-earth-400 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98451 23456"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-earth-200 bg-earth-50 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-forest-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-earth-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-earth-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-earth-200 bg-earth-50 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-forest-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-earth-700 mb-1">State</label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-earth-200 bg-earth-50 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-forest-500"
                >
                  <option value="Karnataka">Karnataka</option>
                  <option value="Kerala">Kerala</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-earth-700 mb-1">District</label>
                <input
                  type="text"
                  required
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="Shivamogga / Palakkad"
                  className="w-full px-3 py-2.5 rounded-xl border border-earth-200 bg-earth-50 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-forest-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-earth-700 mb-1">Language</label>
                <select
                  value={languagePref}
                  onChange={(e) => setLanguagePref(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-earth-200 bg-earth-50 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-forest-500"
                >
                  <option value="kn">ಕನ್ನಡ (Kannada)</option>
                  <option value="ml">മലയാളം (Malayalam)</option>
                  <option value="hi">हिन्दी (Hindi)</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>

            {/* Farmer Specific Fields */}
            {role === 'farmer' ? (
              <div className="p-4 bg-forest-50/60 rounded-2xl border border-forest-100 space-y-3">
                <p className="text-xs font-bold text-forest-900">Farm Information</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-earth-700 mb-1">Farm / Plantation Name</label>
                    <input
                      type="text"
                      value={farmName}
                      onChange={(e) => setFarmName(e.target.value)}
                      placeholder="Sahyadri Organic Garden"
                      className="w-full px-3 py-2 rounded-xl border border-earth-200 bg-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-earth-700 mb-1">Primary Crop</label>
                    <select
                      value={primaryCrop}
                      onChange={(e) => setPrimaryCrop(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-earth-200 bg-white text-xs"
                    >
                      <option value="Paddy">Paddy (Rice)</option>
                      <option value="Arecanut">Arecanut</option>
                      <option value="Coconut">Coconut</option>
                      <option value="Banana">Banana</option>
                      <option value="Tomato">Tomato</option>
                      <option value="Black Pepper">Black Pepper</option>
                    </select>
                  </div>
                </div>
              </div>
            ) : (
              /* Expert Specific Fields */
              <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-100 space-y-3">
                <p className="text-xs font-bold text-blue-900">Expert Certification & Credentials</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-earth-700 mb-1">Specialization</label>
                    <input
                      type="text"
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      placeholder="Plant Pathology / IPM"
                      className="w-full px-3 py-2 rounded-xl border border-earth-200 bg-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-earth-700 mb-1">Institution / University</label>
                    <input
                      type="text"
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      placeholder="ICAR / UAS / KAU"
                      className="w-full px-3 py-2 rounded-xl border border-earth-200 bg-white text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-forest-600 hover:bg-forest-700 text-white font-bold text-sm shadow-md shadow-forest-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              <span>{isLoading ? 'Creating Account...' : 'Complete Registration'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-5 text-center text-xs text-earth-500">
            Already registered?{' '}
            <Link to="/login" className="font-semibold text-forest-700 hover:underline">
              Sign In here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
