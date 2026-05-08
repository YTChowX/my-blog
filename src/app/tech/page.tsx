import { pgPool } from "@/lib/db"
import Link from "next/link"

export default async function TechPage() {
  let posts: any[] = []

  try {
    const result = await pgPool.query(`
      SELECT * FROM "posts" 
      WHERE "published" = true AND "category" = '编程'
      ORDER BY "createdAt" DESC
    `)
    posts = result.rows
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

      {posts.length === 0 ? (
        <div className="text-center py-16">
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
                {/* 封面图 */}
                {post.cover_image && (
                  <div className="hidden sm:block w-32 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-zinc-100">
                    <img
                      src={post.cover_image}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* 内容 */}
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-medium group-hover:text-blue-600 transition-colors">
                    {post.title}
                  </h2>

                  {post.excerpt && (
                    <p className="text-zinc-500 mt-2 line-clamp-2">
                      {post.excerpt}
                    </p>
                  )}

                  {/* 标签和日期 */}
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
  )
}
