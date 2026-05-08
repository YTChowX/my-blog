import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { pgPool } from "@/lib/db"
import bcrypt from "bcryptjs"
import { randomUUID } from "crypto"

export async function GET() {
  // 安全检查：仅允许已认证的管理员调用
  try {
    const session = await auth()
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "未授权" }, { status: 401 })
    }
  } catch {
    return NextResponse.json({ error: "认证服务不可用" }, { status: 500 })
  }

  const results: string[] = []

  try {
    const tables = [
      { name: "users", sql: `
        CREATE TABLE IF NOT EXISTS "users" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "email" TEXT NOT NULL,
          "name" TEXT,
          "password" TEXT,
          "image" TEXT,
          "role" TEXT NOT NULL DEFAULT 'USER',
          "emailVerified" TIMESTAMP(3),
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      ` },
      { name: "accounts", sql: `
        CREATE TABLE IF NOT EXISTS "accounts" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "userId" TEXT NOT NULL,
          "type" TEXT NOT NULL,
          "provider" TEXT NOT NULL,
          "providerAccountId" TEXT NOT NULL,
          "refresh_token" TEXT,
          "access_token" TEXT,
          "expires_at" INTEGER,
          "token_type" TEXT,
          "scope" TEXT,
          "id_token" TEXT,
          "session_state" TEXT,
          CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
        )
      ` },
      { name: "sessions", sql: `
        CREATE TABLE IF NOT EXISTS "sessions" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "sessionToken" TEXT NOT NULL,
          "userId" TEXT NOT NULL,
          "expires" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
        )
      ` },
      { name: "posts", sql: `
        CREATE TABLE IF NOT EXISTS "posts" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "title" TEXT NOT NULL,
          "slug" TEXT NOT NULL,
          "content" TEXT NOT NULL,
          "excerpt" TEXT,
          "published" BOOLEAN NOT NULL DEFAULT false,
          "category" TEXT NOT NULL DEFAULT '未分类',
          "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
          "authorId" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "viewCount" INTEGER NOT NULL DEFAULT 0,
          "coverImage" TEXT,
          CONSTRAINT "posts_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
        )
      ` },
    ]

    for (const table of tables) {
      try {
        await pgPool.query(table.sql)
        results.push(`✅ ${table.name} 表创建成功`)
      } catch (e: any) {
        results.push(`⚠️ ${table.name} 表: ${e.message.substring(0, 80)}`)
      }
    }

    const indexes = [
      `CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email")`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId")`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "sessions_sessionToken_key" ON "sessions"("sessionToken")`,
      `CREATE UNIQUE INDEX IF NOT EXISTS "posts_slug_key" ON "posts"("slug")`,
      `CREATE INDEX IF NOT EXISTS "posts_published_idx" ON "posts"("published")`,
      `CREATE INDEX IF NOT EXISTS "posts_category_idx" ON "posts"("category")`,
    ]
    for (const idx of indexes) {
      try { await pgPool.query(idx) } catch { /* ignore */ }
    }

    // 创建管理员
    try {
      const adminEmail = process.env.ADMIN_EMAIL
      const adminPassword = process.env.ADMIN_PASSWORD

      if (!adminEmail || !adminPassword) {
        results.push("❌ 环境变量 ADMIN_EMAIL 或 ADMIN_PASSWORD 未设置")
      } else {
        const existing = await pgPool.query(`SELECT id FROM "users" WHERE "role" = 'ADMIN' LIMIT 1`)
        if (existing.rows.length > 0) {
          results.push("ℹ️ 管理员已存在")
        } else {
          const hashedPassword = await bcrypt.hash(adminPassword, 10)
          const id = randomUUID()
          await pgPool.query(
            `INSERT INTO "users" ("id", "email", "name", "password", "role") VALUES ($1, $2, $3, $4, $5)`,
            [id, adminEmail, "管理员", hashedPassword, "ADMIN"]
          )
          results.push("✅ 管理员账户创建成功")
        }
      }
    } catch (e: any) {
      results.push("❌ 管理员创建失败")
    }

    return NextResponse.json({ success: true, message: "数据库初始化完成", steps: results })
  } catch {
    return NextResponse.json({ success: false, message: "初始化失败", steps: results }, { status: 500 })
  }
}
