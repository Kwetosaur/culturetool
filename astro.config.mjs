// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://Kwetosaur.github.io',
  base: '/culturetool/',
  build: {
    // 'file' : src/pages/objet-excalibur.astro -> dist/objet-excalibur.html
    // (au lieu de dist/objet-excalibur/index.html). Indispensable pour que les
    // pages compilees gardent EXACTEMENT la meme convention d'URL que les 29
    // pages statiques de public/ : memes liens relatifs entre pages, memes href
    // dans map.html, memes motifs dans tools/sync_sidebar.py. Sans ca, les deux
    // mondes ne peuvent pas cohabiter pendant la migration progressive
    // (voir docs/plan-industrialisation.md).
    format: 'file',
  },
});
