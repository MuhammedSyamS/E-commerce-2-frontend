import { defineConfig } from 'vite'
// Force restart timestamp: 2026-02-11
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5005',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://127.0.0.1:5005',
        changeOrigin: true,
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom', 'zustand', 'axios'],
          ui: ['lucide-react', 'recharts'],
        },
      },
    },
  },
})
