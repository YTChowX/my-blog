import { Pool } from "pg"

const globalForPool = globalThis as unknown as {
  pool: Pool | undefined
}

export const pgPool = globalForPool.pool ?? new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes("neon.tech")
    ? { rejectUnauthorized: false }
    : undefined,
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
})

if (process.env.NODE_ENV !== "production") globalForPool.pool = pgPool
