import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { pgPool } from "@/lib/db"
import { z } from "zod"

const photoSchema = z.object({
  caption: z.string().optional(),
  order_index: z.number().optional(),
})

// 更新照片
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
    const data = photoSchema.parse(body)

    await pgPool.query(
      `UPDATE "photos" SET "caption" = $1, "order_index" = $2 WHERE "id" = $3`,
      [data.caption || null, data.order_index || 0, id]
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: "更新失败" }, { status: 500 })
  }
}

// 删除照片
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

    // 获取相册ID用于更新计数
    const photoResult = await pgPool.query(
      `SELECT "album_id" FROM "photos" WHERE "id" = $1`,
      [id]
    )
    const albumId = photoResult.rows[0]?.album_id

    await pgPool.query(`DELETE FROM "photos" WHERE "id" = $1`, [id])

    // 更新相册照片数量
    if (albumId) {
      await pgPool.query(
        `UPDATE "albums" SET "photo_count" = (SELECT COUNT(*) FROM "photos" WHERE "album_id" = $1), "updated_at" = NOW() WHERE "id" = $1`,
        [albumId]
      )
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "删除失败" }, { status: 500 })
  }
}
