import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist'
  },
  // This line helps Vercel handle client-side routing correctly
  server: {
    fs: {
      allow: ['..']
    }
  }
})
