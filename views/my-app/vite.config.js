// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/',          // ✅ build vào root domain
  server: {
    proxy: {
      '/uploads': {
        target: 'http://localhost:3000', // ✅ chỉ dùng khi dev
        changeOrigin: true,
      },
    },
  },
})
