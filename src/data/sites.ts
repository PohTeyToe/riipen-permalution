// Map pins. Only places a public source names. Coordinates are derived from
// the place name (town or area centre), not given by any source.

export interface Site {
  id: 'coatepec' | 'nayarit' | 'abuDhabi';
  lon: number;
  lat: number;
  claim: string; // id in CLAIMS
  approximate: boolean; // true when the source gives only a city or region
}

export const SITES: Site[] = [
  { id: 'coatepec', lon: -96.96, lat: 19.45, claim: 'coatepec', approximate: false },
  { id: 'nayarit', lon: -104.9, lat: 21.45, claim: 'nayarit', approximate: false },
  { id: 'abuDhabi', lon: 54.37, lat: 24.45, claim: 'abuDhabi', approximate: true },
];

export const HQ = { lon: -71.89, lat: 45.4 }; // Sherbrooke, Quebec
