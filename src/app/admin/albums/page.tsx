import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { pgPool } from "@/lib/db"
import Link from "next/link"

export default async function AdminAlbumsPage() {
  const session = await auth()

  if (!session || session.user.role !== "ADMIN") {
    redirect("/auth/signin?callbackUrl=/admin/albums")
  }

  let albums: any[] = []
  let error = ""

  try {
    const result = await pgPool.query(`SELECT * FROM "albums" ORDER BY "created_at" DESC`)
    albums = result.rows
  } catch (e: any) {
    console.error("[AdminAlbums] 加载相册失败:", e.message)
    error = "加载相册失败: " + e.message
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">📷 相册管理</h1>
          <p className="text-zinc-500">创建和管理摄影相册</p>
        </div>
        <Link
          href="/admin/albums/new"
          className="px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-700 transition-colors"
        >
          + 新建相册
        </Link>
      </div>

      {error && (
        <div className="p-4 mb-6 rounded-lg bg-red-50 text-red-600">
          {error}
          <p className="text-sm mt-1">请检查数据库连接或稍后重试</p>
        </div>
      )}

      {albums.length === 0 && !error ? (
        <div className="text-center py-16 border-2 border-dashed rounded-xl">
          <div className="text-6xl mb-4">📷</div>
          <h3 className="text-xl font-medium mb-2">还没有相册</h3>
          <p className="text-zinc-500 mb-4">创建你的第一个相册，开始记录精彩瞬间</p>
          <Link
            href="/admin/albums/new"
            className="inline-block px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-700"
          >
            创建相册
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {albums.map((album: any) => (
            <Link
              key={album.id}
              href={`/admin/albums/${album.id}`}
              className="group block bg-white dark:bg-zinc-900 rounded-xl overflow-hidden border hover:shadow-lg transition-shadow"
            >
              <div className="aspect-video bg-zinc-100 dark:bg-zinc-800 relative overflow-hidden">
                {album.cover_image ? (
                  <img
                    src={album.cover_image}
                    alt={album.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">
                    🖼️
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-2">
                  <span className="px-2 py-1 bg-black/50 text-white text-xs rounded">
                    {album.photo_count} 张照片
                  </span>
                  {!album.is_public && (
                    <span className="px-2 py-1 bg-yellow-500 text-white text-xs rounded">
                      私密
                    </span>
                  )}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-medium text-lg group-hover:text-blue-600">
                  {album.title}
                </h3>
                {album.description && (
                  <p className="text-sm text-zinc-500 mt-1 line-clamp-2">
                    {album.description}
                  </p>
                )}
                <p className="text-xs text-zinc-400 mt-2">
                  {new Date(album.created_at).toLocaleDateString("zh-CN")}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
