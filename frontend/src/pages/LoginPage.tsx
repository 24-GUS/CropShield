import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Sprout, 
  Lock, 
  Mail, 
  ArrowRight, 
  UserCheck, 
  ShieldCheck, 
  ShieldAlert, 
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2,
  KeyRound
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, demoLogin, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('farmer@cropshield.org');
  const [password, setPassword] = useState('farmer123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRoleTab, setSelectedRoleTab] = useState<'farmer' | 'expert' | 'admin'>('farmer');

  const redirectTarget = (location.state as any)?.from?.pathname || (
    selectedRoleTab === 'expert' ? '/expert-dashboard' : selectedRoleTab === 'admin' ? '/admin-dashboard' : '/dashboard'
  );

  const demoAccounts = {
    farmer: {
      email: 'farmer@cropshield.org',
      pass: 'farmer123',
      name: 'Basavaraj Gowda',
      role: 'Registered Farmer (Shivamogga, Karnataka)',
      path: '/dashboard'
    },
    expert: {
      email: 'expert@cropshield.org',
      pass: 'expert123',
      name: 'Dr. Radhika Menon',
      role: 'Agri-Pathologist (Kerala Agri University)',
      path: '/expert-dashboard'
    },
    admin: {
      email: 'admin@cropshield.org',
      pass: 'admin123',
      name: 'Dr. K. Srinivas',
      role: 'System Administrator & ICAR Liaison',
      path: '/admin-dashboard'
    }
  };

  const handleSelectRoleTab = (role: 'farmer' | 'expert' | 'admin') => {
    setSelectedRoleTab(role);
    setEmail(demoAccounts[role].email);
    setPassword(demoAccounts[role].pass);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
      navigate(redirectTarget, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Invalid email or password. Please verify your credentials.');
    }
  };

  const handleQuickDemoClick = async (role: 'farmer' | 'expert' | 'admin') => {
    setError(null);
    try {
      await demoLogin(role);
      navigate(demoAccounts[role].path, { replace: true });
    } catch (err: any) {
      setError('Demo login failed. Please ensure the backend server is reachable.');
    }
  };

  return (
    <div className="min-h-screen bg-earth-50 flex flex-col justify-center py-10 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex flex-col items-center gap-2 group">
          <img 
            src="/logo.png" 
            alt="CropShield AI" 
            className="w-44 h-auto max-h-24 object-contain group-hover:scale-105 transition-transform drop-shadow-sm" 
          />
        </Link>
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-earth-900">
          Sign In to Your Account
        </h2>
        <p className="mt-1 text-xs text-earth-600">
          AI-Powered Early Crop Disease Detection, Prediction & Assistance
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-soft rounded-3xl border border-earth-200 sm:px-8">
          
          {/* Security Banner / Notice */}
          <div className="mb-6 p-3 rounded-2xl bg-forest-50 border border-forest-100 flex items-start gap-2.5 text-xs text-forest-900">
            <ShieldCheck className="w-4 h-4 text-forest-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-forest-950">Secure Agricultural Authentication</p>
              <p className="text-[11px] text-forest-700 mt-0.5">
                Protected by PBKDF2 HMAC-SHA256, Sliding-Window Rate Limiting, and JWT Bearer Tokens.
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Role Persona Presets Selector */}
          <div className="mb-6">
            <label className="block text-xs font-bold text-earth-700 uppercase tracking-wider mb-2">
              Select Demo Persona (1-Click Fill)
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleSelectRoleTab('farmer')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex flex-col items-center gap-1 border transition-all ${
                  selectedRoleTab === 'farmer'
                    ? 'bg-forest-600 text-white border-forest-600 shadow-sm'
                    : 'bg-forest-50/70 text-forest-800 border-forest-200 hover:bg-forest-100'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>Farmer</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectRoleTab('expert')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex flex-col items-center gap-1 border transition-all ${
                  selectedRoleTab === 'expert'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-blue-50/70 text-blue-800 border-blue-200 hover:bg-blue-100'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Expert</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectRoleTab('admin')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex flex-col items-center gap-1 border transition-all ${
                  selectedRoleTab === 'admin'
                    ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                    : 'bg-purple-50/70 text-purple-800 border-purple-200 hover:bg-purple-100'
                }`}
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Admin</span>
              </button>
            </div>

            {/* Persona Details Card */}
            <div className="mt-3 p-3 rounded-xl bg-earth-50 border border-earth-200/80 text-[11px] text-earth-700 flex items-center justify-between">
              <div>
                <span className="font-bold text-earth-900">{demoAccounts[selectedRoleTab].name}</span>
                <span className="block text-earth-500">{demoAccounts[selectedRoleTab].role}</span>
              </div>
              <button
                type="button"
                onClick={() => handleQuickDemoClick(selectedRoleTab)}
                disabled={isLoading}
                className="px-2.5 py-1 rounded-lg bg-forest-600 hover:bg-forest-700 text-white text-[11px] font-bold shadow-sm transition-colors"
              >
                Instant In
              </button>
            </div>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-earth-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-earth-400 font-semibold tracking-wider">
                Or Sign In with Credentials
              </span>
            </div>
          </div>

          {/* Standard Credential Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-earth-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-earth-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@cropshield.org"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-earth-200 bg-earth-50 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-forest-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-earth-700">
                  Password
                </label>
                <span className="text-[11px] text-forest-700 font-medium">
                  Default: <code className="bg-earth-100 px-1 py-0.5 rounded text-[10px]">{demoAccounts[selectedRoleTab].pass}</code>
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-earth-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-earth-200 bg-earth-50 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-forest-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-earth-400 hover:text-earth-600 focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-earth-600 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-forest-600 focus:ring-forest-500 border-earth-300"
                />
                <span>Remember me for 30 days</span>
              </label>

              <span className="text-earth-400 text-[11px] cursor-not-allowed" title="Contact agricultural extension agent for reset">
                Forgot password?
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-forest-600 hover:bg-forest-700 text-white font-bold text-sm shadow-md shadow-forest-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{isLoading ? 'Verifying Credentials...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-earth-100 flex items-center justify-between text-xs text-earth-500">
            <span>New to CropShield?</span>
            <Link to="/register" className="font-semibold text-forest-700 hover:underline flex items-center gap-1">
              <span>Create Farm Account</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Security Compliance Microcopy */}
        <div className="mt-6 text-center text-[11px] text-earth-500 flex items-center justify-center gap-2">
          <KeyRound className="w-3.5 h-3.5 text-forest-600" />
          <span>Fuzz-Protected GPS • ICAR Data Standard • SSL/TLS 1.3</span>
        </div>
      </div>
    </div>
  );
};
