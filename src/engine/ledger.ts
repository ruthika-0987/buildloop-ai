import { InventoryEvent } from '../types';

export interface StockSummary {
  totalRecovered: number;
  internalAllocated: number;
  reserved: number;
  dispatched: number;
  delivered: number;
  damagedOrUnsuitable: number;
  availableStock: number;
  lastUpdated: string;
  eventCount: number;
}

/**
 * ONE function computeStock is the ONLY way stock is calculated across the entire application.
 */
export function computeStock(events: InventoryEvent[]): StockSummary {
  let totalRecovered = 0;
  let internalAllocated = 0;
  let reserved = 0;
  let dispatched = 0;
  let delivered = 0;
  let damagedOrUnsuitable = 0;

  // Sort chronologically
  const sorted = [...events].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  let lastTimestamp = new Date(0).toISOString();

  for (const ev of sorted) {
    const qty = Number(ev.quantity) || 0;
    lastTimestamp = ev.timestamp;

    switch (ev.eventType) {
      case 'recovered':
        totalRecovered += qty;
        break;

      case 'internal_use_allocated':
        internalAllocated += qty;
        break;

      case 'internal_use_released':
        internalAllocated = Math.max(0, internalAllocated - qty);
        break;

      case 'reserved':
        reserved += qty;
        break;

      case 'reservation_released':
        reserved = Math.max(0, reserved - qty);
        break;

      case 'dispatched':
        // When dispatched, reservation moves to dispatched
        reserved = Math.max(0, reserved - qty);
        dispatched += qty;
        break;

      case 'received_confirmed':
        // When delivered, dispatched moves to delivered
        dispatched = Math.max(0, dispatched - qty);
        delivered += qty;
        break;

      case 'marked_unsuitable':
      case 'damaged':
        damagedOrUnsuitable += qty;
        break;

      case 'stock_correction':
        // Positive correction increases recovered, negative decreases
        totalRecovered = Math.max(0, totalRecovered + qty);
        break;

      case 'qr_scan':
        // Audit scan, does not alter balance
        break;
    }
  }

  const availableStock = Math.max(
    0,
    totalRecovered - (internalAllocated + reserved + dispatched + delivered + damagedOrUnsuitable)
  );

  return {
    totalRecovered,
    internalAllocated,
    reserved,
    dispatched,
    delivered,
    damagedOrUnsuitable,
    availableStock,
    lastUpdated: lastTimestamp,
    eventCount: sorted.length
  };
}

/**
 * Validates that reserving a quantity does not exceed currently available stock.
 * Returns { allowed: boolean, reason?: string, currentAvailable: number }
 */
export function validateReservation(
  events: InventoryEvent[],
  requestedQuantity: number
): { allowed: boolean; reason?: string; currentAvailable: number } {
  const stock = computeStock(events);
  if (requestedQuantity <= 0) {
    return { allowed: false, reason: 'Requested quantity must be greater than zero.', currentAvailable: stock.availableStock };
  }
  if (requestedQuantity > stock.availableStock) {
    return {
      allowed: false,
      reason: `Someone just reserved or claimed this stock. Only ${stock.availableStock} units remain available.`,
      currentAvailable: stock.availableStock
    };
  }
  return { allowed: true, currentAvailable: stock.availableStock };
}
