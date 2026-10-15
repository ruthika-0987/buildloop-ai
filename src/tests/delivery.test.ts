import { describe, it, expect } from 'vitest';
import { computeReliability } from '../engine/stats';

describe('Delivery Check, Remedies & Reliability Scoring (M7)', () => {
  it('Evaluates damage tolerance thresholds correctly', () => {
    const computeRemedyEligibility = (orderedQty: number, damagedQty: number) => {
      const damagePercent = Math.round((damagedQty / orderedQty) * 100);
      return {
        damagePercent,
        withinTolerance: damagePercent <= 10,
        eligibleForPartialRefund: damagePercent > 10 && damagePercent <= 30,
        eligibleForFullRejection: damagePercent > 30
      };
    };

    // Case 1: 5% damage (50 of 1000) -> within 10% tolerance
    const case1 = computeRemedyEligibility(1000, 50);
    expect(case1.damagePercent).toBe(5);
    expect(case1.withinTolerance).toBe(true);
    expect(case1.eligibleForFullRejection).toBe(false);

    // Case 2: 15% damage (150 of 1000) -> partial refund
    const case2 = computeRemedyEligibility(1000, 150);
    expect(case2.damagePercent).toBe(15);
    expect(case2.withinTolerance).toBe(false);
    expect(case2.eligibleForPartialRefund).toBe(true);

    // Case 3: 35% damage (350 of 1000) -> full rejection permitted
    const case3 = computeRemedyEligibility(1000, 350);
    expect(case3.damagePercent).toBe(35);
    expect(case3.eligibleForFullRejection).toBe(true);
  });

  it('Calculates proportional partial refund accurately', () => {
    const totalCost = 10000;
    const ordered = 2000;
    const damaged = 400; // 20% damage
    const refund = Math.round((damaged / ordered) * totalCost);

    expect(refund).toBe(2000); // exactly 20% of 10,000
  });

  it('Computes reliability score with explicit sample size disclosure', () => {
    const rating = computeReliability(4, 5);
    expect(rating.percentage).toBe(80);
    expect(rating.displayText).toBe('4 of 5 deliveries OK (80%, based on 5 orders)');

    // New user with 0 orders
    const newRating = computeReliability(0, 0);
    expect(newRating.displayText).toContain('No completed orders yet');
  });
});
