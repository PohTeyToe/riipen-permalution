import type { SourceKey } from './sources';

// The claims register: every factual line on the page, in reading order.
// 'sourced'  = a public source says it.
// 'confirm'  = a public source says it, but it is a number or an undisclosed
//              detail that should get Permalution's written OK before launch.
export type ClaimStatus = 'sourced' | 'confirm';

export interface Claim {
  id: string;
  status: ClaimStatus;
  sources: SourceKey[];
}

export const CLAIMS: Claim[] = [
  { id: 'hq', status: 'sourced', sources: ['riipen'] },
  { id: 'zeroEnergy', status: 'sourced', sources: ['riipen', 'mars'] },
  { id: 'sectors', status: 'sourced', sources: ['riipen'] },
  { id: 'coatepec', status: 'sourced', sources: ['coatepecPost'] },
  { id: 'nayarit', status: 'sourced', sources: ['orchids', 'fogWaterMass', 'mars'] },
  { id: 'nayaritQuote', status: 'sourced', sources: ['mars'] },
  { id: 'abuDhabi', status: 'confirm', sources: ['cp2025', 'asu2026'] },
  { id: 'reported2025', status: 'confirm', sources: ['asu2026', 'waterCanadaPost'] },
  { id: 'industrialYield', status: 'confirm', sources: ['products'] },
  { id: 'premiumYield', status: 'confirm', sources: ['products'] },
  { id: 'process', status: 'sourced', sources: ['coatepecPost'] },
  { id: 'fogAtlas', status: 'sourced', sources: ['products'] },
  { id: 'waterRadar', status: 'sourced', sources: ['products'] },
  { id: 'waterCanada', status: 'sourced', sources: ['waterCanadaPost'] },
  { id: 'relx', status: 'sourced', sources: ['asu2026'] },
  { id: 'weEmpower', status: 'sourced', sources: ['asu2024'] },
  { id: 'rbc', status: 'sourced', sources: ['betakitRbc'] },
  { id: 'nexterre', status: 'sourced', sources: ['nexterrePost'] },
  { id: 'startupfest', status: 'sourced', sources: ['betakitStartupfest'] },
  { id: 'irap', status: 'sourced', sources: ['nrc'] },
  { id: 'press', status: 'sourced', sources: ['macleans', 'mars', 'cp2025', 'asu2026'] },
];

export function claimNumber(id: string): number {
  const i = CLAIMS.findIndex((c) => c.id === id);
  if (i < 0) throw new Error(`unknown claim ${id}`);
  return i + 1;
}

export function claim(id: string): Claim {
  const c = CLAIMS.find((x) => x.id === id);
  if (!c) throw new Error(`unknown claim ${id}`);
  return c;
}
