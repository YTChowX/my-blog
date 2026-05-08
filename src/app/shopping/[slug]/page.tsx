import { pgPool } from "@/lib/db"
import { notFound } from "next/navigation"
import Link from "next/link"

// 强制动态渲染，避免构建时连接数据库
export const dynamic = 'force-dynamic'

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const result = await pgPool.query(
    `SELECT p.*, c."name" as "categoryName"
     FROM "products" p
     LEFT JOIN "product_categories" c ON p."category_id" = c."id"
     WHERE p."slug" = $1 AND p."status" = 'active'`,
    [slug]
  )

  if (result.rows.length === 0) {
    notFound()
  }

  const product = result.rows[0]
  const images = product.images || []

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <Link
        href="/shopping"
        className="inline-flex items-center gap-1 text-zinc-500 hover:text-zinc-900 mb-6"
      >
        ← 返回商品列表
      </Link>

      <div className="grid md:grid-cols-2 gap-8">
        {/* 图片区域 */}
        <div className="space-y-4">
          {/* 主图 */}
          <div className="aspect-square bg-zinc-100 dark:bg-zinc-800 rounded-xl overflow-hidden">
            {images[0] ? (
              <img
                src={images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl">
                📦
              </div>
            )}
          </div>
          
          {/* 缩略图 */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((img: string, index: number) => (
                <div
                  key={index}
                  className="w-20 h-20 flex-shrink-0 bg-zinc-100 dark:bg-zinc-800 rounded-lg overflow-hidden border"
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 信息区域 */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            {product.is_featured && (
              <span className="px-2 py-1 bg-yellow-500 text-white text-xs rounded">
                推荐
              </span>
            )}
            {product.categoryName && (
              <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 text-xs rounded">
                {product.categoryName}
              </span>
            )}
          </div>

          <h1 className="text-2xl font-bold mb-4">{product.name}</h1>

          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-3xl font-bold text-red-600">
              ¥{product.price}
            </span>
            {product.original_price && Number(product.original_price) > Number(product.price) && (
              <>
                <span className="text-lg text-zinc-400 line-through">
                  ¥{product.original_price}
                </span>
                <span className="text-sm text-red-500">
                  省 ¥{(Number(product.original_price) - Number(product.price)).toFixed(2)}
                </span>
              </>
            )}
          </div>

          {product.description && (
            <div className="text-zinc-600 dark:text-zinc-400 mb-6 whitespace-pre-wrap">
              {product.description}
            </div>
          )}

          <div className="flex items-center gap-4 text-sm text-zinc-500 mb-6">
            <span>库存: {product.stock} 件</span>
            {product.tags && product.tags.length > 0 && (
              <span>标签: {product.tags.join(", ")}</span>
            )}
          </div>

          {/* 购买按钮（示例） */}
          <div className="flex gap-4">
            <button className="flex-1 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors">
              立即购买
            </button>
            <button className="flex-1 py-3 border border-red-500 text-red-500 rounded-lg font-medium hover:bg-red-50 dark:hover:bg-red-950 transition-colors">
              加入购物车
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
