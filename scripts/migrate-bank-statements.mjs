#!/usr/bin/env node
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import pg from 'pg'

function loadDotEnv() {
  const envPath = resolve('.env')
  if (!existsSync(envPath)) return

  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (!(key in process.env)) {
      process.env[key] = value
    }
  }
}

loadDotEnv()

function projectRefFromSupabaseUrl(url) {
  try {
    const hostname = new URL(url).hostname
    return hostname.split('.')[0]
  } catch {
    return null
  }
}

function resolveConnectionString() {
  if (process.env.SUPABASE_DB_URL) return process.env.SUPABASE_DB_URL
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL
  if (process.env.POSTGRES_URL) return process.env.POSTGRES_URL

  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL
  const password =
    process.env.SUPABASE_DB_PASSWORD ??
    process.env.SUPABASE_ORG_PASSWORD ??
    process.env.POSTGRES_PASSWORD

  if (!supabaseUrl || !password) return null

  const ref = projectRefFromSupabaseUrl(supabaseUrl)
  if (!ref) return null

  return `postgresql://postgres:${encodeURIComponent(password)}@db.${ref}.supabase.co:5432/postgres`
}

const connectionString = resolveConnectionString()

if (!connectionString) {
  console.error(
    [
      'Missing database connection string.',
      '',
      'Or run supabase/migrations/20250716_bank_statements.sql manually in the SQL Editor.',
    ].join('\n'),
  )
  process.exit(1)
}

const sqlPath = resolve('supabase/migrations/20250716_bank_statements.sql')
const sql = readFileSync(sqlPath, 'utf8')
const client = new pg.Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
})

try {
  await client.connect()
  await client.query(sql)
  console.log('✓ bank_statements migration applied successfully')
} catch (error) {
  console.error('Migration failed:', error instanceof Error ? error.message : error)
  process.exit(1)
} finally {
  await client.end()
}
