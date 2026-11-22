import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { analyticsApi, weatherApi, scansApi, resolveImageUrl } from '../services/api';
import {
  Scan,
  CheckCircle2,
  AlertTriangle,
  CloudSun,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  MapPin,
  Calendar,
  Sparkles,
  HelpCircle,
  ExternalLink,
  Droplets,
  Thermometer,
  Wind
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export const FarmerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const [summary, setSummary] = useState<any>(null);
  const [weather, setWeather] = useState<any>(null);
  const [recentScans, setRecentScans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [sumRes, weathRes, scansRes] = await Promise.all([
          analyticsApi.getFarmerSummary(),
          weatherApi.getCurrent(13.9299, 75.5681, 'Shivamogga, Karnataka'),
          scansApi.getHistory(5)
        ]);
        setSummary(sumRes);
        setWeather(weathRes);
        setRecentScans(scansRes);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const pieColors = ['#16a34a', '#ea580c', '#64748b'];
  const healthData = [
    { name: 'Healthy', value: summary?.healthy_scans || 1 },
    { name: 'Diseased', value: summary?.diseased_scans || 2 },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-forest-800 via-forest-700 to-leaf-700 rounded-3xl p-6 sm:p-8 text-white shadow-elevated relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-900/60 text-leaf-300 text-xs font-semibold mb-3 border border-forest-600/60">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Smart Agricultural Shield — {user?.district || 'Shivamogga'}, {user?.state || 'Karnataka'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            {t('welcomeFarmer')}, {user?.full_name || 'Farmer'}!
          </h1>
          <p className="mt-2 text-sm text-forest-100 leading-relaxed font-normal">
            Your fields are continuously monitored for early foliar pathogens. Temperature and humidity currently indicate <strong className="text-leaf-300 capitalize">{weather?.overall_risk_level || 'Moderate'}</strong> pathogen development risk.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              to="/scanner"
              className="px-5 py-2.5 rounded-xl bg-white text-forest-900 hover:bg-forest-50 font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 hover:scale-[1.02]"
            >
              <Scan className="w-4 h-4 text-forest-700" />
              <span>{t('quickScan')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/weather"
              className="px-4 py-2.5 rounded-xl bg-forest-900/60 hover:bg-forest-900/80 text-white font-semibold text-xs sm:text-sm border border-forest-500/50 transition-all flex items-center gap-2"
            >
              <CloudSun className="w-4 h-4 text-leaf-300" />
              <span>View Weather Risk Advisory</span>
            </Link>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-leaf-400/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Scans */}
        <div className="bg-white p-5 rounded-2xl border border-earth-200 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-earth-500 uppercase tracking-wider">{t('totalScans')}</span>
            <div className="w-9 h-9 rounded-xl bg-forest-100 text-forest-700 flex items-center justify-center">
              <Scan className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-earth-900">{summary?.total_scans || 0}</div>
          <p className="text-[11px] text-earth-400 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-forest-600" /> Across all registered crops
          </p>
        </div>

        {/* Healthy Crops */}
        <div className="bg-white p-5 rounded-2xl border border-earth-200 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-earth-500 uppercase tracking-wider">{t('healthyScans')}</span>
            <div className="w-9 h-9 rounded-xl bg-green-100 text-green-700 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-green-700">{summary?.healthy_scans || 0}</div>
          <p className="text-[11px] text-green-600 font-medium mt-1">Normal foliage physiology</p>
        </div>

        {/* Detected Diseases */}
        <div className="bg-white p-5 rounded-2xl border border-earth-200 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-earth-500 uppercase tracking-wider">{t('diseasedScans')}</span>
            <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-orange-700">{summary?.diseased_scans || 0}</div>
          <p className="text-[11px] text-orange-600 font-medium mt-1">Requiring immediate IPM</p>
        </div>

        {/* Environmental Risk */}
        <div className="bg-white p-5 rounded-2xl border border-earth-200 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-earth-500 uppercase tracking-wider">{t('riskLevel')}</span>
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <CloudSun className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-blue-700">{weather?.overall_risk_level || 'Moderate'}</div>
          <p className="text-[11px] text-blue-600 font-medium mt-1">
            {weather?.temperature_c || 26.5}°C • {weather?.humidity_pct || 82}% RH
          </p>
        </div>
      </div>

      {/* Weather Snapshot & Priority Seasonal Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weather Card */}
        <div className="bg-white p-6 rounded-3xl border border-earth-200 shadow-soft">
          <div className="flex items-center justify-between pb-4 border-b border-earth-100">
            <div>
              <h3 className="font-bold text-base text-earth-900 flex items-center gap-2">
                <CloudSun className="w-5 h-5 text-forest-600" />
                Live Farm Microclimate
              </h3>
              <p className="text-xs text-earth-500">{weather?.location || 'Shivamogga, Karnataka'}</p>
            </div>
            <Link to="/weather" className="text-xs font-semibold text-forest-700 hover:underline">
              Details
            </Link>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="p-3 bg-earth-50 rounded-2xl">
              <Thermometer className="w-4 h-4 text-orange-500 mx-auto mb-1" />
              <div className="text-base font-bold text-earth-900">{weather?.temperature_c || 26.5}°C</div>
              <div className="text-[10px] text-earth-500">Temperature</div>
            </div>
            <div className="p-3 bg-earth-50 rounded-2xl">
              <Droplets className="w-4 h-4 text-blue-500 mx-auto mb-1" />
              <div className="text-base font-bold text-earth-900">{weather?.humidity_pct || 82}%</div>
              <div className="text-[10px] text-earth-500">Humidity</div>
            </div>
            <div className="p-3 bg-earth-50 rounded-2xl">
              <Wind className="w-4 h-4 text-teal-500 mx-auto mb-1" />
              <div className="text-base font-bold text-earth-900">{weather?.rainfall_mm || 6.4}mm</div>
              <div className="text-[10px] text-earth-500">Precipitation</div>
            </div>
          </div>

          {/* Top Disease Risk Alert */}
          {weather?.risk_factors && weather.risk_factors.length > 0 && (
            <div className="mt-4 p-3.5 rounded-2xl bg-orange-50 border border-orange-200 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-orange-900 mb-1">
                <AlertTriangle className="w-4 h-4 text-orange-600" />
                <span>{weather.risk_factors[0].crop_name}: {weather.risk_factors[0].disease_name}</span>
              </div>
              <p className="text-[11px] text-orange-800 leading-relaxed font-normal">
                {weather.risk_factors[0].explanation}
              </p>
            </div>
          )}
        </div>

        {/* Recommended Actions */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-earth-200 shadow-soft flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-earth-100">
              <h3 className="font-bold text-base text-earth-900 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-forest-600" />
                {t('recommendedActions')}
              </h3>
              <span className="text-[11px] text-forest-700 bg-forest-50 px-2.5 py-0.5 rounded-full font-medium">
                Kharif / Monsoon Season
              </span>
            </div>

            <div className="mt-4 space-y-3">
              <div className="p-3.5 rounded-2xl bg-forest-50/60 border border-forest-100 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-forest-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <h4 className="text-xs font-bold text-forest-950">Arecanut Koleroga (Fruit Rot) Prophylaxis</h4>
                  <p className="text-xs text-earth-600 mt-0.5 leading-relaxed">
                    Forecast indicates continuous rainfall. Spray 1% Bordeaux mixture on arecanut bunches before monsoon showers resume. Clear fallen rotted nuts.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-forest-50/60 border border-forest-100 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-forest-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <h4 className="text-xs font-bold text-forest-950">Paddy Bacterial Leaf Blight & Blast Inspection</h4>
                  <p className="text-xs text-earth-600 mt-0.5 leading-relaxed">
                    Inspect tillering paddy plots for wavy tip drying. Avoid top-dressing excessive urea fertilizer in humid overcast weather.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-earth-100 flex items-center justify-between">
            <span className="text-xs text-earth-500">Need specific dosage guidance?</span>
            <Link to="/treatments" className="text-xs font-bold text-forest-700 hover:text-forest-900 flex items-center gap-1">
              Browse ICAR/KAU Treatment Manuals <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Diagnoses & Crop Health Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Scan History */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-earth-200 shadow-soft">
          <div className="flex items-center justify-between pb-4 border-b border-earth-100 mb-4">
            <h3 className="font-bold text-base text-earth-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-forest-600" />
              {t('recentScans')}
            </h3>
            <Link to="/history" className="text-xs font-semibold text-forest-700 hover:underline">
              View All History
            </Link>
          </div>

          {recentScans.length === 0 ? (
            <div className="text-center py-8 text-earth-400 text-xs">
              No scans recorded yet. Use the AI Scanner to diagnose your first leaf photograph.
            </div>
          ) : (
            <div className="space-y-3">
              {recentScans.map((scan) => (
                <div
                  key={scan.id}
                  onClick={() => navigate(`/diagnosis/${scan.id}`)}
                  className="p-3.5 rounded-2xl border border-earth-100 hover:border-forest-200 bg-earth-50/40 hover:bg-forest-50/30 transition-all flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={resolveImageUrl(scan.image_url)}
                      alt={scan.disease_name}
                      className="w-12 h-12 rounded-xl object-cover border border-earth-200 group-hover:scale-105 transition-transform"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-forest-950">{scan.crop_name}</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          scan.is_healthy
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : 'bg-orange-50 text-orange-700 border-orange-200'
                        }`}>
                          {scan.disease_name}
                        </span>
                      </div>
                      <p className="text-[11px] text-earth-500 mt-0.5">
                        Confidence: <strong className="text-forest-700">{scan.confidence_pct}%</strong> • {new Date(scan.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {scan.expert_verdict && (
                      <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-md font-semibold hidden sm:inline">
                        Verified by Expert
                      </span>
                    )}
                    <ArrowRight className="w-4 h-4 text-earth-400 group-hover:text-forest-700 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Crop Breakdown Chart */}
        <div className="bg-white p-6 rounded-3xl border border-earth-200 shadow-soft">
          <h3 className="font-bold text-base text-earth-900 mb-2">Crop Scan Distribution</h3>
          <p className="text-xs text-earth-500 mb-4">Diagnostics proportion by crop type</p>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={healthData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {healthData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-center gap-6 mt-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-forest-600" />
              <span>Healthy: {summary?.healthy_scans || 0}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-orange-600" />
              <span>Diseased: {summary?.diseased_scans || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
