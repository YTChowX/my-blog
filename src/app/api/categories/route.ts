import { NextResponse } from "next/server"
import { pgPool } from "@/lib/db"

// 获取商品分类列表
export async function GET() {
  try {
    const result = await pgPool.query(
      `SELECT * FROM "product_categories" ORDER BY "sort_order"`
    )
    return NextResponse.json(result.rows)
  } catch {
    return NextResponse.json({ error: "获取失败" }, { status: 500 })
  }
}
