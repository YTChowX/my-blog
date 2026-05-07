import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { pgPool } from "@/lib/db"
import { z } from "zod"
import { randomUUID } from "crypto"

const photoSchema = z.object({
  album_id: z.string().min(1, "相册ID不能为空"),
  url: z.string().min(1, "图片URL不能为空"),
  caption: z.string().optional(),
  order_index: z.number().default(0),
  exif_camera: z.string().optional(),
  exif_lens: z.string().optional(),
  exif_aperture: z.string().optional(),
  exif_shutter: z.string().optional(),
  exif_iso: z.string().optional(),
  exif_focal_length: z.string().optional(),
  taken_at: z.string().optional(),
})

// 批量添加照片
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "未授权" }, { status: 401 })
    }

    const body = await req.json()
    const photos = z.array(photoSchema).parse(body)

    const insertedIds: string[] = []

    for (const photo of photos) {
      const id = randomUUID()
      await pgPool.query(
        `INSERT INTO "photos" ("id", "album_id", "url", "caption", "order_index", "exif_camera", "exif_lens", "exif_aperture", "exif_shutter", "exif_iso", "exif_focal_length", "taken_at")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          id,
          photo.album_id,
          photo.url,
          photo.caption || null,
          photo.order_index,
          photo.exif_camera || null,
          photo.exif_lens || null,
          photo.exif_aperture || null,
          photo.exif_shutter || null,
          photo.exif_iso || null,
          photo.exif_focal_length || null,
          photo.taken_at ? new Date(photo.taken_at) : null,
        ]
      )
      insertedIds.push(id)
    }

    // 更新相册照片数量
    if (photos.length > 0) {
      await pgPool.query(
        `UPDATE "albums" SET "photo_count" = (SELECT COUNT(*) FROM "photos" WHERE "album_id" = $1), "updated_at" = NOW() WHERE "id" = $1`,
        [photos[0].album_id]
      )
    }

    return NextResponse.json({ ids: insertedIds, success: true }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: "添加失败" }, { status: 500 })
  }
}

// 获取照片列表
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const albumId = searchParams.get("album_id")

    if (!albumId) {
      return NextResponse.json({ error: "缺少相册ID" }, { status: 400 })
    }

    const result = await pgPool.query(
      `SELECT * FROM "photos" WHERE "album_id" = $1 ORDER BY "order_index", "created_at"`,
      [albumId]
    )

    return NextResponse.json(result.rows)
  } catch {
    return NextResponse.json({ error: "获取失败" }, { status: 500 })
  }
}
