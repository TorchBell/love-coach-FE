import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

import { fileURLToPath, URL } from 'node:url'
// frontend/vite.config.mjs

export default defineConfig({
  // ... 기존 설정들 ...
  server: {
    host: '0.0.0.0', // [추가] 모든 IP에서의 접속을 허용
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080', // Vite 서버가 백엔드로 요청을 전달하므로 localhost 유지 가능
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },

  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }


})


