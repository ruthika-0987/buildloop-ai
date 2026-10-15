import React, { useState } from 'react';
import {
  ClipboardList,
  Plus,
  Search,
  Filter,
  MapPin,
  Calendar,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  X
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTranslation, t } from '../i18n';
import { Demand, TrustLevel } from '../types';
import { evaluateMatch } from '../engine/matching';
import { TrustBadge, MatchBandBadge, SampleChip } from '../components/Badge';
import { WhyThisScoreModal } from '../components/WhyThisScoreModal';

export const DemandBoardPage: React.FC = () => {
  const { demands, batches, saveRecord } = useData();
  const { user, isBuyer, isAdmin } = useAuth();
  const { showSuccess, showError } = useToast();
  const { currentLanguage } = useTranslation();

  const [search, setSearch] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState('All');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeWhyScoreMatch, setActiveWhyScoreMatch] = useState<{ match: any; batchMat: string; demandMat: string } | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [materialType, setMaterialType] = useState('Clay Bricks');
  const [materialSubtype, setMaterialSubtype] = useState('');
  const [intendedUse, setIntendedUse] = useState('Non-loadbearing boundary wall');
  const [quantityNeeded, setQuantityNeeded] = useState<number>(5000);
  const [unit, setUnit] = useState('Pieces');
  const [maxBudget, setMaxBudget] = useState<number>(6.0);
  const [requiredTrust, setRequiredTrust] = useState<TrustLevel>('L2');
  const [deliveryAddress, setDeliveryAddress] = useState('Begumpet, Hyderabad');
  const [lat, setLat] = useState<number>(17.4447);
  const [lng, setLng] = useState<number>(78.4664);
  const [neededFrom, setNeededFrom] = useState(new Date().toISOString().slice(0, 10));
  const [neededUntil, setNeededUntil] = useState(new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10));
  const [submitting, setSubmitting] = useState(false);

  const filteredDemands = demands.filter(d => {
    if (search) {
      const q = search.toLowerCase();
      if (!d.title.toLowerCase().includes(q) && !d.materialType.toLowerCase().includes(q) && !d.deliveryLocation.address.toLowerCase().includes(q)) {
        return false;
      }
    }
    if (selectedMaterial !== 'All' && d.materialType !== selectedMaterial) return false;
    return true;
  });

  const handleCreateDemand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showError('Please enter a demand title.');
      return;
    }

    setSubmitting(true);
    const demandId = `demand-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newDemand: Demand = {
      id: demandId,
      title: title.trim(),
      materialType,
      materialSubtype: materialSubtype.trim() || undefined,
      intendedUse: intendedUse.trim(),
      quantityNeeded: Number(quantityNeeded) || 1,
      unit,
      maxBudgetPerUnit: Number(maxBudget) || 10,
      requiredTrustLevel: requiredTrust,
      deliveryLocation: {
        address: deliveryAddress.trim(),
        lat,
        lng
      },
      neededFrom,
      neededUntil,
      buyerId: user?.id || 'guest_buyer',
      buyerName: user?.name || 'Local Builder',
      buyerPhone: user?.phone,
      status: 'open',
      created_at: new Date().toISOString()
    };

    const res = await saveRecord('demands', newDemand);
    setSubmitting(false);

    if (res.success) {
      showSuccess('Demand requisition posted to Hyderabad Demand Board!');
      setShowCreateModal(false);
      // Reset form
      setTitle('');
    } else {
      showError(res.error || 'Failed to post demand.');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Demand-First Board • Milestone M5
          </span>
          <h1 className="text-2xl font-extrabold text-stone-900 dark:text-stone-100">
            C&D Material Demand Board
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Browse buyer construction requisitions across Hyderabad. Match engine pairs active supply instantly.
          </p>
        </div>

        {(isBuyer || isAdmin) && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>{t("Post Demand")}</span>
          </button>
        )}
      </div>

      {/* Search & Filter */}
      <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by demand requirements, intended use, location…"
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <select
          value={selectedMaterial}
          onChange={e => setSelectedMaterial(e.target.value)}
          className="px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs text-stone-700 dark:text-stone-300"
        >
          <option value="All">All Materials</option>
          <option value="Clay Bricks">Clay Bricks</option>
          <option value="Recycled Concrete Aggregate (RCA)">RCA Aggregate</option>
          <option value="Fly Ash Bricks">Fly Ash Bricks</option>
          <option value="Granite & Stone Rubble">Stone Rubble</option>
          <option value="Rebar & Steel Sections">Steel Rebar</option>
        </select>
      </div>

      {/* Demand Cards List */}
      <div className="space-y-4">
        {filteredDemands.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3">
            <ClipboardList className="w-10 h-10 text-stone-400 mx-auto" />
            <h3 className="font-bold text-base text-stone-900 dark:text-stone-100">
              No Demands Found
            </h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              No construction demands currently posted. Post a demand to alert recovered material sellers.
            </p>
          </div>
        ) : (
          filteredDemands.map(d => {
            // Compute matches for this demand against published batches
            const matches = batches
              .filter(b => b.status === 'published')
              .map(b => evaluateMatch(b, d))
              .sort((a, b) => b.totalScore - a.totalScore);

            const topMatch = matches[0];

            return (
              <div
                key={d.id}
                className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-stone-900 dark:text-stone-100">
                        {d.title}
                      </h3>
                      {d.isSample && <SampleChip />}
                    </div>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 flex items-center gap-2">
                      <span className="font-medium text-stone-700 dark:text-stone-300">
                        Intended Use: {d.intendedUse}
                      </span>
                      <span>•</span>
                      <span>Delivery: {d.deliveryLocation.address}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-semibold">Min Trust Required:</span>
                    <TrustBadge level={d.requiredTrustLevel} />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-xl bg-stone-50 dark:bg-stone-950/60 border border-stone-200 dark:border-stone-800 text-xs">
                  <div>
                    <span className="text-[10px] text-stone-400 block">Quantity Needed</span>
                    <span className="font-bold font-mono text-stone-900 dark:text-stone-100">
                      {d.quantityNeeded.toLocaleString()} {d.unit}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 block">Target Budget</span>
                    <span className="font-bold font-mono text-stone-900 dark:text-stone-100">
                      Max ₹{d.maxBudgetPerUnit} / {d.unit}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 block">Required Window</span>
                    <span className="font-medium text-stone-700 dark:text-stone-300">
                      {d.neededFrom} to {d.neededUntil}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 block">Requisitioner</span>
                    <span className="font-medium text-stone-700 dark:text-stone-300">
                      {d.buyerName}
                    </span>
                  </div>
                </div>

                {/* Match Engine Results for this demand */}
                <div className="pt-2 border-t border-stone-100 dark:border-stone-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Engine Matched Batches ({matches.length})</span>
                    </span>
                    <a
                      href={`#/demands/${d.id}`}
                      className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                    >
                      View composite match builder →
                    </a>
                  </div>

                  {topMatch && topMatch.totalScore > 0 ? (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 gap-3">
                      <div className="flex items-center gap-3">
                        <MatchBandBadge band={topMatch.band} score={topMatch.totalScore} />
                        <div>
                          <p className="text-xs font-bold text-stone-900 dark:text-stone-100">
                            {topMatch.batchTitle}
                          </p>
                          <p className="text-[11px] text-stone-500">
                            Road distance: {topMatch.roadDistanceKm} km • Est. Savings: ₹{topMatch.netSaving.toLocaleString()} ({topMatch.savingPercent}%)
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setActiveWhyScoreMatch({ match: topMatch, batchMat: topMatch.batchTitle, demandMat: d.materialType })}
                          className="px-2.5 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 hover:bg-stone-100 text-[11px] font-semibold transition"
                        >
                          {t("Why this score")}
                        </button>
                        <a
                          href={`#/batches/${topMatch.batchId}`}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold shadow-xs transition"
                        >
                          View Batch
                        </a>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-stone-400 py-1 italic">
                      No compatible recovery batches currently published in this distance range.
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Post Demand Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl max-w-lg w-full shadow-2xl p-6 text-stone-900 dark:text-stone-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
              <h3 className="font-bold text-base">{t("Post Demand")}</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDemand} className="space-y-4 pt-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Requisition Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. 5,000 Bricks for Landscape Garden Steps"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Material Required *</label>
                  <select
                    value={materialType}
                    onChange={e => setMaterialType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                  >
                    <option value="Clay Bricks">Clay Bricks</option>
                    <option value="Concrete Blocks">Concrete Blocks</option>
                    <option value="Fly Ash Bricks">Fly Ash Bricks</option>
                    <option value="Recycled Concrete Aggregate (RCA)">RCA Aggregate</option>
                    <option value="Granite & Stone Rubble">Stone Rubble</option>
                    <option value="Rebar & Steel Sections">Steel Rebar</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Subtype Specification</label>
                  <input
                    type="text"
                    value={materialSubtype}
                    onChange={e => setMaterialSubtype(e.target.value)}
                    placeholder="e.g. Hand-moulded Red Clay"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Intended Construction Application *</label>
                <input
                  type="text"
                  required
                  value={intendedUse}
                  onChange={e => setIntendedUse(e.target.value)}
                  placeholder="e.g. Non-loadbearing boundary wall, road sub-base, or decorative pavement"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                />
                <span className="text-[10px] text-stone-400 mt-0.5 block">
                  Structural uses (beams, slabs, columns) will require L3 verified evidence.
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Quantity Needed *</label>
                  <input
                    type="number"
                    min="1"
                    value={quantityNeeded}
                    onChange={e => setQuantityNeeded(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Unit</label>
                  <select
                    value={unit}
                    onChange={e => setUnit(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                  >
                    <option value="Pieces">Pieces</option>
                    <option value="Tons">Tons</option>
                    <option value="Cubic Meters">Cubic Meters</option>
                    <option value="Sq.Ft">Sq.Ft</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Max Budget (₹/unit)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={maxBudget}
                    onChange={e => setMaxBudget(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Delivery Destination (Hyderabad)</label>
                <input
                  type="text"
                  required
                  value={deliveryAddress}
                  onChange={e => setDeliveryAddress(e.target.value)}
                  placeholder="e.g. Prakash Nagar, Begumpet, Hyderabad"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Min Required Trust Tier</label>
                  <select
                    value={requiredTrust}
                    onChange={e => setRequiredTrust(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                  >
                    <option value="L1">L1 Visual Record</option>
                    <option value="L2">L2 Evidence Verified</option>
                    <option value="L3">L3 Inspection Verified</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Project Deadline</label>
                  <input
                    type="date"
                    value={neededUntil}
                    onChange={e => setNeededUntil(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-2 rounded-xl text-stone-500 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-sm"
                >
                  {submitting ? 'Posting…' : 'Publish Requisition'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
