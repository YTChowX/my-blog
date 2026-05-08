import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { pgPool } from "@/lib/db"

// 检查是否为首次部署（数据库无管理员）
async function isFirstDeploy(): Promise<boolean> {
  try {
    const result = await pgPool.query(`SELECT id FROM "users" WHERE "role" = 'ADMIN' LIMIT 1`)
    return result.rows.length === 0
  } catch {
    return true
  }
}

export async function GET() {
  const results: string[] = []

  try {
    // 安全检查：首次部署允许无认证，否则需要管理员认证
    const firstDeploy = await isFirstDeploy()
    
    if (!firstDeploy) {
      try {
        const session = await auth()
        if (!session || session.user.role !== "ADMIN") {
          return NextResponse.json({ error: "未授权，请先登录管理员账户" }, { status: 401 })
        }
        results.push("ℹ️ 已认证管理员身份")
      } catch {
        return NextResponse.json({ error: "认证服务不可用，请先登录" }, { status: 401 })
      }
    } else {
      results.push("ℹ️ 检测到首次部署，跳过认证")
    }

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
