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
  const need = f.need.replace(/[\s, _]/g, '');
  if (need) {
    if (!/^\d+(\.\d+)?$/.test(need)) errs.push({ field: 'need', code: 'needNumber' });
    else if (Number(need) < 1 || Number(need) > 10_000_000) errs.push({ field: 'need', code: 'needRange' });
  }
  if (!f.name.trim()) errs.push({ field: 'name', code: 'name' });
  if (!f.email.trim()) errs.push({ field: 'email', code: 'email' });
  else if (!EMAIL.test(f.email.trim())) errs.push({ field: 'email', code: 'emailFormat' });
  if (f.message.trim().length < 20) errs.push({ field: 'message', code: 'message' });
  if (!f.consent) errs.push({ field: 'consent', code: 'consent' });
  return errs;
}
