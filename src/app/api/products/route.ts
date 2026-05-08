import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { pgPool } from "@/lib/db"
import { z } from "zod"
import { randomUUID } from "crypto"

const productSchema = z.object({
  name: z.string().min(1, "商品名称不能为空"),
  slug: z.string().min(1, "Slug 不能为空"),
  description: z.string().optional(),
  price: z.number().min(0, "价格不能为负"),
  original_price: z.number().optional(),
  stock: z.number().int().min(0, "库存不能为负"),
  category_id: z.string().optional(),
  images: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  status: z.enum(["active", "inactive", "soldout"]).default("active"),
  is_featured: z.boolean().default(false),
})

// 获取商品列表
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get("category")
    const status = searchParams.get("status")
    const featured = searchParams.get("featured")

    let sql = `
      SELECT p.*, c."name" as "categoryName"
      FROM "products" p
      LEFT JOIN "product_categories" c ON p."category_id" = c."id"
      WHERE 1=1
    `
    const params: any[] = []
    let idx = 1

    if (category) {
      sql += ` AND p."category_id" = $${idx++}`
      params.push(category)
    }
    if (status) {
      sql += ` AND p."status" = $${idx++}`
      params.push(status)
    }
    if (featured === "true") {
      sql += ` AND p."is_featured" = true`
    }

    sql += ` ORDER BY p."created_at" DESC`

    const result = await pgPool.query(sql, params)
    return NextResponse.json(result.rows)
  } catch {
    return NextResponse.json({ error: "获取失败" }, { status: 500 })
  }
}

// 创建商品
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "未授权" }, { status: 401 })
    }

    const body = await req.json()
    const data = productSchema.parse(body)

    // 检查 slug 是否已存在
    const existing = await pgPool.query(
      `SELECT id FROM "products" WHERE "slug" = $1 LIMIT 1`,
      [data.slug]
    )
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: "Slug 已存在" }, { status: 400 })
    }

    const id = randomUUID()
    await pgPool.query(
      `INSERT INTO "products" ("id", "name", "slug", "description", "price", "original_price", "stock", "category_id", "images", "tags", "status", "is_featured")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        id,
        data.name,
        data.slug,
        data.description || null,
        data.price,
        data.original_price || null,
        data.stock,
        data.category_id || null,
        JSON.stringify(data.images),
        JSON.stringify(data.tags),
        data.status,
        data.is_featured,
      ]
    )

    return NextResponse.json({ id, success: true }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: "创建失败" }, { status: 500 })
  }
}
