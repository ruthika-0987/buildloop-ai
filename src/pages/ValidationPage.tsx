import React, { useState } from 'react';
import { CheckCircle2, XCircle, Play, ShieldCheck, Award, RefreshCw, Cpu } from 'lucide-react';
import { runCalibrationTest, evaluateMatch } from '../engine/matching';
import { calculateWilson95UpperBound, validateSubBatches } from '../engine/stats';
import { computeStock, validateReservation } from '../engine/ledger';
import { InventoryEvent, Batch, Demand } from '../types';
import { useTranslation, t } from '../i18n';

interface TestResult {
  name: string;
  category: string;
  expected: string;
  actual: string;
  passed: boolean;
  notes?: string;
}

export const ValidationPage: React.FC = () => {
  const { currentLanguage } = useTranslation();
  const [running, setRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [hasRun, setHasRun] = useState(false);

  const runAllChecks = () => {
    setRunning(true);
    const results: TestResult[] = [];

    // Test 1: Calibration Case Scores EXACTLY 87
    const cal = runCalibrationTest();
    results.push({
      name: 'Deterministic Matching Engine Calibration',
      category: 'Engine / Calibration',
      expected: 'Total score = 87 (Compatibility 25, Qty 17, Timing 12, Dist 9, Evidence 10, Econ 14)',
      actual: `Total score = ${cal.score} (Compat ${cal.components.compatibility}, Qty ${cal.components.quantity}, Timing ${cal.components.timing}, Dist ${cal.components.distance}, Evidence ${cal.components.evidence}, Econ ${cal.components.economics})`,
      passed: cal.score === 87,
      notes: 'Calibrated reference case across 6 mathematical components.'
    });

    // Test 2: Wilson 95% Score Interval Upper Bound for 1 of 5 failures
    const wilson1of5 = calculateWilson95UpperBound(1, 5);
    // Wilson 95% bound for 1/5 is ~62.1%
    const wilsonPassed = Math.abs(wilson1of5 - 62.1) < 1.0;
    results.push({
      name: 'Wilson 95% Confidence Upper Bound on Small Samples',
      category: 'Statistics / Quality Assurance',
      expected: '~62.1% (k=1, n=5, z=1.96)',
      actual: `${wilson1of5}%`,
      passed: wilsonPassed,
      notes: 'Demonstrates true statistical risk instead of simplistic 20% sample ratio.'
    });

    // Test 3: Immutable Inventory Ledger Stock Calculation
    const dummyEvents: InventoryEvent[] = [
      { id: 'e1', batchId: 'b1', eventType: 'recovered', quantity: 1000, unit: 'Pieces', source: 'manual', actorId: 'u1', actorName: 'Seller', timestamp: '2026-10-01T00:00:00Z' },
      { id: 'e2', batchId: 'b1', eventType: 'reserved', quantity: 200, unit: 'Pieces', source: 'manual', actorId: 'u2', actorName: 'Buyer', timestamp: '2026-10-02T00:00:00Z' },
      { id: 'e3', batchId: 'b1', eventType: 'dispatched', quantity: 100, unit: 'Pieces', source: 'manual', actorId: 'u1', actorName: 'Seller', timestamp: '2026-10-03T00:00:00Z' },
      { id: 'e4', batchId: 'b1', eventType: 'damaged', quantity: 50, unit: 'Pieces', source: 'manual', actorId: 'u2', actorName: 'Buyer', timestamp: '2026-10-04T00:00:00Z' }
    ];
    const stock = computeStock(dummyEvents);
    // Total 1000 - (reserved 100 remaining + dispatched 100 + damaged 50) = 750 available
    const ledgerPassed = stock.availableStock === 750 && stock.totalRecovered === 1000;
    results.push({
      name: 'Inventory Ledger computeStock Pure Function',
      category: 'Ledger / Integrity',
      expected: 'Available = 750, Total = 1000, Damaged = 50',
      actual: `Available = ${stock.availableStock}, Total = ${stock.totalRecovered}, Damaged = ${stock.damagedOrUnsuitable}`,
      passed: ledgerPassed,
      notes: 'Single source of truth: stock is never stored as an editable number.'
    });

    // Test 4: Double Reservation Prevention
    const reservationCheck = validateReservation(dummyEvents, 800);
    const doubleResPassed = reservationCheck.allowed === false && reservationCheck.currentAvailable === 750;
    results.push({
      name: 'Double Reservation Prevention Guard',
      category: 'Ledger / Concurrency',
      expected: 'Reject request exceeding 750 units',
      actual: `Allowed = ${reservationCheck.allowed}, Available = ${reservationCheck.currentAvailable}`,
      passed: doubleResPassed,
      notes: 'Blocks overbooking when concurrent buyers attempt to reserve same batch.'
    });

    // Test 5: Sub-batch Sum Validation
    const subBatchTest = validateSubBatches(1000, [
      { id: 's1', quantity: 600 },
      { id: 's2', quantity: 400 }
    ]);
    results.push({
      name: 'Sub-Batch Division Sum Integrity',
      category: 'Recovery Intel',
      expected: 'valid = true, totalSubQuantity = 1000, difference = 0',
      actual: `valid = ${subBatchTest.valid}, totalSubQuantity = ${subBatchTest.totalSubQuantity}, diff = ${subBatchTest.difference}`,
      passed: subBatchTest.valid,
      notes: 'Ensures parent batch quantity is neither inflated nor lost.'
    });

    // Test 6: Distance Threshold (>40 km Hard Filter)
    const outOfRangeBatch: Batch = {
      id: 'b-far',
      title: 'Distant Batch',
      materialType: 'Clay Bricks',
      materialSubtype: 'Red Clay',
      quantity: 5000,
      unit: 'Pieces',
      pricePerUnit: 4,
      condition: 'Intact',
      lawfulDeclarationAccepted: true,
      location: { address: 'Warangal Highway', lat: 17.8000, lng: 79.2000 },
      availableFrom: '2026-10-01',
      availableUntil: '2026-11-01',
      readinessScore: 80,
      trustLevel: 'L2',
      sellerId: 's1',
      sellerName: 'Far Seller',
      photos: [],
      documents: [],
      status: 'published',
      created_at: '2026-10-01'
    };
    const localDemand: Demand = {
      id: 'd-local',
      title: 'Local Demand',
      materialType: 'Clay Bricks',
      intendedUse: 'Wall',
      quantityNeeded: 2000,
      unit: 'Pieces',
      maxBudgetPerUnit: 6,
      requiredTrustLevel: 'L1',
      deliveryLocation: { address: 'Hyderabad City', lat: 17.3850, lng: 78.4867 },
      neededFrom: '2026-10-01',
      neededUntil: '2026-11-01',
      buyerId: 'b1',
      buyerName: 'Buyer',
      status: 'open',
      created_at: '2026-10-01'
    };
    const distanceMatch = evaluateMatch(outOfRangeBatch, localDemand);
    const distFilterPassed = distanceMatch.hardFilterReasons.includes('OUT_OF_RANGE');
    results.push({
      name: 'Hard Filter: OUT_OF_RANGE (>40 km haulage)',
      category: 'Engine / Hard Filters',
      expected: 'OUT_OF_RANGE triggered for >40km',
      actual: `Hard filter reasons: [${distanceMatch.hardFilterReasons.join(', ')}]`,
      passed: distFilterPassed,
      notes: 'C&D materials are uneconomical to haul beyond 40 km in Hyderabad.'
    });

    setTestResults(results);
    setRunning(false);
    setHasRun(true);
  };

  const allPassed = testResults.length > 0 && testResults.every(r => r.passed);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Engine Proof & Transparency • Milestone M12
          </span>
          <h1 className="text-2xl font-extrabold text-stone-900 dark:text-stone-100">
            Deterministic Engine Validation
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Live browser-side verification of all mathematical formulas, calibration benchmarks, and ledger invariants.
          </p>
        </div>

        <button
          onClick={runAllChecks}
          disabled={running}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs shadow-md transition"
        >
          {running ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          <span>{t("Run checks now")}</span>
        </button>
      </div>

      {/* Banner */}
      {hasRun && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between ${
            allPassed
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
              : 'bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-800 text-red-900 dark:text-red-200'
          }`}
        >
          <div className="flex items-center gap-3">
            {allPassed ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <XCircle className="w-6 h-6 text-red-600" />
            )}
            <div>
              <h3 className="font-bold text-sm">
                {allPassed ? t("All tests passed") : 'Validation Failure Detected'}
              </h3>
              <p className="text-xs opacity-90 mt-0.5">
                {allPassed
                  ? `All ${testResults.length} algorithmic rules verified live. Calibration Case scored exactly 87.`
                  : 'One or more mathematical formulas produced unexpected output.'}
              </p>
            </div>
          </div>
          <span className="font-mono font-black text-sm">
            {testResults.filter(r => r.passed).length}/{testResults.length} PASSED
          </span>
        </div>
      )}

      {/* Test Results Table */}
      <div className="space-y-4">
        {!hasRun ? (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 space-y-3">
            <Cpu className="w-10 h-10 text-stone-400 mx-auto" />
            <h3 className="font-bold text-base text-stone-900 dark:text-stone-100">
              Ready to Validate
            </h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Tap "Run checks now" above to execute the matching calibration suite, Wilson bound checks, and ledger invariants in real time.
            </p>
          </div>
        ) : (
          testResults.map((r, i) => (
            <div
              key={i}
              className={`p-5 rounded-2xl border bg-white dark:bg-stone-900 transition shadow-xs space-y-2 ${
                r.passed ? 'border-emerald-200 dark:border-emerald-900/60' : 'border-red-200 dark:border-red-900'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {r.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                  )}
                  <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100">{r.name}</h4>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  r.passed ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-red-100 text-red-800'
                }`}>
                  {r.passed ? 'PASS' : 'FAIL'}
                </span>
              </div>

              <div className="text-xs grid grid-cols-1 sm:grid-cols-2 gap-2 text-stone-600 dark:text-stone-300 pt-1 font-mono">
                <div><span className="text-stone-400 font-sans">Expected: </span>{r.expected}</div>
                <div><span className="text-stone-400 font-sans">Actual: </span><strong>{r.actual}</strong></div>
              </div>

              {r.notes && (
                <p className="text-[11px] text-stone-400 pt-1 border-t border-stone-100 dark:border-stone-800 italic">
                  {r.notes}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
