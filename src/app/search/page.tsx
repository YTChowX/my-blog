"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Suspense } from "react"

function SearchContent() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get("q") || ""
  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [type, setType] = useState("all")

  useEffect(() => {
    if (initialQuery) {
      doSearch(initialQuery)
    }
  }, [initialQuery])

  const doSearch = async (q: string) => {
    if (!q.trim()) {
      setResults([])
      setTotal(0)
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&type=${type}`)
      if (res.ok) {
        const data = await res.json()
        setResults(data.results)
        setTotal(data.total)
      }
    } catch { /* ignore */ }
    setLoading(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    doSearch(query)
    window.history.replaceState(null, "", `/search?q=${encodeURIComponent(query)}`)
  }

  const getHref = (item: any) => {
    if (item.type === "snippet") return `/tech/snippets/${item.id}`
    const catMap: Record<string, string> = { "编程": "/tech", "生活": "/life", "购物": "/shopping", "摄影": "/photography" }
    return `${catMap[item.category] || "/blog"}/${item.slug}`
  }

  const getTypeLabel = (item: any) => {
    if (item.type === "snippet") return "代码片段"
    return item.category || "文章"
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">🔍 搜索</h1>

      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="输入关键词搜索文章和代码片段..."
            className="flex-1 px-4 py-3 border rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700"
            autoFocus
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-zinc-900 text-white rounded-xl font-medium hover:bg-zinc-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "搜索中..." : "搜索"}
          </button>
        </div>
        <div className="flex gap-2 mt-3">
          {[
            { value: "all", label: "全部" },
            { value: "post", label: "文章" },
            { value: "snippet", label: "代码片段" },
          ].map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => { setType(t.value); if (query) doSearch(query) }}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                type === t.value
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </form>

      {query && !loading && (
        <p className="text-sm text-zinc-500 mb-4">
          找到 {total} 个与「{query}」相关的结果
        </p>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse p-4 border rounded-xl">
              <div className="h-5 bg-zinc-200 dark:bg-zinc-700 rounded w-3/4 mb-2" />
              <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : results.length > 0 ? (
        <div className="space-y-3">
          {results.map((item) => (
            <Link
              key={`${item.type}-${item.id}`}
              href={getHref(item)}
              className="block p-4 border rounded-xl hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-full">
                  {getTypeLabel(item)}
                </span>
                <span className="text-xs text-zinc-400">
                  {new Date(item.createdAt).toLocaleDateString("zh-CN")}
                </span>
              </div>
              <h3 className="font-medium">{item.title}</h3>
              {item.excerpt && (
                <p className="text-sm text-zinc-500 mt-1 line-clamp-2">{item.excerpt}</p>
              )}
            </Link>
          ))}
        </div>
      ) : query ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-medium mb-2">未找到相关内容</h3>
          <p className="text-zinc-500">试试其他关键词吧</p>
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">💡</div>
          <h3 className="text-xl font-medium mb-2">输入关键词开始搜索</h3>
          <p className="text-zinc-500">支持搜索文章标题、内容和代码片段</p>
        </div>
      )}
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="max-w-3xl mx-auto px-4 py-12 text-center">加载中...</div>}>
      <SearchContent />
    </Suspense>
  )
}
