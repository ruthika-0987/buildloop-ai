import React from 'react';
import { Recycle, ShieldCheck, Sparkles, Lock, CheckCircle2, Info } from 'lucide-react';
import { useTranslation, t } from '../i18n';
import { SimulatedChip, EstimatedChip, DemoThresholdChip } from '../components/Badge';

export const AboutPage: React.FC = () => {
  const { currentLanguage } = useTranslation();

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-16">
      {/* Brand & Motto Banner */}
      <div className="p-8 rounded-3xl bg-stone-900 text-white border border-stone-800 space-y-4 shadow-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          <Recycle className="w-4 h-4" />
          <span>BuildLoop AI Manifesto</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          "From recovered material to feasible reuse"
        </h1>

        <div className="p-4 rounded-xl bg-stone-800/80 border border-stone-700/80 font-mono text-emerald-300 text-sm sm:text-base">
          "{t("AI suggests, the engine decides, people confirm.")}"
        </div>

        <p className="text-xs sm:text-sm text-stone-300 leading-relaxed max-w-2xl">
          BuildLoop AI is an evidence-based reuse engine with buyer protection designed specifically for construction and demolition (C&D) materials in Hyderabad, Telangana.
        </p>
      </div>

      {/* 5-Step Operational Lifecycle */}
      <section className="space-y-4">
        <h2 className="text-xl font-extrabold text-stone-900 dark:text-stone-100">
          How It Works in 5 Steps
        </h2>

        <div className="grid grid-cols-1 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-start gap-4">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm shrink-0">
              1
            </div>
            <div>
              <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                1. Recovery & Visual Ingestion
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 leading-relaxed">
                The seller takes 1 to 6 photos of salvaged material at the demolition site. Gemini Vision reads visual condition, mortar adhesion, and material type as suggestions. The seller confirms or edits every single field. AI never certifies.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-start gap-4">
            <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-sm shrink-0">
              2
            </div>
            <div>
              <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                2. TrustLoop Evidence Hardening
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 leading-relaxed">
                Every claim is labelled: seen, claimed, verified, or unknown. Listings start at L1 Visual Record, upgrade to L2 Evidence Verified when readiness reaches 70%+ with test records, and reach L3 Inspection Verified only with physical sign-off from an empanelled Civil Inspector.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-start gap-4">
            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm shrink-0">
              3
            </div>
            <div>
              <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                3. Deterministic Matching Engine
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 leading-relaxed">
                Matches are evaluated strictly via 7 hard feasibility filters and a 6-component scoring formula (Compatibility 25, Quantity 20, Timing 15, Distance 15, Evidence 10, Economics 15). Haversine distance × 1.3 accounts for Hyderabad road circuity. Numbers are completely transparent and verifiable.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-start gap-4">
            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-sm shrink-0">
              4
            </div>
            <div>
              <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                4. Pre-Dispatch Gate & Escrow
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 leading-relaxed">
                Transaction protection levels: Type A Standard, Type B Inspect-first, or Type C Test-required. Truck loading is physically blocked until the pre-dispatch gate is unlocked by the required inspection or lab test. Payment is locked safely in escrow.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-start gap-4">
            <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-sm shrink-0">
              5
            </div>
            <div>
              <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                5. 48-Hour Delivery Check & Remedies
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 leading-relaxed">
                Upon offloading at the buyer site, a 48-hour delivery inspection window opens. Damage under 10% is within tolerance; 10% to 30% triggers automated proportional refund or replacement; over 30% entitles the buyer to full rejection and return.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Honest Disclosures */}
      <section className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3">
        <h2 className="font-bold text-base text-stone-900 dark:text-stone-100 flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-500" />
          <span>Honest Pilot Disclosures</span>
        </h2>
        <ul className="space-y-2 text-xs text-stone-600 dark:text-stone-400">
          <li className="flex items-start gap-2">
            <SimulatedChip />
            <span>Escrow payments, credits, and refunds are simulated accounting records. No real currency is charged.</span>
          </li>
          <li className="flex items-start gap-2">
            <EstimatedChip />
            <span>Environmental metrics (CO₂ mitigated, landfill diverted) are engineering estimates derived from CPCB factors.</span>
          </li>
          <li className="flex items-start gap-2">
            <DemoThresholdChip />
            <span>IS 3495 crush testing and water absorption figures utilize demo laboratory thresholds.</span>
          </li>
        </ul>
      </section>
    </div>
  );
};
