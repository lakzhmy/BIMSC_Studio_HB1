import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load all env vars (including SPECKLE_TOKEN) from .env / .env.local
  const env = loadEnv(mode, process.cwd(), '')
  const backendPort = env.BACKEND_PORT || '3001'
  const backendUrl = `http://localhost:${backendPort}`
  const speckleServerUrl = env.SPECKLE_SERVER_URL || 'https://app.speckle.systems'
  const speckleToken = env.SPECKLE_TOKEN || ''

  if (!speckleToken) {
    console.warn('Warning: SPECKLE_TOKEN is not set. Private streams will fail to load.')
  } else {
    console.log(`Vite proxy: auth enabled, target ${speckleServerUrl}`)
  }

  const backendProxy = { target: backendUrl, changeOrigin: true }

  const speckleProxy = {
    target: speckleServerUrl,
    changeOrigin: true,
    secure: true,
    timeout: 30000,
    configure: (proxy) => {
      proxy.on('proxyReq', (proxyReq) => {
        if (speckleToken) {
          proxyReq.setHeader('Authorization', `Bearer ${speckleToken}`)
        }
      })
      proxy.on('proxyRes', (proxyRes, req) => {
        console.log(`[speckle] ${req.method} ${req.url} -> ${proxyRes.statusCode}`)
      })
      proxy.on('error', (err, req) => {
        console.error(`[speckle] proxy error for ${req.method} ${req.url}:`, err.message)
      })
    }
  }

  return {
    plugins: [vue()],
    server: {
      proxy: {
        // Local Express API routes (must be listed BEFORE the catch-all /api)
        '/api/users': backendProxy,
        '/api/annotations': backendProxy,
        '/api/milestones': backendProxy,
        '/api/stress-test': backendProxy,
        '/api/kpi-map': backendProxy,
        // Everything else under /api goes to Speckle
        '/api': speckleProxy,
        '/objects': speckleProxy,
        '/streams': speckleProxy,
        '/graphql': speckleProxy,
        '/auth': backendProxy,
      },
    },
    resolve: {
      alias: {
        '@': '/src',
      },
      dedupe: [],
    },
  }
})
