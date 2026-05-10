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
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    fetchSnippets()
  }, [])

  const fetchSnippets = async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/snippets")
      if (res.ok) {
        const data = await res.json()
        setSnippets(data)
      } else {
        const err = await res.json()
        setError(err.error || "åŠ è½½ä»£ç ç‰‡æ®µå¤±è´¥")
      }
    } catch (e: any) {
      setError("åŠ è½½å¤±è´¥: " + e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("ç¡®å®šè¦åˆ é™¤è¿™ä¸ªä»£ç ç‰‡æ®µå—ï¼?)) return

    try {
      const res = await fetch(`/api/snippets/${id}`, { method: "DELETE" })
      if (res.ok) {
        setSnippets(snippets.filter((s) => s.id !== id))
      } else {
        const err = await res.json()
        alert("åˆ é™¤å¤±è´¥: " + (err.error || "æœªçŸ¥é”™è¯¯"))
      }
    } catch (e: any) {
      alert("åˆ é™¤å¤±è´¥: " + e.message)
    }
  }

  const getLanguageLabel = (value: string) => {
    return supportedLanguages.find((l) => l.value === value)?.label || value
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center py-12">åŠ è½½ä¸?..</div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">ä»£ç ç‰‡æ®µç®¡ç†</h1>
          <p className="text-zinc-500 text-sm mt-1">ç®¡ç†å’Œåˆ†äº«ä»£ç ç‰‡æ®?/p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin"
            className="px-4 py-2 border rounded-lg hover:bg-zinc-50 transition-colors"
          >
            è¿”å›ž
          </Link>
          <Link
            href="/admin/snippets/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            + æ–°å»ºç‰‡æ®µ
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 mb-6 rounded-lg bg-red-50 text-red-600">
          {error}
          <button onClick={fetchSnippets} className="ml-2 underline">é‡è¯•</button>
        </div>
      )}

      {snippets.length === 0 && !error ? (
        <div className="text-center py-16 border rounded-xl">
          <div className="text-6xl mb-4">ðŸ’»</div>
          <h3 className="text-xl font-medium mb-2">æš‚æ— ä»£ç ç‰‡æ®µ</h3>
          <p className="text-zinc-500 mb-4">å¼€å§‹åˆ›å»ºä½ çš„ç¬¬ä¸€ä¸ªä»£ç ç‰‡æ®µå§</p>
          <Link
            href="/admin/snippets/new"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            åˆ›å»ºä»£ç ç‰‡æ®µ
          </Link>
        </div>
      ) : (
        <div className="border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-800">
                <th className="px-4 py-3 text-left text-sm font-medium">æ ‡é¢˜</th>
                <th className="px-4 py-3 text-left text-sm font-medium">è¯­è¨€</th>
                <th className="px-4 py-3 text-left text-sm font-medium">æ ‡ç­¾</th>
                <th className="px-4 py-3 text-left text-sm font-medium">çŠ¶æ€?/th>
                <th className="px-4 py-3 text-left text-sm font-medium">æµè§ˆ</th>
                <th className="px-4 py-3 text-left text-sm font-medium">æ“ä½œ</th>
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
                      {snippet.is_public ? "å…¬å¼€" : "ç§æœ‰"}
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
                        ç¼–è¾‘
                      </Link>
                      <span className="text-zinc-300">|</span>
                      <button
                        onClick={() => handleDelete(snippet.id)}
                        className="text-sm text-red-600 hover:underline"
                      >
                        åˆ é™¤
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
