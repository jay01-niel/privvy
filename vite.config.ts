import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/ghosty': {
        target: 'https://api.ghosty.cash',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/ghosty/, ''),
      },
    },
  },
})
