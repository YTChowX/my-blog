import { pgPool } from "@/lib/db"
import Link from "next/link"

// 心情表情映射
const moodEmojis: Record<string, string> = {
  happy: "😊",
  sad: "😔",
  excited: "🎉",
  calm: "😌",
  tired: "😴",
  angry: "😠",
  loved: "❤️",
  thinking: "🤔",
  coffee: "☕",
  sunny: "☀️",
  rainy: "🌧️",
  cloudy: "☁️",
}

export default async function LifePage() {
  let posts: any[] = []

  try {
    const result = await pgPool.query(`
      SELECT * FROM "posts" 
      WHERE "published" = true AND "category" = '生活'
      ORDER BY "createdAt" DESC
    `)
    posts = result.rows
  } catch (e) {
    console.error(e)
  }

  // 按年月分组
  const groupedPosts: Record<string, any[]> = {}
  posts.forEach((post: any) => {
    const date = new Date(post.createdAt)
    const key = `${date.getFullYear()}年${date.getMonth() + 1}月`
    if (!groupedPosts[key]) {
      groupedPosts[key] = []
    }
    groupedPosts[key].push(post)
  })

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">🌿 生活</h1>
        <p className="text-zinc-500 text-lg">记录日常点滴，分享生活感悟</p>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-medium mb-2">暂无生活记录</h3>
          <p className="text-zinc-500">生活记录正在整理中，敬请期待...</p>
        </div>
      ) : (
        <div className="relative">
          {/* 时间轴线 */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-zinc-200 dark:bg-zinc-700 transform md:-translate-x-1/2" />

          {/* 时间轴内容 */}
          {Object.entries(groupedPosts).map(([month, monthPosts]) => (
            <div key={month} className="mb-12">
              {/* 月份标题 */}
              <div className="relative flex justify-center mb-8">
                <div className="bg-white dark:bg-zinc-900 px-4 py-2 rounded-full border font-medium z-10">
                  {month}
                </div>
              </div>

              {/* 该月份的文章 */}
              {monthPosts.map((post: any, index: number) => {
                const isLeft = index % 2 === 0
                const moodEmoji = post.mood ? moodEmojis[post.mood] || "📝" : "📝"

                return (
                  <div
                    key={post.id}
                    className={`relative flex items-center mb-8 ${
                      isLeft ? "md:flex-row" : "md:flex-row-reverse"
                    }`}
                  >
                    {/* 时间点 */}
                    <div className="absolute left-4 md:left-1/2 w-4 h-4 bg-blue-500 rounded-full transform -translate-x-1/2 z-10" />

                    {/* 卡片 */}
                    <div
                      className={`ml-12 md:ml-0 md:w-[calc(50%-2rem)] ${
                        isLeft ? "md:mr-auto md:pr-8" : "md:ml-auto md:pl-8"
                      }`}
                    >
                      <Link
                        href={`/life/${post.slug}`}
                        className="block bg-white dark:bg-zinc-900 rounded-xl border p-4 hover:shadow-lg transition-shadow"
                      >
                        {/* 封面图 */}
                        {post.cover_image && (
                          <div className="aspect-video rounded-lg overflow-hidden mb-3 bg-zinc-100">
                            <img
                              src={post.cover_image}
                              alt={post.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}

                        {/* 标题和心情 */}
                        <div className="flex items-start gap-2">
                          <span className="text-2xl">{moodEmoji}</span>
                          <div className="flex-1">
                            <h3 className="font-medium text-lg hover:text-blue-600">
                              {post.title}
                            </h3>
                            {post.excerpt && (
                              <p className="text-sm text-zinc-500 mt-1 line-clamp-2">
                                {post.excerpt}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* 元信息 */}
                        <div className="flex items-center gap-4 mt-3 text-xs text-zinc-400">
                          <span>
                            {new Date(post.createdAt).toLocaleDateString("zh-CN", {
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                          {post.location && (
                            <span className="flex items-center gap-1">
                              📍 {post.location}
                            </span>
                          )}
                          {post.weather && (
                            <span>{post.weather}</span>
                          )}
                        </div>
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
