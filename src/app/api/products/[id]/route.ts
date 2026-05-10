import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { pgPool } from "@/lib/db"
import { z } from "zod"

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

// 获取单个商品
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const result = await pgPool.query(
      `SELECT p.*, c."name" as "categoryName"
       FROM "products" p
       LEFT JOIN "product_categories" c ON p."category_id" = c."id"
       WHERE p."id" = $1 OR p."slug" = $1`,
      [id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "商品不存在" }, { status: 404 })
    }

    return NextResponse.json(result.rows[0])
  } catch (e: any) {
    console.error("[Products] GET 错误:", e.message)
    return NextResponse.json({ error: "获取失败: " + e.message }, { status: 500 })
  }
}

// 更新商品
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
    const data = productSchema.parse(body)

    // 检查 slug 是否被其他商品使用
    const existing = await pgPool.query(
      `SELECT id FROM "products" WHERE "slug" = $1 AND "id" != $2 LIMIT 1`,
      [data.slug, id]
    )
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: "Slug 已被使用" }, { status: 400 })
    }

    const result = await pgPool.query(
      `UPDATE "products" SET 
        "name" = $1, "slug" = $2, "description" = $3, "price" = $4, 
        "original_price" = $5, "stock" = $6, "category_id" = $7, 
        "images" = $8, "tags" = $9, "status" = $10, "is_featured" = $11,
        "updated_at" = NOW()
       WHERE "id" = $12`,
      [
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
        id,
      ]
    )

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "商品不存在" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[Products] PUT 错误:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: "更新失败: " + (error.message || "未知错误") }, { status: 500 })
  }
}

// 删除商品
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
    const result = await pgPool.query(`DELETE FROM "products" WHERE "id" = $1`, [id])
    
    if (result.rowCount === 0) {
      return NextResponse.json({ error: "商品不存在" }, { status: 404 })
    }
    
    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error("[Products] DELETE 错误:", e.message)
    return NextResponse.json({ error: "删除失败: " + e.message }, { status: 500 })
  }
}
