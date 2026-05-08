import { pgPool } from "@/lib/db"
import { notFound } from "next/navigation"
import Link from "next/link"

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const result = await pgPool.query(
    `SELECT * FROM "posts" WHERE "slug" = $1 AND "published" = true`,
    [slug]
  )

  if (result.rows.length === 0) {
    notFound()
  }

  const post = result.rows[0]

  return (
    <article className="max-w-3xl mx-auto px-4 py-12">
      <Link
        href={`/${post.category === '编程' ? 'tech' : post.category === '生活' ? 'life' : 'blog'}`}
        className="inline-flex items-center gap-1 text-zinc-500 hover:text-zinc-900 mb-6"
      >
        ← 返回列表
      </Link>

      {/* 文章头部 */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-4">{post.title}</h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-500">
          <span>
            {new Date(post.createdAt).toLocaleDateString("zh-CN", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
          {post.category && (
            <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded">
              {post.category}
            </span>
          )}
          {post.location && (
            <span>📍 {post.location}</span>
          )}
        </div>

        {/* 标签 */}
        {post.tags && Array.isArray(post.tags) && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {post.tags.map((tag: string) => (
              <span
                key={tag}
                className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm rounded"
              >
                {tag}
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
        className="prose prose-zinc dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-blue-600 prose-code:bg-zinc-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-zinc-900 prose-pre:text-zinc-100"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    </article>
  )
}
