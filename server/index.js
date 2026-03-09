import dotenv from 'dotenv'
import express from 'express'
import { createProxyMiddleware } from 'http-proxy-middleware'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { initDb, query } from './db.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '../.env') })
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const app = express()
const port = Number(process.env.BACKEND_PORT || process.env.PORT || 3001)
const speckleServerUrl = process.env.SPECKLE_SERVER_URL || 'https://app.speckle.systems'
const speckleToken = process.env.SPECKLE_TOKEN || ''
const hasSpeckleToken = Boolean(speckleToken)

if (!hasSpeckleToken) {
  console.warn('Warning: SPECKLE_TOKEN is not set. Private streams will fail to load.')
} else {
  console.log('Speckle proxy auth enabled.')
}

// --- Speckle passthrough proxies (registered BEFORE express.json() to preserve POST body) ---
const specklePassthroughPaths = ['/graphql', '/objects', '/streams']

function makeSpeckleProxy(mountPath) {
  return createProxyMiddleware({
    target: speckleServerUrl,
    changeOrigin: true,
    secure: true,
    pathRewrite: (reqPath) => mountPath + reqPath,
    onProxyReq: (proxyReq) => {
      if (hasSpeckleToken) {
        proxyReq.setHeader('Authorization', `Bearer ${speckleToken}`)
      }
    },
    onProxyRes: (proxyRes, req) => {
      console.log(`[speckle] ${req.method} ${req.url} -> ${proxyRes.statusCode}`)
    },
  })
}

specklePassthroughPaths.forEach((p) => app.use(p, makeSpeckleProxy(p)))

// --- Body parser (after Speckle proxies so POST bodies aren't consumed) ---
app.use(express.json())

const proxyPaths = ['/api', '/objects', '/streams', '/graphql']

// --- User Profile Update (registered before Speckle proxy) ---

app.post('/api/users/profile', async (req, res) => {
  const { google_id, team, avatar } = req.body

  if (!google_id) {
    return res.status(400).json({ error: 'google_id is required' })
  }

  try {
    await query(
      `UPDATE users SET
        team = $1,
        avatar_speed = $2,
        avatar_wobble = $3,
        avatar_complexity = $4,
        avatar_shade = $5,
        updated_at = NOW()
       WHERE google_id = $6`,
      [
        team || null,
        avatar?.speed ?? 2,
        avatar?.wobble ?? 30,
        avatar?.complexity ?? 50,
        avatar?.shade ?? 2,
        google_id,
      ]
    )
    res.json({ ok: true })
  } catch (err) {
    console.error('[db] profile update failed:', err.message)
    res.status(500).json({ error: 'Failed to update profile' })
  }
})

// --- Milestone CRUD ---

// GET all milestones
app.get('/api/milestones', async (req, res) => {
  try {
    const result = await query(
      `SELECT m.*, u.name AS author_name
       FROM milestones m
       LEFT JOIN users u ON m.created_by = u.google_id
       ORDER BY m.week, m.team, m.created_at`
    )
    res.json(result.rows)
  } catch (err) {
    console.error('[db] milestones fetch failed:', err.message)
    res.status(500).json({ error: 'Failed to fetch milestones' })
  }
})

