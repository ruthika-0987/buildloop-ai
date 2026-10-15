import React, { useState } from 'react';
import { X, Sparkles, CheckCircle2, AlertTriangle, ShieldCheck, HelpCircle } from 'lucide-react';
import { MatchResult } from '../types';
import { t } from '../i18n';
import { MatchBandBadge, OrderTypeBadge } from './Badge';

interface WhyThisScoreModalProps {
  match: MatchResult;
  batchMaterial: string;
  demandMaterial: string;
  onClose: () => void;
}

export const WhyThisScoreModal: React.FC<WhyThisScoreModalProps> = ({
  match,
  batchMaterial,
  demandMaterial,
  onClose
}) => {
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const fetchAiExplanation = async () => {
    setLoadingAi(true);
    setAiError(null);
    try {
      const res = await fetch('/api/ai/explain-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batchMaterial,
          demandMaterial,
          totalScore: match.totalScore,
          band: match.band,
          components: match.components,
          roadDistanceKm: match.roadDistanceKm,
          netSaving: match.netSaving,
          hardFilterReasons: match.hardFilterReasons
        })
      });
      const data = await res.json();
      if (data.source === 'unavailable') {
        setAiError(data.reason || 'AI explanation service unavailable. Rely on deterministic engine score breakdown.');
      } else {
        setAiResult(data);
      }
    } catch (err: any) {
      setAiError(err.message || 'AI explanation service unavailable.');
    } finally {
      setLoadingAi(false);
    }
  };

  const components = [
    {
      name: t("Compatibility"),
      score: match.components.compatibility,
      max: 25,
      formula: 'Material specification & physical grade match',
      desc: 'Compares material type, grade, and application constraints.'
    },
    {
      name: t("Quantity"),
      score: match.components.quantity,
      max: 20,
      formula: 'round(20 × min(1, avail / needed))',
      desc: 'Checks if available batch satisfies buyer requisition.'
    },
    {
      name: t("Timing"),
      score: match.components.timing,
      max: 15,
      formula: 'Overlap between recovery availability and construction window',
      desc: 'Prevents holding inventory idle or site project delays.'
    },
    {
      name: t("Distance"),
      score: match.components.distance,
      max: 15,
      formula: `round(15 × max(0, 1 - roadKm / 40)) [${match.roadDistanceKm} km road]`,
      desc: 'Calculated via Haversine distance × 1.3 Hyderabad circuity.'
    },
    {
      name: t("Evidence"),
      score: match.components.evidence,
      max: 10,
      formula: 'L1 = round(5 × readiness/100), L2/L3 = 10',
      desc: 'Rewards lab documentation, verified measurements, and site inspections.'
    },
    {
      name: t("Economics"),
      score: match.components.economics,
      max: 15,
      formula: 'round(15 × clamp((netSaving / newCost) / 0.30, 0, 1))',
      desc: `Buyer saves ₹${match.netSaving} (${match.savingPercent}%) after estimated logistics.`
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl max-w-xl w-full shadow-2xl p-6 text-stone-900 dark:text-stone-100 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-stone-800">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg">{t("Why this score")}</h3>
              <MatchBandBadge band={match.band} score={match.totalScore} />
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Deterministic matching engine • Hyderabad Pilot Rules
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hard Filters Status */}
        <div className="mt-4 p-3 rounded-xl border bg-stone-50 dark:bg-stone-950/60 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-stone-700 dark:text-stone-300">Hard Feasibility Filters:</span>
            {match.passedHardFilters ? (
              <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4" /> Passed all 7 rules
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 font-bold text-red-600 dark:text-red-400">
                <AlertTriangle className="w-4 h-4" /> Triggered filter flags
              </span>
            )}
          </div>
          {!match.passedHardFilters && match.hardFilterReasons.length > 0 && (
            <ul className="mt-2 space-y-1 text-red-600 dark:text-red-400">
              {match.hardFilterReasons.map(r => (
                <li key={r} className="flex items-start gap-1.5">
                  <span className="font-bold">•</span>
                  <span><strong>{r}:</strong> {t(r)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recommended Order Type */}
        <div className="mt-3 flex items-center justify-between p-3 rounded-xl border border-indigo-100 dark:border-indigo-950 bg-indigo-50/50 dark:bg-indigo-950/30 text-xs">
          <div>
            <span className="font-semibold text-indigo-950 dark:text-indigo-200">Suggested Protection Level:</span>
            <p className="text-indigo-700 dark:text-indigo-300 text-[11px] mt-0.5">
              Based on material application and required evidence level.
            </p>
          </div>
          <OrderTypeBadge type={match.recommendedOrderType} />
        </div>

        {/* 6 Deterministic Component Bars */}
        <div className="mt-4 space-y-3">
          <h4 className="font-bold text-xs uppercase tracking-wider text-stone-500">
            Engine Score Breakdown (100 Points Total)
          </h4>
          {components.map(c => {
            const pct = Math.round((c.score / c.max) * 100);
            return (
              <div key={c.name} className="p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900">
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span>{c.name}</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400">
                    {c.score} / {c.max} pts
                  </span>
                </div>
                <div className="w-full bg-stone-100 dark:bg-stone-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400 mt-1.5">
                  <span>{c.desc}</span>
                  <span className="font-mono text-[10px] text-stone-400">{c.formula}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* AI Plain Language Explanation Section */}
        <div className="mt-5 p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/30">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="font-bold text-xs text-stone-900 dark:text-stone-100">
                Plain-Language Match Explanation
              </span>
            </div>
            {!aiResult && !loadingAi && (
              <button
                onClick={fetchAiExplanation}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-xs"
              >
                Explain with Gemini AI
              </button>
            )}
          </div>

          {loadingAi && (
            <p className="text-xs text-stone-500 dark:text-stone-400 animate-pulse">
              Consulting Gemini AI with engine metrics…
            </p>
          )}

          {aiError && (
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
              {aiError}
            </p>
          )}

          {aiResult && (
            <div className="space-y-2 mt-2 text-xs">
              <p className="font-medium text-stone-800 dark:text-stone-200">
                {aiResult.plainSummary}
              </p>
              {aiResult.strengths?.length > 0 && (
                <div>
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400">Strengths:</span>
                  <ul className="list-disc pl-4 text-stone-600 dark:text-stone-300 space-y-0.5 mt-0.5">
                    {aiResult.strengths.map((s: string, i: number) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
              {aiResult.cautions?.length > 0 && (
                <div>
                  <span className="font-semibold text-amber-700 dark:text-amber-400">Cautions:</span>
                  <ul className="list-disc pl-4 text-stone-600 dark:text-stone-300 space-y-0.5 mt-0.5">
                    {aiResult.cautions.map((c: string, i: number) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}
              {aiResult.recommendation && (
                <p className="italic text-stone-700 dark:text-stone-300 border-t border-emerald-200/60 dark:border-emerald-800/60 pt-1.5">
                  <strong>Recommendation:</strong> {aiResult.recommendation}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="mt-5 pt-3 border-t border-stone-200 dark:border-stone-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 font-semibold text-xs transition"
          >
            {t("Close")}
          </button>
        </div>
      </div>
    </div>
  );
};
