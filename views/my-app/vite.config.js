// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  
  // ✅ Build FE ở root của domain
  base: '/',

  // ✅ Chỉ dùng proxy khi chạy dev cục bộ
  server: {
    proxy: {
      '/uploads': {
        target: 'http://localhost:3000', // dùng khi bạn chạy local
        changeOrigin: true,
      },
      // bạn có thể thêm proxy khác ở đây nếu cần trong dev
    },
  },
})
