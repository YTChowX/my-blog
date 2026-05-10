import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { pgPool } from "@/lib/db"
import { z } from "zod"

const postSchema = z.object({
  title: z.string().min(1, "标题不能为空"),
  slug: z.string().min(1, "Slug 不能为空"),
  content: z.string().min(1, "内容不能为空"),
  excerpt: z.string().optional(),
  category: z.string().default("未分类"),
  tags: z.array(z.string()).default([]),
  published: z.boolean().default(false),
})

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const result = await pgPool.query(
      `SELECT p.*, u."name" as "authorName" FROM "posts" p LEFT JOIN "users" u ON p."authorId" = u."id" WHERE p."id" = $1`,
      [id]
    )
    if (result.rows.length === 0) {
      return NextResponse.json({ error: "文章不存在" }, { status: 404 })
    }
    return NextResponse.json(result.rows[0])
  } catch (e: any) {
    console.error("[Posts] GET 错误:", e.message)
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
    
    console.log("[Posts] 收到更新请求:", { id, body })
    
    const data = postSchema.parse(body)
    console.log("[Posts] 数据验证通过:", data)

    // 检查文章是否存在
    const existingPost = await pgPool.query(`SELECT id FROM "posts" WHERE "id" = $1 LIMIT 1`, [id])
    if (existingPost.rows.length === 0) {
      return NextResponse.json({ error: "文章不存在" }, { status: 404 })
    }

    // 检查 slug 是否被其他文章使用
    const existing = await pgPool.query(`SELECT id FROM "posts" WHERE "slug" = $1 AND "id" != $2 LIMIT 1`, [data.slug, id])
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: "Slug 已被使用" }, { status: 400 })
    }

    // 使用 PostgreSQL 数组格式
    const tagsArray = data.tags.length > 0 ? `{${data.tags.map(t => `"${t.replace(/"/g, '\\"')}"`).join(',')}}` : '{}'
    console.log("[Posts] tagsArray:", tagsArray)

    // 只更新基础字段，不包含可选字段
    const sql = `UPDATE "posts" SET "title" = $1, "slug" = $2, "content" = $3, "excerpt" = $4, "published" = $5, "category" = $6, "tags" = $7, "updatedAt" = NOW() WHERE "id" = $8`
    const values = [data.title, data.slug, data.content, data.excerpt || null, data.published, data.category, tagsArray, id]
    
    console.log("[Posts] SQL:", sql)
    console.log("[Posts] Values:", values)

    const result = await pgPool.query(sql, values)
    console.log("[Posts] 更新结果 rowCount:", result.rowCount)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[Posts] PUT 错误:", error)
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
    const result = await pgPool.query(`DELETE FROM "posts" WHERE "id" = $1`, [id])
    
    if (result.rowCount === 0) {
      return NextResponse.json({ error: "文章不存在" }, { status: 404 })
    }
    
    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error("[Posts] DELETE 错误:", e.message)
    return NextResponse.json({ error: "删除失败: " + e.message }, { status: 500 })
  }
}
