import { NextResponse } from "next/server"
import { pgPool } from "@/lib/db"

export async function GET() {
  const results: string[] = []

  try {
    // 创建相册表
    try {
      await pgPool.query(`
        CREATE TABLE IF NOT EXISTS "albums" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "title" TEXT NOT NULL,
          "description" TEXT,
          "cover_image" TEXT,
          "slug" TEXT NOT NULL UNIQUE,
          "is_public" BOOLEAN NOT NULL DEFAULT true,
          "photo_count" INTEGER NOT NULL DEFAULT 0,
          "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `)
      results.push("✅ albums 表创建成功")
    } catch (e: any) {
      results.push("⚠️ albums: " + e.message.substring(0, 80))
    }

    // 创建照片表
    try {
      await pgPool.query(`
        CREATE TABLE IF NOT EXISTS "photos" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "album_id" TEXT NOT NULL,
          "url" TEXT NOT NULL,
          "caption" TEXT,
          "order_index" INTEGER NOT NULL DEFAULT 0,
          "exif_camera" TEXT,
          "exif_lens" TEXT,
          "exif_aperture" TEXT,
          "exif_shutter" TEXT,
          "exif_iso" TEXT,
          "exif_focal_length" TEXT,
          "taken_at" TIMESTAMP(3),
          "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "photos_album_id_fkey" FOREIGN KEY ("album_id") REFERENCES "albums"("id") ON DELETE CASCADE
        )
      `)
      results.push("✅ photos 表创建成功")
    } catch (e: any) {
      results.push("⚠️ photos: " + e.message.substring(0, 80))
    }

    // 创建商品分类表
    try {
      await pgPool.query(`
        CREATE TABLE IF NOT EXISTS "product_categories" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "name" TEXT NOT NULL,
          "slug" TEXT NOT NULL UNIQUE,
          "icon" TEXT,
          "sort_order" INTEGER NOT NULL DEFAULT 0,
          "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `)
      results.push("✅ product_categories 表创建成功")
    } catch (e: any) {
      results.push("⚠️ product_categories: " + e.message.substring(0, 80))
    }

    // 创建商品表
    try {
      await pgPool.query(`
        CREATE TABLE IF NOT EXISTS "products" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "name" TEXT NOT NULL,
          "description" TEXT,
          "price" DECIMAL(10,2) NOT NULL,
          "original_price" DECIMAL(10,2),
          "stock" INTEGER NOT NULL DEFAULT 0,
          "category_id" TEXT,
          "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
          "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
          "status" TEXT NOT NULL DEFAULT 'active',
          "is_featured" BOOLEAN NOT NULL DEFAULT false,
          "slug" TEXT NOT NULL UNIQUE,
          "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "product_categories"("id") ON DELETE SET NULL
        )
      `)
      results.push("✅ products 表创建成功")
    } catch (e: any) {
      results.push("⚠️ products: " + e.message.substring(0, 80))
    }

    // 插入默认商品分类
    try {
      const defaultCategories = [
        { id: 'cat-1', name: '数码产品', slug: 'digital', icon: '📱', sort: 1 },
        { id: 'cat-2', name: '生活用品', slug: 'daily', icon: '🏠', sort: 2 },
        { id: 'cat-3', name: '图书文具', slug: 'books', icon: '📚', sort: 3 },
        { id: 'cat-4', name: '服饰穿搭', slug: 'fashion', icon: '👕', sort: 4 },
      ]

      for (const cat of defaultCategories) {
        await pgPool.query(
          `INSERT INTO "product_categories" ("id", "name", "slug", "icon", "sort_order")
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT ("slug") DO NOTHING`,
          [cat.id, cat.name, cat.slug, cat.icon, cat.sort]
        )
      }
      results.push("✅ 默认商品分类已插入")
    } catch (e: any) {
      results.push("⚠️ 默认分类: " + e.message.substring(0, 80))
    }

    return NextResponse.json({
      success: true,
      message: "数据库表初始化完成",
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
