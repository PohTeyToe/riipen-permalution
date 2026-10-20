export interface Fields {
  topic: string;
  location: string;
  sector: string;
  need: string;
  name: string;
  org: string;
  email: string;
  message: string;
  consent: boolean;
}

export type ErrorCode =
  | 'location' | 'sector' | 'needNumber' | 'needRange' | 'name'
  | 'email' | 'emailFormat' | 'message' | 'consent';

export interface FieldError { field: keyof Fields; code: ErrorCode }

const EMAIL = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;

/** Errors in the order the fields appear, so the summary reads top to bottom. */
export function validate(f: Fields): FieldError[] {
  const errs: FieldError[] = [];
  // Location matters only for a site analysis.
  if (f.topic === 'site' && !f.location.trim()) errs.push({ field: 'location', code: 'location' });
  if (!f.sector) errs.push({ field: 'sector', code: 'sector' });
  const litres = parseLitres(f.need);
  if (litres === 'invalid') errs.push({ field: 'need', code: 'needNumber' });
  else if (litres !== null && (litres < 1 || litres > 10_000_000)) errs.push({ field: 'need', code: 'needRange' });
  if (!f.name.trim()) errs.push({ field: 'name', code: 'name' });
  if (!f.email.trim()) errs.push({ field: 'email', code: 'email' });
  else if (!EMAIL.test(f.email.trim())) errs.push({ field: 'email', code: 'emailFormat' });
  if (f.message.trim().length < 20) errs.push({ field: 'message', code: 'message' });
  if (!f.consent) errs.push({ field: 'consent', code: 'consent' });
  return errs;
}

/**
 * Whole litres, with optional grouping in either language: "5000", "5,000",
 * "5 000", "5.000". Decimals ("0,5", "12.5") are refused rather than guessed.
 */
export function parseLitres(raw: string): number | null | 'invalid' {
  const s = raw.replace(/[\s\u00a0\u202f_]/g, '');
  if (!s) return null;
  if (/^\d+$/.test(s)) return Number(s);
  if (/^\d{1,3}([,.]\d{3})+$/.test(s) && new Set(s.match(/[,.]/g)).size === 1) return Number(s.replace(/[,.]/g, ''));
  return 'invalid';
}
