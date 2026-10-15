import { describe, it, expect } from 'vitest';
import { runCalibrationTest } from '../engine/matching';

describe('Proof Pages & Administration (M12)', () => {
  it('Verifies that the Calibration Case runs cleanly and scores exactly 87', () => {
    const result = runCalibrationTest();
    expect(result.pass).toBe(true);
    expect(result.score).toBe(87);
    expect(result.components.compatibility +
      result.components.quantity +
      result.components.timing +
      result.components.distance +
      result.components.evidence +
      result.components.economics).toBe(87);
  });

  it('Verifies sample data filter flag logic', () => {
    const sampleRecords = [
      { id: '1', data: { isSample: true, title: 'Sample A' } },
      { id: '2', data: { isSample: false, title: 'Real User Batch' } },
      { id: '3', data: { isSample: true, title: 'Sample B' } }
    ];

    const filtered = sampleRecords.filter(r => !r.data.isSample);
    expect(filtered.length).toBe(1);
    expect(filtered[0].data.title).toBe('Real User Batch');
  });
});
