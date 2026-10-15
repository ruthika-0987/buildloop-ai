import React, { useState } from 'react';
import {
  BarChart3,
  TrendingDown,
  DollarSign,
  Truck,
  Leaf,
  Info,
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useTranslation, t } from '../i18n';
import { calculateEnvironmentalImpact } from '../engine/impact';
import { EstimatedChip } from '../components/Badge';

export const ImpactPage: React.FC = () => {
  const { batches, orders } = useData();
  const { currentLanguage } = useTranslation();

  const [showFormulas, setShowFormulas] = useState(false);
  const impact = calculateEnvironmentalImpact(batches, orders);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Circularity Metrics • Milestone M11
          </span>
          <h1 className="text-2xl font-extrabold text-stone-900 dark:text-stone-100">
            Environmental & Economic Impact
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Quantified carbon mitigation, landfill diversion, and direct rupee savings across the Hyderabad circular economy.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <EstimatedChip />
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-1 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-stone-500 uppercase">CO₂ Mitigated</span>
            <Leaf className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
            {impact.co2AvoidedTons} <span className="text-sm font-sans font-medium text-stone-500">Tons</span>
          </p>
          <span className="text-[10px] text-stone-400 block pt-1">
            ({impact.co2AvoidedKg.toLocaleString()} kg total)
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-1 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-stone-500 uppercase">Landfill Diverted</span>
            <TrendingDown className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-3xl font-extrabold text-stone-900 dark:text-stone-100 font-mono">
            {impact.landfillDivertedTons} <span className="text-sm font-sans font-medium text-stone-500">Tons</span>
          </p>
          <span className="text-[10px] text-stone-400 block pt-1">
            Diverted from Jawaharnagar dumping grounds
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-1 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-stone-500 uppercase">Buyer Savings</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-3xl font-extrabold text-stone-900 dark:text-stone-100 font-mono">
            ₹{impact.totalBuyerSavingsInr.toLocaleString()}
          </p>
          <span className="text-[10px] text-stone-400 block pt-1">
            Saved vs brand-new virgin material
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-1 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-stone-500 uppercase">Seller Revenue</span>
            <BarChart3 className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-3xl font-extrabold text-purple-600 dark:text-purple-400 font-mono">
            ₹{impact.totalSellerRevenueInr.toLocaleString()}
          </p>
          <span className="text-[10px] text-stone-400 block pt-1">
            Earned from salvaged demolition assets
          </span>
        </div>
      </div>

      {/* Methodology & Assumptions Accordion */}
      <section className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-4">
        <button
          onClick={() => setShowFormulas(!showFormulas)}
          className="w-full flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-emerald-600" />
            <h2 className="font-bold text-base text-stone-900 dark:text-stone-100">
              Calculation Methodology & Emission Factors
            </h2>
          </div>
          {showFormulas ? <ChevronUp className="w-5 h-5 text-stone-400" /> : <ChevronDown className="w-5 h-5 text-stone-400" />}
        </button>

        {showFormulas && (
          <div className="pt-4 border-t border-stone-100 dark:border-stone-800 space-y-4 text-xs text-stone-600 dark:text-stone-300">
            <p className="leading-relaxed">
              All environmental and financial calculations are benchmarked against Central Pollution Control Board (CPCB) C&D Waste Management Rules and BMTPC lifecycle guidelines:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-950/60 border border-stone-200 dark:border-stone-800">
                <strong className="text-stone-900 dark:text-stone-100 block mb-1">
                  Clay Bricks Mitigation Factor
                </strong>
                <p className="text-[11px] text-stone-500">
                  <strong>0.24 kg CO₂ per brick</strong> saved by avoiding traditional coal-fired clamp kiln baking and topsoil excavation.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-950/60 border border-stone-200 dark:border-stone-800">
                <strong className="text-stone-900 dark:text-stone-100 block mb-1">
                  RCA Aggregate Mitigation Factor
                </strong>
                <p className="text-[11px] text-stone-500">
                  <strong>14.5 kg CO₂ per ton</strong> saved compared to hard-rock granite blasting, primary quarrying, and crushing.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-950/60 border border-stone-200 dark:border-stone-800">
                <strong className="text-stone-900 dark:text-stone-100 block mb-1">
                  Fly Ash Bricks Mitigation Factor
                </strong>
                <p className="text-[11px] text-stone-500">
                  <strong>0.18 kg CO₂ per piece</strong> by utilizing thermal power plant byproduct and reducing virgin clinker usage.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-950/60 border border-stone-200 dark:border-stone-800">
                <strong className="text-stone-900 dark:text-stone-100 block mb-1">
                  Steel Rebar Mitigation Factor
                </strong>
                <p className="text-[11px] text-stone-500">
                  <strong>1.85 kg CO₂ per kg</strong> saved compared to virgin blast furnace iron ore reduction.
                </p>
              </div>
            </div>

            <p className="text-[11px] text-stone-400 italic">
              Disclaimer: Monetary figures represent placeholder pilot rates until multi-yard commercial scaling. Environmental savings represent engineering estimates.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};
