import React, { useState, useEffect } from 'react';
import { analyticsApi, scansApi, consultationApi, resolveImageUrl } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Scan,
  MessageSquare,
  MapPin,
  Check,
  X,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export const ExpertDashboard: React.FC = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState<any>(null);
  const [pendingScans, setPendingScans] = useState<any[]>([]);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Verification modal state
  const [selectedScan, setSelectedScan] = useState<any>(null);
  const [verdict, setVerdict] = useState<'verified' | 'corrected' | 'refuted'>('verified');
  const [expertNotes, setExpertNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchExpertData();
  }, []);

  const fetchExpertData = async () => {
    setLoading(true);
    try {
      const [sumRes, scansRes, consultRes] = await Promise.all([
        analyticsApi.getExpertSummary(),
        scansApi.getHistory(30),
        consultationApi.getAll('pending')
      ]);
      setSummary(sumRes);
      // Filter unverified scans
      setPendingScans(scansRes.filter(s => !s.expert_verdict));
      setConsultations(consultRes);
    } catch (err) {
      console.error('Error fetching expert console data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedScan) return;
    setIsSubmitting(true);
    try {
      await scansApi.verifyScan(selectedScan.id, {
        verdict,
        notes: expertNotes
      });
      setSelectedScan(null);
      setExpertNotes('');
      await fetchExpertData();
    } catch (err) {
      alert('Verification submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Expert Header */}
      <div className="bg-gradient-to-r from-blue-900 via-forest-900 to-forest-950 p-6 sm:p-8 rounded-3xl text-white shadow-elevated">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-800/60 text-blue-200 text-xs font-semibold mb-2 border border-blue-600/50">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Certified Agricultural Scientist Console</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">{user?.full_name || 'Dr. Radhika Menon'}</h1>
            <p className="text-xs text-blue-100 mt-1">
              {user?.specialization || 'Plant Pathology'} • {user?.institution || 'Kerala Agricultural University (KAU)'}
            </p>
          </div>

          <div className="flex gap-2">
            <span className="text-xs bg-white/10 px-3 py-1.5 rounded-xl border border-white/20">
              Station ID: <strong>KAU-PATH-402</strong>
            </span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-earth-200 shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-earth-500 font-semibold uppercase">Pending Scans</span>
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-600">{pendingScans.length}</div>
          <p className="text-[11px] text-earth-400 mt-1">Requiring scientific audit</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-earth-200 shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-earth-500 font-semibold uppercase">Verified Records</span>
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-2xl font-black text-green-700">{summary?.verified_scans || 0}</div>
          <p className="text-[11px] text-earth-400 mt-1">Model diagnoses validated</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-earth-200 shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-earth-500 font-semibold uppercase">Farmer Questions</span>
            <MessageSquare className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-700">{consultations.length}</div>
          <p className="text-[11px] text-earth-400 mt-1">Pending written responses</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-earth-200 shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-earth-500 font-semibold uppercase">Active Outbreaks</span>
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div className="text-2xl font-black text-red-700">{summary?.total_outbreaks || 6}</div>
          <p className="text-[11px] text-earth-400 mt-1">Surveillance hotspots</p>
        </div>
      </div>

      {/* Pending Scan Verification Queue */}
      <div className="bg-white p-6 rounded-3xl border border-earth-200 shadow-soft space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-earth-100">
          <div>
            <h3 className="font-bold text-base text-forest-950 flex items-center gap-2">
              <Scan className="w-5 h-5 text-forest-600" />
              AI Diagnosis Review Queue
            </h3>
            <p className="text-xs text-earth-500">
              Audit crop specimens, confirm neural model predictions, or correct misdiagnosed conditions.
            </p>
          </div>
          <span className="text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-full">
            {pendingScans.length} Unreviewed
          </span>
        </div>

        {pendingScans.length === 0 ? (
          <div className="text-center py-10 text-earth-400 text-xs">
            Queue is clear. All farmer diagnostic scans have been audited!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingScans.map((scan) => (
              <div
                key={scan.id}
                className="p-4 rounded-2xl border border-earth-200 bg-earth-50/50 hover:bg-forest-50/20 transition-all flex flex-col justify-between"
              >
                <div>
                  <img
                    src={resolveImageUrl(scan.image_url)}
                    alt={scan.disease_name}
                    className="w-full h-44 object-cover rounded-xl border border-earth-200 mb-3"
                  />
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-forest-900">{scan.crop_name}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-forest-100 text-forest-800">
                      AI: {scan.confidence_pct}%
                    </span>
                  </div>
                  <h4 className="font-extrabold text-sm text-earth-900">{scan.disease_name}</h4>
                  <p className="text-[11px] text-earth-500 mt-1">
                    Date: {new Date(scan.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-earth-200/80">
                  <button
                    onClick={() => {
                      setSelectedScan(scan);
                      setExpertNotes(`Confirmed ${scan.disease_name}. Advised farmer to follow ICAR recommended fungicide schedule.`);
                    }}
                    className="w-full py-2 rounded-xl bg-forest-600 hover:bg-forest-700 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Review & Verify</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedScan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-earth-200">
            <h3 className="text-base font-bold text-forest-950 mb-1">Expert Diagnosis Verification</h3>
            <p className="text-xs text-earth-500 mb-4">
              Specimen: <strong>{selectedScan.crop_name}</strong> • AI Predicted: <strong>{selectedScan.disease_name}</strong> ({selectedScan.confidence_pct}%)
            </p>

            <form onSubmit={handleVerifyScan} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-earth-700 mb-1">Verification Verdict</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setVerdict('verified')}
                    className={`py-2 text-xs font-bold rounded-xl border text-center ${
                      verdict === 'verified' ? 'bg-green-600 text-white border-green-700' : 'bg-earth-50 text-earth-700'
                    }`}
                  >
                    Confirm AI
                  </button>
                  <button
                    type="button"
                    onClick={() => setVerdict('corrected')}
                    className={`py-2 text-xs font-bold rounded-xl border text-center ${
                      verdict === 'corrected' ? 'bg-blue-600 text-white border-blue-700' : 'bg-earth-50 text-earth-700'
                    }`}
                  >
                    Correct AI
                  </button>
                  <button
                    type="button"
                    onClick={() => setVerdict('refuted')}
                    className={`py-2 text-xs font-bold rounded-xl border text-center ${
                      verdict === 'refuted' ? 'bg-red-600 text-white border-red-700' : 'bg-earth-50 text-earth-700'
                    }`}
                  >
                    Refute
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-earth-700 mb-1">Scientific Agronomic Notes</label>
                <textarea
                  rows={4}
                  required
                  value={expertNotes}
                  onChange={(e) => setExpertNotes(e.target.value)}
                  className="w-full p-3 rounded-xl border border-earth-200 bg-earth-50 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedScan(null)}
                  className="px-4 py-2 rounded-xl border border-earth-200 text-earth-600 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-forest-600 hover:bg-forest-700 text-white font-bold text-xs"
                >
                  {isSubmitting ? 'Recording...' : 'Submit Official Verification'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
