export interface RichPart { text: string; claim?: string }

const TOKEN = /\[\[(\w+):([^\]]+)\]\]/g;

/** Split "a [[id:b]] c" into text and claim parts. */
export function parseRich(s: string): RichPart[] {
  const out: RichPart[] = [];
  let last = 0;
  for (const m of s.matchAll(TOKEN)) {
    if (m.index! > last) out.push({ text: s.slice(last, m.index) });
    out.push({ text: m[2], claim: m[1] });
    last = m.index! + m[0].length;
  }
  if (last < s.length) out.push({ text: s.slice(last) });
  return out;
}

/** The same string with the markers removed, for meta tags and alt text. */
export function plain(s: string): string {
  return s.replace(TOKEN, '$2');
}

/** Claim ids used in a string. */
export function claimIds(s: string): string[] {
  return [...s.matchAll(TOKEN)].map((m) => m[1]);
}
