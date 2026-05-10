"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export function DeleteProductButton({ productId }: { productId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm("确定要删除这个商品吗�?)) {
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/products/${productId}`, {
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
      className="px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50"
    >
      {loading ? "删除�?.." : "删除"}
    </button>
  )
}
