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

  // Seed default KPI map data if tables are empty
  const { rows: nodeCount } = await query('SELECT COUNT(*) FROM kpi_nodes')
  if (parseInt(nodeCount[0].count) === 0) {
    await query(`
      INSERT INTO kpi_nodes (id, team, label, sublabel, description, cx, cy) VALUES
        ('P1','program','Occupancy Density','m² / use','Building occupancy capacity, modifying square footage (m²), and the dimensions of the architectural program.',450,140),
        ('P2','program','Circulation-to-Program Ratio','Net / Gross','Dimensions and positioning of circulation routes based on the location of the program throughout the building.',450,268),
        ('P3','program','Resource Consumption Intensity','','Consumption and distribution of resources throughout the building based on the needs of each program.',450,396),
        ('S1','structure','Natural Light & Shading','Daylight & Solar Control','How the façade pattern, openings, and orientation balance daylight admission and solar gain control across the building.',730,140),
        ('S2','structure','Energy & Water Performance','System Responsiveness','Assesses how efficiently environmental systems respond to external and internal conditions while minimizing energy consumption and resource losses.',730,268),
        ('S3','structure','Thermal, Solar & Wind Buffering','Environmental Envelope','Evaluates how effectively the façade mitigates external environmental forces before they reach interior spaces, integrating material properties, pattern behavior, and wind-responsive design.',730,396),
        ('D1','data','Thermal Comfort Compliance','','Aggregates thermal inputs derived from program occupancy, envelope performance, structural mass, and active systems and evaluates how consistently interior spaces remain within acceptable thermal comfort ranges.',170,140),
        ('D2','data','Acoustic Comfort & Noise Index','','Aggregates noise sources (mechanical systems, circulation, program activity), structural transmission paths, envelope attenuation, and spatial buffering strategies.',170,268),
        ('D3','data','Air Purification Effectiveness','','Informed by façade geometry, structural porosity, program density, and core systems. Defines how much air the building processes and the degree to which pollutants are removed before redistribution.',170,396)
    `)
    await query(`
      INSERT INTO kpi_edges (id, source_id, target_id, strength, type) VALUES
        ('e-P1-D1','P1','D1','strong','cross'),
        ('e-P1-D2','P1','D2','strong','cross'),
        ('e-P1-D3','P1','D3','medium','cross'),
        ('e-P2-D2','P2','D2','strong','cross'),
        ('e-P3-D3','P3','D3','strong','cross'),
        ('e-P3-S2','P3','S2','medium','cross'),
        ('e-S1-D1','S1','D1','strong','cross'),
        ('e-S2-D1','S2','D1','medium','cross'),
        ('e-S3-D1','S3','D1','strong','cross'),
        ('e-S3-D3','S3','D3','medium','cross'),
        ('e-S1-S3','S1','S3','medium','within'),
        ('e-P1-P2','P1','P2','medium','within')
    `)
    console.log('[db] kpi_nodes + kpi_edges seeded with defaults')
  }
}
