import React, { useState, useEffect } from 'react';
import { weatherApi } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import {
  CloudSun,
  Thermometer,
  Droplets,
  Wind,
  CloudRain,
  AlertTriangle,
  MapPin,
  CheckCircle2,
  Calendar,
  Sparkles,
  Info
} from 'lucide-react';
import { WeatherData } from '../types';

export const WeatherPage: React.FC = () => {
  const { t } = useLanguage();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [regions, setRegions] = useState<any[]>([]);
  const [selectedRegion, setSelectedRegion] = useState({
    name: 'Shivamogga, Karnataka',
    lat: 13.9299,
    lng: 75.5681
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const regs = await weatherApi.getRegions();
        setRegions(regs);
      } catch (err) {
        console.error('Error fetching regions:', err);
      }
    };
    fetchRegions();
  }, []);

  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true);
      try {
        const data = await weatherApi.getCurrent(
          selectedRegion.lat,
          selectedRegion.lng,
          selectedRegion.name
        );
        setWeather(data);
      } catch (err) {
        console.error('Error fetching weather:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchWeather();
  }, [selectedRegion]);

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-earth-200">
        <div>
          <h1 className="text-2xl font-black text-forest-950 flex items-center gap-2.5">
            <CloudSun className="w-7 h-7 text-forest-600" />
            {t('weatherTitle')}
          </h1>
          <p className="text-xs text-earth-500 mt-1 max-w-2xl leading-relaxed">
            {t('weatherSubtitle')}
          </p>
        </div>

        {/* Region Selector */}
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-forest-600 shrink-0" />
          <select
            value={selectedRegion.name}
            onChange={(e) => {
              const reg = regions.find((r) => r.name === e.target.value);
              if (reg) setSelectedRegion(reg);
            }}
            className="px-3.5 py-2 rounded-xl border border-earth-200 bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-forest-500 shadow-xs"
          >
            {regions.map((r, idx) => (
              <option key={idx} value={r.name}>{r.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Meteorological Metrics Card */}
      <div className="bg-gradient-to-r from-forest-800 via-forest-700 to-forest-900 rounded-3xl p-6 sm:p-8 text-white shadow-elevated">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <span className="text-xs font-semibold text-leaf-300 uppercase tracking-wider block mb-1">
              Live Station Feed
            </span>
            <h2 className="text-2xl sm:text-3xl font-black">{selectedRegion.name}</h2>
            <p className="text-xs text-forest-200 mt-0.5">{weather?.condition}</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 text-center">
              <span className="text-[10px] text-white/80 uppercase font-semibold">Epidemiological Alert</span>
              <div className="text-xl font-black text-leaf-300 capitalize">{weather?.overall_risk_level || 'Moderate'}</div>
            </div>
          </div>
        </div>

        {/* 4 Meteorological Pillars */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="bg-white/10 backdrop-blur-xs p-4 rounded-2xl border border-white/10">
            <Thermometer className="w-5 h-5 text-orange-400 mx-auto mb-1.5" />
            <div className="text-2xl font-black">{weather?.temperature_c || 26.5}°C</div>
            <div className="text-[11px] text-forest-200 mt-0.5">Air Temperature</div>
          </div>

          <div className="bg-white/10 backdrop-blur-xs p-4 rounded-2xl border border-white/10">
            <Droplets className="w-5 h-5 text-blue-300 mx-auto mb-1.5" />
            <div className="text-2xl font-black">{weather?.humidity_pct || 82}%</div>
            <div className="text-[11px] text-forest-200 mt-0.5">Relative Humidity</div>
          </div>

          <div className="bg-white/10 backdrop-blur-xs p-4 rounded-2xl border border-white/10">
            <CloudRain className="w-5 h-5 text-teal-300 mx-auto mb-1.5" />
            <div className="text-2xl font-black">{weather?.rainfall_mm || 6.4} mm</div>
            <div className="text-[11px] text-forest-200 mt-0.5">24h Precipitation</div>
          </div>

          <div className="bg-white/10 backdrop-blur-xs p-4 rounded-2xl border border-white/10">
            <Wind className="w-5 h-5 text-leaf-300 mx-auto mb-1.5" />
            <div className="text-2xl font-black">{weather?.wind_speed_kmh || 12} km/h</div>
            <div className="text-[11px] text-forest-200 mt-0.5">Wind Speed</div>
          </div>
        </div>
      </div>

      {/* 5-Day Forecast Grid */}
      {weather?.forecast && weather.forecast.length > 0 && (
        <div className="bg-white p-6 rounded-3xl border border-earth-200 shadow-soft">
          <h3 className="text-sm font-bold text-forest-950 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-forest-600" />
            5-Day Microclimate Forecast
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {weather.forecast.map((f, idx) => (
              <div key={idx} className="p-3.5 bg-earth-50 rounded-2xl text-center border border-earth-100">
                <div className="text-xs font-bold text-earth-800">{f.date}</div>
                <CloudSun className="w-6 h-6 text-forest-600 mx-auto my-2" />
                <div className="text-sm font-black text-earth-900">{f.temp_max}° / {f.temp_min}°</div>
                <div className="text-[10px] text-blue-600 font-semibold mt-1 flex items-center justify-center gap-1">
                  <Droplets className="w-3 h-3" />
                  {f.rain_prob}% ({f.rain_sum}mm)
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Biological Epidemiological Risk Factors */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-forest-950 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            Crop-Specific Epidemiological Pathogen Risk
          </h3>
          <span className="text-xs text-earth-500 font-medium">Biological rules (ICAR/KAU)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {weather?.risk_factors?.map((factor, idx) => (
            <div
              key={idx}
              className={`p-5 rounded-3xl border transition-all ${
                factor.risk_level === 'High'
                  ? 'bg-red-50/70 border-red-200 text-red-950'
                  : factor.risk_level === 'Moderate'
                  ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                  : 'bg-green-50/70 border-green-200 text-green-950'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider">{factor.crop_name}</span>
                  <h4 className="font-black text-base mt-0.5">{factor.disease_name}</h4>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                  factor.risk_level === 'High'
                    ? 'bg-red-600 text-white border-red-700'
                    : factor.risk_level === 'Moderate'
                    ? 'bg-amber-500 text-white border-amber-600'
                    : 'bg-green-600 text-white border-green-700'
                }`}>
                  {factor.risk_level} Risk
                </span>
              </div>

              <div className="mt-3 text-xs leading-relaxed space-y-2">
                <p>
                  <strong>Epidemiological Cause:</strong> {factor.explanation}
                </p>
                <div className="p-2.5 rounded-xl bg-white/70 border border-current/20">
                  <strong>Recommended Prophylaxis:</strong> {factor.recommended_prophylaxis}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="p-4 rounded-2xl bg-earth-100/70 border border-earth-200 text-xs text-earth-600 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-earth-500 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          {weather?.disclaimer || 'Weather-based disease risk is an early warning epidemiological indicator, not a confirmation of disease presence. Always visually inspect fields before chemical intervention.'}
        </p>
      </div>
    </div>
  );
};
