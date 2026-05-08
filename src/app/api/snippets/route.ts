import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { pgPool } from "@/lib/db"
import { z } from "zod"
import { randomUUID } from "crypto"

const snippetSchema = z.object({
  title: z.string().min(1, "标题不能为空"),
  description: z.string().optional(),
  code: z.string().min(1, "代码不能为空"),
  language: z.string().default("javascript"),
  tags: z.array(z.string()).default([]),
  is_public: z.boolean().default(true),
})

// 支持的编程语言
export const supportedLanguages = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "csharp", label: "C#" },
  { value: "cpp", label: "C++" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "php", label: "PHP" },
  { value: "ruby", label: "Ruby" },
  { value: "swift", label: "Swift" },
  { value: "kotlin", label: "Kotlin" },
  { value: "sql", label: "SQL" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "json", label: "JSON" },
  { value: "yaml", label: "YAML" },
  { value: "markdown", label: "Markdown" },
  { value: "bash", label: "Bash" },
  { value: "shell", label: "Shell" },
]

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "未授权" }, { status: 401 })
    }

    const body = await req.json()
    const data = snippetSchema.parse(body)

    const id = randomUUID()
    await pgPool.query(
      `INSERT INTO "code_snippets" ("id", "title", "description", "code", "language", "tags", "is_public", "authorId")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [id, data.title, data.description || null, data.code, data.language, JSON.stringify(data.tags), data.is_public, session.user.id]
    )

    return NextResponse.json({ id, success: true }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: "创建失败" }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const language = searchParams.get("language")
    const publicOnly = searchParams.get("public") === "true"

    let sql = `SELECT * FROM "code_snippets" WHERE 1=1`
    const params: any[] = []
    let idx = 1

    if (language) {
      sql += ` AND "language" = $${idx++}`
      params.push(language)
    }
    if (publicOnly) {
      sql += ` AND "is_public" = true`
    }
    sql += ` ORDER BY "createdAt" DESC`

    const result = await pgPool.query(sql, params)
    return NextResponse.json(result.rows)
  } catch {
    return NextResponse.json({ error: "获取失败" }, { status: 500 })
  }
}
