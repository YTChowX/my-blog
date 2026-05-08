import Link from "next/link"
import { pgPool } from "@/lib/db"

export const dynamic = 'force-dynamic'

const categories = [
  { name: "生活", href: "/life", emoji: "🌿", color: "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800" },
  { name: "购物", href: "/shopping", emoji: "🛒", color: "bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800" },
  { name: "编程", href: "/tech", emoji: "💻", color: "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800" },
  { name: "摄影", href: "/photography", emoji: "📷", color: "bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800" },
]

export default async function Home() {
  // 获取最新发布的文章
  let recentPosts: any[] = []
  try {
    const result = await pgPool.query(`
      SELECT id, title, slug, excerpt, category, tags, "createdAt", "cover_image"
      FROM "posts"
      WHERE "published" = true
      ORDER BY "createdAt" DESC
      LIMIT 6
    `)
    recentPosts = result.rows
  } catch (e) {
    console.error(e)
  }

  // 获取各板块统计
  let stats = { life: 0, tech: 0, shopping: 0, photo: 0, snippets: 0 }
  try {
    const [lifeRes, techRes, photoRes, snippetRes] = await Promise.all([
      pgPool.query(`SELECT COUNT(*) FROM "posts" WHERE "published" = true AND "category" = '生活'`),
      pgPool.query(`SELECT COUNT(*) FROM "posts" WHERE "published" = true AND "category" = '编程'`),
      pgPool.query(`SELECT COUNT(*) FROM "albums" WHERE "is_public" = true`),
      pgPool.query(`SELECT COUNT(*) FROM "code_snippets" WHERE "is_public" = true`),
    ])
    stats.life = parseInt(lifeRes.rows[0].count) || 0
    stats.tech = parseInt(techRes.rows[0].count) || 0
    stats.photo = parseInt(photoRes.rows[0].count) || 0
    stats.snippets = parseInt(snippetRes.rows[0].count) || 0
  } catch (e) {
    console.error(e)
  }

  // 获取最新代码片段
  let recentSnippets: any[] = []
  try {
    const result = await pgPool.query(`
      SELECT id, title, language, code, "createdAt"
      FROM "code_snippets"
      WHERE "is_public" = true
      ORDER BY "createdAt" DESC
      LIMIT 3
    `)
    recentSnippets = result.rows
  } catch (e) {
    console.error(e)
  }

  const getCategoryHref = (category: string) => {
    switch (category) {
      case "生活": return "/life"
      case "编程": return "/tech"
      case "购物": return "/shopping"
      case "摄影": return "/photography"
      default: return "/blog"
    }
  }

  const languageLabels: Record<string, string> = {
    javascript: "JS", typescript: "TS", python: "Py", java: "Java",
    go: "Go", rust: "Rust", cpp: "C++", sql: "SQL", bash: "Bash",
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
        <div className="max-w-5xl mx-auto px-4 py-20 md:py-32 text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            记录生活
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              分享美好
            </span>
          </h1>
          <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto mb-10">
            这里是我的个人空间，记录日常生活的点滴、编程开发的心得、购物好物推荐，以及用镜头捕捉的美好瞬间。
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/blog"
              className="px-6 py-3 bg-zinc-900 text-white rounded-lg font-medium hover:bg-zinc-700 transition-colors"
            >
              浏览文章 →
            </Link>
            <Link
              href="/about"
              className="px-6 py-3 border border-zinc-300 dark:border-zinc-700 rounded-lg font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              了解更多
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold mb-8">内容板块</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat) => {
            const count = cat.name === "生活" ? stats.life
              : cat.name === "编程" ? stats.tech + stats.snippets
              : cat.name === "摄影" ? stats.photo
              : 0
            return (
              <Link
                key={cat.name}
                href={cat.href}
                className={`p-6 rounded-xl border ${cat.color} hover:scale-105 transition-transform text-center`}
              >
                <span className="text-3xl mb-3 block">{cat.emoji}</span>
                <span className="font-semibold block">{cat.name}</span>
                <span className="text-xs text-zinc-500 mt-1 block">{count} 篇</span>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Latest Code Snippets */}
      {recentSnippets.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">💡 最新代码片段</h2>
            <Link href="/tech/snippets" className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
              查看全部 →
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {recentSnippets.map((snippet: any) => (
              <Link
                key={snippet.id}
                href={`/tech/snippets/${snippet.id}`}
                className="block bg-white dark:bg-zinc-900 rounded-xl border p-4 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-sm truncate">{snippet.title}</h3>
                  <span className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-xs rounded flex-shrink-0 ml-2">
                    {languageLabels[snippet.language] || snippet.language}
                  </span>
                </div>
                <pre className="text-xs font-mono text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800 rounded p-2 overflow-hidden">
                  <code className="line-clamp-3">{snippet.code}</code>
                </pre>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Recent Posts Section */}
      <section className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">📝 最新文章</h2>
          <Link href="/blog" className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
            查看全部 →
          </Link>
        </div>
        {recentPosts.length === 0 ? (
          <div className="text-center py-16 border rounded-xl">
            <div className="text-6xl mb-4">📝</div>
            <p className="text-zinc-500 dark:text-zinc-400">暂无文章，快去添加第一篇吧！</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentPosts.map((post) => (
              <Link
                key={post.id}
                href={`${getCategoryHref(post.category)}/${post.slug}`}
                className="group block bg-white dark:bg-zinc-900 rounded-xl border overflow-hidden hover:shadow-lg transition-all"
              >
                {/* 封面图 */}
                {post.cover_image && (
                  <div className="aspect-video bg-zinc-100">
                    <img
                      src={post.cover_image}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                      {post.category}
                    </span>
                    <span className="text-xs text-zinc-400">
                      {new Date(post.createdAt).toLocaleDateString("zh-CN")}
                    </span>
                  </div>
                  <h3 className="font-semibold mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2">
                      {post.excerpt}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
