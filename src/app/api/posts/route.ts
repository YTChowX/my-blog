import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
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
})

// 创建文章
export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "未授权" }, { status: 401 })
    }

    const body = await req.json()
    const data = postSchema.parse(body)

    // 检查 slug 是否已存在
    const existing: any[] = await prisma.$queryRawUnsafe(
      `SELECT id FROM "posts" WHERE "slug" = $1 LIMIT 1`,
      data.slug
    )

    if (existing.length > 0) {
      return NextResponse.json({ error: "Slug 已存在" }, { status: 400 })
    }

    const id = randomUUID()
    const tagsJson = JSON.stringify(data.tags)

    await prisma.$executeRawUnsafe(
      `INSERT INTO "posts" ("id", "title", "slug", "content", "excerpt", "published", "category", "tags", "authorId")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9)`,
      id, data.title, data.slug, data.content, data.excerpt || null,
      data.published, data.category, tagsJson, session.user.id
    )

    return NextResponse.json({ id, success: true }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: "创建失败" }, { status: 500 })
  }
}

// 获取文章列表
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get("category")
    const publishedOnly = searchParams.get("published") === "true"

    let sql = `SELECT id, title, slug, excerpt, category, tags, published, "createdAt", "coverImage" FROM "posts" WHERE 1=1`
    const params: any[] = []
    let paramIndex = 1

    if (category) {
      sql += ` AND "category" = $${paramIndex++}`
      params.push(category)
    }
    if (publishedOnly) {
      sql += ` AND "published" = true`
    }

    sql += ` ORDER BY "createdAt" DESC`

    const posts = await prisma.$queryRawUnsafe(sql, ...params)
    return NextResponse.json(posts)
  } catch {
    return NextResponse.json({ error: "获取失败" }, { status: 500 })
  }
}
