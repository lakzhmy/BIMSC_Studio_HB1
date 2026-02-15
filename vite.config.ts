import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const speckleServerUrl = env.SPECKLE_SERVER_URL || 'https://app.speckle.systems'
  const speckleToken = env.SPECKLE_TOKEN || ''

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
    }
  }

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api/users': {
          target: 'http://localhost:5174',
          changeOrigin: true,
        },
        '/api': speckleProxy,
        '/objects': speckleProxy,
        '/streams': speckleProxy,
        '/graphql': speckleProxy,
      },
    },
    resolve: {
      dedupe: ['three'],
    },
  }
})
