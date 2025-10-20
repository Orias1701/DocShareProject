// vite.config.js
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), tailwindcss()],
    // FE deploy ở gốc domain => để '/' (ổn định nhất)
    base: '/',

    // server proxy chỉ chạy khi `vite` (dev). Không ảnh hưởng build
    server: {
      proxy: mode === 'development'
        ? {
            '/uploads': {
              target: 'http://localhost:3000',
              changeOrigin: true,
            },
          }
        : undefined,
    },

    // (tuỳ chọn) strictPort vv. nếu cần
    // build: { sourcemap: true } // bật khi cần debug production
  }
})
