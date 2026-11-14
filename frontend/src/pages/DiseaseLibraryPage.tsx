import React, { useState, useEffect } from 'react';
import { cropsApi } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import { BookOpen, Search, Filter, Stethoscope, ShieldAlert, ArrowRight, Sprout } from 'lucide-react';
import { CropDisease, Crop } from '../types';

export const DiseaseLibraryPage: React.FC = () => {
  const { t, language } = useLanguage();
  const [diseases, setDiseases] = useState<CropDisease[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<string>('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [activeModalDisease, setActiveModalDisease] = useState<CropDisease | null>(null);

  useEffect(() => {
    const fetchLibrary = async () => {
      setLoading(true);
      try {
        const [dRes, cRes] = await Promise.all([
          cropsApi.getAllDiseases({
            crop_name: selectedCrop || undefined,
            severity: selectedSeverity || undefined,
            search: searchQuery || undefined
          }),
          cropsApi.getAllCrops()
        ]);
        setDiseases(dRes);
        setCrops(cRes);
      } catch (err) {
        console.error('Error fetching disease library:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLibrary();
  }, [selectedCrop, selectedSeverity, searchQuery]);

  return (
    <div className="space-y-6 pb-16">
      {/* Page Header */}
      <div className="pb-4 border-b border-earth-200">
        <h1 className="text-2xl font-black text-forest-950 flex items-center gap-2.5">
          <BookOpen className="w-7 h-7 text-forest-600" />
          {t('navLibrary')}
        </h1>
        <p className="text-xs text-earth-500 mt-1 max-w-2xl leading-relaxed">
          Comprehensive scientific repository of crop diseases affecting Karnataka and Kerala plantations. Grounded in ICAR and Agricultural University extension bulletins.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-earth-200 shadow-soft grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-earth-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search symptoms or pathogen..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-earth-200 bg-earth-50 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-forest-500"
          />
        </div>

        {/* Filter by Crop */}
        <div>
          <select
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-earth-200 bg-earth-50 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-forest-500"
          >
            <option value="">All Supported Crops</option>
            {crops.map((c) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Filter by Severity */}
        <div>
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-earth-200 bg-earth-50 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-forest-500"
          >
            <option value="">All Severity Levels</option>
            <option value="None">Healthy Normal</option>
            <option value="Low">Low</option>
            <option value="Moderate">Moderate</option>
            <option value="High">High</option>
            <option value="Severe">Severe</option>
          </select>
        </div>
      </div>

      {/* Disease Cards Grid */}
      {loading ? (
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-3 border-forest-600 border-t-transparent mx-auto mb-2" />
          <p className="text-xs text-earth-500">Loading verified agricultural pathology records...</p>
        </div>
      ) : diseases.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-3xl border border-earth-200 text-earth-500 text-xs">
          No disease records matching your search criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {diseases.map((disease) => {
            const loc = disease.translations?.[language] || {};
            const title = loc.name || disease.disease_name;
            const symptoms = loc.symptoms || disease.symptoms;

            return (
              <div
                key={disease.id}
                className="bg-white rounded-3xl border border-earth-200 hover:border-forest-300 p-5 shadow-soft hover:shadow-elevated transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-forest-700 bg-forest-50 border border-forest-200 px-2.5 py-0.5 rounded-full uppercase">
                      {disease.disease_code.split('_')[0].toUpperCase()}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      disease.is_healthy
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : disease.severity_level === 'Severe'
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-orange-50 text-orange-700 border-orange-200'
                    }`}>
                      {disease.severity_level}
                    </span>
                  </div>

                  <h3 className="font-black text-base text-forest-950 mb-1 leading-snug">
                    {title}
                  </h3>
                  {disease.scientific_name && (
                    <p className="text-[11px] text-earth-400 italic mb-3">
                      {disease.scientific_name}
                    </p>
                  )}

                  <p className="text-xs text-earth-600 line-clamp-3 leading-relaxed mb-4">
                    {symptoms}
                  </p>
                </div>

                <div className="pt-3 border-t border-earth-100 flex items-center justify-between">
                  <span className="text-[11px] text-earth-400">ICAR / KAU Protocol</span>
                  <button
                    onClick={() => setActiveModalDisease(disease)}
                    className="text-xs font-bold text-forest-700 hover:text-forest-900 flex items-center gap-1 group"
                  >
                    View Details
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Disease Detail Modal */}
      {activeModalDisease && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-earth-200 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-earth-100 mb-4">
              <div>
                <span className="text-[10px] bg-forest-50 text-forest-800 font-bold px-2 py-0.5 rounded-md border border-forest-200 uppercase">
                  {activeModalDisease.disease_code.split('_')[0]}
                </span>
                <h2 className="text-xl font-black text-forest-950 mt-1">
                  {activeModalDisease.translations?.[language]?.name || activeModalDisease.disease_name}
                </h2>
                <p className="text-xs text-earth-500 italic">{activeModalDisease.scientific_name}</p>
              </div>
              <button
                onClick={() => setActiveModalDisease(null)}
                className="text-earth-400 hover:text-earth-700 text-sm font-bold p-2"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <h4 className="font-bold text-forest-900 uppercase tracking-wider mb-1">Symptoms</h4>
                <p className="text-earth-700 leading-relaxed bg-earth-50 p-3 rounded-xl border border-earth-100">
                  {activeModalDisease.translations?.[language]?.symptoms || activeModalDisease.symptoms}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-forest-900 uppercase tracking-wider mb-1">Causes & Epidemiology</h4>
                <p className="text-earth-700 leading-relaxed bg-earth-50 p-3 rounded-xl border border-earth-100">
                  {activeModalDisease.common_causes}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-forest-900 uppercase tracking-wider mb-1">Recommended Treatment</h4>
                <p className="text-forest-950 font-medium leading-relaxed bg-forest-50 p-3 rounded-xl border border-forest-200">
                  {activeModalDisease.translations?.[language]?.treatment || activeModalDisease.recommended_treatment}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-forest-900 uppercase tracking-wider mb-1">IPM & Biological Prevention</h4>
                <p className="text-earth-700 leading-relaxed bg-earth-50 p-3 rounded-xl border border-earth-100">
                  {activeModalDisease.ipm_measures}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
                <h4 className="font-bold text-amber-900 mb-0.5">Safety & Environmental Precautions</h4>
                <p className="text-amber-800 leading-relaxed">
                  {activeModalDisease.safety_precautions}
                </p>
              </div>

              <p className="text-[10px] text-earth-400 font-semibold pt-2">
                References: {activeModalDisease.expert_references}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
