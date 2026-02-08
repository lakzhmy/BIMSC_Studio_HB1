import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/speckle': {
        target: 'https://speckle.systems',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/speckle/, ''),
      },
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
    dedupe: ['three'],
  },
})
