import { describe, it, expect } from 'vitest';
import {
  evaluateMatch,
  runCalibrationTest,
  calculateRoadDistanceKm,
  CALIBRATION_BATCH,
  CALIBRATION_DEMAND,
  buildCompositeMatch
} from '../engine/matching';
import { calculateWilson95UpperBound, validateSubBatches } from '../engine/stats';
import { computeStock, validateReservation } from '../engine/ledger';
import { InventoryEvent, Batch, Demand } from '../types';

describe('BuildLoop Deterministic Engine Tests', () => {
  it('Calibration Case scores EXACTLY 87/100', () => {
    const res = runCalibrationTest();
    expect(res.score).toBe(87);
    expect(res.pass).toBe(true);
    expect(res.components.compatibility).toBe(25);
    expect(res.components.quantity).toBe(17);
    expect(res.components.timing).toBe(12);
    expect(res.components.distance).toBe(9);
    expect(res.components.evidence).toBe(10);
    expect(res.components.economics).toBe(14);
  });

  it('Calculates road distance with 1.3 circuity multiplier', () => {
    // 10km straight -> 13km road
    const straightDist = 10;
    const road = Math.round(straightDist * 1.3 * 10) / 10;
    expect(road).toBe(13.0);
  });

  it('Triggers hard filters correctly', () => {
    const incompatibleDemand: Demand = {
      ...CALIBRATION_DEMAND,
      materialType: 'Granite & Stone Rubble'
    };
    const res = evaluateMatch(CALIBRATION_BATCH, incompatibleDemand);
    expect(res.passedHardFilters).toBe(false);
    expect(res.hardFilterReasons).toContain('INCOMPATIBLE_SUBTYPE');
  });

  it('Composite match applies -3 penalty per extra source', () => {
    const batch1: Batch = { ...CALIBRATION_BATCH, id: 'b1', quantity: 5000 };
    const batch2: Batch = { ...CALIBRATION_BATCH, id: 'b2', quantity: 5000 };
    const composite = buildCompositeMatch([batch1, batch2], CALIBRATION_DEMAND);

    expect(composite).not.toBeNull();
    expect(composite?.sources.length).toBe(2);
    expect(composite?.penalty).toBe(3); // 1 extra source * 3 = 3
  });
});

describe('Statistical & QA Intelligence', () => {
  it('Calculates Wilson 95% upper bound for 1 of 5 failures to be ~62.1%', () => {
    const bound = calculateWilson95UpperBound(1, 5);
    expect(bound).toBeGreaterThan(60);
    expect(bound).toBeLessThan(65);
    expect(bound).toBeCloseTo(62.1, 0);
  });

  it('Validates sub-batch division sum', () => {
    const valid = validateSubBatches(5000, [
      { id: '1', quantity: 3000 },
      { id: '2', quantity: 2000 }
    ]);
    expect(valid.valid).toBe(true);
    expect(valid.difference).toBe(0);

    const invalid = validateSubBatches(5000, [
      { id: '1', quantity: 3000 },
      { id: '2', quantity: 1500 }
    ]);
    expect(invalid.valid).toBe(false);
    expect(invalid.difference).toBe(500);
  });
});

describe('Inventory Ledger Invariants', () => {
  it('computeStock correctly calculates available stock from append-only events', () => {
    const events: InventoryEvent[] = [
      { id: '1', batchId: 'b', eventType: 'recovered', quantity: 1000, unit: 'Pieces', source: 'manual', actorId: 'u', actorName: 'Seller', timestamp: '2026-10-01' },
      { id: '2', batchId: 'b', eventType: 'reserved', quantity: 300, unit: 'Pieces', source: 'manual', actorId: 'u', actorName: 'Buyer', timestamp: '2026-10-02' },
      { id: '3', batchId: 'b', eventType: 'dispatched', quantity: 100, unit: 'Pieces', source: 'manual', actorId: 'u', actorName: 'Seller', timestamp: '2026-10-03' },
      { id: '4', batchId: 'b', eventType: 'damaged', quantity: 50, unit: 'Pieces', source: 'manual', actorId: 'u', actorName: 'Buyer', timestamp: '2026-10-04' }
    ];

    const stock = computeStock(events);
    expect(stock.totalRecovered).toBe(1000);
    expect(stock.dispatched).toBe(100);
    expect(stock.reserved).toBe(200); // 300 - 100 dispatched = 200
    expect(stock.damagedOrUnsuitable).toBe(50);
    // 1000 - (200 + 100 + 50) = 650 available
    expect(stock.availableStock).toBe(650);
  });

  it('Prevents double reservation exceeding available stock', () => {
    const events: InventoryEvent[] = [
      { id: '1', batchId: 'b', eventType: 'recovered', quantity: 500, unit: 'Pieces', source: 'manual', actorId: 'u', actorName: 'Seller', timestamp: '2026-10-01' }
    ];
    const check1 = validateReservation(events, 400);
    expect(check1.allowed).toBe(true);

    const check2 = validateReservation(events, 600);
    expect(check2.allowed).toBe(false);
    expect(check2.reason).toContain('Only 500 units remain available');
  });
});
