import { describe, expect, it } from 'vitest';
import { forward, inverse } from './equal-earth';
import { d3Projection, frame, MAP_H, MAP_W } from './map';
import { estimate, groupDigits } from './estimate';
import { INDUSTRIAL, oneDecimal, totes } from './totes';

const places: [string, number, number][] = [
  ['Sherbrooke', -71.89, 45.4],
  ['Coatepec', -96.96, 19.45],
  ['Lima', -77.04, -12.05],
  ['Abu Dhabi', 54.37, 24.45],
  ['Antofagasta', -70.4, -23.65],
];

describe('hand-written Equal Earth matches d3-geo', () => {
  it.each(places)('%s forward', (_n, lon, lat) => {
    const ours = forward(lon, lat, frame);
    const d3 = d3Projection([lon, lat])!;
    expect(ours[0]).toBeCloseTo(d3[0], 6);
    expect(ours[1]).toBeCloseTo(d3[1], 6);
  });

  it.each(places)('%s round trip', (_n, lon, lat) => {
    const [x, y] = forward(lon, lat, frame);
    const back = inverse(x, y, frame)!;
    expect(back[0]).toBeCloseTo(lon, 6);
    expect(back[1]).toBeCloseTo(lat, 6);
  });

  it('every site lands inside the map', () => {
    for (const [, lon, lat] of places) {
      const [x, y] = forward(lon, lat, frame);
      expect(x).toBeGreaterThan(0);
      expect(x).toBeLessThan(MAP_W);
      expect(y).toBeGreaterThan(0);
      expect(y).toBeLessThan(MAP_H);
    }
  });
});

describe('estimate', () => {
  it('multiplies collectors by the per-unit range', () => {
    const e = estimate(12, INDUSTRIAL);
    expect(e.litresMin).toBe(9000);
    expect(e.litresMax).toBe(24000);
  });

  it('matches the products page for one Industrial collector', () => {
    expect(estimate(1, INDUSTRIAL)).toEqual({ units: 1, litresMin: 750, litresMax: 2000 });
  });

  it('refuses nonsense', () => {
    expect(() => estimate(-1, INDUSTRIAL)).toThrow();
    expect(() => estimate(1.5, INDUSTRIAL)).toThrow();
    expect(() => estimate(1, { min: 3, max: 2 })).toThrow();
  });

  it('groups digits without the visitor locale', () => {
    expect(groupDigits(1234567)).toBe('1,234,567');
    expect(groupDigits(1234567, ' ')).toBe('1 234 567');
    expect(groupDigits(999)).toBe('999');
  });
});

describe('totes', () => {
  it('one 1,000 L tote per cell up to the high end, solid to the low end', () => {
    const cells = totes(5); // 3,750 to 10,000 L
    expect(cells).toHaveLength(10);
    expect(cells.slice(0, 3).every((c) => c.low === 1 && c.high === 1)).toBe(true);
    expect(cells[3]).toEqual({ low: 0.75, high: 1 });
    expect(cells[9]).toEqual({ low: 0, high: 1 });
  });

  it('a single collector fills under two totes', () => {
    expect(totes(1)).toEqual([{ low: 0.75, high: 1 }, { low: 0, high: 1 }]);
  });

  it('formats one decimal with a locale mark', () => {
    expect(oneDecimal(3.75)).toBe('3.8');
    expect(oneDecimal(10)).toBe('10');
    expect(oneDecimal(0.75, ',')).toBe('0,8');
  });
});
