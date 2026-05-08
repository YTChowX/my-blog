import { NextResponse } from "next/server"
import { pgPool } from "@/lib/db"

export async function GET() {
  const results: string[] = []

  try {
    // 创建代码片段表
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
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "初始化失败", error: error.message, steps: results },
      { status: 500 }
    )
  }
}
