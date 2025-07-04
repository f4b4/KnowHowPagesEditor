import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/knowhow-editor/',
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    proxy: {
      '/knowhow-api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      },
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 3000,
  },
})
