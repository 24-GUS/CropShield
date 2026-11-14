import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { scansApi, cropsApi } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import { History, Search, ArrowRight, ShieldCheck, CheckCircle2, AlertTriangle, Calendar } from 'lucide-react';
import { ScanHistoryItem, Crop } from '../types';

export const ScanHistoryPage: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [scans, setScans] = useState<ScanHistoryItem[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [sRes, cRes] = await Promise.all([
          scansApi.getHistory(50),
          cropsApi.getAllCrops()
        ]);
        setScans(sRes);
        setCrops(cRes);
      } catch (err) {
        console.error('Error fetching scan history:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredScans = scans.filter((s) => {
    if (selectedCrop && s.crop_name.toLowerCase() !== selectedCrop.toLowerCase()) return false;
    if (selectedStatus === 'healthy' && !s.is_healthy) return false;
    if (selectedStatus === 'diseased' && s.is_healthy) return false;
    return true;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="pb-4 border-b border-earth-200">
        <h1 className="text-2xl font-black text-forest-950 flex items-center gap-2.5">
          <History className="w-7 h-7 text-forest-600" />
          {t('navHistory')}
        </h1>
        <p className="text-xs text-earth-500 mt-1 max-w-2xl leading-relaxed">
          Audit trail of all previous plant disease diagnoses, AI confidence ratings, and expert verifications.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-earth-200 shadow-soft flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-semibold text-earth-500">Filter By:</span>
          <select
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-earth-200 bg-earth-50 text-xs font-medium focus:bg-white"
          >
            <option value="">All Crops</option>
            {crops.map((c) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-earth-200 bg-earth-50 text-xs font-medium focus:bg-white"
          >
            <option value="">All Health Conditions</option>
            <option value="healthy">Healthy Only</option>
            <option value="diseased">Diseased Only</option>
          </select>
        </div>

        <div className="text-xs text-earth-500 font-medium">
          Total Records: <strong>{filteredScans.length}</strong>
        </div>
      </div>

      {/* Scans List */}
      {loading ? (
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-3 border-forest-600 border-t-transparent mx-auto mb-2" />
          <p className="text-xs text-earth-500">Loading scan history...</p>
        </div>
      ) : filteredScans.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-3xl border border-earth-200 text-earth-500 text-xs">
          No matching diagnostic scans found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredScans.map((scan) => (
            <div
              key={scan.id}
              onClick={() => navigate(`/diagnosis/${scan.id}`)}
              className="bg-white rounded-3xl border border-earth-200 hover:border-forest-300 p-5 shadow-soft hover:shadow-elevated transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div className="flex items-start gap-4">
                <img
                  src={scan.image_url}
                  alt={scan.disease_name}
                  className="w-20 h-20 rounded-2xl object-cover border border-earth-200 shrink-0 group-hover:scale-105 transition-transform"
                  onError={(e: any) => {
                    e.target.src = '/demo_samples/paddy_blast.jpg';
                  }}
                />

                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-forest-700 uppercase tracking-wider">
                      {scan.crop_name}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      scan.is_healthy
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : 'bg-orange-50 text-orange-700 border-orange-200'
                    }`}>
                      {scan.disease_name}
                    </span>
                  </div>

                  <div className="text-xs text-earth-600 font-medium">
                    Confidence: <strong className="text-forest-900">{scan.confidence_pct}%</strong>
                  </div>

                  <div className="text-[11px] text-earth-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(scan.created_at).toLocaleString()}
                  </div>

                  {scan.expert_verdict && (
                    <div className="pt-1 flex items-center gap-1 text-[11px] text-blue-700 font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                      <span>Verified by Agricultural Expert</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-earth-100 flex items-center justify-between text-xs text-forest-700 font-bold group-hover:text-forest-900">
                <span>View Full Treatment Protocol</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
