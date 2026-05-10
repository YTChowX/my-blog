import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { pgPool } from "@/lib/db"

export async function GET() {
  try {
    const session = await auth()
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "未授权" }, { status: 401 })
    }

    // 获取 posts 表结构
    const columnsResult = await pgPool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'posts'
      ORDER BY ordinal_position
    `)

    // 尝试一个简单的更新测试
    let updateTest = "未测试"
    try {
      await pgPool.query(`UPDATE "posts" SET "updatedAt" = NOW() WHERE "id" = 'non-existent-id'`)
      updateTest = "成功"
    } catch (e: any) {
      updateTest = "失败: " + e.message
    }

    return NextResponse.json({
      columns: columnsResult.rows,
      updateTest,
      timestamp: new Date().toISOString(),
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
