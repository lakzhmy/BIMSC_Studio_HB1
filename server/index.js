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

// --- Google OAuth2 Routes ---

function getBaseUrl(req) {
  const protocol = req.headers['x-forwarded-proto'] || req.protocol
  const host = req.headers['x-forwarded-host'] || req.get('host')
  return `${protocol}://${host}`
}

app.get('/auth/google', (req, res) => {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID
    if (!clientId) {
      return res.status(500).send('GOOGLE_CLIENT_ID is not configured')
    }

    const redirectUri = `${getBaseUrl(req)}/auth/callback`
    console.log('[oauth] Redirect URI:', redirectUri)

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'online',
      prompt: 'select_account',
    })

    res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`)
  } catch (err) {
    console.error('[oauth] /auth/google error:', err)
    res.status(500).send('Internal server error')
  }
})

app.get('/auth/callback', async (req, res) => {
  const { code, error } = req.query

  if (error) {
    return res.redirect('/?error=' + encodeURIComponent(error))
  }

  if (!code) {
    return res.redirect('/?error=no_code')
  }

  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const redirectUri = `${getBaseUrl(req)}/auth/callback`

  try {
    // Exchange authorization code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    })

    if (!tokenResponse.ok) {
      const err = await tokenResponse.text()
      console.error('Token exchange failed:', err)
      return res.redirect('/?error=token_exchange_failed')
    }

    const tokenData = await tokenResponse.json()

    // Fetch user profile
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    })

    if (!userResponse.ok) {
      console.error('Userinfo fetch failed:', userResponse.status)
      return res.redirect('/?error=userinfo_failed')
    }

    const userData = await userResponse.json()

    // Redirect to frontend with profile data
    const frontendParams = new URLSearchParams({
      email: userData.email || '',
      name: userData.name || '',
      picture: userData.picture || '',
    })

    res.redirect(`/auth/success?${frontendParams.toString()}`)
  } catch (err) {
    console.error('OAuth callback error:', err)
    res.redirect('/?error=server_error')
  }
})

// --- Static Files ---

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
