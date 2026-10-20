import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://riipen-permalution.vercel.app',
  build: { inlineStylesheets: 'always' },
  compressHTML: true,
  // Inline the two trimmed fonts so first-time visitors never see a fallback face.
  vite: { build: { assetsInlineLimit: (file) => (file.endsWith('.woff2') ? true : undefined) } },
});
