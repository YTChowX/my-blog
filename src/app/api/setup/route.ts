import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function GET() {
  const results: string[] = []

  try {
    // 第一步：创建数据库表
    try {
      await prisma.$executeRawUnsafe(`
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
        );
        CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");
      `)
      results.push("✅ users 表创建成功")
    } catch (e: any) {
      results.push("⚠️ users 表: " + e.message)
    }

    try {
      await prisma.$executeRawUnsafe(`
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
        );
        CREATE UNIQUE INDEX IF NOT EXISTS "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");
      `)
      results.push("✅ accounts 表创建成功")
    } catch (e: any) {
      results.push("⚠️ accounts 表: " + e.message)
    }

    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "sessions" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "sessionToken" TEXT NOT NULL,
          "userId" TEXT NOT NULL,
          "expires" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
        );
        CREATE UNIQUE INDEX IF NOT EXISTS "sessions_sessionToken_key" ON "sessions"("sessionToken");
      `)
      results.push("✅ sessions 表创建成功")
    } catch (e: any) {
      results.push("⚠️ sessions 表: " + e.message)
    }

    try {
      await prisma.$executeRawUnsafe(`
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
        );
        CREATE UNIQUE INDEX IF NOT EXISTS "posts_slug_key" ON "posts"("slug");
        CREATE INDEX IF NOT EXISTS "posts_published_idx" ON "posts"("published");
        CREATE INDEX IF NOT EXISTS "posts_category_idx" ON "posts"("category");
      `)
      results.push("✅ posts 表创建成功")
    } catch (e: any) {
      results.push("⚠️ posts 表: " + e.message)
    }

    // 第二步：创建管理员账户
    try {
      const existingAdmin = await prisma.user.findFirst({
        where: { role: "ADMIN" },
      })

      if (existingAdmin) {
        results.push(`ℹ️ 管理员已存在: ${existingAdmin.email}`)
      } else {
        const adminEmail = process.env.ADMIN_EMAIL
        const adminPassword = process.env.ADMIN_PASSWORD

        if (!adminEmail || !adminPassword) {
          results.push("❌ 环境变量 ADMIN_EMAIL 或 ADMIN_PASSWORD 未设置")
        } else {
          const hashedPassword = await bcrypt.hash(adminPassword, 10)
          await prisma.user.create({
            data: {
              email: adminEmail,
              name: "管理员",
              password: hashedPassword,
              role: "ADMIN",
            },
          })
          results.push(`✅ 管理员账户创建成功: ${adminEmail}`)
        }
      }
    } catch (e: any) {
      results.push("❌ 管理员创建失败: " + e.message)
    }

    return NextResponse.json({
      success: true,
      message: "数据库初始化完成",
      steps: results,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: "初始化失败",
        error: error.message,
        steps: results,
      },
      { status: 500 }
    )
  }
}
