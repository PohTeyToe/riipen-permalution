# Permalution homepage: a redesign concept

Live: https://riipen-permalution.vercel.app (English) and https://riipen-permalution.vercel.app/fr/ (French)

Built by Abdallah Safi in October 2026, before applying to the Riipen Level UP project "Permalution Website Redesign and Production Launch". **Not affiliated with or endorsed by Permalution.** It uses no Permalution logo, images or code, and every page carries a concept label and a `noindex` header so it can't be mistaken for their site.

## What it shows

The brief asks for the key journeys (prospective clients, investors, site-analysis requests, partners, general inquiries), approved content and claims, inquiry forms, FAQ interactions, accessibility, basic SEO and performance. This page does each one small:

| Brief asks for | Here |
|---|---|
| Site-analysis requests | The hero map. Pick a project, or click anywhere to drop a pin; "Request a site analysis here" carries the coordinates into the form. |
| Key journeys | "What brings you here?": four paths that each set the form's topic, so one form serves clients, investors, partners and everyone else. |
| Approved content and claims | "Show sources" (top bar) highlights and numbers each fact about Permalution. The register at the foot lists each one with its public source, and marks performance figures and undisclosed details "confirm before launch". Dates, names and places taken from Permalution's own posts count as sourced. |
| Inquiry forms, error messages | One form with a topic, inline errors tied to each field, and an error summary that links to them. Nothing is sent; a confirmation shows what would be. Litres take English or French digit grouping (12,000 or 12 000) and refuse decimals rather than guess. |
| FAQ interactions | Native `<details>`: keyboard and screen-reader friendly with no script. |
| Accessibility | Skip link, landmarks, ARIA tabs with arrow keys, visible focus, labels and hints on every field, contrast checked, reduced motion honoured. axe-core runs clean in the checks below. |
| Basic SEO | Static HTML, one `h1`, title and description per language, canonical, `hreflang` pairs (en-CA, fr-CA, x-default), Open Graph, `lang` on the page. |
| Performance | Astro static build, no framework runtime, one script of about 3 KB gzipped, two fonts trimmed to about 76 KB and inlined so the first paint uses them, the map pre-projected to SVG at build time. |
| Bilingual | `/fr/` is the same page in French, source labels included. Publication titles stay in their original English. |

## What's real and what isn't

- **Real, from public sources** (each listed on the page, in `src/data/sources.ts` and `src/data/claims.ts`): the Coatepec pilot with Nestlé México, the Nayarit project with SEDESU, the Abu Dhabi monitoring, the recognition list, the products page's per-collector ranges, the six project steps.
- **Map pins** sit at the named town or area centre. Coordinates are derived from the place name, not given by any source. Abu Dhabi's pin is at the city because the site isn't public; the panel says so. Peru, Chile and Belgium are listed without pins for the same reason.
- **Fog on the map** is drawn for illustration (the legend says so).
- **The water estimate** multiplies the collector count by the per-unit range on Permalution's products page (Industrial collector: 750 to 2,000 litres a day). It is illustrative, says so on the page, and is the company's figure, not a measurement.
- **The French copy** was drafted with Claude (claude-sonnet-5-5, one recorded run in `data/i18n-run/`: prompt, output, start time) and needs a review by a native speaker. The page says so.
- **The form** sends nothing. Its submit button stays disabled until the script is running, and a `<noscript>` note says why, so a visitor without JavaScript can't post their details anywhere.

## Run it

```bash
npm install
npm run dev        # http://localhost:5106
npm test           # projection, estimate, totes, form validation
npm run build      # type check + static build to dist/
node scripts/quality.mjs https://riipen-permalution.vercel.app   # Lighthouse + axe, writes src/data/quality.json
```

`quality.mjs` runs Lighthouse through `npx` and axe through Playwright. This repo doesn't install Playwright, so install it with Chromium (`npm i -g playwright && npx playwright install chromium`) and set `PLAYWRIGHT_PATH` to that package folder, for example `PLAYWRIGHT_PATH="$(npm root -g)/playwright"`.

## How it's built

- `src/lib/map.ts` projects Natural Earth land (world-atlas 110m) with d3-geo's Equal Earth at build time. The browser gets a finished SVG path.
- `src/lib/equal-earth.ts` is a small hand-written Equal Earth forward and inverse, so a click becomes a latitude and longitude without shipping d3. Tests check it against d3 to six decimals.
- `src/i18n/en.ts` and `fr.ts` hold all copy. `[[claimId:text]]` marks a sourced claim; `Rich.astro` renders it and the claims view numbers it.
- `src/scripts/app.ts` is the only client script: tabs, map pin, estimate slider, claims toggle, form validation. Without it the page still reads top to bottom: every project and journey panel shows, the slider is disabled, and the FAQ works.

The "Measured on this page" strip in the footer is the output of `scripts/quality.mjs` against the live URL (Lighthouse mobile preset, axe-core). Because the live page sends `X-Robots-Tag: noindex` on purpose, Lighthouse's SEO score counts that against it; the strip says so.
