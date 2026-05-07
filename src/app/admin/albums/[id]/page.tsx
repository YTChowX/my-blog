"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"

interface Photo {
  id: string
  url: string
  caption: string | null
  order_index: number
  exif_camera?: string
  exif_aperture?: string
  exif_shutter?: string
  exif_iso?: string
}

interface Album {
  id: string
  title: string
  slug: string
  description: string | null
  cover_image: string | null
  is_public: boolean
  photo_count: number
  photos: Photo[]
}

export default function AlbumDetailPage() {
  const params = useParams()
  const albumId = params.id as string
  const router = useRouter()

  const [album, setAlbum] = useState<Album | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const fetchAlbum = useCallback(async () => {
    try {
      const res = await fetch(`/api/albums/${albumId}`)
      if (res.ok) {
        setAlbum(await res.json())
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [albumId])

  useEffect(() => {
    fetchAlbum()
  }, [fetchAlbum])

  const handleUpload = async (files: FileList) => {
    setUploading(true)
    try {
      const uploadedUrls: string[] = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        if (!file.type.startsWith("image/")) continue

        const formData = new FormData()
        formData.append("file", file)

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (res.ok) {
          const data = await res.json()
          uploadedUrls.push(data.url)
        }
      }

      if (uploadedUrls.length > 0) {
        // 批量添加照片
        await fetch("/api/photos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            uploadedUrls.map((url, index) => ({
              album_id: albumId,
              url,
              order_index: album?.photos?.length || 0 + index,
            }))
          ),
        })
        fetchAlbum()
      }
    } catch (e) {
      console.error(e)
      alert("上传失败")
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files.length > 0) {
      handleUpload(e.dataTransfer.files)
    }
  }

  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm("确定要删除这张照片吗？")) return

    try {
      const res = await fetch(`/api/photos/${photoId}`, { method: "DELETE" })
      if (res.ok) fetchAlbum()
    } catch (e) {
      console.error(e)
    }
  }

  const handleSetCover = async (url: string) => {
    try {
      await fetch(`/api/albums/${albumId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: album?.title,
          slug: album?.slug,
          description: album?.description,
          cover_image: url,
          is_public: album?.is_public,
        }),
      })
      fetchAlbum()
    } catch (e) {
      console.error(e)
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center py-12">加载中...</div>
      </div>
    )
  }

  if (!album) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center py-12">相册不存在</div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/admin/albums" className="text-zinc-500 hover:text-zinc-900 text-sm">
            ← 返回相册列表
          </Link>
          <h1 className="text-2xl font-bold mt-2">{album.title}</h1>
          <p className="text-zinc-500">{album.description || "暂无描述"}</p>
        </div>
        <Link
          href={`/photography/${album.slug}`}
          className="px-4 py-2 border rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          查看前台
        </Link>
      </div>

      {/* 上传区域 */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`mb-8 border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          dragOver ? "border-blue-500 bg-blue-50" : "border-zinc-300"
        }`}
      >
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => e.target.files && handleUpload(e.target.files)}
          className="hidden"
          id="photo-upload"
        />
        <label htmlFor="photo-upload" className="cursor-pointer">
          <div className="text-4xl mb-2">📷</div>
          <p className="text-lg font-medium">
            {uploading ? "上传中..." : "拖拽图片到这里，或点击上传"}
          </p>
          <p className="text-sm text-zinc-500 mt-1">支持 JPG、PNG、WebP，单张最大 10MB</p>
        </label>
      </div>

      {/* 照片网格 */}
      {album.photos.length === 0 ? (
        <div className="text-center py-12 text-zinc-500">
          还没有照片，上传一些吧！
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {album.photos.map((photo) => (
            <div key={photo.id} className="group relative aspect-square rounded-lg overflow-hidden bg-zinc-100">
              <img
                src={photo.url}
                alt={photo.caption || ""}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() => handleSetCover(photo.url)}
                  className="px-3 py-1 bg-white text-sm rounded hover:bg-zinc-100"
                >
                  设为封面
                </button>
                <button
                  onClick={() => handleDeletePhoto(photo.id)}
                  className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                >
                  删除
                </button>
              </div>
              {album.cover_image === photo.url && (
                <div className="absolute top-2 left-2 px-2 py-1 bg-blue-500 text-white text-xs rounded">
                  封面
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
