import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load all env vars (including SPECKLE_TOKEN) from .env / .env.local
  const env = loadEnv(mode, process.cwd(), '')
  const speckleServerUrl = env.SPECKLE_SERVER_URL || 'https://app.speckle.systems'
  const speckleToken = env.SPECKLE_TOKEN || ''

  if (!speckleToken) {
    console.warn('Warning: SPECKLE_TOKEN is not set. Private streams will fail to load.')
  } else {
    console.log(`Vite proxy: auth enabled, target ${speckleServerUrl}`)
  }

  const speckleProxy = {
    target: speckleServerUrl,
    changeOrigin: true,
    secure: true,
    configure: (proxy) => {
      proxy.on('proxyReq', (proxyReq) => {
        if (speckleToken) {
          proxyReq.setHeader('Authorization', `Bearer ${speckleToken}`)
        }
      })
      proxy.on('proxyRes', (proxyRes, req) => {
        console.log(`[speckle] ${req.method} ${req.url} -> ${proxyRes.statusCode}`)
      })
    }
  }

  return {
    plugins: [vue()],
    server: {
      proxy: {
        // Local Express API routes (must be listed BEFORE the catch-all /api)
        '/api/users': { target: 'http://localhost:5174', changeOrigin: true },
        '/api/milestones': { target: 'http://localhost:5174', changeOrigin: true },
        '/api/stress-test': { target: 'http://localhost:5174', changeOrigin: true },
        '/api/kpi-map': { target: 'http://localhost:5174', changeOrigin: true },
        // Everything else under /api goes to Speckle
        '/api': speckleProxy,
        '/objects': speckleProxy,
        '/streams': speckleProxy,
        '/graphql': speckleProxy,
        '/auth': {
          target: 'http://localhost:5174',
          changeOrigin: true,
        },
      },
    },
    resolve: {
      alias: {
        '@': '/src',
      },
      dedupe: ['three'],
    },
  }
})
