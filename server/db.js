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
