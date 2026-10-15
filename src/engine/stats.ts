/**
 * Calculates the Wilson Score 95% Confidence Interval Upper Bound for failure rate.
 * Formula:
 * p_hat = k / n
 * z = 1.95996 (for 95% confidence)
 * upper = (p_hat + z^2/(2n) + z * sqrt((p_hat*(1-p_hat)/n) + (z^2/(4n^2)))) / (1 + z^2/n)
 */
export function calculateWilson95UpperBound(failures: number, totalSamples: number): number {
  if (totalSamples <= 0) return 0;
  const n = totalSamples;
  const k = Math.min(n, Math.max(0, failures));
  const pHat = k / n;
  const z = 1.959963984540054; // 95% two-sided z-score
  const z2 = z * z;

  const numerator = pHat + z2 / (2 * n) + z * Math.sqrt((pHat * (1 - pHat)) / n + z2 / (4 * n * n));
  const denominator = 1 + z2 / n;
  const upper = numerator / denominator;

  // return percentage rounded to 1 decimal place
  return Math.round(Math.min(1, Math.max(0, upper)) * 1000) / 10;
}

/**
 * Validates that sub-batches sum up exactly to parent batch quantity
 */
export function validateSubBatches(
  parentQuantity: number,
  subBatches: Array<{ id: string; quantity: number }>
): { valid: boolean; totalSubQuantity: number; difference: number } {
  const totalSubQuantity = subBatches.reduce((acc, curr) => acc + (Number(curr.quantity) || 0), 0);
  const diff = Math.round((parentQuantity - totalSubQuantity) * 100) / 100;
  return {
    valid: Math.abs(diff) < 0.001,
    totalSubQuantity,
    difference: diff
  };
}

export interface ReliabilityRating {
  successful: number;
  total: number;
  percentage: number;
  displayText: string;
}

export function computeReliability(successfulOrders: number, totalOrders: number): ReliabilityRating {
  if (totalOrders <= 0) {
    return {
      successful: 0,
      total: 0,
      percentage: 100,
      displayText: 'New participant (No completed orders yet)'
    };
  }
  const pct = Math.round((successfulOrders / totalOrders) * 100);
  return {
    successful: successfulOrders,
    total: totalOrders,
    percentage: pct,
    displayText: `${successfulOrders} of ${totalOrders} deliveries OK (${pct}%, based on ${totalOrders} orders)`
  };
}
