import React, { useState } from 'react';
import { X, CheckCircle, ChevronRight, Layers, ShieldCheck, ShoppingCart, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { t } from '../i18n';

interface OnboardingModalProps {
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ onClose }) => {
  const { user } = useAuth();
  const [step, setStep] = useState(0);

  const role = user?.role || 'both';

  const sellerSteps = [
    {
      title: '1. Photograph & List Materials',
      desc: 'Snap 1 to 6 photos of demolished or salvaged material on-site. AI analyzes visual condition, while you confirm specifications and location in Hyderabad.',
      icon: Layers
    },
    {
      title: '2. Build Your Trust Score (L1 → L2 → L3)',
      desc: 'Attach salvage permits or dimensional checks to hit L2 Evidence Verified. L3 Inspection Verified provides buyer guarantees with zero dispute liability.',
      icon: ShieldCheck
    },
    {
      title: '3. Receive Orders & Instant Escrow',
      desc: 'When a matched buyer creates an order, payment is secured in simulated escrow and released immediately upon delivery check completion.',
      icon: ShoppingCart
    }
  ];

  const buyerSteps = [
    {
      title: '1. Browse Batches or Post Demands',
      desc: 'Search salvaged brick, concrete aggregate, or steel across Hyderabad, or post your site requirements to trigger automated matching.',
      icon: Layers
    },
    {
      title: '2. Review Match Feasibility (0 to 100)',
      desc: 'Our deterministic engine checks compatibility, road distance (Haversine × 1.3), timing, and net rupee savings with complete mathematical transparency.',
      icon: Sparkles
    },
    {
      title: '3. Buyer Protection & 48-Hour Inspection',
      desc: 'Select Inspect-First (Type B) or Test-Required (Type C). After delivery, take up to 48 hours to confirm quality, partial refund, or return.',
      icon: ShieldCheck
    }
  ];

  const steps = role === 'seller' ? sellerSteps : buyerSteps;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl max-w-lg w-full shadow-2xl p-6 text-stone-900 dark:text-stone-100 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Welcome to BuildLoop AI
            </span>
            <h3 className="font-bold text-base">Quick 3-Step Guide</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Step Content */}
        <div className="my-6">
          <div className="flex items-center gap-2 mb-4">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-all ${
                  i === step ? 'bg-emerald-600' : i < step ? 'bg-emerald-300 dark:bg-emerald-800' : 'bg-stone-200 dark:bg-stone-800'
                }`}
              />
            ))}
          </div>

          <div className="p-4 rounded-xl bg-stone-50 dark:bg-stone-950/60 border border-stone-200 dark:border-stone-800">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
              {React.createElement(steps[step].icon, { className: 'w-5 h-5' })}
            </div>
            <h4 className="font-bold text-base text-stone-900 dark:text-stone-100">
              {steps[step].title}
            </h4>
            <p className="text-xs text-stone-600 dark:text-stone-400 mt-2 leading-relaxed">
              {steps[step].desc}
            </p>
          </div>
        </div>

        {/* Footer controls */}
        <div className="flex items-center justify-between pt-3 border-t border-stone-200 dark:border-stone-800">
          <button
            onClick={onClose}
            className="text-xs font-medium text-stone-500 hover:text-stone-800 dark:hover:text-stone-200"
          >
            Skip guide
          </button>

          <div className="flex items-center gap-2">
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 text-xs font-semibold hover:bg-stone-100 dark:hover:bg-stone-800"
              >
                Back
              </button>
            )}
            {step < steps.length - 1 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="flex items-center gap-1 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="flex items-center gap-1 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Get Started</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
