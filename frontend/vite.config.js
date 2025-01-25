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
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        ws: true,
        configure: (proxy, options) => {
          // Логирование всех запросов
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Sending Request to API:', {
              method: req.method,
              originalUrl: req.originalUrl,
              path: proxyReq.path,
              headers: proxyReq.getHeaders(),
              body: req.body
            });
          });

          // Логирование всех ответов
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('Received Response from API:', {
              status: proxyRes.statusCode,
              statusMessage: proxyRes.statusMessage,
              headers: proxyRes.headers,
              originalUrl: req.originalUrl
            });

            // Читаем тело ответа
            let body = '';
            proxyRes.on('data', function(chunk) {
              body += chunk;
            });
            proxyRes.on('end', function() {
              try {
                const parsedBody = JSON.parse(body);
                console.log('Response Body:', parsedBody);
              } catch (e) {
                console.log('Raw Response Body:', body);
              }
            });
          });

          // Обработка ошибок
          proxy.on('error', (err, req, res) => {
            console.error('Proxy Error:', {
              message: err.message,
              stack: err.stack,
              code: err.code,
              request: {
                method: req.method,
                url: req.originalUrl,
                headers: req.headers
              }
            });
            
            if (!res.headersSent) {
              res.writeHead(500, {
                'Content-Type': 'application/json'
              });
              res.end(JSON.stringify({ 
                message: 'Proxy error occurred',
                error: err.message
              }));
            }
          });
        }
      }
    }
  }
}) 