import React, { useState, useEffect } from 'react';
import { cropsApi } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import { Sprout, MapPin, Plus, Check, CheckCircle2, ShieldCheck, TreePine, Droplets } from 'lucide-react';
import { Crop, Farm } from '../types';

export const CropRegistrationPage: React.FC = () => {
  const { t, language } = useLanguage();
  const [crops, setCrops] = useState<Crop[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [showAddFarm, setShowAddFarm] = useState(false);
  const [loading, setLoading] = useState(true);

  // New Farm form state
  const [farmName, setFarmName] = useState('');
  const [locationName, setLocationName] = useState('Shivamogga, Karnataka');
  const [areaAcres, setAreaAcres] = useState('3.5');
  const [soilType, setSoilType] = useState('Red Laterite Loam');
  const [irrigationType, setIrrigationType] = useState('Drip & Basin');
  const [primaryCrop, setPrimaryCrop] = useState('Arecanut');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [cRes, fRes] = await Promise.all([
          cropsApi.getAllCrops(),
          cropsApi.getFarms()
        ]);
        setCrops(cRes);
        setFarms(fRes);
      } catch (err) {
        console.error('Error fetching crops/farms:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCreateFarm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const newFarm = await cropsApi.createFarm({
        farm_name: farmName,
        location_name: locationName,
        area_acres: parseFloat(areaAcres),
        soil_type: soilType,
        irrigation_type: irrigationType,
        primary_crop: primaryCrop,
        latitude: 13.9299,
        longitude: 75.5681
      });
      setFarms([...farms, newFarm as Farm]);
      setShowAddFarm(false);
      setFarmName('');
    } catch (err) {
      alert('Failed to register farm plot');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-earth-200">
        <div>
          <h1 className="text-2xl font-black text-forest-950 flex items-center gap-2.5">
            <Sprout className="w-7 h-7 text-forest-600" />
            {t('navCrops')}
          </h1>
          <p className="text-xs text-earth-500 mt-1">
            Manage your registered cultivation plots and explore AI-supported crops in Karnataka & Kerala.
          </p>
        </div>

        <button
          onClick={() => setShowAddFarm(!showAddFarm)}
          className="px-4 py-2.5 rounded-xl bg-forest-600 hover:bg-forest-700 text-white font-bold text-xs shadow-md shadow-forest-600/20 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Farm Plot</span>
        </button>
      </div>

      {/* Add Farm Form Modal / Collapsible */}
      {showAddFarm && (
        <div className="bg-white p-6 rounded-3xl border border-forest-200 shadow-elevated animate-in fade-in">
          <h3 className="text-base font-bold text-forest-950 mb-3">Register New Cultivation Plot</h3>
          <form onSubmit={handleCreateFarm} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-earth-700 mb-1">Farm / Plot Name</label>
              <input
                type="text"
                required
                value={farmName}
                onChange={(e) => setFarmName(e.target.value)}
                placeholder="Sahyadri Plantation Block B"
                className="w-full px-3 py-2 rounded-xl border border-earth-200 bg-earth-50 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-earth-700 mb-1">Location / Village</label>
              <input
                type="text"
                required
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="Thirthahalli, Shivamogga"
                className="w-full px-3 py-2 rounded-xl border border-earth-200 bg-earth-50 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-earth-700 mb-1">Area (Acres)</label>
              <input
                type="number"
                step="0.1"
                required
                value={areaAcres}
                onChange={(e) => setAreaAcres(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-earth-200 bg-earth-50 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-earth-700 mb-1">Soil Type</label>
              <select
                value={soilType}
                onChange={(e) => setSoilType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-earth-200 bg-earth-50 text-xs"
              >
                <option value="Red Laterite Loam">Red Laterite Loam (Malnad)</option>
                <option value="Coastal Alluvial Sand">Coastal Alluvial Sand</option>
                <option value="Clay Loam">Clay Loam (Paddy Delta)</option>
                <option value="Black Cotton Soil">Black Cotton Soil</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-earth-700 mb-1">Primary Crop</label>
              <select
                value={primaryCrop}
                onChange={(e) => setPrimaryCrop(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-earth-200 bg-earth-50 text-xs"
              >
                {crops.map((c) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end gap-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-forest-600 hover:bg-forest-700 text-white text-xs font-bold transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save Plot'}
              </button>
              <button
                type="button"
                onClick={() => setShowAddFarm(false)}
                className="px-4 py-2 rounded-xl border border-earth-200 text-earth-600 text-xs font-medium hover:bg-earth-100"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Registered Farms Section */}
      <div>
        <h2 className="text-base font-bold text-forest-950 mb-3">Your Cultivation Plots</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {farms.map((f) => (
            <div key={f.id} className="p-5 bg-white rounded-2xl border border-earth-200 shadow-soft">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-sm text-forest-950">{f.farm_name}</h3>
                <span className="text-[10px] font-semibold bg-forest-50 text-forest-700 border border-forest-200 px-2 py-0.5 rounded-full">
                  {f.area_acres} Acres
                </span>
              </div>
              <p className="text-xs text-earth-500 flex items-center gap-1 mb-3">
                <MapPin className="w-3.5 h-3.5 text-forest-600" />
                {f.location_name}
              </p>

              <div className="pt-3 border-t border-earth-100 grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-earth-400 block">Primary Crop:</span>
                  <span className="font-semibold text-forest-900">{f.primary_crop}</span>
                </div>
                <div>
                  <span className="text-earth-400 block">Soil Type:</span>
                  <span className="font-semibold text-earth-700">{f.soil_type}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Supported Regional Crops Catalog */}
      <div className="pt-4">
        <h2 className="text-base font-bold text-forest-950 mb-3">
          AI-Calibrated Crop Pathology Scope
        </h2>
        <p className="text-xs text-earth-500 mb-4">
          Models trained with rigorous multi-source field verification. Unsupported plants are automatically rejected.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {crops.map((crop) => (
            <div key={crop.id} className="p-5 bg-white rounded-2xl border border-earth-200 shadow-soft hover:border-forest-200 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-sm text-forest-950">{crop.name}</h3>
                <span className="text-[10px] bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  AI Ready
                </span>
              </div>
              <p className="text-[11px] text-earth-400 italic mb-2">{crop.scientific_name}</p>

              <div className="text-xs text-earth-600 space-y-1 mb-3">
                <div><strong>Category:</strong> {crop.category} • {crop.season}</div>
                {crop.local_names && (
                  <div className="text-[11px] text-forest-800">
                    <strong>Local:</strong> {crop.local_names['kn']} / {crop.local_names['ml']} / {crop.local_names['hi']}
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-earth-100 flex items-center justify-between text-xs">
                <span className="text-earth-500">Diseases Covered:</span>
                <span className="font-bold text-forest-700">{crop.diseases?.length || 3} Conditions</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
