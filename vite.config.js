import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'env-fallback',
      config: () => ({
        define: {
          'import.meta.env.VITE_GOOGLE_CLIENT_ID': JSON.stringify('860117335351-vjtkiko7ce194gd1r55qguspcor2b542.apps.googleusercontent.com')
        }
      })
    },
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      registerType: 'autoUpdate',
      injectManifest: {
        swDest: 'dist/sw.js'
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'SLOOK | Modern Essentials',
        short_name: 'SLOOK',
        description: 'Curated collection of modern essentials, from premium apparel to everyday carry items.',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'vite.svg',
            sizes: '192x192',
            type: 'image/svg+xml'
          },
          {
            src: 'vite.svg',
            sizes: '512x512',
            type: 'image/svg+xml'
          },
          {
            src: 'vite.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ],
        shortcuts: [
          {
            name: "My Orders",
            short_name: "Orders",
            description: "View your order history",
            url: "/profile?tab=orders",
            icons: [{ src: "vite.svg", sizes: "192x192", type: "image/svg+xml" }]
          },
          {
            name: "Cart",
            short_name: "Cart",
            description: "View your shopping cart",
            url: "/cart",
            icons: [{ src: "vite.svg", sizes: "192x192", type: "image/svg+xml" }]
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
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
  optimizeDeps: {
    include: ['@react-oauth/google']
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom', 'zustand', 'axios', '@react-oauth/google'],
          ui: ['lucide-react', 'recharts'],
        },
      },
    },
  },
})
