import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
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

// 创建文章
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "未授权" }, { status: 401 })
    }

    const body = await req.json()
    const data = postSchema.parse(body)

    // 检查 slug 是否已存在
    const existing = await prisma.post.findUnique({
      where: { slug: data.slug },
    })

    if (existing) {
      return NextResponse.json({ error: "Slug 已存在" }, { status: 400 })
    }

    const post = await prisma.post.create({
      data: {
        ...data,
        authorId: session.user.id,
      },
    })

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    return NextResponse.json({ error: "创建失败" }, { status: 500 })
  }
}

// 获取文章列表（公开 API）
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get("category")
    const published = searchParams.get("published")

    const where: any = {}
    if (category) where.category = category
    if (published !== null) where.published = published === "true"

    const posts = await prisma.post.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        category: true,
        tags: true,
        published: true,
        createdAt: true,
        coverImage: true,
      },
    })

    return NextResponse.json(posts)
  } catch {
    return NextResponse.json({ error: "获取失败" }, { status: 500 })
  }
}