// POST create a milestone
app.post('/api/milestones', async (req, res) => {
  const { week, team, title, summary, connections, created_by } = req.body

  if (!week || !team || !title) {
    return res.status(400).json({ error: 'week, team, and title are required' })
  }

  try {
    const result = await query(
      `INSERT INTO milestones (week, team, title, summary, connections, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        week,
        team,
        title,
        summary || [],
        JSON.stringify(connections || {}),
        created_by || null,
      ]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error('[db] milestone create failed:', err.message)
    res.status(500).json({ error: 'Failed to create milestone' })
  }
})

// PUT update a milestone
app.put('/api/milestones/:id', async (req, res) => {
  const { id } = req.params
  const { week, team, title, summary, connections } = req.body

  try {
    const result = await query(
      `UPDATE milestones SET
        week = COALESCE($1, week),
        team = COALESCE($2, team),
        title = COALESCE($3, title),
        summary = COALESCE($4, summary),
        connections = COALESCE($5, connections),
        updated_at = NOW()
       WHERE id = $6
       RETURNING *`,
      [
        week || null,
        team || null,
        title || null,
        summary || null,
        connections ? JSON.stringify(connections) : null,
        id,
      ]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Milestone not found' })
    }
    res.json(result.rows[0])
  } catch (err) {
    console.error('[db] milestone update failed:', err.message)
    res.status(500).json({ error: 'Failed to update milestone' })
  }
})

// DELETE a milestone
app.delete('/api/milestones/:id', async (req, res) => {
  const { id } = req.params

  try {
    const result = await query(
      `DELETE FROM milestones WHERE id = $1 RETURNING id`,
      [id]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Milestone not found' })
    }
    res.json({ ok: true, deleted: result.rows[0].id })
  } catch (err) {
    console.error('[db] milestone delete failed:', err.message)
    res.status(500).json({ error: 'Failed to delete milestone' })
  }
})

// --- Stress Test Scores ---

// GET all stress test scores
app.get('/api/stress-test/scores', async (req, res) => {
  try {
    const result = await query('SELECT * FROM stress_test_scores ORDER BY member_id')
    res.json(result.rows)
  } catch (err) {
    console.error('[db] stress scores fetch failed:', err.message)
    res.status(500).json({ error: 'Failed to fetch scores' })
  }
})

// POST upsert a stress test score for a member
app.post('/api/stress-test/score', async (req, res) => {
  const { member_id, google_id, last_score, last_health, best_score, best_health, highest_pops, total_pops, total_games } = req.body

  if (!member_id) {
    return res.status(400).json({ error: 'member_id is required' })
  }

  try {
    const result = await query(
      `INSERT INTO stress_test_scores
         (member_id, google_id, last_score, last_health, best_score, best_health, highest_pops, total_pops, total_games, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
       ON CONFLICT (member_id) DO UPDATE SET
         google_id    = EXCLUDED.google_id,
         last_score   = EXCLUDED.last_score,
         last_health  = EXCLUDED.last_health,
         best_score   = EXCLUDED.best_score,
         best_health  = EXCLUDED.best_health,
         highest_pops = EXCLUDED.highest_pops,
         total_pops   = EXCLUDED.total_pops,
         total_games  = EXCLUDED.total_games,
         updated_at   = NOW()
       RETURNING *`,
      [
        member_id,
        google_id || null,
        last_score ?? 0,
        last_health ?? 0,
        best_score ?? 0,
        best_health ?? 0,
        highest_pops ?? 0,
        total_pops ?? 0,
        total_games ?? 0,
      ]
    )
    res.json(result.rows[0])
  } catch (err) {
    console.error('[db] stress score save failed:', err.message)
    res.status(500).json({ error: 'Failed to save score' })
  }
})

// --- KPI Map ---

// GET all nodes and edges
app.get('/api/kpi-map', async (req, res) => {
  try {
    const [nodesResult, edgesResult] = await Promise.all([
      query('SELECT * FROM kpi_nodes ORDER BY team, cy'),
      query('SELECT * FROM kpi_edges ORDER BY created_at'),
    ])
    res.json({ nodes: nodesResult.rows, edges: edgesResult.rows })
  } catch (err) {
    console.error('[db] kpi-map fetch failed:', err.message)
    res.status(500).json({ error: 'Failed to fetch KPI map' })
  }
})

// PUT update a node
app.put('/api/kpi-map/nodes/:id', async (req, res) => {
  const { id } = req.params
  const { label, sublabel, description, team } = req.body
  try {
    const result = await query(
      `UPDATE kpi_nodes SET
        label       = COALESCE($1, label),
        sublabel    = COALESCE($2, sublabel),
        description = COALESCE($3, description),
        team        = COALESCE($4, team),
        updated_at  = NOW()
       WHERE id = $5 RETURNING *`,
      [label, sublabel, description, team, id]
    )
    if (!result.rows.length) return res.status(404).json({ error: 'Node not found' })
    res.json(result.rows[0])
  } catch (err) {
    console.error('[db] kpi node update failed:', err.message)
    res.status(500).json({ error: 'Failed to update node' })
  }
})

// POST create a new node (id + cx + cy auto-calculated)
app.post('/api/kpi-map/nodes', async (req, res) => {
  const { team, label, sublabel = '', description = '' } = req.body
  if (!team || !label) return res.status(400).json({ error: 'team and label are required' })

  try {
    const prefix = { program: 'P', structure: 'S', data: 'D' }[team]
    const cx     = { program: 450, structure: 730, data: 170 }[team]
    const { rows: existing } = await query('SELECT id FROM kpi_nodes WHERE team = $1', [team])
    const newId = `${prefix}${existing.length + 1}`
    const cy    = existing.length * 128 + 140

    const result = await query(
      `INSERT INTO kpi_nodes (id, team, label, sublabel, description, cx, cy)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [newId, team, label, sublabel, description, cx, cy]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error('[db] kpi node create failed:', err.message)
    res.status(500).json({ error: 'Failed to create node' })
  }
})

// DELETE a node (edges cascade via FK)
app.delete('/api/kpi-map/nodes/:id', async (req, res) => {
  const { id } = req.params
  try {
    const result = await query('DELETE FROM kpi_nodes WHERE id = $1 RETURNING id', [id])
    if (!result.rows.length) return res.status(404).json({ error: 'Node not found' })
    res.json({ ok: true, deleted: id })
  } catch (err) {
    console.error('[db] kpi node delete failed:', err.message)
    res.status(500).json({ error: 'Failed to delete node' })
  }
})

// POST create a new edge
app.post('/api/kpi-map/edges', async (req, res) => {
  const { source_id, target_id, strength = 'medium' } = req.body
  if (!source_id || !target_id) return res.status(400).json({ error: 'source_id and target_id are required' })

  // Derive type from team prefix
  const srcTeam = source_id[0]
  const tgtTeam = target_id[0]
  const type = srcTeam === tgtTeam ? 'within' : 'cross'
  const id = `e-${source_id}-${target_id}`

  try {
    const result = await query(
      `INSERT INTO kpi_edges (id, source_id, target_id, strength, type)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO UPDATE SET strength = EXCLUDED.strength
       RETURNING *`,
      [id, source_id, target_id, strength, type]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error('[db] kpi edge create failed:', err.message)
    res.status(500).json({ error: 'Failed to create edge' })
  }
})

// PUT update edge strength
app.put('/api/kpi-map/edges/:id', async (req, res) => {
  const { id } = req.params
  const { strength } = req.body
  if (!strength) return res.status(400).json({ error: 'strength is required' })
  try {
    const result = await query(
      'UPDATE kpi_edges SET strength = $1 WHERE id = $2 RETURNING *',
      [strength, id]
    )
    if (!result.rows.length) return res.status(404).json({ error: 'Edge not found' })
    res.json(result.rows[0])
  } catch (err) {
    console.error('[db] kpi edge update failed:', err.message)
    res.status(500).json({ error: 'Failed to update edge' })
  }
})

// DELETE an edge
app.delete('/api/kpi-map/edges/:id', async (req, res) => {
  const { id } = req.params
  try {
    const result = await query('DELETE FROM kpi_edges WHERE id = $1 RETURNING id', [id])
    if (!result.rows.length) return res.status(404).json({ error: 'Edge not found' })
    res.json({ ok: true, deleted: id })
  } catch (err) {
    console.error('[db] kpi edge delete failed:', err.message)
    res.status(500).json({ error: 'Failed to delete edge' })
  }
})

// --- Gradient Visualization Sets ---

app.get('/api/gradient-sets', async (req, res) => {
  try {
    const result = await query('SELECT * FROM gradient_sets ORDER BY sort_order, id')
    res.json(result.rows)
  } catch (err) {
    console.error('[db] gradient_sets fetch failed:', err.message)
    res.status(500).json({ error: 'Failed to fetch gradient sets' })
  }
})

// --- Annotations CRUD ---

const ANNOTATION_ADMINS = [
  'Emilie El Chidiac',
  'María Sánchez Domínguez',
  'María Sánchez i Domínguez',
  'Lakzhmy Mari Zaro',
]

function isAnnotationAdmin(name) {
  return ANNOTATION_ADMINS.some(
    (admin) => admin.localeCompare(name, undefined, { sensitivity: 'base' }) === 0
  )
}

// GET all annotations (public)
app.get('/api/annotations', async (req, res) => {
  try {
    const result = await query('SELECT * FROM annotations ORDER BY route, id')
    res.json(result.rows)
  } catch (err) {
    console.error('[db] annotations fetch failed:', err.message)
    res.status(500).json({ error: 'Failed to fetch annotations' })
  }
})

// POST create an annotation (admin only)
app.post('/api/annotations', async (req, res) => {
  const { route: annRoute, ann_id, arrow_path, label, label_anchor, color, user_name } = req.body
  if (!user_name || !isAnnotationAdmin(user_name)) {
    return res.status(403).json({ error: 'Not authorized to manage annotations' })
  }
  if (!annRoute || !ann_id || !arrow_path || !label || !label_anchor) {
    return res.status(400).json({ error: 'route, ann_id, arrow_path, label, and label_anchor are required' })
  }
  try {
    const result = await query(
      `INSERT INTO annotations (route, ann_id, arrow_path, label, label_anchor, color, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (route, ann_id) DO UPDATE SET
         arrow_path   = EXCLUDED.arrow_path,
         label        = EXCLUDED.label,
         label_anchor = EXCLUDED.label_anchor,
         color        = EXCLUDED.color,
         updated_at   = NOW()
       RETURNING *`,
      [annRoute, ann_id, JSON.stringify(arrow_path), label, JSON.stringify(label_anchor), color || '#c0392b', user_name]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error('[db] annotation create failed:', err.message)
    res.status(500).json({ error: 'Failed to create annotation' })
  }
})

// PUT update an annotation (admin only)
app.put('/api/annotations/:id', async (req, res) => {
  const { id } = req.params
  const { arrow_path, label, label_anchor, color, user_name } = req.body
  if (!user_name || !isAnnotationAdmin(user_name)) {
    return res.status(403).json({ error: 'Not authorized to manage annotations' })
  }
  try {
    const result = await query(
      `UPDATE annotations SET
        arrow_path   = COALESCE($1, arrow_path),
        label        = COALESCE($2, label),
        label_anchor = COALESCE($3, label_anchor),
        color        = COALESCE($4, color),
        updated_at   = NOW()
       WHERE id = $5 RETURNING *`,
      [
        arrow_path ? JSON.stringify(arrow_path) : null,
        label || null,
        label_anchor ? JSON.stringify(label_anchor) : null,
        color || null,
        id,
      ]
    )
    if (!result.rows.length) return res.status(404).json({ error: 'Annotation not found' })
    res.json(result.rows[0])
  } catch (err) {
    console.error('[db] annotation update failed:', err.message)
    res.status(500).json({ error: 'Failed to update annotation' })
  }
})

// DELETE an annotation (admin only)
app.delete('/api/annotations/:id', async (req, res) => {
  const { id } = req.params
  const userName = req.query.user_name
  if (!userName || !isAnnotationAdmin(userName)) {
    return res.status(403).json({ error: 'Not authorized to manage annotations' })
  }
  try {
    const result = await query('DELETE FROM annotations WHERE id = $1 RETURNING id', [id])
    if (!result.rows.length) return res.status(404).json({ error: 'Annotation not found' })
    res.json({ ok: true, deleted: result.rows[0].id })
  } catch (err) {
    console.error('[db] annotation delete failed:', err.message)
    res.status(500).json({ error: 'Failed to delete annotation' })
  }
})

// --- Speckle /api catch-all proxy (after Express API routes so they take priority) ---
app.use('/api', makeSpeckleProxy('/api'))

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

  const frontendBase = process.env.FRONTEND_URL || getBaseUrl(req)

  if (error) {
    return res.redirect(`${frontendBase}/?error=` + encodeURIComponent(error))
  }

  if (!code) {
    return res.redirect(`${frontendBase}/?error=no_code`)
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
      return res.redirect(`${frontendBase}/?error=token_exchange_failed`)
    }

    const tokenData = await tokenResponse.json()

    // Fetch user profile
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    })

    if (!userResponse.ok) {
      console.error('Userinfo fetch failed:', userResponse.status)
      return res.redirect(`${frontendBase}/?error=userinfo_failed`)
    }

    const userData = await userResponse.json()

    // Upsert user into database and retrieve saved team/avatar
    let dbUser = null
    try {
      const result = await query(
        `INSERT INTO users (google_id, email, verified_email, name, given_name, family_name, picture, locale)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (google_id) DO UPDATE SET
           email = EXCLUDED.email,
           verified_email = EXCLUDED.verified_email,
           name = EXCLUDED.name,
           given_name = EXCLUDED.given_name,
           family_name = EXCLUDED.family_name,
           picture = EXCLUDED.picture,
           locale = EXCLUDED.locale,
           updated_at = NOW()
         RETURNING team, avatar_speed, avatar_wobble, avatar_complexity, avatar_shade`,
        [
          userData.id,
          userData.email,
          userData.verified_email ?? false,
          userData.name,
          userData.given_name,
          userData.family_name,
          userData.picture,
          userData.locale,
        ]
      )
      dbUser = result.rows[0]
      console.log('[db] upserted user:', userData.email)
    } catch (dbErr) {
      console.error('[db] upsert failed:', dbErr.message)
    }

    // Redirect to frontend with profile data
    const frontendParams = new URLSearchParams({
      google_id: userData.id || '',
      email: userData.email || '',
      verified_email: String(userData.verified_email ?? false),
      name: userData.name || '',
      given_name: userData.given_name || '',
      family_name: userData.family_name || '',
      picture: userData.picture || '',
      locale: userData.locale || '',
    })

    // Include saved team/avatar so the frontend can skip profile setup
    if (dbUser?.team) {
      frontendParams.set('team', dbUser.team)
      frontendParams.set('avatar_speed', String(dbUser.avatar_speed ?? 2))
      frontendParams.set('avatar_wobble', String(dbUser.avatar_wobble ?? 30))
      frontendParams.set('avatar_complexity', String(dbUser.avatar_complexity ?? 50))
      frontendParams.set('avatar_shade', String(dbUser.avatar_shade ?? 2))
    }

    const frontendUrl = process.env.FRONTEND_URL || getBaseUrl(req)
    res.redirect(`${frontendUrl}/auth/success?${frontendParams.toString()}`)
  } catch (err) {
    console.error('OAuth callback error:', err)
    const frontendBase = process.env.FRONTEND_URL || getBaseUrl(req)
    res.redirect(`${frontendBase}/?error=server_error`)
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

initDb()
  .then(() => {
    app.listen(port, () => {
      console.log(`Speckle proxy server listening on http://localhost:${port}`)
    })
  })
  .catch((err) => {
    console.error('[db] Failed to initialize database:', err.message)
    process.exit(1)
  })
