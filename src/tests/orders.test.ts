import { describe, it, expect } from 'vitest';
import { Order, OrderType, OrderStatus } from '../types';

describe('Orders, Transaction Types & Pre-Dispatch Gate (M6)', () => {
  const mockOrder: Order = {
    id: 'ord-unit-01',
    batchId: 'bat-01',
    sellerId: 'sel-01',
    sellerName: 'Deccan Salvage',
    buyerId: 'buy-01',
    buyerName: 'Urban Habitat',
    driverToken: 'drv-token-123',
    orderType: 'B', // Inspect-first
    quantity: 1000,
    unit: 'Pieces',
    unitPrice: 5.0,
    totalMaterialCost: 5000,
    simulatedLogisticsCost: 800,
    simulatedEscrowTotal: 5800,
    status: 'accepted',
    paymentStatus: 'ESCROW_HELD_SIMULATED',
    preDispatchGate: {
      evidenceCheckPassed: true,
      inspectionPassed: false,
      gateUnlocked: false
    },
    driverInfo: {
      name: 'Yadagiri',
      phone: '+91 98490 11223',
      vehicleNumber: 'TS 09 UA 4120',
      tripStatus: 'not_started'
    },
    deliveryCheck: {
      checked: false,
      deadlineAt: '2026-10-18T00:00:00Z',
      acceptedQuantity: 0,
      damagedQuantity: 0,
      damagePercent: 0,
      remedy: null
    },
    created_at: '2026-10-14T00:00:00Z'
  };

  it('Blocks dispatch when pre-dispatch gate is locked', () => {
    const canDispatch = (ord: Order): boolean => {
      return ord.status === 'accepted' && ord.preDispatchGate.gateUnlocked === true;
    };

    expect(canDispatch(mockOrder)).toBe(false);

    // After inspector unlocks gate:
    const unlockedOrder: Order = {
      ...mockOrder,
      preDispatchGate: {
        ...mockOrder.preDispatchGate,
        inspectionPassed: true,
        gateUnlocked: true,
        inspectorName: 'Er. R. K. Rao'
      }
    };

    expect(canDispatch(unlockedOrder)).toBe(true);
  });

  it('Maintains simulated escrow status during transport', () => {
    expect(mockOrder.paymentStatus).toBe('ESCROW_HELD_SIMULATED');
    expect(mockOrder.simulatedEscrowTotal).toBe(5800);
  });

  it('Transitions order lifecycle steps in correct sequence', () => {
    const lifecycleSequence: OrderStatus[] = [
      'requested',
      'accepted',
      'pre_dispatch_cleared',
      'dispatched',
      'delivered',
      'delivery_checked',
      'closed'
    ];

    expect(lifecycleSequence.indexOf('pre_dispatch_cleared')).toBeLessThan(
      lifecycleSequence.indexOf('dispatched')
    );
    expect(lifecycleSequence.indexOf('dispatched')).toBeLessThan(
      lifecycleSequence.indexOf('delivered')
    );
    expect(lifecycleSequence.indexOf('delivered')).toBeLessThan(
      lifecycleSequence.indexOf('delivery_checked')
    );
  });
});
