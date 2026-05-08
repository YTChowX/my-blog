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

    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS "code_snippets" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "title" TEXT NOT NULL,
        "description" TEXT,
        "code" TEXT NOT NULL,
        "language" TEXT NOT NULL DEFAULT 'javascript',
        "tags" JSONB DEFAULT '[]',
        "is_public" BOOLEAN DEFAULT true,
        "views" INTEGER DEFAULT 0,
        "authorId" TEXT,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      )
    `)
    results.push("✅ 创建 code_snippets 表成功")

    return NextResponse.json({
      success: true,
      message: "代码片段表初始化完成",
      steps: results,
    })
  } catch {
    return NextResponse.json(
      { success: false, message: "初始化失败", steps: results },
      { status: 500 }
    )
  }
}
