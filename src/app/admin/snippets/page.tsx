"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

const supportedLanguages = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "csharp", label: "C#" },
  { value: "cpp", label: "C++" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "php", label: "PHP" },
  { value: "ruby", label: "Ruby" },
  { value: "swift", label: "Swift" },
  { value: "kotlin", label: "Kotlin" },
  { value: "sql", label: "SQL" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "json", label: "JSON" },
  { value: "yaml", label: "YAML" },
  { value: "markdown", label: "Markdown" },
  { value: "bash", label: "Bash" },
  { value: "shell", label: "Shell" },
]

export default function SnippetsPage() {
  const [snippets, setSnippets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchSnippets()
  }, [])

  const fetchSnippets = async () => {
    try {
      const res = await fetch("/api/snippets")
      if (res.ok) {
        const data = await res.json()
        setSnippets(data)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这个代码片段吗？")) return

    try {
      const res = await fetch(`/api/snippets/${id}`, { method: "DELETE" })
      if (res.ok) {
        setSnippets(snippets.filter((s) => s.id !== id))
      }
    } catch (e) {
      console.error(e)
    }
  }

  const getLanguageLabel = (value: string) => {
    return supportedLanguages.find((l) => l.value === value)?.label || value
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center py-12">加载中...</div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">代码片段管理</h1>
          <p className="text-zinc-500 text-sm mt-1">管理和分享代码片段</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin"
            className="px-4 py-2 border rounded-lg hover:bg-zinc-50 transition-colors"
          >
            返回
          </Link>
          <Link
            href="/admin/snippets/new"
            className="px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-700 transition-colors"
          >
            + 新建片段
          </Link>
        </div>
      </div>

      {snippets.length === 0 ? (
        <div className="text-center py-16 border rounded-xl">
          <div className="text-6xl mb-4">💻</div>
          <h3 className="text-xl font-medium mb-2">暂无代码片段</h3>
          <p className="text-zinc-500 mb-4">开始创建你的第一个代码片段吧</p>
          <Link
            href="/admin/snippets/new"
            className="inline-block px-6 py-2 bg-zinc-900 text-white rounded-lg"
          >
            创建代码片段
          </Link>
        </div>
      ) : (
        <div className="border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-800">
                <th className="px-4 py-3 text-left text-sm font-medium">标题</th>
                <th className="px-4 py-3 text-left text-sm font-medium">语言</th>
                <th className="px-4 py-3 text-left text-sm font-medium">标签</th>
                <th className="px-4 py-3 text-left text-sm font-medium">状态</th>
                <th className="px-4 py-3 text-left text-sm font-medium">浏览</th>
                <th className="px-4 py-3 text-left text-sm font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {snippets.map((snippet) => (
                <tr key={snippet.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800">
                  <td className="px-4 py-3">
                    <div className="font-medium">{snippet.title}</div>
                    {snippet.description && (
                      <div className="text-sm text-zinc-500 truncate max-w-xs">
                        {snippet.description}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs rounded">
                      {getLanguageLabel(snippet.language)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {snippet.tags?.slice(0, 3).map((tag: string) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-700 text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        snippet.is_public
                          ? "bg-green-100 text-green-700"
                          : "bg-zinc-100 text-zinc-600"
                      }`}
                    >
                      {snippet.is_public ? "公开" : "私有"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-500">
                    {snippet.views || 0}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/snippets/${snippet.id}/edit`}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        编辑
                      </Link>
                      <span className="text-zinc-300">|</span>
                      <button
                        onClick={() => handleDelete(snippet.id)}
                        className="text-sm text-red-600 hover:underline"
                      >
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
