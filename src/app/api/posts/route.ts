import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { pgPool } from "@/lib/db"
import { z } from "zod"
import { randomUUID } from "crypto"

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

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "未授权" }, { status: 401 })
    }

    const body = await req.json()
    const data = postSchema.parse(body)

    const existing = await pgPool.query(`SELECT id FROM "posts" WHERE "slug" = $1 LIMIT 1`, [data.slug])
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: "Slug 已存在" }, { status: 400 })
    }

    const id = randomUUID()
    
    // 使用 PostgreSQL 数组格式
    const tagsArray = data.tags.length > 0 ? `{${data.tags.map(t => `"${t.replace(/"/g, '\\"')}"`).join(',')}}` : '{}'
    
    await pgPool.query(
      `INSERT INTO "posts" ("id", "title", "slug", "content", "excerpt", "published", "category", "tags", "authorId", "location", "mood", "weather", "cover_image")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [id, data.title, data.slug, data.content, data.excerpt || null, data.published, data.category, tagsArray, session.user.id, data.location || null, data.mood || null, data.weather || null, data.cover_image || null]
    )

    return NextResponse.json({ id, success: true }, { status: 201 })
  } catch (error: any) {
    console.error("[Posts] 创建文章失败:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: "创建失败: " + (error.message || "未知错误") }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get("category")
    const publishedOnly = searchParams.get("published") === "true"

    let sql = `SELECT id, title, slug, excerpt, category, tags, published, "createdAt", "coverImage", location, mood, weather, cover_image FROM "posts" WHERE 1=1`
    const params: any[] = []
    let idx = 1

    if (category) {
      sql += ` AND "category" = $${idx++}`
      params.push(category)
    }
    if (publishedOnly) {
      sql += ` AND "published" = true`
    }
    sql += ` ORDER BY "createdAt" DESC`

    const result = await pgPool.query(sql, params)
    return NextResponse.json(result.rows)
  } catch (e: any) {
    console.error("[Posts] 获取文章失败:", e.message)
    return NextResponse.json({ error: "获取失败: " + e.message }, { status: 500 })
  }
}
