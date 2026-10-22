import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        // Do NOT rewrite — backend context-path is already /api
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
