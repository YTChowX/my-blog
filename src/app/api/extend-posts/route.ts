import { NextResponse } from "next/server"
import { pgPool } from "@/lib/db"

export async function GET() {
  const results: string[] = []

  try {
    // 为 posts 表添加位置和心情标签字段
    const columns = [
      { name: "location", sql: `ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "location" TEXT` },
      { name: "mood", sql: `ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "mood" TEXT` },
      { name: "weather", sql: `ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "weather" TEXT` },
      { name: "cover_image", sql: `ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "cover_image" TEXT` },
    ]

    for (const col of columns) {
      try {
        await pgPool.query(col.sql)
        results.push(`✅ 添加 ${col.name} 字段成功`)
      } catch (e: any) {
        if (e.message.includes("already exists")) {
          results.push(`ℹ️ ${col.name} 字段已存在`)
        } else {
          results.push(`⚠️ ${col.name}: ${e.message.substring(0, 50)}`)
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "生活板块字段扩展完成",
      steps: results,
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: "扩展失败", error: error.message, steps: results },
      { status: 500 }
    )
  }
}
