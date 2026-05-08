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

export default async function TechPage() {
  let posts: any[] = []
  let snippets: any[] = []

  try {
    const postsResult = await pgPool.query(`
      SELECT * FROM "posts" 
      WHERE "published" = true AND "category" = '编程'
      ORDER BY "createdAt" DESC
    `)
    posts = postsResult.rows
  } catch (e) {
    console.error(e)
  }

  try {
    const snippetsResult = await pgPool.query(`
      SELECT * FROM "code_snippets" 
      WHERE "is_public" = true
      ORDER BY "createdAt" DESC
      LIMIT 6
    `)
    snippets = snippetsResult.rows
  } catch (e) {
    console.error(e)
  }

  // 技术标签统计
  const tagCounts: Record<string, number> = {}
  posts.forEach((post: any) => {
    if (post.tags && Array.isArray(post.tags)) {
      post.tags.forEach((tag: string) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1
      })
    }
  })
  const topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">💻 编程</h1>
        <p className="text-zinc-500 text-lg">技术笔记、代码片段、开发心得</p>
      </div>

      {/* 技术标签云 */}
      {topTags.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {topTags.map(([tag, count]) => (
            <Link
              key={tag}
              href={`/tech?tag=${encodeURIComponent(tag)}`}
              className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full text-sm hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              {tag} <span className="text-zinc-400">({count})</span>
            </Link>
          ))}
        </div>
      )}

      {/* 代码片段区域 */}
      {snippets.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">💡 代码片段</h2>
            <Link href="/tech/snippets" className="text-sm text-blue-600 hover:underline">
              查看全部 →
            </Link>
          </div>
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
                      <h3 className="font-medium truncate">{snippet.title}</h3>
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
                    {snippet.tags && snippet.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
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
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* 技术文章区域 */}
      <div>
        <h2 className="text-xl font-bold mb-4">📝 技术文章</h2>
        {posts.length === 0 ? (
          <div className="text-center py-16 border rounded-xl">
            <div className="text-6xl mb-4">💻</div>
            <h3 className="text-xl font-medium mb-2">暂无技术文章</h3>
            <p className="text-zinc-500">技术文章正在整理中，敬请期待...</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {posts.map((post: any) => (
              <Link
                key={post.id}
                href={`/tech/${post.slug}`}
                className="group block bg-white dark:bg-zinc-900 rounded-xl border p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start gap-4">
                  {post.cover_image && (
                    <div className="hidden sm:block w-32 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-zinc-100">
                      <img
                        src={post.cover_image}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-medium group-hover:text-blue-600 transition-colors">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="text-zinc-500 mt-2 line-clamp-2">
                        {post.excerpt}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      {post.tags && Array.isArray(post.tags) && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {post.tags.slice(0, 3).map((tag: string) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <span className="text-xs text-zinc-400">
                        {new Date(post.createdAt).toLocaleDateString("zh-CN")}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
