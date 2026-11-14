import React, { useState, useEffect } from 'react';
import { consultationApi, cropsApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { MessageSquare, Plus, Send, CheckCircle2, Star, User, ShieldCheck, Clock, ArrowRight } from 'lucide-react';
import { Consultation, Crop } from '../types';

export const ConsultationPage: React.FC = () => {
  const { user, role } = useAuth();
  const { t } = useLanguage();

  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);

  // New consultation state
  const [showAskModal, setShowAskModal] = useState(false);
  const [selectedCropName, setSelectedCropName] = useState('Paddy');
  const [subject, setSubject] = useState('');
  const [question, setQuestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Expert answer state
  const [answeringId, setAnsweringId] = useState<number | null>(null);
  const [answerText, setAnswerText] = useState('');

  useEffect(() => {
    fetchConsultations();
    fetchCrops();
  }, []);

  const fetchConsultations = async () => {
    setLoading(true);
    try {
      const data = await consultationApi.getAll();
      setConsultations(data);
    } catch (err) {
      console.error('Error fetching consultations:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCrops = async () => {
    try {
      const data = await cropsApi.getAllCrops();
      setCrops(data);
    } catch (err) {
      console.error('Error fetching crops:', err);
    }
  };

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await consultationApi.create({
        crop_name: selectedCropName,
        subject,
        question
      });
      setShowAskModal(false);
      setSubject('');
      setQuestion('');
      await fetchConsultations();
    } catch (err) {
      alert('Failed to submit question');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAnswerSubmit = async (consultId: number) => {
    if (!answerText.trim()) return;
    try {
      await consultationApi.answer(consultId, answerText);
      setAnsweringId(null);
      setAnswerText('');
      await fetchConsultations();
    } catch (err) {
      alert('Failed to submit expert answer');
    }
  };

  const handleRate = async (consultId: number, rating: number) => {
    try {
      await consultationApi.rate(consultId, rating);
      await fetchConsultations();
    } catch {
      alert('Failed to record rating');
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-earth-200">
        <div>
          <h1 className="text-2xl font-black text-forest-950 flex items-center gap-2.5">
            <MessageSquare className="w-7 h-7 text-forest-600" />
            {t('navConsult')}
          </h1>
          <p className="text-xs text-earth-500 mt-1 max-w-2xl leading-relaxed">
            Direct communication channel with agricultural scientists from UAS Bangalore, Dharwad, and Kerala Agricultural University.
          </p>
        </div>

        {role === 'farmer' && (
          <button
            onClick={() => setShowAskModal(true)}
            className="px-4 py-2.5 rounded-xl bg-forest-600 hover:bg-forest-700 text-white font-bold text-xs shadow-md shadow-forest-600/20 transition-all flex items-center gap-2 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Ask Agricultural Scientist</span>
          </button>
        )}
      </div>

      {/* Consultations List */}
      {loading ? (
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-3 border-forest-600 border-t-transparent mx-auto mb-2" />
          <p className="text-xs text-earth-500">Loading consultation threads...</p>
        </div>
      ) : consultations.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-3xl border border-earth-200 text-earth-500 text-xs">
          No questions submitted yet. Click "Ask Agricultural Scientist" to start a consultation.
        </div>
      ) : (
        <div className="space-y-5">
          {consultations.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl border border-earth-200 p-6 shadow-soft space-y-4"
            >
              {/* Question Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-earth-100">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold bg-forest-50 text-forest-800 border border-forest-200 px-2 py-0.5 rounded-md">
                      {item.crop_name}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      item.status === 'answered'
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {item.status === 'answered' ? 'Answered by Scientist' : 'Pending Expert Review'}
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-forest-950">{item.subject}</h3>
                  <div className="text-[11px] text-earth-400 mt-0.5">
                    Asked by <strong>{item.farmer_name || 'Farmer'}</strong> • {new Date(item.created_at).toLocaleDateString()}
                  </div>
                </div>

                {/* Farmer Rating Stars */}
                {item.status === 'answered' && role === 'farmer' && (
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-earth-400 mr-1">Rate advice:</span>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleRate(item.id, star)}
                        className={`p-1 transition-transform hover:scale-125 ${
                          item.farmer_rating && item.farmer_rating >= star ? 'text-amber-500' : 'text-earth-300'
                        }`}
                      >
                        <Star className="w-4 h-4 fill-current" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Farmer's Question Text */}
              <div className="p-4 rounded-2xl bg-earth-50 border border-earth-100 text-xs sm:text-sm text-earth-800 leading-relaxed">
                "{item.question}"
              </div>

              {/* Expert Answer Section */}
              {item.answer ? (
                <div className="p-4 rounded-2xl bg-forest-50/80 border border-forest-200 text-xs sm:text-sm text-forest-950 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-forest-900 flex items-center gap-1.5 text-xs">
                      <ShieldCheck className="w-4 h-4 text-forest-600" />
                      Verified Response — {item.expert_name || 'Dr. Radhika Menon, KAU'}
                    </span>
                    <span className="text-[10px] text-forest-700 font-medium">
                      Updated: {new Date(item.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="leading-relaxed whitespace-pre-line font-medium text-forest-950">
                    {item.answer}
                  </p>
                </div>
              ) : (role === 'expert' || role === 'admin') ? (
                /* Expert Answer Formulation Box */
                answeringId === item.id ? (
                  <div className="space-y-3 pt-2">
                    <label className="block text-xs font-bold text-forest-900">Formulate Expert Response:</label>
                    <textarea
                      rows={4}
                      value={answerText}
                      onChange={(e) => setAnswerText(e.target.value)}
                      placeholder="Specify diagnosis confirmation, recommended cultural drainage/pruning, approved fungicide/bactericide and exact dilution per liter..."
                      className="w-full p-3 rounded-2xl border border-forest-300 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-forest-500"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setAnsweringId(null)}
                        className="px-3.5 py-1.5 rounded-xl border border-earth-200 text-earth-600 text-xs"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAnswerSubmit(item.id)}
                        className="px-4 py-1.5 rounded-xl bg-forest-600 hover:bg-forest-700 text-white font-bold text-xs"
                      >
                        Submit Verified Answer
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setAnsweringId(item.id);
                      setAnswerText('');
                    }}
                    className="px-4 py-2 rounded-xl bg-forest-600 hover:bg-forest-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Answer Farmer Question</span>
                  </button>
                )
              ) : (
                <div className="text-xs text-earth-400 italic flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  Your inquiry is queued for review by the regional agricultural research station.
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Ask Question Modal */}
      {showAskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-earth-200">
            <h3 className="text-base font-bold text-forest-950 mb-1">Ask Agricultural Scientist</h3>
            <p className="text-xs text-earth-500 mb-4">
              Get personalized pathology and agronomy advice grounded in ICAR and university guidelines.
            </p>

            <form onSubmit={handleAskQuestion} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-earth-700 mb-1">Crop</label>
                <select
                  value={selectedCropName}
                  onChange={(e) => setSelectedCropName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-earth-200 bg-earth-50 text-xs"
                >
                  {crops.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-earth-700 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Yellowing leaf tips in 40-day paddy crop"
                  className="w-full px-3 py-2 rounded-xl border border-earth-200 bg-earth-50 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-earth-700 mb-1">Detailed Question</label>
                <textarea
                  rows={4}
                  required
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Describe soil moisture, fertilizer applications, and visible leaf spots..."
                  className="w-full px-3 py-2 rounded-xl border border-earth-200 bg-earth-50 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAskModal(false)}
                  className="px-4 py-2 rounded-xl border border-earth-200 text-earth-600 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-forest-600 text-white font-bold text-xs hover:bg-forest-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Send to Scientist'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
