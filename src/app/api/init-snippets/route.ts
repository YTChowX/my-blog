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
