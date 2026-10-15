import React, { useState } from 'react';
import {
  ArrowLeft,
  Sparkles,
  Layers,
  MapPin,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Building,
  TrendingDown,
  ShieldCheck
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useTranslation, t } from '../i18n';
import { evaluateMatch, buildCompositeMatch } from '../engine/matching';
import { TrustBadge, MatchBandBadge, SampleChip } from '../components/Badge';
import { WhyThisScoreModal } from '../components/WhyThisScoreModal';

export const DemandDetailPage: React.FC<{ demandId: string }> = ({ demandId }) => {
  const { demands, batches } = useData();
  const { user, isBuyer } = useAuth();
  const { currentLanguage } = useTranslation();

  const [activeWhyScoreMatch, setActiveWhyScoreMatch] = useState<{ match: any; batchMat: string; demandMat: string } | null>(null);

  const demand = demands.find(d => d.id === demandId);

  if (!demand) {
    return (
      <div className="p-12 text-center bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-3">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
        <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">Demand Not Found</h2>
        <a href="#/demands" className="inline-block px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold">
          Back to Demand Board
        </a>
      </div>
    );
  }

  // Evaluate all published batches
  const published = batches.filter(b => b.status === 'published');
  const matches = published
    .map(b => ({ batch: b, result: evaluateMatch(b, demand) }))
    .sort((a, b) => b.result.totalScore - a.result.totalScore);

  // Composite match builder
  const composite = buildCompositeMatch(published, demand);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="space-y-2">
        <a
          href="#/demands"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Demand Board</span>
        </a>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100">
              {demand.title}
            </h1>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-stone-400" />
              <span>Destination: {demand.deliveryLocation.address}</span>
              <span>•</span>
              <span>Buyer: {demand.buyerName}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold">Required Trust:</span>
            <TrustBadge level={demand.requiredTrustLevel} />
          </div>
        </div>
      </div>

      {/* Demand Specifications Card */}
      <div className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-4">
        <h2 className="font-bold text-sm text-stone-900 dark:text-stone-100 uppercase tracking-wider text-stone-400">
          Requisition Parameters
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-950/60 border border-stone-200 dark:border-stone-800">
            <span className="text-stone-400 block text-[10px]">Material</span>
            <span className="font-bold text-stone-900 dark:text-stone-100">
              {demand.materialType} {demand.materialSubtype ? `(${demand.materialSubtype})` : ''}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-950/60 border border-stone-200 dark:border-stone-800">
            <span className="text-stone-400 block text-[10px]">Quantity Needed</span>
            <span className="font-bold font-mono text-stone-900 dark:text-stone-100">
              {demand.quantityNeeded.toLocaleString()} {demand.unit}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-950/60 border border-stone-200 dark:border-stone-800">
            <span className="text-stone-400 block text-[10px]">Max Budget</span>
            <span className="font-bold font-mono text-stone-900 dark:text-stone-100">
              ₹{demand.maxBudgetPerUnit} / {demand.unit}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-950/60 border border-stone-200 dark:border-stone-800">
            <span className="text-stone-400 block text-[10px]">Target Construction Window</span>
            <span className="font-medium text-stone-700 dark:text-stone-300">
              {demand.neededFrom} to {demand.neededUntil}
            </span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-950 text-xs text-indigo-900 dark:text-indigo-200">
          <strong>Intended Structural / Site Use:</strong> {demand.intendedUse}
        </div>
      </div>

      {/* Composite Multi-Source Solution (if demand > single batch) */}
      {composite && composite.sources.length > 1 && (
        <section className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-stone-900 to-stone-900 border border-emerald-800/60 text-white space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mb-1">
                <Sparkles className="w-3 h-3" />
                <span>Multi-Source Composite Match</span>
              </div>
              <h3 className="font-bold text-lg">
                Consolidated Fulfillment ({composite.sources.length} Batches)
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-400">Composite Feasibility:</span>
              <span className="px-3 py-1 rounded-xl bg-emerald-500 text-stone-950 font-black text-sm font-mono">
                {composite.compositeScore}/100
              </span>
            </div>
          </div>

          <p className="text-xs text-stone-300 leading-relaxed max-w-2xl">
            Our engine combined {composite.sources.length} nearby batches to fulfill {composite.totalAllocated.toLocaleString()} of {composite.needed.toLocaleString()} {demand.unit} needed. (Includes standard -{composite.penalty} pt multi-haulage logistics penalty).
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {composite.sources.map((s, idx) => (
              <div key={s.batch.id} className="p-3 rounded-xl bg-stone-800/80 border border-stone-700/80 space-y-1">
                <div className="flex items-center justify-between text-[10px] text-emerald-400 font-bold uppercase">
                  <span>Source #{idx + 1}</span>
                  <span>{s.allocatedQty} {s.batch.unit}</span>
                </div>
                <h4 className="font-bold text-xs truncate">{s.batch.title}</h4>
                <p className="text-[11px] text-stone-400 truncate">{s.batch.location.address}</p>
                <a href={`#/batches/${s.batch.id}`} className="text-[10px] text-emerald-400 hover:underline block pt-1">
                  View Source Batch →
                </a>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Ranked Matched Supply Batches */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            <span>Deterministic Ranked Matches ({matches.length})</span>
          </h2>
          <p className="text-xs text-stone-500">
            Ranked by mathematical compatibility, road haulage distance, delivery timing, evidence level, and economic savings.
          </p>
        </div>

        <div className="space-y-3">
          {matches.map(({ batch: b, result }) => (
            <div
              key={b.id}
              className={`p-5 rounded-2xl bg-white dark:bg-stone-900 border transition shadow-xs space-y-3 ${
                result.band === 'Strong'
                  ? 'border-emerald-300 dark:border-emerald-800/80'
                  : 'border-stone-200 dark:border-stone-800'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <MatchBandBadge band={result.band} score={result.totalScore} />
                    <h3 className="font-bold text-base text-stone-900 dark:text-stone-100">
                      {b.title}
                    </h3>
                  </div>
                  <p className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-2">
                    <span>Seller: {b.sellerName}</span>
                    <span>•</span>
                    <span>{b.location.address}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setActiveWhyScoreMatch({ match: result, batchMat: b.materialType, demandMat: demand.materialType })}
                    className="px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 text-xs font-semibold transition"
                  >
                    {t("Why this score")}
                  </button>
                  <a
                    href={`#/batches/${b.id}`}
                    className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition"
                  >
                    View Batch & Order
                  </a>
                </div>
              </div>

              {/* Match Highlights */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-stone-100 dark:border-stone-800 text-xs text-stone-600 dark:text-stone-300">
                <div>
                  <span className="text-[10px] text-stone-400 block">Road Distance</span>
                  <strong>{result.roadDistanceKm} km</strong> (Haversine × 1.3)
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 block">Available Qty</span>
                  <strong>{b.quantity} {b.unit}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 block">Price / Unit</span>
                  <strong>₹{b.pricePerUnit}</strong> (vs ₹{demand.maxBudgetPerUnit} budget)
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 block">Est. Net Savings</span>
                  <strong className="text-emerald-600 dark:text-emerald-400">
                    ₹{result.netSaving.toLocaleString()} ({result.savingPercent}%)
                  </strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why this score modal */}
      {activeWhyScoreMatch && (
        <WhyThisScoreModal
          match={activeWhyScoreMatch.match}
          batchMaterial={activeWhyScoreMatch.batchMat}
          demandMaterial={activeWhyScoreMatch.demandMat}
          onClose={() => setActiveWhyScoreMatch(null)}
        />
      )}
    </div>
  );
};
