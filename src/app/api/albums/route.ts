import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { pgPool } from "@/lib/db"
import { z } from "zod"
import { randomUUID } from "crypto"

const albumSchema = z.object({
  title: z.string().min(1, "标题不能为空"),
  slug: z.string().min(1, "Slug 不能为空"),
  description: z.string().optional(),
  cover_image: z.string().optional(),
  is_public: z.boolean().default(true),
})

// 获取相册列表
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const isPublic = searchParams.get("public") === "true"

    let sql = `SELECT * FROM "albums" WHERE 1=1`
    if (isPublic) {
      sql += ` AND "is_public" = true`
    }
    sql += ` ORDER BY "created_at" DESC`

    const result = await pgPool.query(sql)
    return NextResponse.json(result.rows)
  } catch {
    return NextResponse.json({ error: "获取失败" }, { status: 500 })
  }
}

// 创建相册
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "未授权" }, { status: 401 })
    }

    const body = await req.json()
    const data = albumSchema.parse(body)

    // 检查 slug 是否已存在
    const existing = await pgPool.query(
      `SELECT id FROM "albums" WHERE "slug" = $1 LIMIT 1`,
      [data.slug]
    )
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: "Slug 已存在" }, { status: 400 })
    }

    const id = randomUUID()
    await pgPool.query(
      `INSERT INTO "albums" ("id", "title", "slug", "description", "cover_image", "is_public")
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, data.title, data.slug, data.description || null, data.cover_image || null, data.is_public]
    )

    return NextResponse.json({ id, success: true }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: "创建失败" }, { status: 500 })
  }
}
