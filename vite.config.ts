import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages serves this project site under /Private/ (the repo name).
// Override with BASE_PATH at build time if the repo is renamed.
// https://vite.dev/config/
export default defineConfig({
  base: process.env.BASE_PATH ?? '/Private/',
  plugins: [react()],
})
