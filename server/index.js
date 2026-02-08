import 'dotenv/config'
import express from 'express'
import { createProxyMiddleware } from 'http-proxy-middleware'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const app = express()
const port = Number(process.env.PORT || 5174)
const speckleServerUrl = process.env.SPECKLE_SERVER_URL || 'https://speckle.systems'
const speckleToken = process.env.SPECKLE_TOKEN || ''

const proxyPaths = ['/api', '/objects', '/streams', '/graphql']

if (!speckleToken) {
  console.warn('Warning: SPECKLE_TOKEN is not set. Private streams will fail to load.')
}

proxyPaths.forEach((proxyPath) => {
  app.use(
    proxyPath,
    createProxyMiddleware({
      target: speckleServerUrl,
      changeOrigin: true,
      secure: true,
      onProxyReq: (proxyReq) => {
        if (speckleToken) {
          proxyReq.setHeader('Authorization', `Bearer ${speckleToken}`)
        }
      }
    })
  )
})

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
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
