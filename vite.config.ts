import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'SM TV all in one TV platform',
        short_name: 'SM TV',
        description: 'SM TV all in one TV platform - Watch Live TV Online',
        theme_color: '#0a0a0f',
        background_color: '#0a0a0f',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ]
      },
      workbox: { globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'] }
    })
  ],
  server: {
    port: 5173,
    proxy: {
      '/__m3u': {
        target: 'https://go.skym3u.dev',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/__m3u/, ''),
        headers: { 'User-Agent': 'SMTV-Web/1.0' }
      }
    }
  }
})
