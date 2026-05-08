import { pgPool } from "@/lib/db"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"

export async function generateStaticParams() {
  const result = await pgPool.query(`SELECT slug FROM "albums" WHERE "is_public" = true`)
  return result.rows.map((row: any) => ({ slug: row.slug }))
}

export default async function AlbumDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  // 获取相册信息
  const albumResult = await pgPool.query(
    `SELECT * FROM "albums" WHERE "slug" = $1 AND "is_public" = true`,
    [slug]
  )

  if (albumResult.rows.length === 0) {
    notFound()
  }

  const album = albumResult.rows[0]

  // 获取照片列表
  const photosResult = await pgPool.query(
    `SELECT * FROM "photos" WHERE "album_id" = $1 ORDER BY "order_index", "created_at"`,
    [album.id]
  )
  const photos = photosResult.rows

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* 返回按钮 */}
      <Link
        href="/photography"
        className="inline-flex items-center gap-1 text-zinc-500 hover:text-zinc-900 mb-6"
      >
        ← 返回相册列表
      </Link>

      {/* 相册信息 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{album.title}</h1>
        {album.description && (
          <p className="text-zinc-500">{album.description}</p>
        )}
        <p className="text-sm text-zinc-400 mt-2">
          {photos.length} 张照片 · {new Date(album.created_at).toLocaleDateString("zh-CN")}
        </p>
      </div>

      {/* 瀑布流照片展示 */}
      {photos.length === 0 ? (
        <div className="text-center py-16 text-zinc-500">
          相册暂无照片
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          {photos.map((photo: any, index: number) => (
            <div
              key={photo.id}
              className="break-inside-avoid group relative rounded-lg overflow-hidden bg-zinc-100"
            >
              <img
                src={photo.url}
                alt={photo.caption || `照片 ${index + 1}`}
                className="w-full h-auto"
              />
              
              {/* 悬浮信息 */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                <div className="text-white text-sm">
                  {photo.caption && <p className="mb-1">{photo.caption}</p>}
                  {photo.exif_camera && (
                    <p className="text-xs text-white/70">
                      {photo.exif_camera}
                      {photo.exif_aperture && ` · ${photo.exif_aperture}`}
                      {photo.exif_shutter && ` · ${photo.exif_shutter}`}
                      {photo.exif_iso && ` · ISO ${photo.exif_iso}`}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
