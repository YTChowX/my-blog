import { pgPool } from "@/lib/db"
import { notFound } from "next/navigation"
import Link from "next/link"

const languageColors: Record<string, string> = {
  javascript: "bg-yellow-100 text-yellow-800",
  typescript: "bg-blue-100 text-blue-800",
  python: "bg-green-100 text-green-800",
  java: "bg-red-100 text-red-800",
  csharp: "bg-purple-100 text-purple-800",
  cpp: "bg-indigo-100 text-indigo-800",
  go: "bg-cyan-100 text-cyan-800",
  rust: "bg-orange-100 text-orange-800",
  php: "bg-violet-100 text-violet-800",
  ruby: "bg-pink-100 text-pink-800",
  sql: "bg-slate-100 text-slate-800",
  html: "bg-rose-100 text-rose-800",
  css: "bg-sky-100 text-sky-800",
  json: "bg-zinc-100 text-zinc-800",
  bash: "bg-amber-100 text-amber-800",
}

const languageLabels: Record<string, string> = {
  javascript: "JavaScript",
  typescript: "TypeScript",
  python: "Python",
  java: "Java",
  csharp: "C#",
  cpp: "C++",
  go: "Go",
  rust: "Rust",
  php: "PHP",
  ruby: "Ruby",
  swift: "Swift",
  kotlin: "Kotlin",
  sql: "SQL",
  html: "HTML",
  css: "CSS",
  json: "JSON",
  yaml: "YAML",
  markdown: "Markdown",
  bash: "Bash",
  shell: "Shell",
}

export const dynamic = 'force-dynamic'

export default async function SnippetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const result = await pgPool.query(
    `SELECT * FROM "code_snippets" WHERE "id" = $1 AND "is_public" = true`,
    [id]
  )

  if (result.rows.length === 0) {
    notFound()
  }

  const snippet = result.rows[0]
  const langColor = languageColors[snippet.language] || "bg-zinc-100 text-zinc-800"
  const langLabel = languageLabels[snippet.language] || snippet.language

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link
        href="/tech/snippets"
        className="inline-flex items-center gap-1 text-zinc-500 hover:text-zinc-900 mb-6"
      >
        ← 返回代码片段列表
      </Link>

      {/* 标题区域 */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <span className={`px-3 py-1 text-sm rounded-full ${langColor}`}>
            {langLabel}
          </span>
          <span className="text-sm text-zinc-400">
            👁 {snippet.views || 0} 次浏览
          </span>
        </div>
        <h1 className="text-3xl font-bold">{snippet.title}</h1>
        {snippet.description && (
          <p className="text-zinc-500 mt-2">{snippet.description}</p>
        )}
      </div>

      {/* 标签 */}
      {snippet.tags && snippet.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {snippet.tags.map((tag: string) => (
            <span
              key={tag}
              className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-sm rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* 代码区域 */}
      <div className="bg-zinc-900 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 bg-zinc-800">
          <span className="text-sm text-zinc-400">{langLabel}</span>
          <button
            onClick={() => navigator.clipboard.writeText(snippet.code)}
            className="text-sm text-zinc-400 hover:text-white transition-colors"
          >
            📋 复制代码
          </button>
        </div>
        <pre className="p-4 overflow-x-auto text-sm">
          <code className="text-zinc-100 font-mono whitespace-pre">
            {snippet.code}
          </code>
        </pre>
      </div>

      {/* 元信息 */}
      <div className="mt-6 text-sm text-zinc-400">
        创建于 {new Date(snippet.createdAt).toLocaleDateString("zh-CN", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </div>
    </div>
  )
}
