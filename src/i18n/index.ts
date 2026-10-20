import { en, type Dict } from './en';
import { fr } from './fr';

export type Lang = 'en' | 'fr';
export const dicts: Record<Lang, Dict> = { en, fr };
export type { Dict };
