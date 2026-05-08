import { pgPool } from "@/lib/db"
import Link from "next/link"

export default async function ShoppingPage() {
  let products: any[] = []
  let categories: any[] = []

  try {
    const [productsResult, categoriesResult] = await Promise.all([
      pgPool.query(`
        SELECT p.*, c."name" as "categoryName"
        FROM "products" p
        LEFT JOIN "product_categories" c ON p."category_id" = c."id"
        WHERE p."status" = 'active'
        ORDER BY p."is_featured" DESC, p."created_at" DESC
      `),
      pgPool.query(`SELECT * FROM "product_categories" ORDER BY "sort_order"`),
    ])
    products = productsResult.rows
    categories = categoriesResult.rows
  } catch (e) {
    console.error(e)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">🛒 购物</h1>
        <p className="text-zinc-500 text-lg">精选好物，品质生活</p>
      </div>

      {/* 分类筛选 */}
      {categories.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          <Link
            href="/shopping"
            className="px-4 py-2 rounded-full bg-zinc-900 text-white text-sm"
          >
            全部
          </Link>
          {categories.map((cat: any) => (
            <Link
              key={cat.id}
              href={`/shopping?category=${cat.slug}`}
              className="px-4 py-2 rounded-full border text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              {cat.icon} {cat.name}
            </Link>
          ))}
        </div>
      )}

      {products.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🛒</div>
          <h3 className="text-xl font-medium mb-2">暂无商品</h3>
          <p className="text-zinc-500">商品正在上架中，敬请期待...</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product: any) => (
            <Link
              key={product.id}
              href={`/shopping/${product.slug}`}
              className="group bg-white dark:bg-zinc-900 rounded-xl overflow-hidden border hover:shadow-lg transition-shadow"
            >
              <div className="aspect-square bg-zinc-100 dark:bg-zinc-800 relative overflow-hidden">
                {product.images && product.images[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">
                    📦
                  </div>
                )}
                
                {/* 标签 */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {product.is_featured && (
                    <span className="px-2 py-1 bg-yellow-500 text-white text-xs rounded">
                      推荐
                    </span>
                  )}
                  {product.original_price && Number(product.original_price) > Number(product.price) && (
                    <span className="px-2 py-1 bg-red-500 text-white text-xs rounded">
                      {Math.round((1 - Number(product.price) / Number(product.original_price)) * 100)}% OFF
                    </span>
                  )}
                </div>
              </div>
              
              <div className="p-3">
                <h3 className="font-medium text-sm line-clamp-2 group-hover:text-blue-600">
                  {product.name}
                </h3>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-lg font-bold text-red-600">
                    ¥{product.price}
                  </span>
                  {product.original_price && Number(product.original_price) > Number(product.price) && (
                    <span className="text-xs text-zinc-400 line-through">
                      ¥{product.original_price}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
