import dotenv from 'dotenv'
import express from 'express'
import { createProxyMiddleware } from 'http-proxy-middleware'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '../.env') })
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const app = express()
const port = Number(process.env.PORT || 5174)
const speckleServerUrl = process.env.SPECKLE_SERVER_URL || 'https://app.speckle.systems'
const speckleToken = process.env.SPECKLE_TOKEN || ''
const hasSpeckleToken = Boolean(speckleToken)

const proxyPaths = ['/api', '/objects', '/streams', '/graphql']

if (!hasSpeckleToken) {
  console.warn('Warning: SPECKLE_TOKEN is not set. Private streams will fail to load.')
} else {
  console.log('Speckle proxy auth enabled.')
}

proxyPaths.forEach((proxyPath) => {
  app.use(
    proxyPath,
    createProxyMiddleware({
      target: speckleServerUrl,
      changeOrigin: true,
      secure: true,
      pathRewrite: (reqPath, req) => {
        // Express strips the mount path, so we must prepend it back
        return proxyPath + reqPath
      },
      onProxyReq: (proxyReq) => {
        if (hasSpeckleToken) {
          proxyReq.setHeader('Authorization', `Bearer ${speckleToken}`)
        }
      },
      onProxyRes: (proxyRes, req) => {
        console.log(`[speckle] ${req.method} ${req.url} -> ${proxyRes.statusCode}`)
      }
    })
  )
})

const distPath = path.resolve(__dirname, '../dist')

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath))

  app.get('*', (req, res, next) => {
    if (proxyPaths.some((prefix) => req.path.startsWith(prefix))) {
      return next()
    }
    res.sendFile(path.join(distPath, 'index.html'))
  })
}

app.listen(port, () => {
  console.log(`Speckle proxy server listening on http://localhost:${port}`)
})
