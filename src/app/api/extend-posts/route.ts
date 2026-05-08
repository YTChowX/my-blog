import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { pgPool } from "@/lib/db"

export async function GET() {
  // 安全检查：仅允许已认证的管理员调用
  try {
    const session = await auth()
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "未授权" }, { status: 401 })
    }
  } catch {
    return NextResponse.json({ error: "认证服务不可用" }, { status: 500 })
  }

  const results: string[] = []

  try {
    const columns = [
      { name: "location", sql: `ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "location" TEXT` },
      { name: "mood", sql: `ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "mood" TEXT` },
      { name: "weather", sql: `ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "weather" TEXT` },
      { name: "cover_image", sql: `ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "cover_image" TEXT` },
    ]

    for (const col of columns) {
      try {
        await pgPool.query(col.sql)
        results.push(`✅ 添加 ${col.name} 字段成功`)
      } catch {
        results.push(`⚠️ ${col.name} 字段添加失败`)
      }
    }

    return NextResponse.json({
      success: true,
      message: "生活板块字段扩展完成",
      steps: results,
    })
  } catch {
    return NextResponse.json(
      { success: false, message: "扩展失败", steps: results },
      { status: 500 }
    )
  }
}
