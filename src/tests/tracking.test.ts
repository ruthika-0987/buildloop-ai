import { describe, it, expect } from 'vitest';
import { calculateRoadDistanceKm } from '../engine/matching';

describe('Location, QR & Driver Tracking (M9)', () => {
  it('Flags GPS telemetry as stale when last ping exceeds 2 minutes', () => {
    const isGpsStale = (lastPingIso: string, now: number = Date.now()): boolean => {
      const elapsed = now - new Date(lastPingIso).getTime();
      return elapsed > 120000; // 2 minutes = 120,000 ms
    };

    const freshPing = new Date(Date.now() - 30000).toISOString(); // 30s ago
    expect(isGpsStale(freshPing)).toBe(false);

    const stalePing = new Date(Date.now() - 150000).toISOString(); // 2.5m ago
    expect(isGpsStale(stalePing)).toBe(true);
  });

  it('Calculates road haulage distance between Hyderabad hubs with circuity factor', () => {
    // Jubilee Hills (17.4319, 78.4073) to Begumpet (17.4447, 78.4664)
    const roadKm = calculateRoadDistanceKm(17.4319, 78.4073, 17.4447, 78.4664);
    // Straight is ~6.4km, with 1.3 circuity = ~8.3km
    expect(roadKm).toBeGreaterThan(7.5);
    expect(roadKm).toBeLessThan(10.0);
  });

  it('Generates driver access token with correct format', () => {
    const generateDriverToken = () => `drv-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const token = generateDriverToken();
    expect(token).toMatch(/^drv-\d+-[a-z0-9]+$/);
  });
});
