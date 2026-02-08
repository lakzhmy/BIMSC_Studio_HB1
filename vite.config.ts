import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5174',
        changeOrigin: true,
        secure: false
      },
      '/objects': {
        target: 'http://localhost:5174',
        changeOrigin: true,
        secure: false
      },
      '/streams': {
        target: 'http://localhost:5174',
        changeOrigin: true,
        secure: false
      },
      '/graphql': {
        target: 'http://localhost:5174',
        changeOrigin: true,
        secure: false
      }
    },
  },
  resolve: {
    dedupe: ['three'],
  },
})
