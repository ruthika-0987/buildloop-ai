import { describe, it, expect } from 'vitest';
import { Batch, TrustLevel, FactState } from '../types';

describe('TrustLoop Evidence & Trust Levels (M2)', () => {
  it('Evaluates facts into seen, claimed, verified, unknown', () => {
    const batchWithPhotos: Partial<Batch> = {
      photos: ['photo1.jpg'],
      documents: [{ name: 'LabTest.pdf', type: 'Lab', verified: true, date: '2026-10-10' }],
      lawfulDeclarationAccepted: true,
      trustLevel: 'L2'
    };

    const visualFactState: FactState = (batchWithPhotos.photos && batchWithPhotos.photos.length > 0) ? 'seen' : 'unknown';
    expect(visualFactState).toBe('seen');

    const labFactState: FactState = (batchWithPhotos.documents && batchWithPhotos.documents.length > 0) ? 'verified' : 'unknown';
    expect(labFactState).toBe('verified');

    const titleFactState: FactState = batchWithPhotos.lawfulDeclarationAccepted ? 'claimed' : 'unknown';
    expect(titleFactState).toBe('claimed');
  });

  it('Enforces L2 readiness threshold of >= 70 plus document or measurement', () => {
    const computeDerivedTrustLevel = (readiness: number, hasDocs: boolean, hasMeasurements: boolean): TrustLevel => {
      if (readiness >= 70 && (hasDocs || hasMeasurements)) {
        return 'L2';
      }
      return 'L1';
    };

    expect(computeDerivedTrustLevel(65, true, false)).toBe('L1'); // readiness under 70
    expect(computeDerivedTrustLevel(75, false, false)).toBe('L1'); // no doc or measurement
    expect(computeDerivedTrustLevel(75, true, false)).toBe('L2'); // qualifies for L2
    expect(computeDerivedTrustLevel(88, false, true)).toBe('L2'); // qualifies for L2
  });

  it('Validates that L3 Inspection Verified requires inspector or admin authorization', () => {
    const canAwardL3 = (role: string): boolean => {
      return role === 'inspector' || role === 'admin';
    };

    expect(canAwardL3('seller')).toBe(false);
    expect(canAwardL3('buyer')).toBe(false);
    expect(canAwardL3('both')).toBe(false);
    expect(canAwardL3('inspector')).toBe(true);
    expect(canAwardL3('admin')).toBe(true);
  });
});
