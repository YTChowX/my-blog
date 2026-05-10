"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export function DeleteAlbumButton({ albumId }: { albumId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm("确定要删除这个相册吗？所有照片也会被删除�?)) {
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/albums/${albumId}`, {
        method: "DELETE",
      })

      if (res.ok) {
        router.refresh()
      } else {
        alert("删除失败")
      }
    } catch {
      alert("删除失败")
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-sm text-red-600 hover:underline disabled:opacity-50"
    >
      {loading ? "删除�?.." : "删除"}
    </button>
  )
}
