// Equal Earth projection (Šavrič, Patterson & Jenny, 2018), forward and
// inverse, written out so the browser can turn a click into lon/lat without
// shipping d3. Tested against d3-geo's geoEqualEarth in equal-earth.test.ts.

const A1 = 1.340264, A2 = -0.081106, A3 = 0.000893, A4 = 0.003796;
const M = Math.sqrt(3) / 2;
const RAD = Math.PI / 180;

export interface Frame { k: number; tx: number; ty: number }

export function forward(lon: number, lat: number, f: Frame): [number, number] {
  const lambda = lon * RAD;
  const l = Math.asin(M * Math.sin(lat * RAD));
  const l2 = l * l, l6 = l2 * l2 * l2;
  const x = (lambda * Math.cos(l)) / (M * (A1 + 3 * A2 * l2 + l6 * (7 * A3 + 9 * A4 * l2)));
  const y = l * (A1 + A2 * l2 + l6 * (A3 + A4 * l2));
  return [x * f.k + f.tx, -y * f.k + f.ty];
}

export function inverse(px: number, py: number, f: Frame): [number, number] | null {
  const x = (px - f.tx) / f.k;
  const y = -(py - f.ty) / f.k;
  let l = y;
  for (let i = 0; i < 12; i++) {
    const l2 = l * l, l6 = l2 * l2 * l2;
    const fy = l * (A1 + A2 * l2 + l6 * (A3 + A4 * l2)) - y;
    const fpy = A1 + 3 * A2 * l2 + l6 * (7 * A3 + 9 * A4 * l2);
    const step = fy / fpy;
    l -= step;
    if (Math.abs(step) < 1e-12) break;
  }
  const l2 = l * l, l6 = l2 * l2 * l2;
  const fpy = A1 + 3 * A2 * l2 + l6 * (7 * A3 + 9 * A4 * l2);
  const s = Math.sin(l) / M;
  if (!(Math.abs(s) <= 1)) return null;
  const lambda = (M * x * fpy) / Math.cos(l);
  const lon = lambda / RAD, lat = Math.asin(s) / RAD;
  if (Math.abs(lon) > 180) return null;
  return [lon, lat];
}
