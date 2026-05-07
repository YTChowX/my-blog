import { pgPool } from "@/lib/db"

export async function query(text: string, params?: any[]) {
  const client = await pgPool.connect()
  try {
    const result = await client.query(text, params)
    return result.rows
  } finally {
    client.release()
  }
}

export async function exec(text: string, params?: any[]) {
  const client = await pgPool.connect()
  try {
    await client.query(text, params)
  } finally {
    client.release()
  }
}
