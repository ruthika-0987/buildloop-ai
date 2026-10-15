import { describe, it, expect } from 'vitest';
import { calculateEnvironmentalImpact } from '../engine/impact';
import { Batch, Order } from '../types';

describe('Environmental & Economic Impact (M11)', () => {
  const mockBatches: Batch[] = [
    {
      id: 'b-impact-1',
      title: 'Salvaged Clay Bricks',
      materialType: 'Clay Bricks',
      materialSubtype: 'Red Clay',
      quantity: 10000,
      unit: 'Pieces',
      pricePerUnit: 5.0,
      originalNewPrice: 10.0,
      condition: 'Intact',
      lawfulDeclarationAccepted: true,
      location: { address: 'Jubilee Hills', lat: 17.43, lng: 78.40 },
      availableFrom: '2026-10-01',
      availableUntil: '2026-11-01',
      readinessScore: 85,
      trustLevel: 'L2',
      sellerId: 's1',
      sellerName: 'Deccan Salvage',
      photos: [],
      documents: [],
      status: 'published',
      created_at: '2026-10-01'
    }
  ];

  const mockOrders: Order[] = [
    {
      id: 'o-impact-1',
      batchId: 'b-impact-1',
      sellerId: 's1',
      sellerName: 'Deccan Salvage',
      buyerId: 'b1',
      buyerName: 'Urban Habitat',
      driverToken: 'drv-1',
      orderType: 'A',
      quantity: 5000,
      unit: 'Pieces',
      unitPrice: 5.0,
      totalMaterialCost: 25000,
      simulatedLogisticsCost: 1000,
      simulatedEscrowTotal: 26000,
      status: 'closed',
      paymentStatus: 'ESCROW_RELEASED_SIMULATED',
      preDispatchGate: { evidenceCheckPassed: true, inspectionPassed: true, gateUnlocked: true },
      driverInfo: { name: 'Driver', phone: '123', vehicleNumber: 'TS 09', tripStatus: 'delivered' },
      deliveryCheck: { checked: true, deadlineAt: '', acceptedQuantity: 5000, damagedQuantity: 0, damagePercent: 0, remedy: 'accept' },
      created_at: '2026-10-01'
    }
  ];

  it('Calculates CO2 avoided based on CPCB brick emission factors (0.24 kg/brick)', () => {
    const impact = calculateEnvironmentalImpact(mockBatches, mockOrders);
    // 5000 bricks * 0.24 kg = 1200 kg CO2 = 1.2 metric tons
    expect(impact.co2AvoidedKg).toBe(1200);
    expect(impact.co2AvoidedTons).toBe(1.2);
  });

  it('Calculates net buyer savings and seller income in INR', () => {
    const impact = calculateEnvironmentalImpact(mockBatches, mockOrders);
    // 5000 bricks * (10 new - 5 recovered) = 25,000 INR savings
    expect(impact.totalBuyerSavingsInr).toBe(25000);
    expect(impact.totalSellerRevenueInr).toBe(25000);
  });

  it('Calculates diverted landfill tonnage', () => {
    const impact = calculateEnvironmentalImpact(mockBatches, mockOrders);
    // 5000 bricks * 0.003 tons = 15 tons diverted from dumpsites (+ inventory staging)
    expect(impact.landfillDivertedTons).toBeGreaterThanOrEqual(15);
  });
});
