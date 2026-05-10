import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { pgPool } from "@/lib/db"
import { z } from "zod"

const snippetSchema = z.object({
  title: z.string().min(1, "标题不能为空"),
  description: z.string().optional(),
  code: z.string().min(1, "代码不能为空"),
  language: z.string().default("javascript"),
  tags: z.array(z.string()).default([]),
  is_public: z.boolean().default(true),
})

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // 增加浏览次数
    await pgPool.query(
      `UPDATE "code_snippets" SET "views" = "views" + 1 WHERE "id" = $1`,
      [id]
    )
    
    const result = await pgPool.query(
      `SELECT * FROM "code_snippets" WHERE "id" = $1`,
      [id]
    )
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: "代码片段不存在" }, { status: 404 })
    }
    
    return NextResponse.json(result.rows[0])
  } catch (e: any) {
    console.error("[Snippets] GET 错误:", e.message)
    return NextResponse.json({ error: "获取失败: " + e.message }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "未授权" }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const data = snippetSchema.parse(body)

    const result = await pgPool.query(
      `UPDATE "code_snippets" SET 
        "title" = $1, "description" = $2, "code" = $3, 
        "language" = $4, "tags" = $5, "is_public" = $6, 
        "updatedAt" = NOW() 
       WHERE "id" = $7`,
      [data.title, data.description || null, data.code, data.language, JSON.stringify(data.tags), data.is_public, id]
    )

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "代码片段不存在" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[Snippets] PUT 错误:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: "更新失败: " + (error.message || "未知错误") }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "未授权" }, { status: 401 })
    }

    const { id } = await params
    const result = await pgPool.query(`DELETE FROM "code_snippets" WHERE "id" = $1`, [id])
    
    if (result.rowCount === 0) {
      return NextResponse.json({ error: "代码片段不存在" }, { status: 404 })
    }
    
    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error("[Snippets] DELETE 错误:", e.message)
    return NextResponse.json({ error: "删除失败: " + e.message }, { status: 500 })
  }
}
