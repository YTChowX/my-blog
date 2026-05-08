import { NextRequest, NextResponse } from "next/server"
import { pgPool } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const q = searchParams.get("q")?.trim()
    const type = searchParams.get("type") || "all"

    if (!q || q.length < 1) {
      return NextResponse.json({ results: [], total: 0 })
    }

    const results: any[] = []
    const keyword = `%${q}%`

    // 搜索文章
    if (type === "all" || type === "post") {
      try {
        const postResult = await pgPool.query(
          `SELECT id, title, slug, excerpt, category, "createdAt", 'post' as type
           FROM "posts" 
           WHERE "published" = true AND (
             "title" ILIKE $1 OR "content" ILIKE $1 OR "excerpt" ILIKE $1 OR "tags"::text ILIKE $1
           )
           ORDER BY "createdAt" DESC LIMIT 10`,
          [keyword]
        )
        results.push(...postResult.rows)
      } catch (e: any) {
        console.error("[Search] 文章搜索失败:", e.message)
      }
    }

    // 搜索代码片段
    if (type === "all" || type === "snippet") {
      try {
        const snippetResult = await pgPool.query(
          `SELECT id, title, description as excerpt, language as category, "createdAt", 'snippet' as type
           FROM "code_snippets"
           WHERE "is_public" = true AND (
             "title" ILIKE $1 OR "description" ILIKE $1 OR "code" ILIKE $1 OR "tags"::text ILIKE $1
           )
           ORDER BY "createdAt" DESC LIMIT 10`,
          [keyword]
        )
        results.push(...snippetResult.rows)
      } catch (e: any) {
        console.error("[Search] 代码片段搜索失败:", e.message)
      }
    }

    return NextResponse.json({ results, total: results.length, query: q })
  } catch (e: any) {
    console.error("[Search] 搜索接口错误:", e.message)
    return NextResponse.json({ error: "搜索失败", results: [], total: 0 }, { status: 500 })
  }
}
