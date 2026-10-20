import { describe, expect, it } from 'vitest';
import { parseLitres, validate, type Fields } from './validate';

const ok: Fields = {
  topic: 'site', location: 'Coatepec', sector: 'agriculture', need: '5,000', name: 'A', org: '',
  email: 'a@b.co', message: 'Water for a greenhouse, next spring.', consent: true,
};

describe('validate', () => {
  it('passes a complete request', () => expect(validate(ok)).toEqual([]));

  it('lists every problem in field order', () => {
    const errs = validate({ ...ok, location: ' ', sector: '', email: 'nope', message: 'short', consent: false });
    expect(errs.map((e) => e.code)).toEqual(['location', 'sector', 'emailFormat', 'message', 'consent']);
  });

  it('only a site analysis needs a location', () => {
    expect(validate({ ...ok, topic: 'invest', location: '' })).toEqual([]);
  });

  it('reads the litres loosely but checks them', () => {
    expect(validate({ ...ok, need: '12 000' })).toEqual([]);
    expect(validate({ ...ok, need: 'lots' })[0].code).toBe('needNumber');
    expect(validate({ ...ok, need: '0' })[0].code).toBe('needRange');
  });

  it('takes whole litres in English or French grouping, never decimals', () => {
    expect(parseLitres('1 000 000')).toBe(1_000_000);
    expect(parseLitres('1\u202f000')).toBe(1000);
    expect(parseLitres('12,000')).toBe(12000);
    expect(parseLitres('12.000')).toBe(12000);
    expect(parseLitres('0,5')).toBe('invalid');
    expect(parseLitres('12.5')).toBe('invalid');
    expect(parseLitres('1,000.000')).toBe('invalid');
    expect(parseLitres('')).toBe(null);
  });
});
