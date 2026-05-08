import { pgPool } from "@/lib/db"
import { notFound } from "next/navigation"
import Link from "next/link"
import { remark } from "remark"
import html from "remark-html"

const moodEmojis: Record<string, string> = {
  happy: "😊", sad: "😔", excited: "🎉", calm: "😌",
  tired: "😴", angry: "😠", loved: "❤️", thinking: "🤔",
  coffee: "☕",
}

export const dynamic = 'force-dynamic'

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>
}) {
  const { category, slug } = await params

  const result = await pgPool.query(
    `SELECT * FROM "posts" WHERE "slug" = $1 AND "published" = true`,
    [slug]
  )

  if (result.rows.length === 0) {
    notFound()
  }

  const post = result.rows[0]

  // Markdown 渲染为 HTML
  let htmlContent = post.content
  try {
    const processed = await remark().use(html).process(post.content || "")
    htmlContent = processed.toString()
  } catch (e) {
    console.error("Markdown render error:", e)
  }

  const categoryHref = post.category === '编程' ? '/tech'
    : post.category === '生活' ? '/life'
    : post.category === '购物' ? '/shopping'
    : post.category === '摄影' ? '/photography'
    : '/blog'

  const moodEmoji = post.mood ? moodEmojis[post.mood] : null

  return (
    <article className="max-w-3xl mx-auto px-4 py-12">
      <Link
        href={categoryHref}
        className="inline-flex items-center gap-1 text-zinc-500 hover:text-zinc-900 mb-6"
      >
        ← 返回列表
      </Link>

      {/* 文章头部 */}
      <header className="mb-8">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
            {post.category}
          </span>
          <span className="text-xs text-zinc-400">
            {new Date(post.createdAt).toLocaleDateString("zh-CN", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
          {moodEmoji && <span className="text-lg">{moodEmoji}</span>}
        </div>

        <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>

        {/* 位置和天气 */}
        {(post.location || post.weather) && (
          <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-500 mb-4">
            {post.location && <span>📍 {post.location}</span>}
            {post.weather && <span>{post.weather}</span>}
          </div>
        )}

        {/* 标签 */}
        {post.tags && Array.isArray(post.tags) && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag: string) => (
              <span
                key={tag}
                className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm rounded"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* 封面图 */}
      {post.cover_image && (
        <div className="aspect-video rounded-xl overflow-hidden mb-8 bg-zinc-100">
          <img
            src={post.cover_image}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* 文章内容 */}
      <div
        className="prose prose-zinc dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-blue-600 prose-code:bg-zinc-100 dark:prose-code:bg-zinc-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-zinc-900 dark:prose-pre:bg-zinc-800 prose-pre:text-zinc-100 prose-img:rounded-xl"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </article>
  )
}
