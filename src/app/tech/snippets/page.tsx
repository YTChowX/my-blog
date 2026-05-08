import { pgPool } from "@/lib/db"
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

export default async function SnippetsListPage() {
  let snippets: any[] = []

  try {
    const result = await pgPool.query(`
      SELECT * FROM "code_snippets" 
      WHERE "is_public" = true
      ORDER BY "createdAt" DESC
    `)
    snippets = result.rows
  } catch (e) {
    console.error(e)
  }

  // 统计各语言数量
  const languageCounts: Record<string, number> = {}
  snippets.forEach((s: any) => {
    languageCounts[s.language] = (languageCounts[s.language] || 0) + 1
  })

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="mb-8">
        <Link
          href="/tech"
          className="inline-flex items-center gap-1 text-zinc-500 hover:text-zinc-900 mb-4"
        >
          ← 返回编程首页
        </Link>
        <h1 className="text-3xl font-bold mb-2">💡 代码片段</h1>
        <p className="text-zinc-500">收集整理的实用代码片段</p>
      </div>

      {/* 语言筛选 */}
      {Object.keys(languageCounts).length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          <Link
            href="/tech/snippets"
            className="px-3 py-1 bg-zinc-900 text-white rounded-full text-sm"
          >
            全部 ({snippets.length})
          </Link>
          {Object.entries(languageCounts).map(([lang, count]) => {
            const color = languageColors[lang] || "bg-zinc-100 text-zinc-800"
            const label = languageLabels[lang] || lang
            return (
              <Link
                key={lang}
                href={`/tech/snippets?lang=${lang}`}
                className={`px-3 py-1 rounded-full text-sm ${color}`}
              >
                {label} ({count})
              </Link>
            )
          })}
        </div>
      )}

      {snippets.length === 0 ? (
        <div className="text-center py-16 border rounded-xl">
          <div className="text-6xl mb-4">💻</div>
          <h3 className="text-xl font-medium mb-2">暂无代码片段</h3>
          <p className="text-zinc-500">代码片段正在整理中，敬请期待...</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {snippets.map((snippet: any) => {
            const langColor = languageColors[snippet.language] || "bg-zinc-100 text-zinc-800"
            const langLabel = languageLabels[snippet.language] || snippet.language

            return (
              <Link
                key={snippet.id}
                href={`/tech/snippets/${snippet.id}`}
                className="block bg-white dark:bg-zinc-900 rounded-xl border overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="font-medium truncate">{snippet.title}</h2>
                    <span className={`px-2 py-0.5 text-xs rounded ${langColor}`}>
                      {langLabel}
                    </span>
                  </div>
                  {snippet.description && (
                    <p className="text-sm text-zinc-500 line-clamp-2 mb-3">
                      {snippet.description}
                    </p>
                  )}
                  <div className="bg-zinc-50 dark:bg-zinc-800 rounded p-3 overflow-hidden">
                    <pre className="text-xs font-mono text-zinc-600 dark:text-zinc-400 overflow-x-auto">
                      <code className="line-clamp-3">{snippet.code}</code>
                    </pre>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    {snippet.tags && snippet.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {snippet.tags.slice(0, 3).map((tag: string) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-700 text-xs rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <span className="text-xs text-zinc-400 ml-auto">
                      👁 {snippet.views || 0}
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
