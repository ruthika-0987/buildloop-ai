import React, { useState, useMemo } from 'react';
import { Search, Filter, Map, Grid, Plus, Layers, MapPin, Tag } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useTranslation, t } from '../i18n';
import { TrustBadge, SampleChip } from '../components/Badge';
import { MapViewer, MapMarker } from '../components/MapViewer';

export const BatchListPage: React.FC = () => {
  const { batches } = useData();
  const { user, isSeller, isAdmin } = useAuth();
  const { currentLanguage } = useTranslation();

  const [search, setSearch] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState('All');
  const [selectedTrust, setSelectedTrust] = useState('All');
  const [selectedCondition, setSelectedCondition] = useState('All');
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc' | 'readiness'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  const filteredBatches = useMemo(() => {
    return batches
      .filter(b => {
        if (search) {
          const q = search.toLowerCase();
          const matchTitle = b.title.toLowerCase().includes(q);
          const matchMat = b.materialType.toLowerCase().includes(q);
          const matchLoc = b.location.address.toLowerCase().includes(q);
          if (!matchTitle && !matchMat && !matchLoc) return false;
        }
        if (selectedMaterial !== 'All' && b.materialType !== selectedMaterial) return false;
        if (selectedTrust !== 'All' && b.trustLevel !== selectedTrust) return false;
        if (selectedCondition !== 'All' && b.condition !== selectedCondition) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price_asc') return a.pricePerUnit - b.pricePerUnit;
        if (sortBy === 'price_desc') return b.pricePerUnit - a.pricePerUnit;
        if (sortBy === 'readiness') return b.readinessScore - a.readinessScore;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [batches, search, selectedMaterial, selectedTrust, selectedCondition, sortBy]);

  const mapMarkers: MapMarker[] = useMemo(() => {
    return filteredBatches.map(b => ({
      id: b.id,
      lat: b.location.lat,
      lng: b.location.lng,
      title: b.title,
      subtitle: `${b.quantity} ${b.unit} • ₹${b.pricePerUnit}/${b.unit}`,
      type: 'batch'
    }));
  }, [filteredBatches]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Supply Directory
          </span>
          <h1 className="text-2xl font-extrabold text-stone-900 dark:text-stone-100">
            Recovered C&D Material Batches
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Browse verified materials recovered from demolition and salvage sites in Hyderabad.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center bg-stone-100 dark:bg-stone-800 p-1 rounded-xl border border-stone-200 dark:border-stone-700">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
              aria-label="Grid view"
            >
              <Grid className="w-4 h-4" />
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                viewMode === 'map'
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
              aria-label="Map view"
            >
              <Map className="w-4 h-4" />
              <span className="hidden sm:inline">Map</span>
            </button>
          </div>

          {(isSeller || isAdmin) && (
            <a
              href="#/batches/new"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>{t("List a Batch")}</span>
            </a>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by material, locality (e.g. Jubilee Hills, Begumpet)…"
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
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

            <select
              value={selectedTrust}
              onChange={e => setSelectedTrust(e.target.value)}
              className="px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs text-stone-700 dark:text-stone-300"
            >
              <option value="All">All Trust Tiers</option>
              <option value="L1">L1 Visual</option>
              <option value="L2">L2 Evidence Verified</option>
              <option value="L3">L3 Inspection Verified</option>
            </select>

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs text-stone-700 dark:text-stone-300"
            >
              <option value="newest">Sort: Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="readiness">Readiness Score</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content: Map or Grid */}
      {viewMode === 'map' ? (
        <div className="space-y-4">
          <MapViewer markers={mapMarkers} height="480px" />
          <p className="text-xs text-stone-500 text-center">
            Showing {filteredBatches.length} recovery batches plotted across Hyderabad. Tap any pin for details.
          </p>
        </div>
      ) : (
        <>
          {filteredBatches.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3">
              <Layers className="w-10 h-10 text-stone-400 mx-auto" />
              <h3 className="font-bold text-base text-stone-900 dark:text-stone-100">
                {t("No items found")}
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                No material batches match your filter criteria. Try clearing search filters or add a new recovery listing.
              </p>
              {(isSeller || isAdmin) && (
                <a
                  href="#/batches/new"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold text-xs shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>List First Batch</span>
                </a>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBatches.map(b => (
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
                      {b.isSample && <SampleChip />}
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

                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-stone-600 dark:text-stone-300 bg-stone-50 dark:bg-stone-950/60 p-2 rounded-lg">
                        <div>
                          <span className="text-[10px] text-stone-400 block">Available</span>
                          <span className="font-bold font-mono">
                            {b.quantity.toLocaleString()} {b.unit}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-stone-400 block">Readiness</span>
                          <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">
                            {b.readinessScore}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                      <span className="text-[11px] text-stone-400">Seller: {b.sellerName}</span>
                      <a
                        href={`#/batches/${b.id}`}
                        className="px-3 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-emerald-600 hover:text-white text-xs font-semibold transition"
                      >
                        {t("View Details")}
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
