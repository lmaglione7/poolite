/**
 * Anonymous zone comparison ("pools like yours in Monza"). Until the Supabase
 * backend has enough real users to aggregate, stats are derived
 * deterministically from the city name so they're stable day-to-day and
 * plausible — same shape the real aggregate endpoint will return.
 */

function cityHash(city: string): number {
  let h = 0;
  for (let i = 0; i < city.length; i++) h = (h * 31 + city.charCodeAt(i)) >>> 0;
  return h;
}

export interface ZoneStats {
  city: string;
  poolsInZone: number;
  avgDailyCost: number;
  /** 0–100: share of comparable pools you're beating on daily cost. */
  costPercentile: number;
  avgWaterScore: number;
  avgMonthlySavings: number;
}

export function getZoneStats(city: string, userDailyCost: number, userWaterScore: number): ZoneStats {
  const h = cityHash(city.toLowerCase());
  const poolsInZone = 40 + (h % 220);
  // Zone average sits above an optimized pool: most people run 10–12 fixed hours.
  const avgDailyCost = Math.round(userDailyCost * (1.28 + ((h >> 4) % 25) / 100) * 100) / 100;

  const ratio = userDailyCost / avgDailyCost;
  const costPercentile = Math.max(3, Math.min(97, Math.round((1 - ratio) * 100 + 55)));

  const avgWaterScore = 62 + ((h >> 8) % 14);
  const avgMonthlySavings = Math.round((avgDailyCost - userDailyCost) * 30 * 0.6 * 100) / 100;

  return { city, poolsInZone, avgDailyCost, costPercentile, avgWaterScore, avgMonthlySavings };
}
