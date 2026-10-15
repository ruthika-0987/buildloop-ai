import { Batch, Order } from '../types';

export interface EnvironmentalImpact {
  co2AvoidedKg: number;
  co2AvoidedTons: number;
  landfillDivertedTons: number;
  truckTripsAvoided: number;
  totalBuyerSavingsInr: number;
  totalSellerRevenueInr: number;
}

// Factors based on Central Pollution Control Board (CPCB) & BMTPC C&D Waste Guidelines
const CO2_FACTOR_PER_UNIT: Record<string, number> = {
  // kg CO2 avoided per unit
  'clay bricks': 0.24, // vs coal-fired Hoffman/clamp kiln
  'recycled concrete aggregate (rca)': 14.5, // per ton vs hard rock blasting
  'fly ash bricks': 0.18, // per piece
  'rebar & steel sections': 1.85, // per kg
  'granite & stone rubble': 11.2, // per ton
  'timber & wood scantlings': 0.95 // per kg
};

const MASS_PER_UNIT_TONS: Record<string, number> = {
  'clay bricks': 0.003, // 3 kg per brick = 0.003 tons
  'recycled concrete aggregate (rca)': 1.0, // 1 ton
  'fly ash bricks': 0.004, // 4 kg
  'rebar & steel sections': 0.001, // assuming kg unit
  'granite & stone rubble': 1.0,
  'timber & wood scantlings': 0.001
};

export function calculateEnvironmentalImpact(batches: Batch[], orders: Order[]): EnvironmentalImpact {
  let co2TotalKg = 0;
  let landfillTons = 0;
  let buyerSavings = 0;
  let sellerRevenue = 0;

  // From completed or accepted orders
  for (const ord of orders) {
    if (['accepted', 'pre_dispatch_cleared', 'dispatched', 'delivered', 'delivery_checked', 'closed'].includes(ord.status)) {
      sellerRevenue += ord.totalMaterialCost;
      // Find batch to estimate savings
      const parentBatch = batches.find(b => b.id === ord.batchId);
      if (parentBatch?.originalNewPrice) {
        const newCost = parentBatch.originalNewPrice * ord.quantity;
        buyerSavings += Math.max(0, newCost - ord.totalMaterialCost);
      } else {
        // Fallback standard ~35% saving
        buyerSavings += Math.round(ord.totalMaterialCost * 0.35);
      }

      const matKey = (parentBatch?.materialType || '').toLowerCase();
      const co2Factor = CO2_FACTOR_PER_UNIT[matKey] || 0.2;
      const massFactor = MASS_PER_UNIT_TONS[matKey] || 0.003;

      co2TotalKg += ord.quantity * co2Factor;
      landfillTons += ord.quantity * massFactor;
    }
  }

  // Also include published active batches available for diversion
  for (const b of batches) {
    if (b.status === 'published') {
      const matKey = (b.materialType || '').toLowerCase();
      const massFactor = MASS_PER_UNIT_TONS[matKey] || 0.003;
      // Potential diverted weight
      landfillTons += b.quantity * massFactor * 0.1; // 10% attribution for inventory staged
    }
  }

  const truckTripsAvoided = Math.max(1, Math.round(landfillTons / 10)); // 10-ton tipper trucks

  return {
    co2AvoidedKg: Math.round(co2TotalKg),
    co2AvoidedTons: Math.round((co2TotalKg / 1000) * 10) / 10,
    landfillDivertedTons: Math.round(landfillTons * 10) / 10,
    truckTripsAvoided,
    totalBuyerSavingsInr: Math.round(buyerSavings),
    totalSellerRevenueInr: Math.round(sellerRevenue)
  };
}
