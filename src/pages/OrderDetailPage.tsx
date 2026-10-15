import React, { useState } from 'react';
import {
  ArrowLeft,
  Truck,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Unlock,
  Clock,
  RotateCcw,
  ExternalLink,
  Copy,
  Check,
  DollarSign,
  UserCheck
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTranslation, t } from '../i18n';
import { Order, OrderStatus } from '../types';
import { OrderTypeBadge, SimulatedChip, SampleChip } from '../components/Badge';

export const OrderDetailPage: React.FC<{ orderId: string }> = ({ orderId }) => {
  const { orders, batches, saveRecord } = useData();
  const { user, isBuyer, isSeller, isInspector, isAdmin } = useAuth();
  const { showSuccess, showError } = useToast();
  const { currentLanguage } = useTranslation();

  const [copiedDriverLink, setCopiedDriverLink] = useState(false);
  const [submittingAction, setSubmittingAction] = useState(false);

  // Delivery check state
  const [damagedQty, setDamagedQty] = useState<number>(0);
  const [selectedRemedy, setSelectedRemedy] = useState<'accept' | 'partial_refund' | 'replace' | 'return'>('accept');
  const [remedyNotes, setRemedyNotes] = useState('');

  // Inspector gate signoff state
  const [inspectorNotes, setInspectorNotes] = useState('');

  const order = orders.find(o => o.id === orderId);

  if (!order) {
    return (
      <div className="p-12 text-center bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 space-y-3">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
        <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">Order Not Found</h2>
        <a href="#/orders" className="inline-block px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold">
          Back to Orders
        </a>
      </div>
    );
  }

  const batch = batches.find(b => b.id === order.batchId);
  const isGateUnlocked = order.preDispatchGate.gateUnlocked;
  const driverUrl = `${window.location.origin}/#/d/${order.driverToken}`;

  const copyDriverLink = () => {
    navigator.clipboard.writeText(driverUrl);
    setCopiedDriverLink(true);
    setTimeout(() => setCopiedDriverLink(false), 2000);
  };

  // 1. Sign off Pre-Dispatch Inspection (Inspector/Admin)
  const handleUnlockGate = async () => {
    setSubmittingAction(true);
    const updated: Order = {
      ...order,
      preDispatchGate: {
        ...order.preDispatchGate,
        inspectionPassed: true,
        inspectorName: user?.name || 'Certified Inspector',
        inspectorNotes: inspectorNotes.trim() || 'Visual and grade inspection passed on-site.',
        gateUnlocked: true,
        unlockedAt: new Date().toISOString()
      }
    };

    const res = await saveRecord('orders', updated);
    setSubmittingAction(false);
    if (res.success) {
      showSuccess('Pre-dispatch gate unlocked! Seller may now dispatch the truck.');
    } else {
      showError(res.error || 'Failed to unlock gate.');
    }
  };

  // 2. Dispatch Order (Seller)
  const handleDispatchOrder = async () => {
    if (!isGateUnlocked) {
      showError('Dispatch is blocked! Pre-dispatch gate must be unlocked first.');
      return;
    }

    setSubmittingAction(true);
    const updated: Order = {
      ...order,
      status: 'dispatched',
      driverInfo: {
        ...order.driverInfo,
        tripStatus: 'in_transit'
      }
    };

    const res = await saveRecord('orders', updated);
    if (res.success) {
      // Append inventory dispatched event
      await saveRecord('events', {
        id: `evt-disp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        batchId: order.batchId,
        orderId: order.id,
        eventType: 'dispatched',
        quantity: order.quantity,
        unit: order.unit,
        source: 'manual',
        actorId: user?.id || 'seller',
        actorName: user?.name || 'Seller',
        notes: `Dispatched under Order #${order.id}. Truck in transit.`,
        timestamp: new Date().toISOString()
      });

      showSuccess('Order marked as dispatched! Truck driver link is active.');
    } else {
      showError(res.error || 'Failed to dispatch order.');
    }
    setSubmittingAction(false);
  };

  // 3. Mark Delivered (Buyer or Driver)
  const handleMarkDelivered = async () => {
    setSubmittingAction(true);
    const updated: Order = {
      ...order,
      status: 'delivered',
      driverInfo: {
        ...order.driverInfo,
        tripStatus: 'delivered'
      },
      deliveryCheck: {
        ...order.deliveryCheck,
        deadlineAt: new Date(Date.now() + 48 * 3600000).toISOString()
      }
    };

    const res = await saveRecord('orders', updated);
    if (res.success) {
      showSuccess('Marked as delivered! 48-hour buyer delivery check countdown started.');
    } else {
      showError(res.error || 'Failed to update status.');
    }
    setSubmittingAction(false);
  };

  // 4. Submit Delivery Check (Buyer)
  const handleSubmitDeliveryCheck = async () => {
    const damaged = Math.min(order.quantity, Math.max(0, Number(damagedQty) || 0));
    const accepted = order.quantity - damaged;
    const damagePercent = Math.round((damaged / order.quantity) * 100);

    let remedy = selectedRemedy;
    // Auto remedy rules:
    // damage <= 10%: Accept
    // damage > 10% and <= 30%: Partial refund or replace
    // damage > 30%: Return / full refund allowed
    let refundAmount = 0;
    if (remedy === 'partial_refund') {
      refundAmount = Math.round((damaged / order.quantity) * order.totalMaterialCost);
    } else if (remedy === 'return') {
      refundAmount = order.totalMaterialCost;
    }

    setSubmittingAction(true);
    const updated: Order = {
      ...order,
      status: 'delivery_checked',
      paymentStatus: remedy === 'accept' ? 'ESCROW_RELEASED_SIMULATED' : 'REFUNDED_SIMULATED',
      deliveryCheck: {
        checked: true,
        checkedAt: new Date().toISOString(),
        deadlineAt: order.deliveryCheck.deadlineAt,
        acceptedQuantity: accepted,
        damagedQuantity: damaged,
        damagePercent,
        remedy,
        remedyNotes: remedyNotes.trim(),
        refundAmount
      }
    };

    const res = await saveRecord('orders', updated);
    if (res.success) {
      // Record confirmation event in ledger
      await saveRecord('events', {
        id: `evt-recv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        batchId: order.batchId,
        orderId: order.id,
        eventType: 'received_confirmed',
        quantity: accepted,
        unit: order.unit,
        source: 'manual',
        actorId: user?.id || 'buyer',
        actorName: user?.name || 'Buyer',
        notes: `Delivery check completed: ${accepted} accepted, ${damaged} damaged (${damagePercent}%). Remedy: ${remedy}`,
        timestamp: new Date().toISOString()
      });

      if (damaged > 0) {
        await saveRecord('events', {
          id: `evt-dmg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          batchId: order.batchId,
          orderId: order.id,
          eventType: 'damaged',
          quantity: damaged,
          unit: order.unit,
          source: 'manual',
          actorId: user?.id || 'buyer',
          actorName: user?.name || 'Buyer',
          notes: `Damaged quantity reported upon delivery check: ${damaged} ${order.unit}`,
          timestamp: new Date().toISOString()
        });
      }

      showSuccess('Delivery check submitted successfully! Remedy recorded.');
    } else {
      showError(res.error || 'Failed to submit delivery check.');
    }
    setSubmittingAction(false);
  };

  const steps: Array<{ key: OrderStatus; label: string }> = [
    { key: 'requested', label: 'Requested' },
    { key: 'accepted', label: 'Accepted' },
    { key: 'pre_dispatch_cleared', label: 'Pre-Dispatch Gate' },
    { key: 'dispatched', label: 'Dispatched' },
    { key: 'delivered', label: 'Delivered' },
    { key: 'delivery_checked', label: 'Delivery Check' },
    { key: 'closed', label: 'Closed' }
  ];

  const getStepStatus = (stepKey: OrderStatus) => {
    const orderStatusOrder = [
      'requested',
      'accepted',
      'inspection_pending',
      'inspection_completed',
      'pre_dispatch_cleared',
      'dispatched',
      'delivered',
      'delivery_checked',
      'closed'
    ];
    const currentIndex = orderStatusOrder.indexOf(order.status);
    const stepIndex = orderStatusOrder.indexOf(stepKey);

    if (stepIndex <= currentIndex) return 'completed';
    if (stepIndex === currentIndex + 1) return 'current';
    return 'upcoming';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Top Header */}
      <div className="space-y-2">
        <a
          href="#/orders"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Orders</span>
        </a>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <OrderTypeBadge type={order.orderType} />
              <h1 className="text-2xl font-extrabold text-stone-900 dark:text-stone-100">
                Order #{order.id}
              </h1>
              {order.isSample && <SampleChip />}
            </div>
            <p className="text-xs text-stone-500 mt-1">
              {batch?.title} • {order.quantity} {order.unit}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <SimulatedChip label="SIMULATED ESCROW" />
          </div>
        </div>
      </div>

      {/* Lifecycle Progress Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
        <div className="flex items-center justify-between overflow-x-auto gap-2 py-2">
          {['Accepted', 'Gate Unlocked', 'Dispatched', 'Delivered', 'Remedy Check'].map((name, i) => {
            const isDone =
              (i === 0 && order.status !== 'requested') ||
              (i === 1 && isGateUnlocked) ||
              (i === 2 && ['dispatched', 'delivered', 'delivery_checked', 'closed'].includes(order.status)) ||
              (i === 3 && ['delivered', 'delivery_checked', 'closed'].includes(order.status)) ||
              (i === 4 && ['delivery_checked', 'closed'].includes(order.status));

            return (
              <div key={name} className="flex items-center gap-2 shrink-0">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                    isDone
                      ? 'bg-emerald-600 text-white'
                      : 'bg-stone-200 dark:bg-stone-800 text-stone-500'
                  }`}
                >
                  {isDone ? '✓' : i + 1}
                </div>
                <span className={`text-xs font-semibold ${isDone ? 'text-stone-900 dark:text-stone-100' : 'text-stone-400'}`}>
                  {name}
                </span>
                {i < 4 && <span className="text-stone-300 dark:text-stone-700 px-1">―</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Commercial Summary Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
          <span className="text-[10px] font-bold uppercase text-stone-400">Material Cost</span>
          <p className="text-xl font-extrabold font-mono text-stone-900 dark:text-stone-100 mt-1">
            ₹{order.totalMaterialCost.toLocaleString()}
          </p>
          <span className="text-[11px] text-stone-500">
            {order.quantity} {order.unit} @ ₹{order.unitPrice}/{order.unit}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
          <span className="text-[10px] font-bold uppercase text-stone-400">Simulated Logistics</span>
          <p className="text-xl font-extrabold font-mono text-stone-900 dark:text-stone-100 mt-1">
            ₹{order.simulatedLogisticsCost.toLocaleString()}
          </p>
          <span className="text-[11px] text-stone-500">Haulage estimate</span>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/80">
          <span className="text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-400">
            Escrow Status (Simulated)
          </span>
          <p className="text-xl font-extrabold font-mono text-emerald-800 dark:text-emerald-300 mt-1">
            {order.paymentStatus.replace('_SIMULATED', '')}
          </p>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400">
            ₹{order.simulatedEscrowTotal.toLocaleString()} held safely
          </span>
        </div>
      </div>

      {/* Pre-Dispatch Gate Section (Milestone M6) */}
      <section className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-4 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-2">
            {isGateUnlocked ? (
              <Unlock className="w-5 h-5 text-emerald-600" />
            ) : (
              <Lock className="w-5 h-5 text-amber-600" />
            )}
            <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
              {t("Pre-dispatch Gate")}: {isGateUnlocked ? t("Gate Unlocked") : t("Gate Locked")}
            </h2>
          </div>
          <span className={`px-2.5 py-0.5 rounded text-xs font-bold uppercase ${
            isGateUnlocked ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
          }`}>
            {isGateUnlocked ? 'Cleared for Dispatch' : 'Dispatch Blocked'}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-950/60 border border-stone-200 dark:border-stone-800 text-xs space-y-2">
          <p className="text-stone-600 dark:text-stone-300">
            {isGateUnlocked
              ? 'All pre-dispatch verification requirements have been satisfied. Truck loading and dispatch is authorized.'
              : order.orderType === 'B'
              ? 'This is an Inspect-First (Type B) order. Dispatch is strictly blocked until an empanelled Civil Inspector or Admin completes physical verification on-site.'
              : 'This is a Test-Required (Type C) order. Dispatch is blocked until accredited lab reports are verified.'}
          </p>

          {order.preDispatchGate.inspectorName && (
            <div className="pt-2 border-t border-stone-200 dark:border-stone-800 text-[11px] text-stone-500">
              <strong>Inspector Signoff:</strong> {order.preDispatchGate.inspectorName} ({order.preDispatchGate.inspectorNotes})
            </div>
          )}
        </div>

        {/* Action: Inspector sign off */}
        {!isGateUnlocked && (isInspector || isAdmin) && (
          <div className="p-4 rounded-xl border border-purple-200 dark:border-purple-900/60 bg-purple-50/50 dark:bg-purple-950/30 space-y-3 text-xs">
            <span className="font-bold text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4" />
              <span>Inspector Gate Clearance</span>
            </span>
            <input
              type="text"
              value={inspectorNotes}
              onChange={e => setInspectorNotes(e.target.value)}
              placeholder="Enter on-site inspection observations (e.g. Bricks stacked, sound edges, mortar easily brushed off)…"
              className="w-full px-3 py-2 rounded-xl border border-purple-300 dark:border-purple-800 bg-white dark:bg-stone-800 text-xs"
            />
            <button
              onClick={handleUnlockGate}
              disabled={submittingAction}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-sm transition"
            >
              Sign & Unlock Pre-Dispatch Gate
            </button>
          </div>
        )}

        {/* Action: Seller Dispatch */}
        {isGateUnlocked && order.status === 'accepted' && (
          <div className="flex justify-end pt-2">
            <button
              onClick={handleDispatchOrder}
              disabled={submittingAction}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition"
            >
              <Truck className="w-4 h-4" />
              <span>Dispatch Truck Now</span>
            </button>
          </div>
        )}
      </section>

      {/* Driver Tracking Link Section (Milestone M9) */}
      <section className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-purple-600" />
            <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">
              Live Truck Driver Tracking Link
            </h3>
          </div>
          <span className="text-[10px] text-stone-400">No login required for driver</span>
        </div>

        <p className="text-xs text-stone-500 leading-relaxed">
          Share this unique driver link with the transport operator. The driver can tap "Start trip", update live GPS pings, and confirm delivery:
        </p>

        <div className="flex items-center gap-2 bg-stone-50 dark:bg-stone-800 p-2 rounded-xl border border-stone-200 dark:border-stone-700">
          <input
            type="text"
            readOnly
            value={driverUrl}
            className="flex-1 bg-transparent text-xs text-stone-700 dark:text-stone-300 font-mono outline-hidden truncate"
          />
          <button
            onClick={copyDriverLink}
            className="p-1.5 rounded-lg bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 text-xs text-stone-700 dark:text-stone-200 flex items-center gap-1 font-semibold"
          >
            {copiedDriverLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedDriverLink ? 'Copied' : 'Copy'}</span>
          </button>
          <a
            href={driverUrl}
            target="_blank"
            rel="noreferrer"
            className="p-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open</span>
          </a>
        </div>

        {order.status === 'dispatched' && (
          <div className="pt-2 flex justify-end">
            <button
              onClick={handleMarkDelivered}
              disabled={submittingAction}
              className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-100 text-xs font-semibold"
            >
              Simulate: Mark Delivered (Start 48h Check)
            </button>
          </div>
        )}
      </section>

      {/* 48-Hour Delivery Check & Remedies (Milestone M7) */}
      <section className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
              {t("Delivery Check")} (48-Hour Protection Window)
            </h2>
          </div>
          <span className={`px-2 py-0.5 rounded text-xs font-bold ${
            order.deliveryCheck.checked ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
          }`}>
            {order.deliveryCheck.checked ? 'Check Verified' : 'Check Pending'}
          </span>
        </div>

        {order.deliveryCheck.checked ? (
          <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs space-y-2">
            <p className="font-bold text-emerald-900 dark:text-emerald-200">
              Delivery check recorded on {new Date(order.deliveryCheck.checkedAt!).toLocaleString()}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-stone-700 dark:text-stone-300">
              <div>Accepted Qty: <strong>{order.deliveryCheck.acceptedQuantity} {order.unit}</strong></div>
              <div>Damaged Qty: <strong>{order.deliveryCheck.damagedQuantity} {order.unit}</strong></div>
              <div>Damage Rate: <strong>{order.deliveryCheck.damagePercent}%</strong></div>
              <div>Selected Remedy: <strong className="uppercase">{order.deliveryCheck.remedy}</strong></div>
            </div>
            {order.deliveryCheck.refundAmount! > 0 && (
              <p className="font-semibold text-emerald-800 dark:text-emerald-300 pt-1">
                Simulated Refund Released to Buyer: ₹{order.deliveryCheck.refundAmount?.toLocaleString()}
              </p>
            )}
            {order.deliveryCheck.remedyNotes && (
              <p className="text-stone-500 italic mt-1">"{order.deliveryCheck.remedyNotes}"</p>
            )}
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            <p className="text-stone-600 dark:text-stone-400">
              {t("Buyer has 48 hours from delivery to confirm condition.")} Damage tolerance is 10%. Over 30% allows rejection or full return.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-1">
                  Report Damaged / Broken Quantity ({order.unit})
                </label>
                <input
                  type="number"
                  min="0"
                  max={order.quantity}
                  value={damagedQty}
                  onChange={e => setDamagedQty(Math.min(order.quantity, Math.max(0, parseInt(e.target.value) || 0)))}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                />
                <span className="text-[10px] text-stone-400 mt-0.5 block">
                  Damage: {Math.round(((Number(damagedQty) || 0) / order.quantity) * 100)}%
                </span>
              </div>

              <div>
                <label className="block font-semibold mb-1">Select Remedy</label>
                <select
                  value={selectedRemedy}
                  onChange={e => setSelectedRemedy(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                >
                  <option value="accept">Accept Delivery (Within tolerance)</option>
                  <option value="partial_refund">Partial Refund (Simulated escrow credit)</option>
                  <option value="replace">Request Seller Replacement</option>
                  <option value="return">Reject & Return (Full simulated refund)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1">Inspection Notes</label>
              <textarea
                rows={2}
                value={remedyNotes}
                onChange={e => setRemedyNotes(e.target.value)}
                placeholder="e.g. Unloaded into courtyard. 50 bricks damaged in corner stack due to transit bumps."
                className="w-full p-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleSubmitDeliveryCheck}
                disabled={submittingAction}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition"
              >
                Submit Delivery Verification
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
