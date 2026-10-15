import React, { useState } from 'react';
import {
  Microscope,
  Calculator,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Plus,
  FileText,
  Percent,
  Split
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTranslation, t } from '../i18n';
import { calculateWilson95UpperBound, validateSubBatches } from '../engine/stats';
import { TestReport } from '../types';
import { DemoThresholdChip } from '../components/Badge';

export const RecoveryIntelPage: React.FC = () => {
  const { testReports, batches, saveRecord } = useData();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const { currentLanguage } = useTranslation();

  // Wilson calculator interactive state
  const [calcSamples, setCalcSamples] = useState<number>(5);
  const [calcFailures, setCalcFailures] = useState<number>(1);
  const liveWilson = calculateWilson95UpperBound(calcFailures, calcSamples);

  // Sub-batch division tool state
  const [selectedBatchId, setSelectedBatchId] = useState<string>(batches[0]?.id || '');
  const [subBatches, setSubBatches] = useState<Array<{ id: string; name: string; quantity: number }>>([
    { id: 'sub-1', name: 'Grade A Intact', quantity: 8000 },
    { id: 'sub-2', name: 'Grade B Chipped', quantity: 4000 }
  ]);

  const activeBatch = batches.find(b => b.id === selectedBatchId) || batches[0];
  const subBatchValidation = activeBatch
    ? validateSubBatches(activeBatch.quantity, subBatches)
    : { valid: true, totalSubQuantity: 0, difference: 0 };

  // New Test Report modal / entry
  const [showTestModal, setShowTestModal] = useState(false);
  const [compressiveStrength, setCompressiveStrength] = useState<number>(8.5);
  const [waterAbsorption, setWaterAbsorption] = useState<number>(14.0);
  const [efflorescence, setEfflorescence] = useState<'Nil' | 'Slight' | 'Moderate' | 'Heavy'>('Slight');
  const [testSamples, setTestSamples] = useState<number>(10);
  const [testFailures, setTestFailures] = useState<number>(1);
  const [submittingTest, setSubmittingTest] = useState(false);

  const handleCreateTestReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBatch) return;

    setSubmittingTest(true);
    const reportId = `test-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const wilson = calculateWilson95UpperBound(testFailures, testSamples);

    let verdict = 'Compliant for non-loadbearing and exterior paving (IS 3495 Class 7.5)';
    if (compressiveStrength < 5.0) {
      verdict = 'Downgrade recommended: Unsuitable for structural walls. Best for landscaping aggregate.';
    }

    const newReport: TestReport = {
      id: reportId,
      batchId: activeBatch.id,
      standard: 'IS 3495 (Parts 1-4) / DEMO Reference',
      isDemoThresholds: true,
      testDate: new Date().toISOString().slice(0, 10),
      labName: 'Hyderabad Civil Test Wing (Sample)',
      compressiveStrengthMpa: compressiveStrength,
      waterAbsorptionPercent: waterAbsorption,
      efflorescence,
      sampleSize: testSamples,
      failedCount: testFailures,
      wilson95UpperBound: wilson,
      verdict,
      created_at: new Date().toISOString()
    };

    const res = await saveRecord('testReports', newReport);
    setSubmittingTest(false);
    if (res.success) {
      showSuccess('Test report registered with Wilson 95% bound calculation!');
      setShowTestModal(false);
    } else {
      showError(res.error || 'Failed to register test report.');
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Quality Assurance • Milestone M8
          </span>
          <h1 className="text-2xl font-extrabold text-stone-900 dark:text-stone-100">
            Recovery Intelligence & IS 3495 Standards
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Statistical failure bounds, physical crush test logging, and sub-batch division algorithms.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <DemoThresholdChip />
          <button
            onClick={() => setShowTestModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Enter Test Report</span>
          </button>
        </div>
      </div>

      {/* 2 Key Intelligence Tools: Wilson Failure Calculator + Sub-Batch Division */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tool 1: Wilson 95% Failure Bound Calculator */}
        <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-indigo-600" />
              <h2 className="font-bold text-base text-stone-900 dark:text-stone-100">
                {t("Wilson 95% Failure Bound")}
              </h2>
            </div>
            <span className="text-[10px] text-stone-400 font-mono">Statistical Confidence</span>
          </div>

          <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
            Standard percentage (1 of 5 = 20%) is dangerously deceptive with small sample sizes. The Wilson 95% upper bound shows the true worst-case statistical risk:
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-stone-600 dark:text-stone-400 mb-1">
                Sample Size Tested (n)
              </label>
              <input
                type="number"
                min="1"
                max="500"
                value={calcSamples}
                onChange={e => setCalcSamples(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-stone-600 dark:text-stone-400 mb-1">
                Failed Samples (k)
              </label>
              <input
                type="number"
                min="0"
                max={calcSamples}
                value={calcFailures}
                onChange={e => setCalcFailures(Math.min(calcSamples, Math.max(0, parseInt(e.target.value) || 0)))}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-sm font-mono"
              />
            </div>
          </div>

          {/* Result Banner */}
          <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 block">
                Wilson 95% Upper Bound
              </span>
              <p className="text-2xl font-black font-mono text-indigo-900 dark:text-indigo-100 mt-0.5">
                {liveWilson}%
              </p>
              <span className="text-[10px] text-stone-500">
                Simple ratio: {Math.round((calcFailures / calcSamples) * 100)}% ({calcFailures} of {calcSamples})
              </span>
            </div>
            <div className="text-right text-[11px] text-stone-500 max-w-[160px]">
              For example, 1 of 5 failure rate gives ~<strong>62.1%</strong> upper risk bound.
            </div>
          </div>
        </div>

        {/* Tool 2: Sub-Batch Division Algorithm */}
        <div className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
            <div className="flex items-center gap-2">
              <Split className="w-5 h-5 text-emerald-600" />
              <h2 className="font-bold text-base text-stone-900 dark:text-stone-100">
                {t("Sub-batch Division")}
              </h2>
            </div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              subBatchValidation.valid ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
            }`}>
              {subBatchValidation.valid ? 'Sum Validated' : 'Sum Mismatch'}
            </span>
          </div>

          <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
            Divide a parent batch into multiple graded sub-batches. The inventory ledger enforces that sub-batches exactly sum to the parent quantity.
          </p>

          {activeBatch && (
            <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-950/60 border border-stone-200 dark:border-stone-800 text-xs flex justify-between items-center">
              <div>
                <span className="font-semibold text-stone-900 dark:text-stone-100">{activeBatch.title}</span>
                <span className="text-[10px] text-stone-400 block mt-0.5">Batch ID: {activeBatch.id}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-stone-400 block">Parent Quantity</span>
                <span className="font-bold font-mono text-emerald-600">{activeBatch.quantity} {activeBatch.unit}</span>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {subBatches.map((sub, i) => (
              <div key={sub.id} className="flex gap-2">
                <input
                  type="text"
                  value={sub.name}
                  onChange={e => {
                    const next = [...subBatches];
                    next[i].name = e.target.value;
                    setSubBatches(next);
                  }}
                  className="flex-1 px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs"
                />
                <input
                  type="number"
                  value={sub.quantity}
                  onChange={e => {
                    const next = [...subBatches];
                    next[i].quantity = parseInt(e.target.value) || 0;
                    setSubBatches(next);
                  }}
                  className="w-28 px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs font-mono"
                />
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-950/60 border border-stone-200 dark:border-stone-800 text-xs flex justify-between items-center">
            <span>Total Sub-Batch Sum:</span>
            <span className={`font-mono font-bold ${subBatchValidation.valid ? 'text-emerald-600' : 'text-red-600'}`}>
              {subBatchValidation.totalSubQuantity} / {activeBatch?.quantity} {activeBatch?.unit}
            </span>
          </div>
        </div>
      </div>

      {/* IS 3495 Specification Reference & Pathways */}
      <section className="p-6 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
          <h2 className="font-bold text-base text-stone-900 dark:text-stone-100">
            {t("Reuse Pathways")} & Material Grading Thresholds
          </h2>
          <DemoThresholdChip />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-2">
            <span className="font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider text-[10px]">
              Pathway 1: Direct Reuse
            </span>
            <h3 className="font-bold text-stone-900 dark:text-stone-100">Compressive Strength ≥ 7.5 MPa</h3>
            <p className="text-stone-600 dark:text-stone-400 text-[11px] leading-relaxed">
              Acceptable for non-loadbearing exterior boundary walls, garden dividers, and courtyard pavements without modification.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-800/80 bg-blue-50/40 dark:bg-blue-950/20 space-y-2">
            <span className="font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider text-[10px]">
              Pathway 2: Further Assessment
            </span>
            <h3 className="font-bold text-stone-900 dark:text-stone-100">Strength 5.0 – 7.4 MPa</h3>
            <p className="text-stone-600 dark:text-stone-400 text-[11px] leading-relaxed">
              Requires third-party rebound hammer verification and water absorption limit testing before structural clearance.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-800/80 bg-amber-50/40 dark:bg-amber-950/20 space-y-2">
            <span className="font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider text-[10px]">
              Pathway 3: Downgraded Listing
            </span>
            <h3 className="font-bold text-stone-900 dark:text-stone-100">Strength 3.5 – 4.9 MPa</h3>
            <p className="text-stone-600 dark:text-stone-400 text-[11px] leading-relaxed">
              Downgraded automatically to non-structural landscape rubble, ornamental terracing, or sound insulation fill.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-purple-200 dark:border-purple-800/80 bg-purple-50/40 dark:bg-purple-950/20 space-y-2">
            <span className="font-bold text-purple-800 dark:text-purple-300 uppercase tracking-wider text-[10px]">
              Pathway 4: Hub Recycling
            </span>
            <h3 className="font-bold text-stone-900 dark:text-stone-100">Strength &lt; 3.5 MPa</h3>
            <p className="text-stone-600 dark:text-stone-400 text-[11px] leading-relaxed">
              Routed to GHMC centralized C&D crushing plants (Jeedimetla / Fathullaguda) for conversion into graded RCA aggregate.
            </p>
          </div>
        </div>
      </section>

      {/* Modal: Enter Test Report */}
      {showTestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl max-w-md w-full shadow-2xl p-6 text-stone-900 dark:text-stone-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
              <div className="flex items-center gap-2">
                <Microscope className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base">Enter Physical Test Report</h3>
              </div>
              <DemoThresholdChip />
            </div>

            <form onSubmit={handleCreateTestReport} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Target Recovery Batch</label>
                <select
                  value={selectedBatchId}
                  onChange={e => setSelectedBatchId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                >
                  {batches.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.title} ({b.id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Compressive Strength (MPa)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={compressiveStrength}
                    onChange={e => setCompressiveStrength(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Water Absorption (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={waterAbsorption}
                    onChange={e => setWaterAbsorption(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Sample Size (n)</label>
                  <input
                    type="number"
                    min="1"
                    value={testSamples}
                    onChange={e => setTestSamples(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Failed Count (k)</label>
                  <input
                    type="number"
                    min="0"
                    value={testFailures}
                    onChange={e => setTestFailures(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Efflorescence Rating</label>
                <select
                  value={efflorescence}
                  onChange={e => setEfflorescence(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800"
                >
                  <option value="Nil">Nil</option>
                  <option value="Slight">Slight (Acceptable)</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Heavy">Heavy (Reject)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setShowTestModal(false)}
                  className="px-3 py-2 rounded-xl text-stone-500 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingTest}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-sm"
                >
                  {submittingTest ? 'Recording…' : 'Record Test Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
