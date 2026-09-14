import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Vercel serves from `/`. GitHub Pages project sites set BASE_PATH in CI.
  base: process.env.BASE_PATH || '/',
})
