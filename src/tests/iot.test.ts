import { describe, it, expect } from 'vitest';

describe('IoT Sensor Ingestion & Telemetry (M10)', () => {
  it('Validates device API key format', () => {
    const isValidDeviceKey = (key?: string): boolean => {
      if (!key) return false;
      return key.startsWith('BL-IOT-') || key === 'demo-iot-key';
    };

    expect(isValidDeviceKey('BL-IOT-HYD-DEVICE-01')).toBe(true);
    expect(isValidDeviceKey('demo-iot-key')).toBe(true);
    expect(isValidDeviceKey('invalid-key')).toBe(false);
    expect(isValidDeviceKey('')).toBe(false);
  });

  it('Evaluates anomaly thresholds: normal vs warning', () => {
    const evaluateTelemetryStatus = (vibrationG: number, tiltDegrees: number, moisturePercent: number): 'NORMAL' | 'WARNING' => {
      if (vibrationG > 0.5 || tiltDegrees > 5 || moisturePercent > 20) {
        return 'WARNING';
      }
      return 'NORMAL';
    };

    // Case 1: Normal storage conditions
    expect(evaluateTelemetryStatus(0.08, 0.4, 6.2)).toBe('NORMAL');

    // Case 2: Excessive vibration during transit (e.g. rough offloading)
    expect(evaluateTelemetryStatus(0.72, 1.2, 6.5)).toBe('WARNING');

    // Case 3: Stack tipping risk
    expect(evaluateTelemetryStatus(0.1, 7.5, 5.0)).toBe('WARNING');

    // Case 4: Rain moisture ingress
    expect(evaluateTelemetryStatus(0.05, 0.2, 24.0)).toBe('WARNING');
  });
});
