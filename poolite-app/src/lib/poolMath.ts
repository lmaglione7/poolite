import { env } from './env';

export type PoolSize = 'S' | 'M' | 'L' | 'XL' | 'custom';
export type PumpHp = '0.5' | '0.75' | '1' | '1.5' | '2' | 'boh';

// Typical residential single-speed pump flow rate (m³/h) and electrical draw (kW)
// by nameplate HP — used to size filtration hours and estimate running cost.
const PUMP_SPECS: Record<Exclude<PumpHp, 'boh'>, { flowM3h: number; kw: number }> = {
  '0.5': { flowM3h: 6, kw: 0.37 },
  '0.75': { flowM3h: 8, kw: 0.55 },
  '1': { flowM3h: 10, kw: 0.75 },
  '1.5': { flowM3h: 13, kw: 1.1 },
  '2': { flowM3h: 16, kw: 1.5 },
};

const SIZE_VOLUME_M3: Record<PoolSize, number> = {
  S: 10,
  M: 25,
  L: 45,
  XL: 65,
  custom: 25,
};

export function poolVolumeM3(size: PoolSize, dims?: { l?: string; w?: string; d?: string }): number {
  if (size === 'custom' && dims?.l && dims?.w && dims?.d) {
    const l = parseFloat(dims.l.replace(',', '.'));
    const w = parseFloat(dims.w.replace(',', '.'));
    const d = parseFloat(dims.d.replace(',', '.'));
    if (l > 0 && w > 0 && d > 0) return l * w * d;
  }
  return SIZE_VOLUME_M3[size] ?? 25;
}

export function pumpSpec(pump: PumpHp) {
  return PUMP_SPECS[pump === 'boh' ? '1' : pump] ?? PUMP_SPECS['1'];
}

/** Hours of filtration needed to turn the whole pool volume over roughly once a day. */
export function recommendedHours(volumeM3: number, pump: PumpHp): number {
  const { flowM3h } = pumpSpec(pump);
  const hours = Math.ceil(volumeM3 / flowM3h);
  return Math.min(12, Math.max(4, hours));
}

export interface CostEstimate {
  hours: number;
  kw: number;
  costToday: number;
  costEveryone: number; // 12 fixed hours, the "everyone else" comparison card
  savingsToday: number;
  monthlyCost: number;
  monthlyCostEveryone: number;
  monthlySavings: number;
}

export function estimateCost(volumeM3: number, pump: PumpHp): CostEstimate {
  const { kw } = pumpSpec(pump);
  const hours = recommendedHours(volumeM3, pump);
  const rate = env.electricityRatePerKwh;
  const costToday = hours * kw * rate;
  const costEveryone = 12 * kw * rate;
  return {
    hours,
    kw,
    costToday,
    costEveryone,
    savingsToday: Math.max(0, costEveryone - costToday),
    monthlyCost: costToday * 30,
    monthlyCostEveryone: costEveryone * 30,
    monthlySavings: Math.max(0, (costEveryone - costToday) * 30),
  };
}

/** Finds the contiguous `hours`-long window (within 6:00–21:00) with the most solar radiation. */
export function sunniestWindow(hourlyRadiation: number[], hourStartOfDay: number, hours: number): { startHour: number; endHour: number } {
  const dayStart = 6;
  const dayEnd = 21;
  let bestStart = 11;
  let bestSum = -1;
  for (let h = dayStart; h + hours <= dayEnd; h++) {
    let sum = 0;
    for (let k = 0; k < hours; k++) {
      const idx = h + k - hourStartOfDay;
      sum += hourlyRadiation[idx] ?? 0;
    }
    if (sum > bestSum) {
      bestSum = sum;
      bestStart = h;
    }
  }
  return { startHour: bestStart, endHour: bestStart + hours };
}

export function formatHourRange(startHour: number, endHour: number): string {
  const fmt = (h: number) => `${String(h).padStart(2, '0')}:00`;
  return `${fmt(startHour)} – ${fmt(endHour)}`;
}
