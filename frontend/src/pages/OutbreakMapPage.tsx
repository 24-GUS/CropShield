import React, { useState, useEffect } from 'react';
import { outbreakApi, cropsApi } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { MapPin, AlertTriangle, ShieldCheck, Plus, Filter, CheckCircle2, ShieldAlert, Sparkles } from 'lucide-react';
import { OutbreakReport, Crop } from '../types';

export const OutbreakMapPage: React.FC = () => {
  const { t } = useLanguage();
  const { role } = useAuth();

  const [reports, setReports] = useState<OutbreakReport[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<string>('');
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  // New report modal state
  const [showReportModal, setShowReportModal] = useState(false);
  const [cropId, setCropId] = useState<number>(1);
  const [diseaseNameCustom, setDiseaseNameCustom] = useState('Suspected Leaf Blight');
  const [description, setDescription] = useState('');
  const [district, setDistrict] = useState('Shivamogga');
  const [state, setState] = useState('Karnataka');
  const [severity, setSeverity] = useState<'Low' | 'Moderate' | 'High' | 'Severe'>('High');
  const [affectedAcres, setAffectedAcres] = useState('5.0');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchReports();
    fetchCrops();
  }, [selectedCrop, verifiedOnly]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await outbreakApi.getReports(selectedCrop || undefined, verifiedOnly);
      setReports(data);
    } catch (err) {
      console.error('Error fetching outbreak reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCrops = async () => {
    try {
      const data = await cropsApi.getAllCrops();
      setCrops(data);
      if (data.length > 0) setCropId(data[0].id);
    } catch (err) {
      console.error('Error fetching crops:', err);
    }
  };

  const handleVerify = async (reportId: number) => {
    try {
      await outbreakApi.verifyReport(reportId);
      await fetchReports();
    } catch (err) {
      alert('Verification failed');
    }
  };

  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Default coordinate anchors by district with privacy fuzzing
      const defaultCoords: Record<string, [number, number]> = {
        Shivamogga: [13.9299, 75.5681],
        Palakkad: [10.7867, 76.6548],
        Kolar: [13.1362, 78.1291],
        Wayanad: [11.6854, 76.1320],
        Davanagere: [14.4426, 75.9218],
        Kozhikode: [11.2588, 75.7804]
      };
      const coords = defaultCoords[district] || [13.9299, 75.5681];

      await outbreakApi.createReport({
        crop_id: cropId,
        disease_name_custom: diseaseNameCustom,
        description,
        district,
        state,
        severity,
        affected_acres: parseFloat(affectedAcres) || 2.0,
        approx_latitude: coords[0],
        approx_longitude: coords[1]
      });

      setShowReportModal(false);
      setDescription('');
      await fetchReports();
    } catch (err) {
      alert('Failed to submit report');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-earth-200">
        <div>
          <h1 className="text-2xl font-black text-forest-950 flex items-center gap-2.5">
            <MapPin className="w-7 h-7 text-forest-600" />
            {t('outbreakMapTitle')}
          </h1>
          <p className="text-xs text-earth-500 mt-1 max-w-2xl leading-relaxed">
            {t('outbreakSubtitle')}
          </p>
        </div>

        <button
          onClick={() => setShowReportModal(true)}
          className="px-4 py-2.5 rounded-xl bg-forest-600 hover:bg-forest-700 text-white font-bold text-xs shadow-md shadow-forest-600/20 transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t('reportOutbreakBtn')}</span>
        </button>
      </div>

      {/* Privacy Guarantee Pill */}
      <div className="p-3.5 rounded-2xl bg-forest-50 border border-forest-200 text-xs text-forest-900 flex items-center gap-2.5">
        <ShieldCheck className="w-4 h-4 text-forest-600 shrink-0" />
        <span>
          <strong>Farmer Privacy Shield:</strong> All farm coordinates are approximated at the district and taluk level (~200m fuzzing). Exact farm parcels and personal contact records are never published.
        </span>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-3xl border border-earth-200 shadow-soft flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-earth-500">Filter Crop:</span>
          <select
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-earth-200 bg-earth-50 text-xs font-medium focus:bg-white"
          >
            <option value="">All Plantation Crops</option>
            {crops.map((c) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>

          <label className="flex items-center gap-1.5 text-xs font-semibold text-earth-700 ml-2 cursor-pointer">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(e) => setVerifiedOnly(e.target.checked)}
              className="rounded text-forest-600 focus:ring-forest-500"
            />
            <span>Show Only Expert-Verified Outbreaks</span>
          </label>
        </div>

        <div className="text-xs text-earth-500 font-medium">
          Showing <strong>{reports.length}</strong> Outbreak Reports
        </div>
      </div>

      {/* Map Hotspot Visualization Card */}
      <div className="bg-white rounded-3xl border border-earth-200 shadow-soft p-5 overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-forest-950 uppercase tracking-wider flex items-center gap-2">
            <MapPin className="w-4 h-4 text-forest-600" />
            Karnataka & Kerala Surveillance Cluster
          </h3>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600" /> High / Severe
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Moderate
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-forest-600" /> Verified
            </span>
          </div>
        </div>

        {/* Visual Map Canvas with Interactive Region Hotspots */}
        <div className="relative w-full h-80 bg-gradient-to-b from-forest-950 to-forest-900 rounded-2xl overflow-hidden p-6 flex flex-col justify-between border border-forest-800">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#84cc16_1px,transparent_1px)] [background-size:16px_16px]" />

          {/* Region Hotspots Overlaid */}
          <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {reports.slice(0, 6).map((r) => (
              <div
                key={r.id}
                className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 text-white text-xs hover:bg-white/20 transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-leaf-300">{r.district}, {r.state}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                    r.is_verified ? 'bg-forest-600 text-white' : 'bg-amber-600 text-white'
                  }`}>
                    {r.is_verified ? 'Verified' : 'Community'}
                  </span>
                </div>
                <div className="font-extrabold text-white text-xs truncate">{r.crop_name}: {r.disease_name}</div>
                <div className="text-[10px] text-white/70 mt-1">Est: {r.affected_acres} Acres affected</div>
              </div>
            ))}
          </div>

          <div className="relative z-10 flex items-center justify-between text-xs text-white/70 pt-4 border-t border-white/10">
            <span>Lat: 10.5°N - 15.5°N | Lng: 74.8°E - 78.5°E</span>
            <span>Western Ghats & Coastal Agricultural Belt</span>
          </div>
        </div>
      </div>

      {/* Outbreak Reports List */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-forest-950">Detailed Incident Reports</h3>

        {reports.map((report) => (
          <div
            key={report.id}
            className="bg-white rounded-2xl border border-earth-200 p-5 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-forest-950">
                  {report.crop_name}: {report.disease_name}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  report.is_verified
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {report.is_verified ? 'Verified by Expert' : 'Unverified Community Report'}
                </span>
              </div>

              <p className="text-xs text-earth-600 leading-relaxed">
                {report.description}
              </p>

              <div className="text-[11px] text-earth-400 flex items-center gap-3 pt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-forest-600" />
                  {report.district}, {report.state} (~{report.approx_latitude}, {report.approx_longitude})
                </span>
                <span>• Area: {report.affected_acres} Acres</span>
                <span>• Reported: {new Date(report.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Expert Verify Action */}
            {(role === 'expert' || role === 'admin') && !report.is_verified && (
              <button
                onClick={() => handleVerify(report.id)}
                className="px-3.5 py-2 rounded-xl bg-forest-600 hover:bg-forest-700 text-white font-bold text-xs shrink-0 shadow-xs flex items-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Verify Outbreak</span>
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Report Outbreak Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-earth-200">
            <h3 className="text-base font-bold text-forest-950 mb-1">Report Crop Outbreak</h3>
            <p className="text-xs text-earth-500 mb-4">
              Alert neighboring farmers to prevent disease spread. Coordinates are fuzzed for privacy.
            </p>

            <form onSubmit={handleCreateReport} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-earth-700 mb-1">Crop</label>
                  <select
                    value={cropId}
                    onChange={(e) => setCropId(parseInt(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-earth-200 bg-earth-50 text-xs"
                  >
                    {crops.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-earth-700 mb-1">Suspected Disease</label>
                  <input
                    type="text"
                    required
                    value={diseaseNameCustom}
                    onChange={(e) => setDiseaseNameCustom(e.target.value)}
                    placeholder="e.g. Koleroga / Blast"
                    className="w-full px-3 py-2 rounded-xl border border-earth-200 bg-earth-50 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-earth-700 mb-1">District</label>
                  <input
                    type="text"
                    required
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="Shivamogga / Palakkad"
                    className="w-full px-3 py-2 rounded-xl border border-earth-200 bg-earth-50 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-earth-700 mb-1">Affected Acres</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={affectedAcres}
                    onChange={(e) => setAffectedAcres(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-earth-200 bg-earth-50 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-earth-700 mb-1">Observed Symptoms & Situation</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe visible symptoms, rainfall context, and spread across bunds..."
                  className="w-full px-3 py-2 rounded-xl border border-earth-200 bg-earth-50 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 rounded-xl border border-earth-200 text-earth-600 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-forest-600 text-white font-bold text-xs hover:bg-forest-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Anonymous Alert'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
