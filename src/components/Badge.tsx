import React from 'react';
import { ShieldCheck, Eye, FileCheck, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { TrustLevel, MatchBand, OrderType } from '../types';
import { t } from '../i18n';

export const TrustBadge: React.FC<{ level: TrustLevel; size?: 'sm' | 'md' }> = ({ level, size = 'sm' }) => {
  if (level === 'L3') {
    return (
      <span
        title={t("Certified on-site by empanelled civil inspector.")}
        className={`inline-flex items-center gap-1.5 font-semibold rounded-md border ${
          size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm'
        } bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800`}
      >
        <ShieldCheck className={size === 'sm' ? 'w-3.5 h-3.5 text-purple-600 dark:text-purple-400' : 'w-4 h-4 text-purple-600'} />
        <span>{t("L3 Inspection Verified")}</span>
      </span>
    );
  }

  if (level === 'L2') {
    return (
      <span
        title={t("Completeness >= 70% with verified measurement or lab document.")}
        className={`inline-flex items-center gap-1.5 font-semibold rounded-md border ${
          size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm'
        } bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800`}
      >
        <FileCheck className={size === 'sm' ? 'w-3.5 h-3.5 text-blue-600 dark:text-blue-400' : 'w-4 h-4 text-blue-600'} />
        <span>{t("L2 Evidence Verified")}</span>
      </span>
    );
  }

  return (
    <span
      title={t("Photos and basic listing details recorded.")}
      className={`inline-flex items-center gap-1.5 font-medium rounded-md border ${
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm'
      } bg-stone-100 text-stone-700 border-stone-200 dark:bg-stone-800 dark:text-stone-300 dark:border-stone-700`}
    >
      <Eye className={size === 'sm' ? 'w-3.5 h-3.5 text-stone-500' : 'w-4 h-4 text-stone-500'} />
      <span>{t("L1 Visual Record")}</span>
    </span>
  );
};

export const MatchBandBadge: React.FC<{ band: MatchBand; score: number }> = ({ band, score }) => {
  if (band === 'Strong') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800">
        <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        <span>{score}/100 • {t("Strong")}</span>
      </span>
    );
  }
  if (band === 'Possible') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800">
        <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
        <span>{score}/100 • {t("Possible")}</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-stone-100 text-stone-700 border border-stone-300 dark:bg-stone-800 dark:text-stone-300 dark:border-stone-700">
      <AlertTriangle className="w-3.5 h-3.5 text-stone-500" />
      <span>{score}/100 • {t("Weak")}</span>
    </span>
  );
};

export const OrderTypeBadge: React.FC<{ type: OrderType }> = ({ type }) => {
  if (type === 'C') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300 dark:bg-rose-950 dark:text-rose-300">
        {t("Type C: Test-required")}
      </span>
    );
  }
  if (type === 'B') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-300 dark:bg-indigo-950 dark:text-indigo-300">
        {t("Type B: Inspect-first")}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-teal-100 text-teal-800 border border-teal-300 dark:bg-teal-950 dark:text-teal-300">
      {t("Type A: Standard")}
    </span>
  );
};

export const SimulatedChip: React.FC<{ label?: string }> = ({ label = t("SIMULATED") }) => (
  <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-700">
    {label}
  </span>
);

export const EstimatedChip: React.FC<{ label?: string }> = ({ label = t("Estimated") }) => (
  <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-bold rounded bg-sky-100 text-sky-900 border border-sky-300 dark:bg-sky-950 dark:text-sky-200 dark:border-sky-700">
    {label}
  </span>
);

export const DemoThresholdChip: React.FC = () => (
  <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-bold rounded bg-purple-100 text-purple-900 border border-purple-300 dark:bg-purple-950 dark:text-purple-200">
    {t("DEMO Thresholds")}
  </span>
);

export const SampleChip: React.FC = () => (
  <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-bold uppercase rounded bg-neutral-200 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
    {t("Sample")}
  </span>
);
