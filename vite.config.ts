import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import { crawlerMarkup } from './src/seo/crawlerMarkup.ts'

/** Writes the site's real content into #root so crawlers see it without running JS. */
function crawlerShell(): Plugin {
  return {
    name: 'crawler-shell',
    transformIndexHtml(html) {
      return html.replace('<div id="root"></div>', `<div id="root">${crawlerMarkup()}</div>`)
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), crawlerShell()],
  // Vercel serves from `/`. GitHub Pages project sites set BASE_PATH in CI.
  base: process.env.BASE_PATH || '/',
})
