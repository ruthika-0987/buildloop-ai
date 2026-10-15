import React, { useState } from 'react';
import {
  ArrowLeft,
  QrCode,
  ShieldCheck,
  MapPin,
  Calendar,
  FileText,
  Clock,
  ShoppingCart,
  Award,
  AlertTriangle,
  Microscope,
  Radio,
  CheckCircle2,
  HelpCircle,
  Eye,
  Check,
  UserCheck
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTranslation, t } from '../i18n';
import { Batch, OrderType, Order } from '../types';
import { computeStock, validateReservation } from '../engine/ledger';
import { TrustBadge, OrderTypeBadge, SampleChip, SimulatedChip, DemoThresholdChip } from '../components/Badge';
import { MapViewer } from '../components/MapViewer';
import { QrModal } from '../components/QrModal';

export const BatchDetailPage: React.FC<{ batchId: string }> = ({ batchId }) => {
  const { batches, events, testReports, sensor_readings, saveRecord } = useData();
  const { user, isBuyer, isInspector, isAdmin } = useAuth();
  const { showSuccess, showError } = useToast();
  const { currentLanguage } = useTranslation();

  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showInspectionModal, setShowInspectionModal] = useState(false);

  // Order modal state
  const [orderQty, setOrderQty] = useState<number>(100);
  const [orderType, setOrderType] = useState<OrderType>('B');
  const [creatingOrder, setCreatingOrder] = useState(false);

  // Inspection modal state
  const [inspectorNotes, setInspectorNotes] = useState('');
  const [certifying, setCertifying] = useState(false);

  const batch = batches.find(b => b.id === batchId);

  if (!batch) {
    return (
      <div className="p-12 text-center bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-3">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
        <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">Batch Not Found</h2>
        <p className="text-xs text-stone-500">The batch ID #{batchId} does not exist or has been removed.</p>
        <a href="#/batches" className="inline-block px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold">
          Back to Batches
        </a>
      </div>
    );
  }

  // Calculate stock from append-only events
  const batchEvents = events.filter(e => e.batchId === batch.id);
  const stock = computeStock(batchEvents);

  // Relevant test reports & IoT readings
  const batchTests = testReports.filter(tr => tr.batchId === batch.id);
  const batchSensors = sensor_readings.filter(sr => sr.batchId === batch.id);

  // TrustLoop Evidence Checklist: Seen, Claimed, Verified, Unknown
  const facts = [
    {
      label: 'Visual Condition & Surface Mortar',
      value: `${batch.condition} (${batch.visibleMortar || 'Standard'})`,
      state: batch.photos.length > 0 ? 'seen' : 'unknown',
      source: batch.photos.length > 0 ? 'Verified in site photos' : 'No photos available'
    },
    {
      label: 'Quantity & Stock Count',
      value: `${batch.quantity} ${batch.unit}`,
      state: stock.eventCount > 0 ? 'verified' : 'claimed',
      source: `Ledger tracked across ${stock.eventCount} immutable events`
    },
    {
      label: 'Recovery Location Coordinates',
      value: batch.location.address,
      state: batch.location.lat && batch.location.lng ? 'verified' : 'claimed',
      source: `Pinned at (${batch.location.lat.toFixed(4)}, ${batch.location.lng.toFixed(4)})`
    },
    {
      label: 'Lawful Salvage Title',
      value: batch.lawfulDeclarationAccepted ? 'Declared Under Penalty of Perjury' : 'Unconfirmed',
      state: batch.lawfulDeclarationAccepted ? 'claimed' : 'unknown',
      source: 'Seller sworn declaration'
    },
    {
      label: 'Lab Documentation / Test Reports',
      value: batch.documents.length > 0 ? `${batch.documents.length} verified documents` : 'No lab documents attached',
      state: batch.documents.length > 0 ? 'verified' : 'unknown',
      source: batch.documents.map(d => d.name).join(', ') || 'Awaiting lab testing'
    },
    {
      label: 'Third-Party Civil Inspection',
      value: batch.trustLevel === 'L3' ? 'Empanelled Inspector Verified' : 'Pending site inspection',
      state: batch.trustLevel === 'L3' ? 'verified' : 'unknown',
      source: batch.trustLevel === 'L3' ? 'Certified by Civil Engineer' : 'Requires L3 inspection form'
    }
  ];

  // What is missing to reach next trust level?
  let nextLevelRequirement = '';
  if (batch.trustLevel === 'L1') {
    nextLevelRequirement = 'To reach L2 Evidence Verified: Readiness must be >= 70% and attach at least 1 verified lab document or dimensional measurement.';
  } else if (batch.trustLevel === 'L2') {
    nextLevelRequirement = 'To reach L3 Inspection Verified: An empanelled Civil Inspector must conduct an on-site physical inspection.';
  } else {
    nextLevelRequirement = 'Maximum trust level reached! Certified L3 Inspection Verified.';
  }

  // Handle Order creation
  const handleCreateOrder = async () => {
    const requested = Number(orderQty) || 1;
    const reservationCheck = validateReservation(batchEvents, requested);
    if (!reservationCheck.allowed) {
      showError(reservationCheck.reason || 'Reservation failed.', 'Please adjust order quantity.');
      return;
    }

    setCreatingOrder(true);
    const orderId = `ord-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const driverToken = `drv-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const totalMaterial = requested * batch.pricePerUnit;
    const estLogistics = Math.round(requested * 0.08 * 12); // sample 12km haulage
    const escrowTotal = totalMaterial + estLogistics;

    const newOrder: Order = {
      id: orderId,
      batchId: batch.id,
      sellerId: batch.sellerId,
      sellerName: batch.sellerName,
      buyerId: user?.id || 'guest_buyer',
      buyerName: user?.name || 'Site Contractor',
      driverToken,
      orderType,
      quantity: requested,
      unit: batch.unit,
      unitPrice: batch.pricePerUnit,
      totalMaterialCost: totalMaterial,
      simulatedLogisticsCost: estLogistics,
      simulatedEscrowTotal: escrowTotal,
      status: 'accepted',
      paymentStatus: 'ESCROW_HELD_SIMULATED',
      preDispatchGate: {
        evidenceCheckPassed: batch.trustLevel === 'L2' || batch.trustLevel === 'L3',
        inspectionPassed: orderType === 'A' || batch.trustLevel === 'L3',
        gateUnlocked: orderType === 'A' || batch.trustLevel === 'L3'
      },
      driverInfo: {
        name: 'Assigned Driver (Hyderabad Haulage)',
        phone: '+91 98490 00000',
        vehicleNumber: 'TS 09 UA 9988',
        tripStatus: 'not_started'
      },
      deliveryCheck: {
        checked: false,
        deadlineAt: new Date(Date.now() + 48 * 3600000).toISOString(),
        acceptedQuantity: 0,
        damagedQuantity: 0,
        damagePercent: 0,
        remedy: null
      },
      created_at: new Date().toISOString()
    };

    const res = await saveRecord('orders', newOrder);
    if (res.success) {
      // Append reservation event to ledger
      await saveRecord('events', {
        id: `evt-res-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        batchId: batch.id,
        orderId,
        eventType: 'reserved',
        quantity: requested,
        unit: batch.unit,
        source: 'manual',
        actorId: user?.id || 'buyer',
        actorName: user?.name || 'Buyer',
        notes: `Simulated escrow reservation for Order #${orderId}`,
        timestamp: new Date().toISOString()
      });

      showSuccess('Order created! Escrow held in simulation.');
      setShowOrderModal(false);
      window.location.hash = `#/orders/${orderId}`;
    } else {
      showError(res.error || 'Failed to place order.');
    }
    setCreatingOrder(false);
  };

  // Handle L3 Inspection certification (Inspector/Admin only)
  const handleAwardL3 = async () => {
    if (!inspectorNotes.trim()) {
      showError('Please enter inspection observation notes.');
      return;
    }
    setCertifying(true);
    const updatedBatch: Batch = {
      ...batch,
      trustLevel: 'L3',
      readinessScore: 100
    };

    const res = await saveRecord('batches', updatedBatch);
    if (res.success) {
      await saveRecord('events', {
        id: `evt-insp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        batchId: batch.id,
        eventType: 'stock_correction',
        quantity: 0,
        unit: batch.unit,
        source: 'manual',
        actorId: user!.id,
        actorName: user!.name,
        notes: `L3 Inspection Certified: ${inspectorNotes.trim()}`,
        timestamp: new Date().toISOString()
      });

      showSuccess('Awarded L3 Inspection Verified to this batch!');
      setShowInspectionModal(false);
    } else {
      showError(res.error || 'Failed to update trust level.');
    }
    setCertifying(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Back button & Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <a
            href="#/batches"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Batches</span>
          </a>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100">
            {batch.title}
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-stone-400" />
            <span>{batch.location.address}</span>
            <span>•</span>
            <span>Listed by: <strong>{batch.sellerName}</strong></span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowQrModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs font-semibold hover:bg-stone-100 dark:hover:bg-stone-700 transition"
          >
            <QrCode className="w-4 h-4 text-emerald-600" />
            <span>Batch Passport</span>
          </button>

          {(isInspector || isAdmin) && batch.trustLevel !== 'L3' && (
            <button
              onClick={() => setShowInspectionModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-sm transition"
            >
              <UserCheck className="w-4 h-4" />
              <span>Certify L3</span>
            </button>
          )}

          {isBuyer && stock.availableStock > 0 && (
            <button
              onClick={() => setShowOrderModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-900/20 transition"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Order Material</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Gallery + Key Commercials */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Photo Gallery (2 Cols) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="relative aspect-16/10 rounded-2xl overflow-hidden bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-sm">
            {batch.photos && batch.photos.length > 0 ? (
              <img
                src={batch.photos[activePhotoIdx] || batch.photos[0]}
                alt={batch.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-stone-400 text-xs">
                No site photos uploaded
              </div>
            )}
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <TrustBadge level={batch.trustLevel} size="md" />
              {batch.isSample && <SampleChip />}
            </div>
            <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-xs text-white px-3 py-1 rounded-xl text-sm font-bold">
              ₹{batch.pricePerUnit} / {batch.unit}
            </div>
          </div>

          {batch.photos && batch.photos.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {batch.photos.map((p, i) => (
                <button
                  key={i}
                  onClick={() => setActivePhotoIdx(i)}
                  className={`w-20 h-14 rounded-lg overflow-hidden border-2 transition shrink-0 ${
                    activePhotoIdx === i ? 'border-emerald-500 scale-102' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={p} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Commercial & Stock Panel (1 Col) */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-5 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="pb-3 border-b border-stone-100 dark:border-stone-800">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                Live Inventory Status
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-stone-900 dark:text-stone-100 font-mono">
                  {stock.availableStock.toLocaleString()}
                </span>
                <span className="text-stone-500 text-sm font-medium">{batch.unit} Available</span>
              </div>
              <p className="text-[11px] text-stone-500 mt-1">
                Total recovered: {stock.totalRecovered} • Reserved: {stock.reserved} • Delivered: {stock.delivered}
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-stone-100 dark:border-stone-800">
                <span className="text-stone-500">Material Type:</span>
                <span className="font-semibold text-stone-900 dark:text-stone-100">{batch.materialType}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-100 dark:border-stone-800">
                <span className="text-stone-500">Subtype / Grade:</span>
                <span className="font-semibold text-stone-900 dark:text-stone-100">{batch.materialSubtype}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-100 dark:border-stone-800">
                <span className="text-stone-500">Physical Condition:</span>
                <span className="font-semibold text-stone-900 dark:text-stone-100">{batch.condition}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-100 dark:border-stone-800">
                <span className="text-stone-500">New Equivalent Price:</span>
                <span className="font-semibold text-stone-500 line-through">
                  ₹{batch.originalNewPrice || Math.round(batch.pricePerUnit * 1.8)} / {batch.unit}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-100 dark:border-stone-800">
                <span className="text-stone-500">Estimated Savings:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  ~{Math.round(((batch.originalNewPrice || batch.pricePerUnit * 1.8) - batch.pricePerUnit) / (batch.originalNewPrice || batch.pricePerUnit * 1.8) * 100)}% Cheaper
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-stone-500">Readiness Score:</span>
                <span className="font-bold font-mono text-emerald-600">{batch.readinessScore}/100</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-stone-100 dark:border-stone-800">
            {isBuyer && (
              <button
                onClick={() => setShowOrderModal(true)}
                disabled={stock.availableStock <= 0}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-emerald-900/20 transition flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>{stock.availableStock > 0 ? 'Place Order (Simulated Escrow)' : 'Batch Fully Reserved'}</span>
              </button>
            )}
            <p className="text-[10px] text-stone-400 text-center mt-2">
              Buyer protected with 48h delivery inspection window.
            </p>
          </div>
        </div>
      </div>

      {/* TrustLoop: Evidence Checklist (Seen, Claimed, Verified, Unknown) */}
      <section className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
                TrustLoop Fact Verification
              </h2>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Every material claim is audited against physical evidence: <strong>seen, claimed, verified, or unknown</strong>.
            </p>
          </div>
          <TrustBadge level={batch.trustLevel} />
        </div>

        {/* Fact Rows */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {facts.map(f => {
            const stateColors = {
              seen: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300',
              verified: 'bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300',
              claimed: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300',
              unknown: 'bg-stone-100 text-stone-600 border-stone-200 dark:bg-stone-800 dark:text-stone-400'
            };

            return (
              <div
                key={f.label}
                className="p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950/40 text-xs flex items-start justify-between gap-3"
              >
                <div>
                  <span className="font-semibold text-stone-900 dark:text-stone-100 block">
                    {f.label}
                  </span>
                  <p className="text-stone-700 dark:text-stone-300 mt-0.5 font-medium">{f.value}</p>
                  <span className="text-[10px] text-stone-400 mt-1 block italic">{f.source}</span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded uppercase font-bold text-[10px] shrink-0 border ${
                    stateColors[f.state as keyof typeof stateColors]
                  }`}
                >
                  {f.state}
                </span>
              </div>
            );
          })}
        </div>

        {/* Next level path */}
        <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-2.5">
          <HelpCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <p>{nextLevelRequirement}</p>
        </div>
      </section>

      {/* Recovery Intelligence & IS 3495 Lab Tests */}
      {batchTests.length > 0 && (
        <section className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
            <div className="flex items-center gap-2">
              <Microscope className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
                IS 3495 Reference Test Reports
              </h2>
            </div>
            <DemoThresholdChip />
          </div>

          <div className="space-y-3">
            {batchTests.map(t => (
              <div key={t.id} className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-900 dark:text-stone-100">{t.standard}</span>
                  <span className="text-stone-400">Tested on: {t.testDate}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-stone-600 dark:text-stone-300">
                  <div>Compressive Strength: <strong>{t.compressiveStrengthMpa} MPa</strong></div>
                  <div>Water Absorption: <strong>{t.waterAbsorptionPercent}%</strong></div>
                  <div>Efflorescence: <strong>{t.efflorescence}</strong></div>
                  <div>Wilson 95% Bound: <strong>{t.wilson95UpperBound}%</strong></div>
                </div>
                <div className="pt-2 border-t border-stone-100 dark:border-stone-800 text-emerald-600 dark:text-emerald-400 font-medium">
                  Verdict: {t.verdict}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* IoT Live Telemetry (if attached) */}
      {batchSensors.length > 0 && (
        <section className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
            <div className="flex items-center gap-2">
              <Radio className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
                Real-Time IoT Sensor Telemetry
              </h2>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
              Live Feed
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {batchSensors.slice(0, 4).map(s => (
              <div key={s.id} className="p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950/60">
                <div className="text-[10px] text-stone-400">{s.deviceId}</div>
                <div className="mt-1 font-bold text-stone-900 dark:text-stone-100">
                  Moisture: {s.moisturePercent}%
                </div>
                <div className="text-stone-500 text-[11px]">
                  Vibration: {s.vibrationG}G • Tilt: {s.tiltDegrees}°
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Location Map */}
      <section className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 space-y-3">
        <h2 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-emerald-600" />
          <span>Salvage Recovery Site Location</span>
        </h2>
        <MapViewer
          markers={[
            {
              id: batch.id,
              lat: batch.location.lat,
              lng: batch.location.lng,
              title: batch.title,
              subtitle: batch.location.address,
              type: 'batch'
            }
          ]}
          center={[batch.location.lat, batch.location.lng]}
          zoom={13}
          height="300px"
        />
      </section>

      {/* Milestone M4: Inventory Ledger Event History */}
      <section className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
          <div>
            <h2 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-stone-500" />
              <span>Immutable Inventory Ledger</span>
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Append-only audit trail. Single function <code>computeStock</code> calculates balances.
            </p>
          </div>
          <span className="text-xs font-mono text-stone-400">
            {batchEvents.length} events logged
          </span>
        </div>

        <div className="space-y-2">
          {batchEvents.length === 0 ? (
            <p className="text-xs text-stone-400 py-3 text-center">No ledger events recorded yet.</p>
          ) : (
            batchEvents.map(e => (
              <div
                key={e.id}
                className="p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950/60 text-xs flex items-start justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider text-[10px] bg-stone-200 dark:bg-stone-800 px-1.5 py-0.5 rounded">
                      {e.eventType.replace('_', ' ')}
                    </span>
                    <span className="font-semibold text-stone-700 dark:text-stone-300">
                      {e.quantity} {e.unit}
                    </span>
                    <span className="text-[10px] text-stone-400">via {e.source}</span>
                  </div>
                  {e.notes && <p className="text-stone-600 dark:text-stone-400 mt-1">{e.notes}</p>}
                </div>
                <div className="text-right text-[10px] text-stone-400 shrink-0">
                  <span>{new Date(e.timestamp).toLocaleDateString()}</span>
                  <div className="font-medium text-stone-500">{e.actorName}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* QR Modal */}
      {showQrModal && <QrModal batch={batch} onClose={() => setShowQrModal(false)} />}

      {/* Order Creation Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl max-w-md w-full shadow-2xl p-6 text-stone-900 dark:text-stone-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
              <h3 className="font-bold text-base">Create Order with Protection</h3>
              <SimulatedChip />
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Order Quantity ({batch.unit})</label>
                <input
                  type="number"
                  min="1"
                  max={stock.availableStock}
                  value={orderQty}
                  onChange={e => setOrderQty(Math.min(stock.availableStock, Math.max(1, parseInt(e.target.value) || 1)))}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm"
                />
                <span className="text-[10px] text-stone-400 mt-0.5 block">
                  Available right now: {stock.availableStock} {batch.unit}
                </span>
              </div>

              <div>
                <label className="block font-semibold mb-1">Transaction Type & Protection</label>
                <div className="space-y-2">
                  <label className="flex items-start gap-2 p-2 rounded-lg border border-stone-200 dark:border-stone-800 cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-800">
                    <input
                      type="radio"
                      name="orderType"
                      checked={orderType === 'A'}
                      onChange={() => setOrderType('A')}
                      className="mt-0.5 text-emerald-600"
                    />
                    <div>
                      <span className="font-bold">{t("Type A: Standard")}</span>
                      <p className="text-[11px] text-stone-500">{t("Direct dispatch with 48h delivery remedy protection.")}</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-2 p-2 rounded-lg border border-stone-200 dark:border-stone-800 cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-800">
                    <input
                      type="radio"
                      name="orderType"
                      checked={orderType === 'B'}
                      onChange={() => setOrderType('B')}
                      className="mt-0.5 text-emerald-600"
                    />
                    <div>
                      <span className="font-bold">{t("Type B: Inspect-first")}</span>
                      <p className="text-[11px] text-stone-500">{t("On-site visual verification required before truck dispatch.")}</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-2 p-2 rounded-lg border border-stone-200 dark:border-stone-800 cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-800">
                    <input
                      type="radio"
                      name="orderType"
                      checked={orderType === 'C'}
                      onChange={() => setOrderType('C')}
                      className="mt-0.5 text-emerald-600"
                    />
                    <div>
                      <span className="font-bold">{t("Type C: Test-required")}</span>
                      <p className="text-[11px] text-stone-500">{t("Mandatory laboratory crush or sieve test report required.")}</p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-950/60 border border-stone-200 dark:border-stone-800 space-y-1">
                <div className="flex justify-between">
                  <span>Material Cost:</span>
                  <span className="font-mono font-bold">₹{(orderQty * batch.pricePerUnit).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-stone-500">
                  <span>Simulated Logistics:</span>
                  <span className="font-mono">₹{Math.round(orderQty * 0.08 * 12).toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-1 border-t font-bold text-stone-900 dark:text-stone-100">
                  <span>Simulated Escrow Total:</span>
                  <span className="font-mono text-emerald-600">
                    ₹{(orderQty * batch.pricePerUnit + Math.round(orderQty * 0.08 * 12)).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200 dark:border-stone-800">
              <button
                onClick={() => setShowOrderModal(false)}
                className="px-3 py-2 rounded-xl text-stone-500 text-xs font-semibold hover:bg-stone-100 dark:hover:bg-stone-800"
              >
                Cancel
              </button>
              <button
                disabled={creatingOrder}
                onClick={handleCreateOrder}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm"
              >
                {creatingOrder ? 'Reserving…' : 'Confirm & Hold Escrow'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* L3 Inspection Certification Modal (Inspector/Admin only) */}
      {showInspectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl max-w-md w-full shadow-2xl p-6 text-stone-900 dark:text-stone-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-base">Certify L3 Inspection Verified</h3>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-stone-600 dark:text-stone-400">
                As an empanelled Civil Inspector / Admin, you are certifying that you have conducted on-site physical inspection of this batch in Hyderabad.
              </p>
              <div>
                <label className="block font-semibold mb-1">Inspector Notes & Lab Findings *</label>
                <textarea
                  rows={3}
                  value={inspectorNotes}
                  onChange={e => setInspectorNotes(e.target.value)}
                  placeholder="e.g. Visual and rebound hammer inspection on-site: 100% sound edges, no oil/paint contamination, verified mortar separation."
                  className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200 dark:border-stone-800">
              <button
                onClick={() => setShowInspectionModal(false)}
                className="px-3 py-2 rounded-xl text-stone-500 text-xs font-semibold hover:bg-stone-100 dark:hover:bg-stone-800"
              >
                Cancel
              </button>
              <button
                disabled={certifying || !inspectorNotes.trim()}
                onClick={handleAwardL3}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold shadow-sm"
              >
                {certifying ? 'Certifying…' : 'Award L3 Verified'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
