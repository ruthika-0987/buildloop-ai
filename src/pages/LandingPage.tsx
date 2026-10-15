import React from 'react';
import {
  Recycle,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  TrendingDown,
  Layers,
  MapPin,
  CheckCircle2,
  Lock,
  Truck,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useTranslation, t } from '../i18n';
import { calculateEnvironmentalImpact } from '../engine/impact';
import { TrustBadge, MatchBandBadge, SimulatedChip, EstimatedChip } from '../components/Badge';

export const LandingPage: React.FC<{ onOpenOnboarding: () => void }> = ({ onOpenOnboarding }) => {
  const { user, isSeller, isBuyer } = useAuth();
  const { batches, demands, orders } = useData();
  const { currentLanguage } = useTranslation();

  const impact = calculateEnvironmentalImpact(batches, orders);
  const publishedBatches = batches.filter(b => b.status === 'published').slice(0, 3);

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-12 rounded-3xl bg-gradient-to-b from-stone-900 via-stone-900 to-stone-950 text-white p-6 sm:p-12 border border-stone-800 shadow-2xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Hyderabad C&D Pilot Active (GHMC Area)</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            From recovered material to <span className="text-emerald-400">feasible reuse</span>
          </h1>

          <p className="mt-4 text-base sm:text-lg text-stone-300 font-medium">
            Evidence-based reuse engine with buyer protection for construction and demolition materials in Hyderabad.
          </p>

          <div className="mt-3 inline-block px-3.5 py-1.5 rounded-xl bg-stone-800/80 border border-stone-700/80 font-mono text-xs sm:text-sm text-emerald-300">
            "{t("AI suggests, the engine decides, people confirm.")}"
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            {user ? (
              <>
                {(isSeller || user.role === 'admin') && (
                  <a
                    href="#/batches/new"
                    className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-900/30 transition"
                  >
                    <span>{t("List a Batch")}</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                )}
                <a
                  href="#/batches"
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-100 border border-stone-700 font-semibold text-sm transition"
                >
                  <span>{t("Browse Batches")}</span>
                </a>
                <a
                  href="#/demands"
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-100 border border-stone-700 font-semibold text-sm transition"
                >
                  <span>{t("Demand Board")}</span>
                </a>
              </>
            ) : (
              <>
                <a
                  href="#/signup"
                  className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-900/30 transition"
                >
                  <span>Create Free Account</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
                <a
                  href="#/batches"
                  className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 font-semibold text-sm transition"
                >
                  <span>Explore Available Batches</span>
                </a>
              </>
            )}

            <button
              onClick={onOpenOnboarding}
              className="flex items-center gap-1.5 px-4 py-3 rounded-xl text-stone-300 hover:text-white hover:bg-stone-800/60 font-medium text-xs transition"
            >
              <HelpCircle className="w-4 h-4 text-emerald-400" />
              <span>How it works (3 min)</span>
            </button>
          </div>
        </div>

        {/* Background glow */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Live Impact Counters (Estimated) */}
      <section className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800 mb-6">
          <div>
            <h2 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <span>Hyderabad Pilot Metrics</span>
              <EstimatedChip />
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Live impact calculated from published inventory and closed orders.
            </p>
          </div>
          <a href="#/impact" className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
            View full calculations →
          </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-950/60 border border-stone-200 dark:border-stone-800">
            <span className="text-[11px] font-semibold text-stone-500">Landfill Diverted</span>
            <p className="text-2xl font-extrabold text-stone-900 dark:text-stone-100 mt-1">
              {impact.landfillDivertedTons} <span className="text-sm font-normal text-stone-500">Tons</span>
            </p>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 block">
              Diverted from Jawaharnagar
            </span>
          </div>

          <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-950/60 border border-stone-200 dark:border-stone-800">
            <span className="text-[11px] font-semibold text-stone-500">Estimated CO₂ Avoided</span>
            <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
              {impact.co2AvoidedTons} <span className="text-sm font-normal text-stone-500">MT</span>
            </p>
            <span className="text-[10px] text-stone-400 mt-1 block">
              vs virgin brick kiln firing
            </span>
          </div>

          <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-950/60 border border-stone-200 dark:border-stone-800">
            <span className="text-[11px] font-semibold text-stone-500">Net Buyer Savings</span>
            <p className="text-2xl font-extrabold text-stone-900 dark:text-stone-100 mt-1">
              ₹{impact.totalBuyerSavingsInr.toLocaleString()}
            </p>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 block">
              Average ~38% vs new material
            </span>
          </div>

          <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-950/60 border border-stone-200 dark:border-stone-800">
            <span className="text-[11px] font-semibold text-stone-500">Active Listings & Demands</span>
            <p className="text-2xl font-extrabold text-stone-900 dark:text-stone-100 mt-1">
              {batches.length} / {demands.length}
            </p>
            <span className="text-[10px] text-stone-400 mt-1 block">
              Batches listed / Open demands
            </span>
          </div>
        </div>
      </section>

      {/* Featured Hyderabad Materials */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
              Recovered Materials Near You
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Verified inventory ready for offloading and delivery in Hyderabad.
            </p>
          </div>
          <a href="#/batches" className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
            View all {batches.length} batches →
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {publishedBatches.map(b => (
            <div
              key={b.id}
              className="group bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition flex flex-col"
            >
              <div className="relative h-44 bg-stone-100 dark:bg-stone-800 overflow-hidden">
                {b.photos && b.photos.length > 0 ? (
                  <img
                    src={b.photos[0]}
                    alt={b.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-400 text-xs">
                    No photo uploaded
                  </div>
                )}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <TrustBadge level={b.trustLevel} />
                </div>
                <div className="absolute bottom-2.5 right-2.5 bg-black/70 backdrop-blur-xs text-white px-2 py-0.5 rounded text-xs font-bold">
                  ₹{b.pricePerUnit} / {b.unit}
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100 line-clamp-1">
                    {b.title}
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 shrink-0 text-stone-400" />
                    <span className="truncate">{b.location.address}</span>
                  </p>
                  <div className="mt-3 flex items-center justify-between text-xs text-stone-600 dark:text-stone-300 bg-stone-50 dark:bg-stone-950/60 p-2 rounded-lg">
                    <span>Available Qty:</span>
                    <span className="font-bold font-mono">
                      {b.quantity.toLocaleString()} {b.unit}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                  <span className="text-[11px] text-stone-400">Seller: {b.sellerName}</span>
                  <a
                    href={`#/batches/${b.id}`}
                    className="px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-emerald-600 hover:text-white text-xs font-semibold transition"
                  >
                    View Details
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3 Pillars of BuildLoop */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
        <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-stone-900 dark:text-stone-100">
            TrustLoop Evidence Levels
          </h3>
          <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
            Every recovered material fact is labelled: <strong>seen, claimed, verified, or unknown</strong>. Progress from L1 Visual Record to L2 Lab Verified to L3 Empanelled Inspection.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-stone-900 dark:text-stone-100">
            Deterministic Matching Engine
          </h3>
          <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
            Scores supply against buyer demands out of 100 with zero black-box mystery. Haversine × 1.3 road distance, timing, economics, and hard filter reason codes.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-stone-900 dark:text-stone-100">
            Buyer Protection & Remedies
          </h3>
          <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
            Simulated escrow protects payments. Pre-dispatch inspection gates prevent faulty truck dispatches, while 48-hour delivery checks guarantee refunds or replacements.
          </p>
        </div>
      </section>
    </div>
  );
};
