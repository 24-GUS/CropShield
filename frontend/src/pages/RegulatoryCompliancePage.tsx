import React from 'react';
import { Link } from 'react-router-dom';
import { Award, ShieldCheck, AlertTriangle, BookOpen, CheckCircle, ArrowLeft, ExternalLink } from 'lucide-react';

export const RegulatoryCompliancePage: React.FC = () => {
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
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-forest-950">
              Agricultural Regulatory & Pesticide Safety Standards
            </h1>
            <p className="text-xs text-earth-500 mt-1">
              Aligned with ICAR, CIB&RC Statutory Norms, UAS Bangalore, UAS Dharwad & KAU Packages of Practices
            </p>
          </div>
        </div>
      </div>

      {/* Institutional Alignment Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-earth-200 shadow-soft">
          <span className="text-[10px] uppercase font-bold text-forest-600 block mb-1">Standard Authority</span>
          <h3 className="font-bold text-sm text-forest-950">ICAR Norms</h3>
          <p className="text-[11px] text-earth-500 mt-1">
            Indian Council of Agricultural Research standardized diagnostic taxonomy and IPM schedules.
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-earth-200 shadow-soft">
          <span className="text-[10px] uppercase font-bold text-forest-600 block mb-1">Statutory Body</span>
          <h3 className="font-bold text-sm text-forest-950">CIB&RC Registered</h3>
          <p className="text-[11px] text-earth-500 mt-1">
            Central Insecticides Board & Registration Committee approved formulations and label dosages.
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-earth-200 shadow-soft">
          <span className="text-[10px] uppercase font-bold text-forest-600 block mb-1">Regional Universities</span>
          <h3 className="font-bold text-sm text-forest-950">KAU & UAS Practices</h3>
          <p className="text-[11px] text-earth-500 mt-1">
            University of Agricultural Sciences & Kerala Agricultural University verified treatments.
          </p>
        </div>
      </div>

      {/* Toxicity Triangle Guide */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-earth-200 shadow-soft space-y-6">
        <div>
          <h2 className="text-lg font-bold text-forest-950 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            Statutory Toxicity Classification (Insecticides Act, 1968)
          </h2>
          <p className="text-xs text-earth-600 mt-1">
            Every chemical recommendation in CropShield AI corresponds to statutory toxicity categories mandated by the Government of India:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-green-50/70 border border-green-300">
            <div className="flex items-center gap-2 font-bold text-green-950 text-xs mb-1">
              <span className="w-3.5 h-3.5 rounded-full bg-green-600 shrink-0 inline-block" />
              Green Triangle: Caution (Slightly Toxic)
            </div>
            <p className="text-[11px] text-green-900 leading-relaxed">
              Bio-agents (<em>Trichoderma harzianum</em>, <em>Pseudomonas fluorescens</em>, Neem oil / Azadirachtin) and low-toxicity protectants (Bordeaux mixture 1%). Safe for natural pollinators when sprayed at dusk.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-300">
            <div className="flex items-center gap-2 font-bold text-blue-950 text-xs mb-1">
              <span className="w-3.5 h-3.5 rounded-full bg-blue-600 shrink-0 inline-block" />
              Blue Triangle: Danger (Moderately Toxic)
            </div>
            <p className="text-[11px] text-blue-900 leading-relaxed">
              Standard protectant fungicides (Mancozeb 75% WP, Copper Oxychloride 50% WP, Metalaxyl-Mancozeb). Requires basic personal protective equipment (gloves, eye protection).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-yellow-50/70 border border-yellow-300">
            <div className="flex items-center gap-2 font-bold text-yellow-950 text-xs mb-1">
              <span className="w-3.5 h-3.5 rounded-full bg-yellow-600 shrink-0 inline-block" />
              Yellow Triangle: Poison (Highly Toxic)
            </div>
            <p className="text-[11px] text-yellow-900 leading-relaxed">
              Systemic compounds (Hexaconazole 5% SC, Propiconazole 25% EC, Tricyclazole 75% WP). Use strictly as emergency curative curative intervention; adhere strictly to pre-harvest intervals.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-red-50/70 border border-red-300">
            <div className="flex items-center gap-2 font-bold text-red-950 text-xs mb-1">
              <span className="w-3.5 h-3.5 rounded-full bg-red-600 shrink-0 inline-block" />
              Red Triangle: Extreme Danger (Banned / Strictly Restricted)
            </div>
            <p className="text-[11px] text-red-900 leading-relaxed">
              CropShield AI does <strong>not</strong> recommend red-label organochlorine or banned persistent organic pollutants. All recommendations prioritize Integrated Pest Management (IPM).
            </p>
          </div>
        </div>
      </div>

      {/* 5 Golden Rules of Safe Application */}
      <div className="bg-forest-950 text-white p-6 sm:p-8 rounded-3xl space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-leaf-400" />
          The Five Golden Rules of Field Spraying
        </h2>
        <div className="space-y-2.5 text-xs text-forest-200">
          <div className="flex items-start gap-2.5">
            <CheckCircle className="w-4 h-4 text-leaf-400 shrink-0 mt-0.5" />
            <span><strong>Targeted Spraying:</strong> Spray only infected zones or high-risk microclimates. Avoid prophylactic whole-field spraying of systemics.</span>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle className="w-4 h-4 text-leaf-400 shrink-0 mt-0.5" />
            <span><strong>Weather Condition Protocol:</strong> Never apply foliar sprays during high ambient winds (&gt;15 km/h) or within 3 hours of predicted heavy rainfall.</span>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle className="w-4 h-4 text-leaf-400 shrink-0 mt-0.5" />
            <span><strong>Calibrated Dilution:</strong> Follow the exact grams/milliliters per liter prescribed. Under-dosing induces pathogen resistance; over-dosing induces phytotoxicity.</span>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle className="w-4 h-4 text-leaf-400 shrink-0 mt-0.5" />
            <span><strong>Pre-Harvest Interval (PHI):</strong> Strictly allow the designated number of days between the final spray and harvesting produce for consumption.</span>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle className="w-4 h-4 text-leaf-400 shrink-0 mt-0.5" />
            <span><strong>Personal Protective Gear:</strong> Always wear full trousers, long-sleeved shirts, rubber boots, rubber gloves, and an N95 respiratory mask when mixing sprays.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
