import React from 'react';
import { Recycle, ShieldAlert, Award, FileText } from 'lucide-react';
import { t } from '../i18n';
import { SimulatedChip, EstimatedChip, DemoThresholdChip } from './Badge';

export const Footer: React.FC<{ onOpenOnboarding?: () => void }> = ({ onOpenOnboarding }) => {
  return (
    <footer className="bg-stone-900 text-stone-300 border-t border-stone-800 text-xs mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: Brand & Motto */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                <Recycle className="w-4 h-4" />
              </div>
              <span className="font-bold text-base text-white">BuildLoop AI</span>
            </div>
            <p className="text-stone-300 font-semibold text-sm">
              "{t("From recovered material to feasible reuse")}"
            </p>
            <p className="text-emerald-400 font-mono text-xs">
              "{t("AI suggests, the engine decides, people confirm.")}"
            </p>
            <p className="text-stone-400 text-xs leading-relaxed max-w-md">
              Evidence-based reuse engine with buyer protection for construction and demolition (C&D) materials across Hyderabad (GHMC area).
            </p>
          </div>

          {/* Col 2: Honest Pilot Disclaimers */}
          <div className="space-y-2">
            <h4 className="font-bold text-stone-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>Transparent Pilot Status</span>
            </h4>
            <ul className="space-y-2 text-stone-400">
              <li className="flex items-start gap-2">
                <SimulatedChip />
                <span>Escrow payments & refunds are simulated in this pilot build.</span>
              </li>
              <li className="flex items-start gap-2">
                <EstimatedChip />
                <span>CO₂ and landfill metrics are estimated via CPCB benchmarks.</span>
              </li>
              <li className="flex items-start gap-2">
                <DemoThresholdChip />
                <span>IS 3495 crush testing utilizes demo laboratory threshold models.</span>
              </li>
            </ul>
          </div>

          {/* Col 3: Proof & Compliance Pages */}
          <div className="space-y-2">
            <h4 className="font-bold text-stone-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-emerald-400" />
              <span>Engine Proof & Verification</span>
            </h4>
            <div className="flex flex-col space-y-1.5">
              <a href="#/validation" className="hover:text-emerald-400 transition flex items-center gap-1.5">
                <FileText className="w-3 h-3" />
                <span>/validation (Live 87-score check)</span>
              </a>
              <a href="#/coverage" className="hover:text-emerald-400 transition flex items-center gap-1.5">
                <FileText className="w-3 h-3" />
                <span>/coverage (Feature audit matrix)</span>
              </a>
              <a href="#/about" className="hover:text-emerald-400 transition flex items-center gap-1.5">
                <FileText className="w-3 h-3" />
                <span>/about (Architecture & 5 Steps)</span>
              </a>
              {onOpenOnboarding && (
                <button
                  onClick={onOpenOnboarding}
                  className="text-left text-emerald-400 hover:underline pt-1"
                >
                  📖 Re-open 3-Step Guide
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-stone-400 text-[11px]">
          <p>© 2026 BuildLoop AI • Hyderabad C&D Circularity Project. All rights reserved.</p>
          <p>
            Language active: <span className="font-semibold text-stone-300 uppercase">English / తెలుగు / हिन्दी</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
