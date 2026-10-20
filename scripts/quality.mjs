// Measures the live page and writes src/data/quality.json, which the footer shows.
// Usage: node scripts/quality.mjs https://riipen-permalution.vercel.app
// Needs: npx lighthouse (downloaded on first run) and the Playwright browsers.
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const base = (process.argv[2] ?? '').replace(/\/$/, '');
if (!base) throw new Error('pass the base URL');
const require = createRequire(import.meta.url);
const tmp = mkdtempSync(join(tmpdir(), 'lh-'));
const LH = 'lighthouse@12.8.2';

function lighthouse(url) {
  const out = join(tmp, 'lh.json');
  execFileSync('npx', ['-y', LH, url, '--quiet', '--output=json', `--output-path=${out}`,
    '--only-categories=performance,accessibility,best-practices,seo', '--chrome-flags=--headless=new'],
    { stdio: 'inherit', shell: process.platform === 'win32' });
  const r = JSON.parse(readFileSync(out, 'utf8'));
  const pct = (k) => Math.round(r.categories[k].score * 100);
  const failingSeo = Object.values(r.audits).filter((a) => a.score === 0 && r.categories.seo.auditRefs.some((x) => x.id === a.id)).map((a) => a.id);
  return {
    performance: pct('performance'),
    accessibility: pct('accessibility'),
    bestPractices: pct('best-practices'),
    seo: pct('seo'),
    seoFailing: failingSeo,
    lcpMs: Math.round(r.audits['largest-contentful-paint'].numericValue),
    cls: Number(r.audits['cumulative-layout-shift'].numericValue.toFixed(3)),
    transferBytes: r.audits['total-byte-weight'].numericValue,
    lighthouseVersion: r.lighthouseVersion,
  };
}

async function axe(url) {
  const { chromium } = require(process.env.PLAYWRIGHT_PATH ?? 'playwright');
  const axeSource = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  await p.goto(url, { waitUntil: 'networkidle' });
  await p.addScriptTag({ content: axeSource });
  const res = await p.evaluate(async () => {
    const r = await window.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa', 'best-practice'] });
    return { n: r.violations.length, ids: r.violations.map((v) => v.id), version: r.testEngine.version };
  });
  await b.close();
  return res;
}

const runs = {};
for (const [lang, path] of [['en', '/'], ['fr', '/fr/']]) {
  const url = base + path;
  const lh = lighthouse(url);
  const ax = await axe(url);
  runs[lang] = { url, ...lh, axeViolations: ax.n, axeIds: ax.ids, axeVersion: ax.version, date: new Date().toISOString().slice(0, 10) };
  console.log(lang, runs[lang]);
}
writeFileSync(new URL('../src/data/quality.json', import.meta.url), JSON.stringify({ runs }, null, 2) + '\n');
