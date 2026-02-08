import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
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
    alias: {
      '@': '/src',
    },
    dedupe: ['three'],
  },
})
