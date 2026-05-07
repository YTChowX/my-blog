import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const postSchema = z.object({
  title: z.string().min(1, "标题不能为空"),
  slug: z.string().min(1, "Slug 不能为空"),
  content: z.string().min(1, "内容不能为空"),
  excerpt: z.string().optional(),
  category: z.string().default("未分类"),
  tags: z.array(z.string()).default([]),
  published: z.boolean().default(false),
})

// 获取单篇文章
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const posts: any[] = await prisma.$queryRawUnsafe(
      `SELECT p.*, u."name" as "authorName" FROM "posts" p LEFT JOIN "users" u ON p."authorId" = u."id" WHERE p."id" = $1`,
      id
    )

    if (posts.length === 0) {
      return NextResponse.json({ error: "文章不存在" }, { status: 404 })
    }

    return NextResponse.json(posts[0])
  } catch {
    return NextResponse.json({ error: "获取失败" }, { status: 500 })
  }
}

// 更新文章
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
    const data = postSchema.parse(body)

    // 检查 slug 是否被其他文章使用
    const existing: any[] = await prisma.$queryRawUnsafe(
      `SELECT id FROM "posts" WHERE "slug" = $1 AND "id" != $2 LIMIT 1`,
      data.slug, id
    )

    if (existing.length > 0) {
      return NextResponse.json({ error: "Slug 已被使用" }, { status: 400 })
    }

    const tagsJson = JSON.stringify(data.tags)

    await prisma.$executeRawUnsafe(
      `UPDATE "posts" SET "title" = $1, "slug" = $2, "content" = $3, "excerpt" = $4, "published" = $5, "category" = $6, "tags" = $7::jsonb, "updatedAt" = NOW() WHERE "id" = $8`,
      data.title, data.slug, data.content, data.excerpt || null,
      data.published, data.category, tagsJson, id
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: "更新失败" }, { status: 500 })
  }
}

// 删除文章
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
    await prisma.$executeRawUnsafe(`DELETE FROM "posts" WHERE "id" = $1`, id)

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "删除失败" }, { status: 500 })
  }
}
