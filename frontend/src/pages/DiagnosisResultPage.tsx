import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { scansApi, consultationApi, outbreakApi, resolveImageUrl } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  HelpCircle,
  Volume2,
  Calendar,
  ShieldCheck,
  Stethoscope,
  Sparkles,
  ArrowLeft,
  Share2,
  Star,
  Check,
  UserCheck,
  MapPin,
  ExternalLink
} from 'lucide-react';

export const DiagnosisResultPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const passedPreview = (location.state as any)?.previewUrl;
  const { t, language, speak, isSpeaking, stopSpeaking } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [scan, setScan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Feedback rating state
  const [rating, setRating] = useState<number | null>(null);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Expert verification modal / prompt
  const [showExpertModal, setShowExpertModal] = useState(false);
  const [expertSubject, setExpertSubject] = useState('');
  const [expertQuestion, setExpertQuestion] = useState('');
  const [expertSubmitted, setExpertSubmitted] = useState(false);

  useEffect(() => {
    const fetchScanDetail = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await scansApi.getDetail(parseInt(id, 10));
        setScan(res);
        setRating(res.farmer_feedback || null);
        setExpertSubject(`Verification request for ${res.crop_name}: ${res.disease_name}`);
        setExpertQuestion(`Dear Agricultural Officer, please review the AI diagnosis (${res.disease_name}) for my crop in ${user?.district || 'Shivamogga'}.`);
      } catch (err: any) {
        setError(err.message || 'Failed to load diagnosis record');
      } finally {
        setLoading(false);
      }
    };
    fetchScanDetail();
  }, [id, user]);

  const handleRating = async (stars: number) => {
    if (!id) return;
    try {
      await scansApi.submitFeedback(parseInt(id, 10), stars);
      setRating(stars);
      setFeedbackSubmitted(true);
    } catch {
      alert('Failed to record feedback');
    }
  };

  const handleSubmitExpertReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scan) return;
    try {
      await consultationApi.create({
        crop_name: scan.crop_name,
        subject: expertSubject,
        question: expertQuestion,
        scan_id: scan.id
      });
      setExpertSubmitted(true);
      setShowExpertModal(false);
    } catch {
      alert('Failed to submit consultation request');
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-3 border-forest-600 border-t-transparent mx-auto mb-3" />
        <p className="text-sm font-semibold text-earth-700">Loading Calibrated Diagnosis Report...</p>
      </div>
    );
  }

  if (error || !scan) {
    return (
      <div className="py-16 text-center max-w-md mx-auto">
        <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-earth-900">Diagnosis Record Not Found</h2>
        <p className="text-xs text-earth-500 mt-1">{error || 'Invalid scan reference ID'}</p>
        <Link to="/scanner" className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-forest-600 text-white text-xs font-semibold rounded-xl">
          <ArrowLeft className="w-4 h-4" /> Return to AI Scanner
        </Link>
      </div>
    );
  }

  // Handle local translation for disease if present
  const localizedInfo = scan.translations?.[language] || {};
  const displayName = localizedInfo.name || scan.disease_name;
  const displaySymptoms = localizedInfo.symptoms || scan.symptoms;
  const displayTreatment = localizedInfo.treatment || scan.recommended_treatment;

  const isHealthy = scan.is_healthy;
  const isUncertain = scan.status === 'uncertain';

  return (
    <div className="space-y-6 pb-20">
      {/* Top Breadcrumb & Action bar */}
      <div className="flex items-center justify-between pb-3 border-b border-earth-200">
        <Link to="/scanner" className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest-700 hover:text-forest-900">
          <ArrowLeft className="w-4 h-4" />
          <span>New AI Scan</span>
        </Link>

        <div className="flex items-center gap-2">
          {/* Audio Speech Button */}
          <button
            onClick={() => {
              if (isSpeaking) {
                stopSpeaking();
              } else {
                speak(`${displayName}. ${displaySymptoms}. ${displayTreatment}`);
              }
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              isSpeaking
                ? 'bg-amber-100 border-amber-300 text-amber-900 ring-2 ring-amber-400 shadow-sm'
                : 'border-forest-200 bg-forest-50 hover:bg-forest-100 text-forest-800'
            }`}
            title={isSpeaking ? "Click to stop voice playback" : "Listen to diagnosis, symptoms, and treatment instructions aloud"}
          >
            <Volume2 className={`w-4 h-4 ${isSpeaking ? 'text-amber-700 animate-pulse' : 'text-forest-600'}`} />
            <span>{isSpeaking ? 'Stop Audio' : 'Listen in Audio'}</span>
          </button>
        </div>
      </div>

      {/* Main Diagnosis Card */}
      <div className="bg-white rounded-3xl border border-earth-200 shadow-soft overflow-hidden">
        {/* Status Header Banner */}
        <div className={`p-6 sm:p-8 text-white ${
          isUncertain
            ? 'bg-gradient-to-r from-amber-600 to-amber-700'
            : isHealthy
            ? 'bg-gradient-to-r from-forest-700 to-leaf-600'
            : 'bg-gradient-to-r from-emerald-800 via-forest-800 to-earth-900'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs bg-white/20 backdrop-blur-xs font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider text-white">
                  {scan.crop_name} {scan.crop_scientific_name ? `(${scan.crop_scientific_name})` : ''}
                </span>
                <span className="text-xs text-white/80">
                  {new Date(scan.created_at).toLocaleString()}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                {displayName}
              </h1>
              {scan.disease_scientific_name && (
                <p className="text-xs text-leaf-200 italic mt-0.5">{scan.disease_scientific_name}</p>
              )}
              {scan.pathology_stage && (
                <div className="flex flex-wrap items-center gap-2 mt-2.5">
                  <span className="text-[11px] font-bold bg-white/20 text-white px-2.5 py-1 rounded-lg backdrop-blur-xs flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-leaf-300" />
                    {scan.pathology_stage}
                  </span>
                  {scan.treatment_urgency && (
                    <span className="text-[11px] font-bold bg-amber-400/20 text-amber-200 border border-amber-300/30 px-2.5 py-1 rounded-lg backdrop-blur-xs flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-300" />
                      {scan.treatment_urgency}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Confidence & Severity Pill */}
            <div className="flex items-center gap-3">
              <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 text-center min-w-[110px]">
                <div className="text-xs text-white/80 uppercase font-semibold text-[10px]">Confidence</div>
                <div className="text-2xl font-black text-leaf-300">{scan.confidence_pct}%</div>
                <div className="text-[10px] text-white/90 font-medium">{scan.confidence_level || 'Calibrated'}</div>
              </div>

              <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 text-center min-w-[110px]">
                <div className="text-xs text-white/80 uppercase font-semibold text-[10px]">Severity</div>
                <div className="text-2xl font-black text-white">{scan.severity}</div>
                <div className="text-[10px] text-white/90 font-medium">Field Rating</div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Body Grid */}
        <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Specimen Photograph */}
          <div>
            <div className="rounded-2xl overflow-hidden border border-earth-200 shadow-sm bg-earth-900">
              <img
                src={passedPreview || resolveImageUrl(scan.image_url)}
                alt={scan.disease_name}
                className="w-full h-72 object-contain mx-auto"
                onError={(e: any) => {
                  // If local preview expired or failed, try resolving the backend image URL
                  if (scan?.image_url && !e.target.dataset.triedBackend) {
                    e.target.dataset.triedBackend = 'true';
                    e.target.src = resolveImageUrl(scan.image_url);
                  }
                }}
              />
            </div>
            <div className="mt-2 text-center text-[11px] text-earth-500">
              Specimen captured and evaluated by CropShield neural vision engine
            </div>

            {/* Expert Verification Badge or Action */}
            <div className="mt-4 p-4 rounded-2xl bg-earth-50 border border-earth-200">
              {scan.expert_verdict ? (
                <div className="text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-forest-800 mb-1">
                    <ShieldCheck className="w-4 h-4 text-forest-600" />
                    <span>Verified by Agricultural Expert</span>
                  </div>
                  <p className="text-earth-600 italic">"{scan.expert_notes}"</p>
                  <p className="text-[10px] text-earth-400 mt-1 font-semibold">— {scan.expert_name || 'Dr. Radhika Menon, KAU'}</p>
                </div>
              ) : expertSubmitted ? (
                <div className="text-xs text-forest-800 font-semibold flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-forest-600" />
                  Review request submitted to Agricultural Officer.
                </div>
              ) : (
                <div>
                  <p className="text-xs text-earth-700 font-semibold mb-2">Want a second opinion?</p>
                  <button
                    onClick={() => setShowExpertModal(true)}
                    className="w-full py-2 px-3 rounded-xl bg-forest-600 hover:bg-forest-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                  >
                    <UserCheck className="w-4 h-4" />
                    {t('expertVerifyPrompt')}
                  </button>
                </div>
              )}
            </div>

            {/* Farmer Feedback Rating */}
            <div className="mt-4 p-4 rounded-2xl bg-earth-50 border border-earth-200 text-center">
              <p className="text-xs font-semibold text-earth-700 mb-2">Was this diagnosis accurate & helpful?</p>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRating(star)}
                    className={`p-1.5 rounded-lg transition-transform hover:scale-125 ${
                      rating && rating >= star ? 'text-amber-500' : 'text-earth-300 hover:text-amber-400'
                    }`}
                  >
                    <Star className="w-5 h-5 fill-current" />
                  </button>
                ))}
              </div>
              {feedbackSubmitted && (
                <p className="text-[11px] text-forest-700 font-semibold mt-2">
                  Thank you! Your feedback helps calibrate the model.
                </p>
              )}
            </div>
          </div>

          {/* Diagnostic Details & Treatment Protocol */}
          <div className="lg:col-span-2 space-y-6">
            {/* Scientific Uncertainty Notice if applicable */}
            {isUncertain && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
                <span className="font-bold flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-amber-600" />
                  Uncertainty Guardrail Activated:
                </span>
                <p className="leading-relaxed">
                  Unable to confidently identify the disease with high certainty. The symptoms are ambiguous or multiple leaf conditions overlap. Please upload a clearer photograph or consult an agricultural expert.
                </p>
              </div>
            )}

            {/* Visible Symptoms */}
            <div>
              <h3 className="text-sm font-bold text-forest-950 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-forest-600" />
                {t('symptoms')}
              </h3>
              <p className="text-xs sm:text-sm text-earth-700 leading-relaxed bg-earth-50/70 p-4 rounded-2xl border border-earth-100">
                {displaySymptoms}
              </p>
            </div>

            {/* Common Causes & Environmental Conditions */}
            {scan.common_causes && (
              <div>
                <h3 className="text-sm font-bold text-forest-950 uppercase tracking-wider mb-2">
                  {t('causes')}
                </h3>
                <p className="text-xs sm:text-sm text-earth-700 leading-relaxed bg-earth-50/70 p-4 rounded-2xl border border-earth-100">
                  {scan.common_causes}
                </p>
              </div>
            )}

            {/* Recommended Immediate Actions & Treatment */}
            <div>
              <h3 className="text-sm font-bold text-forest-950 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-leaf-500" />
                {t('immediateAction')}
              </h3>
              <div className="p-4 rounded-2xl bg-forest-50/80 border border-forest-200 text-xs sm:text-sm text-forest-950 leading-relaxed font-medium">
                {displayTreatment}
              </div>
            </div>

            {/* IPM & Long-Term Prevention */}
            {scan.ipm_measures && (
              <div>
                <h3 className="text-sm font-bold text-forest-950 uppercase tracking-wider mb-2">
                  {t('ipmPrevention')}
                </h3>
                <p className="text-xs sm:text-sm text-earth-700 leading-relaxed bg-earth-50/70 p-4 rounded-2xl border border-earth-100">
                  {scan.ipm_measures}
                </p>
              </div>
            )}

            {/* Approved Pesticide Safety & Dosage */}
            {scan.safety_precautions && (
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 text-xs">
                <h4 className="font-bold text-amber-900 mb-1 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  {t('safetyPrecautions')}
                </h4>
                <p className="text-amber-800 leading-relaxed font-normal">
                  {scan.safety_precautions}
                </p>
                <p className="text-[10px] text-amber-700 mt-2 font-semibold">
                  Source: {scan.expert_references || 'ICAR & University of Agricultural Sciences Package of Practices'}
                </p>
              </div>
            )}

            {/* Report to Outbreak Map CTA */}
            {!isHealthy && (
              <div className="p-4 rounded-2xl bg-earth-50 border border-earth-200 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-earth-900">Spreading across neighboring farms?</h4>
                  <p className="text-[11px] text-earth-500">Alert local farmers anonymously on the community outbreak map.</p>
                </div>
                <Link
                  to="/map"
                  className="px-3.5 py-2 rounded-xl bg-white border border-earth-300 hover:border-forest-500 text-forest-800 font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5 text-forest-600" />
                  {t('shareOutbreakPrompt')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Expert Consultation Request Modal */}
      {showExpertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-earth-200">
            <h3 className="text-base font-bold text-forest-950 mb-1">Request Expert Verification</h3>
            <p className="text-xs text-earth-500 mb-4">
              Your photograph and diagnosis will be routed to certified agricultural extension scientists.
            </p>

            <form onSubmit={handleSubmitExpertReview} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-earth-700 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={expertSubject}
                  onChange={(e) => setExpertSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-earth-200 bg-earth-50 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-earth-700 mb-1">Your Question / Notes</label>
                <textarea
                  rows={4}
                  required
                  value={expertQuestion}
                  onChange={(e) => setExpertQuestion(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-earth-200 bg-earth-50 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowExpertModal(false)}
                  className="px-4 py-2 rounded-xl border border-earth-200 text-earth-600 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-forest-600 text-white font-bold text-xs shadow-xs hover:bg-forest-700"
                >
                  Submit for Verification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
