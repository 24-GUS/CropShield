import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, Eye, Database, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Navigation & Header */}
      <div>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest-700 hover:text-forest-900 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-forest-100 text-forest-800 flex items-center justify-center shrink-0">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-forest-950">
              Farmer Privacy & Data Protection Policy
            </h1>
            <p className="text-xs text-earth-500 mt-1">
              Compliant with the Digital Personal Data Protection (DPDP) Act 2023 & Global Privacy Principles
            </p>
          </div>
        </div>
      </div>

      {/* Privacy Pledge */}
      <div className="p-5 rounded-3xl bg-forest-50 border border-forest-200 text-xs text-forest-950 space-y-2">
        <div className="flex items-center gap-2 font-bold text-forest-900 text-sm">
          <ShieldCheck className="w-5 h-5 text-forest-600 shrink-0" />
          <span>Our Farmer Data Commitment</span>
        </div>
        <p className="leading-relaxed">
          At CropShield AI, we treat agricultural data as the personal intellectual asset of the farmer. We do <strong>not</strong> sell, monetize, or disclose your landholding, yield patterns, or personal contacts to third-party commercial advertisers or commodity trading desks.
        </p>
      </div>

      {/* Main Privacy Sections */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-earth-200 shadow-soft space-y-6 text-xs sm:text-sm text-earth-800 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-forest-950 flex items-center gap-2">
            1. Data We Collect
          </h2>
          <p>
            We collect only the minimum data necessary to deliver accurate crop diagnoses and hyperlocal risk alerts:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-earth-700">
            <li><strong>Farmer Account Details:</strong> Name, phone number or email address, preferred regional language (Kannada, Malayalam, Hindi, or English), and general district/state.</li>
            <li><strong>Crop & Plant Imagery:</strong> Photographs of diseased or healthy leaves, stems, or fruits submitted for AI analysis.</li>
            <li><strong>Geographic Coordinates:</strong> Approximate latitude and longitude (fuzzed to a minimum 3 km grid radius) to compute microclimate disease vulnerability via Open-Meteo weather models without exposing exact property boundaries.</li>
            <li><strong>Agricultural Consultation Messages:</strong> Inquiries submitted to university agricultural officers or extension specialists.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-forest-950 flex items-center gap-2">
            2. Purpose of Data Processing
          </h2>
          <p>
            Your information is processed strictly for legitimate agricultural support objectives:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-2xl bg-earth-50 border border-earth-100 text-xs">
              <strong className="block text-forest-900 mb-1">Botanical Feature Extraction</strong>
              Calculating 62 botanical color moments, texture indices, and lesion fractions to detect pathogens.
            </div>
            <div className="p-3 rounded-2xl bg-earth-50 border border-earth-100 text-xs">
              <strong className="block text-forest-900 mb-1">Epidemiological Outbreak Mapping</strong>
              Aggregating anonymized pathogen sightings to warn neighboring farmers of impending regional blights.
            </div>
            <div className="p-3 rounded-2xl bg-earth-50 border border-earth-100 text-xs">
              <strong className="block text-forest-900 mb-1">Hyperlocal Microclimate Warning</strong>
              Evaluating temperature and relative humidity to forecast spore germination risks.
            </div>
            <div className="p-3 rounded-2xl bg-earth-50 border border-earth-100 text-xs">
              <strong className="block text-forest-900 mb-1">Multilingual Speech Synthesis</strong>
              Converting diagnosis reports into audible regional dialects for farmers with limited literacy.
            </div>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-forest-950 flex items-center gap-2">
            3. Data Security & Storage Architecture
          </h2>
          <p>
            We employ enterprise-grade security protocols:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-earth-700">
            <li><strong>Transport Security:</strong> All API communication is encrypted in transit using Transport Layer Security (TLS 1.3 / HTTPS) with strict OWASP security response headers.</li>
            <li><strong>Password Protection:</strong> Passwords are cryptographically hashed using PBKDF2 with SHA-256 and salted. Plaintext passwords are never stored.</li>
            <li><strong>JWT Authentication:</strong> Secure, time-delimited stateless tokens with cryptographic signatures.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-forest-950 flex items-center gap-2">
            4. Farmer Rights under DPDP Act 2023
          </h2>
          <p>
            As a registered user, you retain complete sovereignty over your data:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-earth-700">
            <li><strong>Right to Access:</strong> View all past crop scans, diagnoses, and consultation notes in your Scan History portal.</li>
            <li><strong>Right to Correction:</strong> Update personal contact information, farm size, or crop portfolio at any time via your Profile page.</li>
            <li><strong>Right to Erasure:</strong> Request permanent deletion of uploaded photos and diagnostic history by contacting our Data Protection Officer.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-forest-950 flex items-center gap-2">
            5. Contact Our Data Protection Officer (DPO)
          </h2>
          <p>
            For inquiries, consent withdrawals, or privacy rights execution:
          </p>
          <div className="p-4 rounded-2xl bg-earth-50 border border-earth-200 text-xs text-earth-800">
            <p><strong>Data Protection Desk:</strong> CropShield AI Data Office</p>
            <p><strong>Email:</strong> privacy@cropshield.org</p>
            <p><strong>Official Address:</strong> Agri-Innovation Hub, Bengaluru, Karnataka 560065, India</p>
          </div>
        </section>
      </div>
    </div>
  );
};
