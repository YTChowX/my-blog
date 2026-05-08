import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { pgPool } from "@/lib/db"

// 站点设置表
const SETTINGS_TABLE = "site_settings"

async function ensureTable() {
  await pgPool.query(`
    CREATE TABLE IF NOT EXISTS "${SETTINGS_TABLE}" (
      "key" TEXT PRIMARY KEY,
      "value" TEXT,
      "updatedAt" TIMESTAMP DEFAULT NOW()
    )
  `)
}

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.role || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "未授权" }, { status: 401 })
    }

    await ensureTable()
    const result = await pgPool.query(`SELECT * FROM "${SETTINGS_TABLE}"`)
    const settings: Record<string, string> = {}
    result.rows.forEach((row: any) => {
      settings[row.key] = row.value
    })
    return NextResponse.json(settings)
  } catch (e: any) {
    console.error("[Settings] GET 错误:", e.message)
    return NextResponse.json({ error: "获取设置失败: " + e.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.role || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "未授权" }, { status: 401 })
    }

    await ensureTable()
    const body = await req.json()

    for (const [key, value] of Object.entries(body)) {
      if (typeof value === "string") {
        await pgPool.query(
          `INSERT INTO "${SETTINGS_TABLE}" ("key", "value", "updatedAt") VALUES ($1, $2, NOW())
           ON CONFLICT ("key") DO UPDATE SET "value" = $2, "updatedAt" = NOW()`,
          [key, value]
        )
      }
    }

    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error("[Settings] PUT 错误:", e.message)
    return NextResponse.json({ error: "保存设置失败: " + e.message }, { status: 500 })
  }
}
