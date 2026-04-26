import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react(), 
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        devOptions: {
          enabled: true,
          type: 'module'
        },
        workbox: {
          cleanupOutdatedCaches: true,
          clientsClaim: true,
          skipWaiting: true,
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            {
              urlPattern: /^https:\/\/img\.icons8\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'icons8-cache',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
                }
              }
            },
            {
              urlPattern: /^https:\/\/image\.pollinations\.ai\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'ai-images-cache',
                expiration: {
                  maxEntries: 20,
                  maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
                }
              }
            }
          ]
        },
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
        manifest: {
          name: 'LEO AI',
          short_name: 'LEO',
          id: 'com.aipower.leo',
          description: 'Advanced AI Voice and Chat Application with Live Voice capabilities',
          theme_color: '#0a0a0c',
          background_color: '#0a0a0c',
          display: 'standalone',
          display_override: ['window-controls-overlay', 'minimal-ui'],
          start_url: '/app',
          categories: ["productivity", "utilities", "ai"],
          icons: [
            {
              src: 'https://img.icons8.com/nolan/192/bot.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: 'https://img.icons8.com/nolan/512/bot.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: 'https://img.icons8.com/nolan/512/bot.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable'
            }
          ],
          shortcuts: [
            {
              name: "الدردشة النصية",
              short_name: "نص",
              url: "/app",
              icons: [{ "src": "https://img.icons8.com/color/96/chat--v1.png", "sizes": "96x96" }]
            },
            {
              name: "المكالمة الصوتية",
              short_name: "صوت",
              url: "/app",
              icons: [{ "src": "https://img.icons8.com/color/96/microphone.png", "sizes": "96x96" }]
            }
          ]
        }
      })
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      sourcemap: false,
    },
  };
});
