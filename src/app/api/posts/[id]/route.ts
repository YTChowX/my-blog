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
  const debugInfo: string[] = []
  
  try {
    debugInfo.push("1. 开始认证检查")
    const session = await auth()
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "未授权" }, { status: 401 })
    }
    debugInfo.push("2. 认证通过")

    const { id } = await params
    debugInfo.push(`3. 文章ID: ${id}`)
    
    const body = await req.json()
    debugInfo.push(`4. 请求体: ${JSON.stringify(body).substring(0, 200)}`)
    
    const data = postSchema.parse(body)
    debugInfo.push("5. 数据验证通过")

    // 检查文章是否存在
    const existingPost = await pgPool.query(`SELECT id FROM "posts" WHERE "id" = $1 LIMIT 1`, [id])
    if (existingPost.rows.length === 0) {
      return NextResponse.json({ error: "文章不存在", debug: debugInfo }, { status: 404 })
    }
    debugInfo.push("6. 文章存在")

    // 检查 slug 是否被其他文章使用
    const existing = await pgPool.query(`SELECT id FROM "posts" WHERE "slug" = $1 AND "id" != $2 LIMIT 1`, [data.slug, id])
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: "Slug 已被使用", debug: debugInfo }, { status: 400 })
    }
    debugInfo.push("7. Slug 检查通过")

    // 使用 PostgreSQL 数组格式
    const tagsArray = data.tags.length > 0 ? `{${data.tags.map(t => `"${t.replace(/"/g, '\\"')}"`).join(',')}}` : '{}'
    debugInfo.push(`8. Tags 格式: ${tagsArray.substring(0, 50)}`)

    // 先尝试简单更新（不含可选字段）
    try {
      await pgPool.query(
        `UPDATE "posts" SET "title" = $1, "slug" = $2, "content" = $3, "excerpt" = $4, "published" = $5, "category" = $6, "tags" = $7, "updatedAt" = NOW() WHERE "id" = $8`,
        [data.title, data.slug, data.content, data.excerpt || null, data.published, data.category, tagsArray, id]
      )
      debugInfo.push("9. 基础更新成功")
    } catch (e: any) {
      debugInfo.push(`9. 基础更新失败: ${e.message}`)
      throw e
    }

    // 尝试更新可选字段（忽略错误）
    const optionalFields = [
      { name: "location", value: data.location },
      { name: "mood", value: data.mood },
      { name: "weather", value: data.weather },
      { name: "cover_image", value: data.cover_image },
    ]
    
    for (const field of optionalFields) {
      try {
        await pgPool.query(
          `UPDATE "posts" SET "${field.name}" = $1 WHERE "id" = $2`,
          [field.value || null, id]
        )
        debugInfo.push(`10.${field.name} 更新成功`)
      } catch (e: any) {
        debugInfo.push(`10.${field.name} 更新失败: ${e.message}`)
      }
    }

    return NextResponse.json({ success: true, debug: debugInfo })
  } catch (error: any) {
    console.error("[Posts] PUT 错误:", error)
    debugInfo.push(`错误: ${error.message}`)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message, debug: debugInfo }, { status: 400 })
    }
    return NextResponse.json({ error: "更新失败: " + (error.message || "未知错误"), debug: debugInfo }, { status: 500 })
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
