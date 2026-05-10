import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { pgPool } from "@/lib/db"
import { z } from "zod"

const albumSchema = z.object({
  title: z.string().min(1, "标题不能为空"),
  slug: z.string().min(1, "Slug 不能为空"),
  description: z.string().optional(),
  cover_image: z.string().optional(),
  is_public: z.boolean().default(true),
})

// 获取单个相册（包含照片）
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // 获取相册信息
    const albumResult = await pgPool.query(
      `SELECT * FROM "albums" WHERE "id" = $1 OR "slug" = $1`,
      [id]
    )
    if (albumResult.rows.length === 0) {
      return NextResponse.json({ error: "相册不存在" }, { status: 404 })
    }

    const album = albumResult.rows[0]

    // 获取照片列表
    const photosResult = await pgPool.query(
      `SELECT * FROM "photos" WHERE "album_id" = $1 ORDER BY "order_index", "created_at"`,
      [album.id]
    )

    return NextResponse.json({ ...album, photos: photosResult.rows })
  } catch (e: any) {
    console.error("[Albums] GET 错误:", e.message)
    return NextResponse.json({ error: "获取失败: " + e.message }, { status: 500 })
  }
}

// 更新相册
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
    const data = albumSchema.parse(body)

    // 检查 slug 是否被其他相册使用
    const existing = await pgPool.query(
      `SELECT id FROM "albums" WHERE "slug" = $1 AND "id" != $2 LIMIT 1`,
      [data.slug, id]
    )
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: "Slug 已被使用" }, { status: 400 })
    }

    const result = await pgPool.query(
      `UPDATE "albums" SET "title" = $1, "slug" = $2, "description" = $3, "cover_image" = $4, "is_public" = $5, "updated_at" = NOW() WHERE "id" = $6`,
      [data.title, data.slug, data.description || null, data.cover_image || null, data.is_public, id]
    )

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "相册不存在" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[Albums] PUT 错误:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: "更新失败: " + (error.message || "未知错误") }, { status: 500 })
  }
}

// 删除相册
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
    
    // 先删除相册中的所有照片
    await pgPool.query(`DELETE FROM "photos" WHERE "album_id" = $1`, [id])
    
    const result = await pgPool.query(`DELETE FROM "albums" WHERE "id" = $1`, [id])
    
    if (result.rowCount === 0) {
      return NextResponse.json({ error: "相册不存在" }, { status: 404 })
    }
    
    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error("[Albums] DELETE 错误:", e.message)
    return NextResponse.json({ error: "删除失败: " + e.message }, { status: 500 })
  }
}
