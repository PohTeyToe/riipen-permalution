import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://riipen-permalution.vercel.app',
  build: { inlineStylesheets: 'always' },
  compressHTML: true,
});
