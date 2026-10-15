import React, { useState } from 'react';
import {
  ShoppingCart,
  ShieldCheck,
  Truck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Lock,
  Unlock,
  RefreshCw
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useTranslation, t } from '../i18n';
import { OrderTypeBadge, SimulatedChip, SampleChip } from '../components/Badge';

export const OrdersPage: React.FC = () => {
  const { orders, batches } = useData();
  const { user, isBuyer, isSeller, isAdmin } = useAuth();
  const { currentLanguage } = useTranslation();

  const [activeTab, setActiveTab] = useState<'all' | 'buyer' | 'seller'>('all');

  const visibleOrders = orders.filter(o => {
    if (activeTab === 'buyer') return o.buyerId === user?.id;
    if (activeTab === 'seller') return o.sellerId === user?.id;
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Transactions & Buyer Protection • Milestones M6 & M7
          </span>
          <h1 className="text-2xl font-extrabold text-stone-900 dark:text-stone-100">
            Material Orders & Escrow
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Standard (A), Inspect-First (B), and Test-Required (C) orders with pre-dispatch gates and 48h remedy protection.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <SimulatedChip label="SIMULATED ESCROW" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200 dark:border-stone-800 text-xs font-semibold gap-6">
        <button
          onClick={() => setActiveTab('all')}
          className={`pb-2 transition border-b-2 -mb-px ${
            activeTab === 'all'
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          All Orders ({orders.length})
        </button>
        {user && (
          <>
            <button
              onClick={() => setActiveTab('buyer')}
              className={`pb-2 transition border-b-2 -mb-px ${
                activeTab === 'buyer'
                  ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              My Purchases ({orders.filter(o => o.buyerId === user.id).length})
            </button>
            <button
              onClick={() => setActiveTab('seller')}
              className={`pb-2 transition border-b-2 -mb-px ${
                activeTab === 'seller'
                  ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              My Sales ({orders.filter(o => o.sellerId === user.id).length})
            </button>
          </>
        )}
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {visibleOrders.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3">
            <ShoppingCart className="w-10 h-10 text-stone-400 mx-auto" />
            <h3 className="font-bold text-base text-stone-900 dark:text-stone-100">
              No Orders Found
            </h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              You haven't placed or received any material orders yet. Browse available batches to start an order.
            </p>
            <a
              href="#/batches"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold text-xs shadow-sm"
            >
              <span>Browse Batches</span>
            </a>
          </div>
        ) : (
          visibleOrders.map(ord => {
            const batch = batches.find(b => b.id === ord.batchId);
            const isGateUnlocked = ord.preDispatchGate.gateUnlocked;

            return (
              <div
                key={ord.id}
                className="p-5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <OrderTypeBadge type={ord.orderType} />
                      <h3 className="font-bold text-base text-stone-900 dark:text-stone-100">
                        Order #{ord.id}
                      </h3>
                      {ord.isSample && <SampleChip />}
                    </div>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                      Material: <strong>{batch?.title || 'Recovered Material Batch'}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                      ord.status === 'delivered' || ord.status === 'closed'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : ord.status === 'dispatched'
                        ? 'bg-purple-50 text-purple-800 border-purple-300 animate-pulse'
                        : 'bg-amber-50 text-amber-800 border-amber-300'
                    }`}>
                      {ord.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Key Numbers Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-xl bg-stone-50 dark:bg-stone-950/60 border border-stone-200 dark:border-stone-800 text-xs">
                  <div>
                    <span className="text-[10px] text-stone-400 block">Quantity</span>
                    <span className="font-bold font-mono text-stone-900 dark:text-stone-100">
                      {ord.quantity.toLocaleString()} {ord.unit}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 block">Material Cost</span>
                    <span className="font-bold font-mono text-stone-900 dark:text-stone-100">
                      ₹{ord.totalMaterialCost.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 block">Simulated Escrow Total</span>
                    <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">
                      ₹{ord.simulatedEscrowTotal.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400 block">Parties</span>
                    <span className="font-medium text-stone-700 dark:text-stone-300">
                      {ord.buyerName} → {ord.sellerName}
                    </span>
                  </div>
                </div>

                {/* Gate & Driver Tracking Summary */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800 gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    {isGateUnlocked ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                        <Unlock className="w-3.5 h-3.5" />
                        <span>Pre-dispatch Gate Unlocked</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Pre-dispatch Gate Locked ({ord.orderType === 'B' ? 'Awaiting Inspection' : 'Awaiting Test Report'})</span>
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Audio Status for Uneducated Users */}
                    <button
                      onClick={() => {
                        const { speakText } = require('../lib/speech') || {};
                        const msg =
                          currentLanguage === 'te'
                            ? `ఆర్డర్ నంబర్ ${ord.id}. స్థితి: ${ord.status}. మొత్తం ఖర్చు: రూపాయలు ${ord.totalMaterialCost.toLocaleString()}. కొనుగోలుదారు రక్షణ క్రియాశీలంగా ఉంది.`
                            : currentLanguage === 'hi'
                            ? `ऑर्डर संख्या ${ord.id}. स्थिति: ${ord.status}. कुल लागत: रुपये ${ord.totalMaterialCost.toLocaleString()}। क्रेता सुरक्षा सक्रिय है।`
                            : `Order #${ord.id}. Status: ${ord.status}. Total material cost: Rs ${ord.totalMaterialCost.toLocaleString()}. Buyer protection escrow active.`;
                        if (typeof window !== 'undefined') {
                          import('../lib/speech').then(s => s.speakText(msg, currentLanguage));
                        }
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-semibold text-xs hover:bg-amber-100 hover:text-amber-900 transition flex items-center gap-1"
                      title="Listen Order Details / వినండి"
                    >
                      <span>🔊</span>
                      <span>{currentLanguage === 'te' ? 'వినండి' : currentLanguage === 'hi' ? 'सुनें' : 'Listen'}</span>
                    </button>

                    <a
                      href={`#/d/${ord.driverToken}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-stone-500 hover:text-stone-900 dark:hover:text-stone-200 inline-flex items-center gap-1 font-medium"
                    >
                      <Truck className="w-3.5 h-3.5 text-purple-600" />
                      <span>Driver View</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>

                    <a
                      href={`#/orders/${ord.id}`}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shadow-xs"
                    >
                      Manage Order & Remedies →
                    </a>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
