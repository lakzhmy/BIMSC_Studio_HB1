import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import pg from 'pg'

// Load .env BEFORE creating the pool so DATABASE_URL is available locally
const __db_dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__db_dirname, '../.env') })
dotenv.config({ path: path.resolve(__db_dirname, '../.env.local') })

const { Pool } = pg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

export function query(text, params) {
  return pool.query(text, params)
}

export async function initDb() {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id              SERIAL PRIMARY KEY,
      google_id       TEXT UNIQUE NOT NULL,
      email           TEXT UNIQUE NOT NULL,
      verified_email  BOOLEAN DEFAULT FALSE,
      name            TEXT,
      given_name      TEXT,
      family_name     TEXT,
      picture         TEXT,
      locale          TEXT,
      team            TEXT,
      avatar_speed      REAL DEFAULT 2,
      avatar_wobble     INTEGER DEFAULT 30,
      avatar_complexity INTEGER DEFAULT 50,
      avatar_shade      INTEGER DEFAULT 2,
      created_at      TIMESTAMPTZ DEFAULT NOW(),
      updated_at      TIMESTAMPTZ DEFAULT NOW()
    )
  `)
  console.log('[db] users table ready')

  await query(`
    CREATE TABLE IF NOT EXISTS milestones (
      id              SERIAL PRIMARY KEY,
      week            INTEGER NOT NULL CHECK (week >= 1 AND week <= 10),
      team            TEXT NOT NULL CHECK (team IN ('structure', 'program', 'data')),
      title           TEXT NOT NULL,
      summary         TEXT[] DEFAULT '{}',
      connections     JSONB DEFAULT '{}',
      created_by      TEXT REFERENCES users(google_id),
      created_at      TIMESTAMPTZ DEFAULT NOW(),
      updated_at      TIMESTAMPTZ DEFAULT NOW()
    )
  `)
  console.log('[db] milestones table ready')

  await query(`
    CREATE TABLE IF NOT EXISTS stress_test_scores (
      id           SERIAL PRIMARY KEY,
      member_id    INTEGER NOT NULL UNIQUE,
      google_id    TEXT,
      last_score   INTEGER NOT NULL DEFAULT 0,
      last_health  INTEGER NOT NULL DEFAULT 0,
      best_score   INTEGER NOT NULL DEFAULT 0,
      best_health  INTEGER NOT NULL DEFAULT 0,
      highest_pops INTEGER NOT NULL DEFAULT 0,
      total_pops   INTEGER NOT NULL DEFAULT 0,
      total_games  INTEGER NOT NULL DEFAULT 0,
      updated_at   TIMESTAMPTZ DEFAULT NOW()
    )
  `)
  console.log('[db] stress_test_scores table ready')

  await query(`
    CREATE TABLE IF NOT EXISTS kpi_nodes (
      id          TEXT PRIMARY KEY,
      team        TEXT NOT NULL CHECK (team IN ('program','structure','data')),
      label       TEXT NOT NULL,
      sublabel    TEXT DEFAULT '',
      description TEXT DEFAULT '',
      cx          INTEGER NOT NULL,
      cy          INTEGER NOT NULL,
      created_at  TIMESTAMPTZ DEFAULT NOW(),
      updated_at  TIMESTAMPTZ DEFAULT NOW()
    )
  `)
  console.log('[db] kpi_nodes table ready')

  await query(`
    CREATE TABLE IF NOT EXISTS kpi_edges (
      id         TEXT PRIMARY KEY,
      source_id  TEXT NOT NULL REFERENCES kpi_nodes(id) ON DELETE CASCADE,
      target_id  TEXT NOT NULL REFERENCES kpi_nodes(id) ON DELETE CASCADE,
      strength   TEXT NOT NULL CHECK (strength IN ('strong','medium')),
      type       TEXT NOT NULL CHECK (type IN ('cross','within')),
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `)
  console.log('[db] kpi_edges table ready')

  await query(`
    CREATE TABLE IF NOT EXISTS annotations (
      id          SERIAL PRIMARY KEY,
      route       TEXT NOT NULL,
      ann_id      TEXT NOT NULL,
      arrow_path  JSONB NOT NULL,
      label       TEXT NOT NULL,
      label_anchor JSONB NOT NULL,
      color       TEXT NOT NULL DEFAULT '#c0392b',
      created_by  TEXT,
      created_at  TIMESTAMPTZ DEFAULT NOW(),
      updated_at  TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(route, ann_id)
    )
  `)
  // Migration: add sort_order column if it doesn't exist
  await query(`
    DO $$ BEGIN
      ALTER TABLE annotations ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
    EXCEPTION WHEN duplicate_column THEN NULL;
    END $$
  `)
  // Migration: add selector, title, side columns for fully-dynamic step definitions
  await query(`ALTER TABLE annotations ADD COLUMN IF NOT EXISTS selector TEXT`)
  await query(`ALTER TABLE annotations ADD COLUMN IF NOT EXISTS title    TEXT`)
  await query(`ALTER TABLE annotations ADD COLUMN IF NOT EXISTS side     TEXT DEFAULT 'bottom'`)
  // Backfill selector/title/side for existing rows that predate this migration
  await query(`
    UPDATE annotations SET
      selector = CASE ann_id
        WHEN 'kpi-health'        THEN '#tour-kpi-health'
        WHEN 'milestone'         THEN '#tour-milestone'
        WHEN 'team-health'       THEN '#tour-team-health'
        WHEN 'team-members'      THEN '#tour-team-members'
        WHEN 'kpi-table'         THEN '#tour-kpi-table'
        WHEN 'kpi-radar'         THEN '#tour-kpi-radar'
        WHEN 'kpi-network'       THEN '#tour-kpi-network'
        WHEN 'kpi-map-filter'    THEN '#tour-kpi-map-filter'
        WHEN 'timeline-track'    THEN '#tour-timeline-track'
        WHEN 'timeline-add'      THEN '#tour-timeline-add'
        WHEN 'viewer-3d'         THEN '#tour-viewer-3d'
        WHEN 'stress-game'       THEN '#tour-stress-game'
        WHEN 'stress-leaderboard' THEN '#tour-stress-leaderboard'
        ELSE selector
      END,
      title = CASE ann_id
        WHEN 'kpi-health'        THEN 'KPI Health'
        WHEN 'milestone'         THEN 'Milestones'
        WHEN 'team-health'       THEN 'Team Health'
        WHEN 'team-members'      THEN 'Team Members'
        WHEN 'kpi-table'         THEN 'KPI Cards'
        WHEN 'kpi-radar'         THEN 'Performance Radar'
        WHEN 'kpi-network'       THEN 'Dependency Network'
        WHEN 'kpi-map-filter'    THEN 'Team Filters'
        WHEN 'timeline-track'    THEN 'Timeline Track'
        WHEN 'timeline-add'      THEN 'Add Milestone'
        WHEN 'viewer-3d'         THEN '3D Model Viewer'
        WHEN 'stress-game'       THEN 'Stress Game'
        WHEN 'stress-leaderboard' THEN 'Leaderboard'
        ELSE title
      END,
      side = CASE ann_id
        WHEN 'team-members'      THEN 'top'
        WHEN 'kpi-table'         THEN 'top'
        WHEN 'kpi-radar'         THEN 'top'
        WHEN 'kpi-network'       THEN 'right'
        WHEN 'timeline-track'    THEN 'top'
        WHEN 'viewer-3d'         THEN 'right'
        WHEN 'stress-game'       THEN 'right'
        WHEN 'stress-leaderboard' THEN 'left'
        ELSE 'bottom'
      END
    WHERE selector IS NULL
  `)
  console.log('[db] annotations table ready')

  await query(`
    CREATE TABLE IF NOT EXISTS gradient_sets (
      id                    SERIAL PRIMARY KEY,
      name                  TEXT NOT NULL,
      property_name         TEXT NOT NULL,
      project_id            TEXT NOT NULL,
      visualization_model_id TEXT NOT NULL,
      manifest_model_id     TEXT NOT NULL,
      unit                  TEXT NOT NULL DEFAULT '',
      sort_order            INTEGER DEFAULT 0,
      created_at            TIMESTAMPTZ DEFAULT NOW()
    )
  `)
  // Add unit column if it doesn't exist (migration for existing tables)
  await query(`
    DO $$ BEGIN
      ALTER TABLE gradient_sets ADD COLUMN IF NOT EXISTS unit TEXT NOT NULL DEFAULT '';
    EXCEPTION WHEN duplicate_column THEN NULL;
    END $$
  `)
  console.log('[db] gradient_sets table ready')

  // Seed gradient sets if table is empty
  const { rows: gsCount } = await query('SELECT count(*)::int AS c FROM gradient_sets')
  if (gsCount[0].c === 0) {
    await query(`
      INSERT INTO gradient_sets (name, property_name, project_id, visualization_model_id, manifest_model_id, unit, sort_order) VALUES
        ('Distance to Exit',       'PRG_PAR_MeanDistToExit',  'f91adc2f08', '470a5c84fa', '31f0fc18e2', 'm', 1),
        ('Geometry Weight',        'PRG_PAR_GeometryWeight',  'f91adc2f08', '5def7c760f', 'a1819c4ed1', 'kg', 2),
        ('Ideal Distance to Exit', 'PRG_PAR_IdealDistToExit', 'f91adc2f08', '9b72254e73', '9ae5c82ef9', 'm', 3)
    `)
    console.log('[db] gradient_sets seeded with 3 defaults')
  } else {
    // Backfill units for existing rows that are missing them
    await query(`UPDATE gradient_sets SET unit = 'm'  WHERE unit = '' AND property_name LIKE '%Dist%'`)
    await query(`UPDATE gradient_sets SET unit = 'kg' WHERE unit = '' AND property_name LIKE '%Weight%'`)
  }

  // Seed annotations if table is empty
  const { rows: annCount } = await query('SELECT count(*)::int AS c FROM annotations')
  if (annCount[0].c === 0) {
    await query(`
      INSERT INTO annotations (route, ann_id, selector, title, side, arrow_path, label, label_anchor, color) VALUES
        ('dashboard','kpi-health',   '#tour-kpi-health',        'KPI Health',          'bottom', '[[0.08,0.50],[0.06,0.40],[0.14,0.32],[0.22,0.34]]', 'KPI health and Warning detecting\nbased on set targets.\nConnected to the KPI Tab.',             '{"x":0.03,"y":0.51}','#c0392b'),
        ('dashboard','milestone',    '#tour-milestone',          'Milestones',          'bottom', '[[0.38,0.62],[0.40,0.52],[0.42,0.42],[0.44,0.34]]', 'Milestones summary to keep\nthe motivation up. Connected\nto the Timeline Tab.',                   '{"x":0.28,"y":0.62}','#c0392b'),
        ('dashboard','team-health',  '#tour-team-health',        'Team Health',         'bottom', '[[0.88,0.50],[0.90,0.42],[0.86,0.34],[0.76,0.34]]', 'Team Health calculated\nfrom the "Stress Test"\nmini game.',                                  '{"x":0.82,"y":0.51}','#c0392b'),
        ('dashboard','team-members', '#tour-team-members',       'Team Members',        'top',    '[[0.84,0.86],[0.78,0.82],[0.60,0.76],[0.48,0.72]]', 'Team members with their\npersonal avatar and info.',                                    '{"x":0.78,"y":0.87}','#c0392b'),
        ('kpi','kpi-table',          '#tour-kpi-table',          'KPI Cards',           'top',    '[[0.08,0.48],[0.06,0.38],[0.12,0.30],[0.24,0.32]]', 'KPI cards pulled live from\nGoogle Sheets. Green = on target,\nRed = outside target range.','{"x":0.03,"y":0.49}','#c0392b'),
        ('kpi','kpi-radar',          '#tour-kpi-radar',          'Performance Radar',   'top',    '[[0.80,0.56],[0.82,0.48],[0.78,0.40],[0.68,0.42]]', 'Radar chart: relative KPI\nperformance per team.\nUse toggles to filter teams.',              '{"x":0.74,"y":0.57}','#c0392b'),
        ('kpi-map','kpi-network',    '#tour-kpi-network',        'Dependency Network',  'right',  '[[0.08,0.52],[0.06,0.42],[0.14,0.36],[0.28,0.42]]', 'KPI dependency network.\nNodes represent design parameters.\nDrag to reorganise.',          '{"x":0.03,"y":0.53}','#c0392b'),
        ('kpi-map','kpi-map-filter', '#tour-kpi-map-filter',     'Team Filters',        'bottom', '[[0.82,0.24],[0.84,0.18],[0.88,0.14],[0.92,0.13]]', 'Filter by team to highlight\nrelevant KPI connections.',                                '{"x":0.72,"y":0.25}','#c0392b'),
        ('timeline','timeline-track','#tour-timeline-track',     'Timeline Track',      'top',    '[[0.10,0.46],[0.08,0.36],[0.16,0.28],[0.30,0.32]]', 'Weekly milestone track.\nEach lane = one team.\nToday marker shows current week.',           '{"x":0.04,"y":0.47}','#c0392b'),
        ('timeline','timeline-add',  '#tour-timeline-add',       'Add Milestone',       'bottom', '[[0.76,0.22],[0.80,0.17],[0.86,0.14],[0.90,0.15]]', 'Add Milestone to log\nteam deliverables.',                                             '{"x":0.66,"y":0.22}','#c0392b'),
        ('viewer','viewer-3d',       '#tour-viewer-3d',          '3D Model Viewer',     'right',  '[[0.10,0.54],[0.08,0.44],[0.16,0.36],[0.30,0.42]]', '3D model viewer powered by\nSpeckle. Navigate with mouse.\nToggle model versions on the right.','{"x":0.04,"y":0.55}','#c0392b'),
        ('stress-test','stress-game','#tour-stress-game',        'Stress Game',         'right',  '[[0.10,0.56],[0.08,0.46],[0.16,0.38],[0.30,0.44]]', 'Pop the blobs to score.\nYour result becomes your\npersonal Health score.',                 '{"x":0.03,"y":0.57}','#c0392b'),
        ('stress-test','stress-leaderboard','#tour-stress-leaderboard','Leaderboard',   'left',   '[[0.82,0.50],[0.84,0.42],[0.80,0.36],[0.72,0.38]]', 'Team calmness ranking\nand health breakdown\nper member.',                              '{"x":0.76,"y":0.51}','#c0392b')
    `)
    console.log('[db] annotations seeded with defaults')
  }

  // Seed login and tower page hints (insert only if missing — works on existing DBs too)
  await query(`
    INSERT INTO annotations (route, ann_id, selector, title, side, arrow_path, label, label_anchor, color) VALUES
      ('login', 'login-signin',  '#tour-login-signin',  'Sign In',           'bottom', '[]', 'Sign in with your Google account to access the BIMSC Studio dashboard and collaborate with your team.', '{}', '#c0392b'),
      ('login', 'login-explore', '#tour-login-explore', 'Explore the Tower', 'top',    '[]', 'Take a peek at HB01 — The Lungs — without signing in. Explore the design systems behind the hyperbuilding.', '{}', '#c0392b'),
      ('tower', 'tower-hero',    '#tour-tower-hero',    'The Project',       'bottom', '[]', 'HB01 "The Lungs" — a hyperbuilding designed to breathe. Scroll to explore the concept behind the project.', '{}', '#c0392b'),
      ('tower', 'tower-systems', '#tour-tower-systems', 'Three Systems',     'bottom', '[]', 'Three interconnected systems — Structure, Program, and Data — drive the design logic of this building.', '{}', '#c0392b')
    ON CONFLICT (route, ann_id) DO NOTHING
  `)
  console.log('[db] login/tower annotations ensured')

  // Upsert KPI map nodes (update names/descriptions, preserve cx/cy positions)
  await query(`
    INSERT INTO kpi_nodes (id, team, label, sublabel, description, cx, cy) VALUES
      ('P1','program','Effective Programmatic Area (EPA)','m²','The EPA (Effective Programmatic Area) is used to calculate operating costs based on actual usage. It defines how well-utilized (high EPA) or under-utilized (low EPA) spaces are in relation to the total area of the building.',450,140),
      ('P2','program','Programmatic Proximity Index (PPI)','unitless [0.0-1.0]','The PPI (Programmatic Proximity Index) evaluates a space''s location based strictly on its functional dependencies. High values (1.0) indicate optimal connectivity to critical zones, while low values (0.0) signify operational isolation.',450,268),
      ('P3','program','Resource Consumption Intensity Ratio (RCIR)','unitless [0.0-1.0]','The RCIR (Resource Consumption Intensity Ratio) is a performance metric (0.0 – 1.0) that quantifies the estimated demand for energy, water, and data services per program. By weighting the density of equipment and occupancy (the use_ratio) against specific technical requirements, the RCIR identifies high-intensity infrastructure cores versus low-impact, passive public zones.',450,396),
      ('S1','structure','Solar Control Performance','%','Measures how effectively the building''s structural configuration moderates solar exposure. By relating structural density to incident solar radiation, it reflects the capacity of the structure to contribute to passive shading and solar mitigation. Higher values indicate improved control of solar gains and more stable interior conditions.',730,140),
      ('S2','structure','Structural Efficiency','%','Evaluates how effectively the structural system resists environmental loads while maintaining material stability. By comparing structural density with stress loads and external wind pressure, it reflects the balance between structural capacity and environmental demand. Higher values indicate a more resilient and efficient structural configuration.',730,268),
      ('S3','structure','Filtration Efficiency','%','Quantifies the building''s ability to mitigate external pollution through filtration systems. By comparing filtration capacity with environmental pollution intensity, it reflects how effectively airborne contaminants are reduced. Higher values indicate stronger filtration performance and improved indoor air quality.',730,396),
      ('D1','data','Thermal Comfort Compliance Rate','%','Estimates the percentage of conditions that remain within acceptable thermal comfort ranges. By comparing structural buffering capacity with environmental pressures such as solar radiation and wind exposure, it approximates the building''s ability to moderate external climate effects. Higher values indicate more thermally stable environments.',170,140),
      ('D2','data','Acoustic Comfort Noise Impact Index','dB','Estimates the level of acoustic disturbance transmitted through the building envelope. By relating environmental pressures and structural stress to the damping effect of structural density, it approximates internal noise impact. Lower values indicate improved acoustic comfort.',170,268),
      ('D3','data','Air Purification Effectiveness','%','Estimates the percentage of airborne pollutants removed by the building. By normalizing pollution levels and combining with program intensity and filtration performance, it reflects the system''s capacity to process contaminated air. Higher values indicate stronger air purification capability.',170,396)
    ON CONFLICT (id) DO UPDATE SET
      label       = EXCLUDED.label,
      sublabel    = EXCLUDED.sublabel,
      description = EXCLUDED.description,
      updated_at  = NOW()
  `)
  console.log('[db] kpi_nodes upserted')

  // Replace all edges with formula-justified connections
  await query('DELETE FROM kpi_edges')
  await query(`
    INSERT INTO kpi_edges (id, source_id, target_id, strength, type) VALUES
      -- Within-team: shared formula parameters
      ('e-P1-P3','P1','P3','medium','within'),
      ('e-S1-S2','S1','S2','medium','within'),
      -- Cross P→D
      ('e-P1-D1','P1','D1','medium','cross'),
      ('e-P1-D3','P1','D3','medium','cross'),
      ('e-P3-D3','P3','D3','strong','cross'),
      ('e-P2-D2','P2','D2','medium','cross'),
      -- Cross S→D
      ('e-S1-D1','S1','D1','strong','cross'),
      ('e-S2-D1','S2','D1','medium','cross'),
      ('e-S2-D2','S2','D2','strong','cross'),
      ('e-S1-D2','S1','D2','medium','cross'),
      ('e-S3-D3','S3','D3','strong','cross')
  `)
  console.log('[db] kpi_edges reset with formula-justified connections')
}
