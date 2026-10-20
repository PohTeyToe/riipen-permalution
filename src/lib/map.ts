// Build-time map. Runs in Astro frontmatter and in tests only; the browser
// gets a finished SVG path and the three numbers in `frame`.
import { geoEqualEarth, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import land110 from 'world-atlas/land-110m.json' with { type: 'json' };
import type { Topology } from 'topojson-specification';
import type { Frame } from './equal-earth';

export const MAP_W = 1000;
// The window that holds every site: the Pacific coast of the Americas to the Gulf.
const WEST = -128, EAST = 70, SOUTH = -40, NORTH = 56;

// A dense MultiPoint over the window. (A Polygon ring here would be read as
// a spherical polygon and, wound this way, mean "everything outside the box".)
const pts: [number, number][] = [];
for (let lon = WEST; lon <= EAST; lon += 4) for (let lat = SOUTH; lat <= NORTH; lat += 4) pts.push([lon, lat]);
const box = { type: 'Feature' as const, properties: {}, geometry: { type: 'MultiPoint' as const, coordinates: pts } };

const projection = geoEqualEarth().fitWidth(MAP_W, box);
const [[, top], [, bottom]] = geoPath(projection).bounds(box);
const [tx0, ty0] = projection.translate();
projection.translate([tx0, ty0 - top]);
export const MAP_H = Math.round(bottom - top);
projection.clipExtent([[0, 0], [MAP_W, MAP_H]]);

export const frame: Frame = {
  k: projection.scale(),
  tx: projection.translate()[0],
  ty: projection.translate()[1],
};

/** lon/lat to map units (0..MAP_W, 0..MAP_H). */
export function project(lon: number, lat: number): [number, number] {
  const p = projection([lon, lat]);
  if (!p) throw new Error(`cannot project ${lon},${lat}`);
  return [Math.round(p[0] * 10) / 10, Math.round(p[1] * 10) / 10];
}

/** Land as one SVG path, rounded to whole units to keep the HTML small. */
export function landPath(): string {
  const topo = land110 as unknown as Topology;
  const land = feature(topo, topo.objects.land);
  return (geoPath(projection)(land) ?? '').replace(/(\d+)\.\d+/g, '$1');
}

/** A parallel as a path, for the tropics. */
export function parallel(lat: number): string {
  const pts: string[] = [];
  for (let lon = WEST; lon <= EAST; lon += 2) {
    const [x, y] = project(lon, lat);
    pts.push(`${pts.length ? 'L' : 'M'}${x},${y}`);
  }
  return pts.join('');
}

export { projection as d3Projection };
