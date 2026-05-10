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
  location: z.string().optional(),
  mood: z.string().optional(),
  weather: z.string().optional(),
  cover_image: z.string().optional(),
})

// 确保 posts 表有所有需要的字段
async function ensurePostColumns() {
  const columns = [
    { name: "location", sql: `ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "location" TEXT` },
    { name: "mood", sql: `ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "mood" TEXT` },
    { name: "weather", sql: `ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "weather" TEXT` },
    { name: "cover_image", sql: `ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "cover_image" TEXT` },
  ]
  for (const col of columns) {
    try {
      await pgPool.query(col.sql)
    } catch (e: any) {
      console.error(`[Posts] 添加 ${col.name} 字段失败:`, e.message)
    }
  }
}

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

    // 确保所有字段都存在
    await ensurePostColumns()

    const { id } = await params
    const body = await req.json()
    const data = postSchema.parse(body)

    const existing = await pgPool.query(`SELECT id FROM "posts" WHERE "slug" = $1 AND "id" != $2 LIMIT 1`, [data.slug, id])
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: "Slug 已被使用" }, { status: 400 })
    }

    // 使用 PostgreSQL 数组格式
    const tagsArray = data.tags.length > 0 ? `{${data.tags.map(t => `"${t.replace(/"/g, '\\"')}"`).join(',')}}` : '{}'

    await pgPool.query(
      `UPDATE "posts" SET "title" = $1, "slug" = $2, "content" = $3, "excerpt" = $4, "published" = $5, "category" = $6, "tags" = $7, "updatedAt" = NOW(), "location" = $8, "mood" = $9, "weather" = $10, "cover_image" = $11 WHERE "id" = $12`,
      [data.title, data.slug, data.content, data.excerpt || null, data.published, data.category, tagsArray, data.location || null, data.mood || null, data.weather || null, data.cover_image || null, id]
    )

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
    await pgPool.query(`DELETE FROM "posts" WHERE "id" = $1`, [id])
    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error("[Posts] DELETE 错误:", e.message)
    return NextResponse.json({ error: "删除失败: " + e.message }, { status: 500 })
  }
}
