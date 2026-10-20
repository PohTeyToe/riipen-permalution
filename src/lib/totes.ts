import type { YieldRange } from './estimate';

/** Industrial Fog Collector, per unit, as listed on permalution.com/pages/products-and-services. */
export const INDUSTRIAL: YieldRange = { min: 750, max: 2000 };
export const MAX_UNITS = 20;
export const DEFAULT_UNITS = 5;
export const TOTE_L = 1000;

export interface ToteCell {
  low: number; // 0..1 of this tote filled at the low end
  high: number; // 0..1 filled at the high end
}

/** One cell per 1,000 L tote, up to the high end of the range. */
export function totes(units: number, y: YieldRange = INDUSTRIAL): ToteCell[] {
  const low = (units * y.min) / TOTE_L;
  const high = (units * y.max) / TOTE_L;
  const n = Math.ceil(high - 1e-9);
  return Array.from({ length: n }, (_, i) => ({
    low: round2(clamp01(low - i)),
    high: round2(clamp01(high - i)),
  }));
}

/** 3.75 -> "3.8", 10 -> "10", with a locale decimal mark. */
export function oneDecimal(x: number, mark = '.'): string {
  const s = (Math.round(x * 10) / 10).toFixed(1).replace(/\.0$/, '');
  return mark === '.' ? s : s.replace('.', mark);
}

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const round2 = (x: number) => Math.round(x * 100) / 100;
