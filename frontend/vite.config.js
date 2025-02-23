/**
 * Конфигурация Vite
 * Настройка сборки проекта
 */

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  define: {
    __VUE_PROD_DEVTOOLS__: true,
    'process.env': {}
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @use "@/styles/abstracts/_variables" as *;
          @use "@/styles/abstracts/_mixins" as *;
          @use "@/styles/abstracts/_functions" as *;
        `,
        api: 'modern'
      }
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.error('Ошибка прокси:', err);
            res.writeHead(500, {
              'Content-Type': 'application/json'
            });
            res.end(JSON.stringify({
              error: true,
              message: 'Ошибка прокси',
              details: err.message
            }));
          });
        }
      }
    }
  }
}) 