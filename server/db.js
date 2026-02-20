import pg from 'pg'

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
}
