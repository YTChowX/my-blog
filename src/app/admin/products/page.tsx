import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { pgPool } from "@/lib/db"
import Link from "next/link"
import { DeleteProductButton } from "./DeleteProductButton"

export default async function AdminProductsPage() {
  const session = await auth()

  if (!session || session.user.role !== "ADMIN") {
    redirect("/auth/signin?callbackUrl=/admin/products")
  }

  let products: any[] = []
  try {
    const result = await pgPool.query(`
      SELECT p.*, c."name" as "categoryName"
      FROM "products" p
      LEFT JOIN "product_categories" c ON p."category_id" = c."id"
      ORDER BY p."created_at" DESC
    `)
    products = result.rows
  } catch (e) {
    console.error(e)
  }

  const statusMap: Record<string, { label: string; color: string }> = {
    active: { label: "上架", color: "bg-green-100 text-green-700" },
    inactive: { label: "下架", color: "bg-gray-100 text-gray-700" },
    soldout: { label: "售罄", color: "bg-red-100 text-red-700" },
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">🛒 商品管理</h1>
          <p className="text-zinc-500">上架和管理商�?/p>
        </div>
        <Link
          href="/admin/products/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + 上架商品
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-xl">
          <div className="text-6xl mb-4">🛒</div>
          <h3 className="text-xl font-medium mb-2">还没有商�?/h3>
          <p className="text-zinc-500 mb-4">上架你的第一个商�?/p>
          <Link
            href="/admin/products/new"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            上架商品
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product: any) => (
            <div
              key={product.id}
              className="bg-white dark:bg-zinc-900 rounded-xl overflow-hidden border hover:shadow-lg transition-shadow"
            >
              <div className="aspect-square bg-zinc-100 dark:bg-zinc-800 relative">
                {product.images && product.images[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">
                    📦
                  </div>
                )}
                <div className="absolute top-2 left-2 flex gap-2">
                  <span className={`px-2 py-1 text-xs rounded ${statusMap[product.status]?.color}`}>
                    {statusMap[product.status]?.label || product.status}
                  </span>
                  {product.is_featured && (
                    <span className="px-2 py-1 bg-yellow-500 text-white text-xs rounded">
                      推荐
                    </span>
                  )}
                </div>
                {product.original_price && product.original_price > Number(product.price) && (
                  <div className="absolute top-2 right-2 px-2 py-1 bg-red-500 text-white text-xs rounded">
                    {Math.round((1 - Number(product.price) / product.original_price) * 100)}% OFF
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-medium text-lg">{product.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-lg font-bold text-red-600">¥{product.price}</span>
                  {product.original_price && (
                    <span className="text-sm text-zinc-400 line-through">
                      ¥{product.original_price}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between mt-2 text-sm text-zinc-500">
                  <span>库存: {product.stock}</span>
                  <span>{product.categoryName || "未分�?}</span>
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <Link
                    href={`/admin/products/${product.id}/edit`}
                    className="flex-1 text-center py-2 border rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    编辑
                  </Link>
                  <DeleteProductButton productId={product.id} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
