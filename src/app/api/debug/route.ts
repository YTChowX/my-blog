import { NextResponse } from "next/server"

export async function GET() {
  const checks = {
    NODE_ENV: process.env.NODE_ENV,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "已设置 (长度: " + process.env.NEXTAUTH_SECRET.length + ")" : "未设置",
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || "未设置",
    DATABASE_URL: process.env.DATABASE_URL ? "已设置 (长度: " + process.env.DATABASE_URL.length + ")" : "未设置",
    ADMIN_EMAIL: process.env.ADMIN_EMAIL || "未设置",
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD ? "已设置 (长度: " + process.env.ADMIN_PASSWORD.length + ")" : "未设置",
  }

  // 尝试连接数据库
  let dbStatus = "未测试"
  try {
    const { pgPool } = await import("@/lib/db")
    const result = await pgPool.query("SELECT NOW()")
    dbStatus = "连接成功: " + result.rows[0].now
  } catch (e: any) {
    dbStatus = "连接失败: " + e.message
  }

  return NextResponse.json({
    checks,
    dbStatus,
    timestamp: new Date().toISOString(),
  })
}
