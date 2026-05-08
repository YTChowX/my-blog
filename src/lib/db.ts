import { Pool } from "pg"

const globalForPool = globalThis as unknown as {
  pool: Pool | undefined
}

// 启动时校验必要的环境变量
if (!process.env.DATABASE_URL) {
  console.error("[SECURITY] DATABASE_URL 环境变量未设置，数据库功能将不可用")
}

export const pgPool = globalForPool.pool ?? new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes("neon.tech")
    ? { rejectUnauthorized: true }
    : undefined,
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
})

if (process.env.NODE_ENV !== "production") globalForPool.pool = pgPool
