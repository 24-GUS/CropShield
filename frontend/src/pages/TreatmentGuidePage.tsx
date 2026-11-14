import React, { useState, useEffect } from 'react';
import { cropsApi } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import { Stethoscope, ShieldCheck, AlertTriangle, CheckCircle2, Leaf, FlaskConical, Filter } from 'lucide-react';
import { CropDisease, Crop } from '../types';

export const TreatmentGuidePage: React.FC = () => {
  const { t, language } = useLanguage();
  const [diseases, setDiseases] = useState<CropDisease[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTreatments = async () => {
      setLoading(true);
      try {
        const [dRes, cRes] = await Promise.all([
          cropsApi.getAllDiseases({ crop_name: selectedCrop || undefined }),
          cropsApi.getAllCrops()
        ]);
        // Filter only disease conditions (ignore normal healthy)
        setDiseases(dRes.filter(d => !d.is_healthy));
        setCrops(cRes);
      } catch (err) {
        console.error('Error fetching treatment protocols:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTreatments();
  }, [selectedCrop]);

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="pb-4 border-b border-earth-200">
        <h1 className="text-2xl font-black text-forest-950 flex items-center gap-2.5">
          <Stethoscope className="w-7 h-7 text-forest-600" />
          {t('navTreatments')}
        </h1>
        <p className="text-xs text-earth-500 mt-1 max-w-2xl leading-relaxed">
          Integrated Pest & Disease Management (IPM) guidelines. Prioritizing biological, cultural, and approved chemical dosages adhering to Central Insecticides Board (CIBRC) regulations.
        </p>
      </div>

      {/* Safety Callout Box */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold block">Authoritative Prescription Standard:</span>
          <p className="leading-relaxed">
            All chemical formulations follow University of Agricultural Sciences (UAS Bangalore & Dharwad) and Kerala Agricultural University (KAU) packages of practices. Always observe personal protective equipment (PPE) mandates and Pre-Harvest Intervals (PHI). Never mix unapproved chemical formulations.
          </p>
        </div>
      </div>

      {/* Crop Selector Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedCrop('')}
          className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-colors ${
            selectedCrop === ''
              ? 'bg-forest-600 text-white shadow-xs'
              : 'bg-white border border-earth-200 text-earth-700 hover:bg-forest-50'
          }`}
        >
          All Crops
        </button>
        {crops.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCrop(c.name)}
            className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-colors ${
              selectedCrop === c.name
                ? 'bg-forest-600 text-white shadow-xs'
                : 'bg-white border border-earth-200 text-earth-700 hover:bg-forest-50'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Treatment Protocols Cards */}
      {loading ? (
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-3 border-forest-600 border-t-transparent mx-auto mb-2" />
          <p className="text-xs text-earth-500">Loading verified agricultural protocols...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {diseases.map((d) => {
            const loc = d.translations?.[language] || {};
            const diseaseTitle = loc.name || d.disease_name;
            const treatmentText = loc.treatment || d.recommended_treatment;

            return (
              <div
                key={d.id}
                className="bg-white rounded-3xl border border-earth-200 p-6 sm:p-7 shadow-soft space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-earth-100 gap-2">
                  <div>
                    <span className="text-[10px] bg-forest-50 text-forest-800 font-bold px-2 py-0.5 rounded-md border border-forest-200 uppercase">
                      {d.disease_code.split('_')[0]}
                    </span>
                    <h2 className="text-lg font-black text-forest-950 mt-1">
                      {diseaseTitle}
                    </h2>
                    <p className="text-xs text-earth-400 italic">{d.scientific_name}</p>
                  </div>

                  <span className={`self-start sm:self-auto text-xs font-bold px-3 py-1 rounded-full border ${
                    d.severity_level === 'Severe'
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : 'bg-orange-50 text-orange-700 border-orange-200'
                  }`}>
                    Severity: {d.severity_level}
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  {/* Step 1: Cultural & Sanitation */}
                  <div className="bg-earth-50/70 p-4 rounded-2xl border border-earth-200/80">
                    <h4 className="text-xs font-bold text-forest-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Leaf className="w-4 h-4 text-forest-600" />
                      1. Cultural & Sanitation
                    </h4>
                    <p className="text-xs text-earth-700 leading-relaxed">
                      {d.prevention_methods}
                    </p>
                  </div>

                  {/* Step 2: Biological & IPM Control */}
                  <div className="bg-forest-50/60 p-4 rounded-2xl border border-forest-200/80">
                    <h4 className="text-xs font-bold text-forest-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-forest-600" />
                      2. Biological & IPM Control
                    </h4>
                    <p className="text-xs text-earth-800 leading-relaxed">
                      {d.ipm_measures}
                    </p>
                  </div>

                  {/* Step 3: Approved Chemical Prescription */}
                  <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200/80">
                    <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <FlaskConical className="w-4 h-4 text-emerald-700" />
                      3. Approved Curative Dosage
                    </h4>
                    <p className="text-xs text-emerald-900 font-semibold leading-relaxed">
                      {treatmentText}
                    </p>
                  </div>
                </div>

                {/* Safety Precautions & Advisory Reference */}
                <div className="p-3.5 rounded-2xl bg-earth-50 border border-earth-100 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-earth-600 gap-2">
                  <div>
                    <strong className="text-earth-800">Safety & PPE:</strong> {d.safety_precautions}
                  </div>
                  <div className="shrink-0 text-earth-400">
                    Authority: {d.expert_references}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
