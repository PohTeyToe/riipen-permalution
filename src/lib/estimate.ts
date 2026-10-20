// The only arithmetic behind the litre figures on the page. Shared by the
// build (for the no-JS default) and the browser script.

export interface YieldRange {
  min: number; // litres a day per collector, low end
  max: number; // litres a day per collector, high end
}

export interface Estimate {
  units: number;
  litresMin: number;
  litresMax: number;
}

/** Litres a day for `units` collectors, each giving a range per day. */
export function estimate(units: number, perUnit: YieldRange): Estimate {
  if (!Number.isInteger(units) || units < 0) throw new Error(`bad collector count ${units}`);
  if (!(perUnit.min >= 0 && perUnit.max >= perUnit.min)) throw new Error(`bad range ${perUnit.min}..${perUnit.max}`);
  return { units, litresMin: units * perUnit.min, litresMax: units * perUnit.max };
}

/** "1,200" style grouping without depending on the visitor's locale. */
export function groupDigits(n: number, sep = ','): string {
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, sep);
}
