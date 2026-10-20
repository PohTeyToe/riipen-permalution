import { describe, expect, it } from 'vitest';
import { parseLitres, validate, type Fields } from './validate';

const ok: Fields = {
  topic: 'site', location: 'Coatepec', sector: 'agriculture', need: '5,000', name: 'A', org: '',
  email: 'a@b.co', message: 'Water for a greenhouse, next spring.', consent: true,
};

describe('validate', () => {
  it('passes a complete request', () => expect(validate(ok, 'en')).toEqual([]));

  it('lists every problem in field order', () => {
    const errs = validate({ ...ok, location: ' ', sector: '', email: 'nope', message: 'short', consent: false }, 'en');
    expect(errs.map((e) => e.code)).toEqual(['location', 'sector', 'emailFormat', 'message', 'consent']);
  });

  it('only a site analysis needs a location', () => {
    expect(validate({ ...ok, topic: 'invest', location: '' }, 'en')).toEqual([]);
  });

  it('reads the litres loosely but checks them', () => {
    expect(validate({ ...ok, need: '12 000' }, 'en')).toEqual([]);
    expect(validate({ ...ok, need: 'lots' }, 'en')[0].code).toBe('needNumber');
    expect(validate({ ...ok, need: '0' }, 'fr')[0].code).toBe('needRange');
  });

  it('takes whole litres grouped the way each language groups them, never decimals', () => {
    expect(parseLitres('1 000 000', 'fr')).toBe(1_000_000);
    expect(parseLitres('1\u202f000', 'fr')).toBe(1000);
    expect(parseLitres('12 000', 'en')).toBe(12000);
    expect(parseLitres('12,000', 'en')).toBe(12000);
    // A French comma and an English point are decimals.
    expect(parseLitres('12,000', 'fr')).toBe('invalid');
    expect(parseLitres('0,500', 'fr')).toBe('invalid');
    expect(parseLitres('0,5', 'fr')).toBe('invalid');
    expect(parseLitres('0,500', 'en')).toBe('invalid');
    expect(parseLitres('0.500', 'en')).toBe('invalid');
    expect(parseLitres('12.5', 'en')).toBe('invalid');
    expect(parseLitres('1,000.000', 'en')).toBe('invalid');
    expect(parseLitres('', 'en')).toBe(null);
  });
});
