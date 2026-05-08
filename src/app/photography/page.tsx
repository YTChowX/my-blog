import { pgPool } from "@/lib/db"
import Link from "next/link"

export default async function PhotographyPage() {
  let albums: any[] = []
  try {
    const result = await pgPool.query(
      `SELECT * FROM "albums" WHERE "is_public" = true ORDER BY "created_at" DESC`
    )
    albums = result.rows
  } catch (e) {
    console.error(e)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">📷 摄影</h1>
        <p className="text-zinc-500 text-lg">用镜头记录生活的美好瞬间</p>
      </div>

      {albums.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📷</div>
          <h3 className="text-xl font-medium mb-2">暂无相册</h3>
          <p className="text-zinc-500">相册正在整理中，敬请期待...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {albums.map((album: any) => (
            <Link
              key={album.id}
              href={`/photography/${album.slug}`}
              className="group block bg-white dark:bg-zinc-900 rounded-xl overflow-hidden border hover:shadow-xl transition-all duration-300"
            >
              <div className="aspect-[4/3] bg-zinc-100 dark:bg-zinc-800 relative overflow-hidden">
                {album.cover_image ? (
                  <img
                    src={album.cover_image}
                    alt={album.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl">
                    🖼️
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                  <span className="text-white text-sm">
                    {album.photo_count} 张照片
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h2 className="font-medium text-lg group-hover:text-blue-600 transition-colors">
                  {album.title}
                </h2>
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
