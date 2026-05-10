import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { pgPool } from "@/lib/db"
import Link from "next/link"
import { DeletePostButton } from "./DeletePostButton"

export default async function AdminPage() {
  const session = await auth()

  if (!session || session.user.role !== "ADMIN") {
    redirect("/auth/signin?callbackUrl=/admin")
  }

  // 获取统计数据
  let postsCount = 0
  let albumsCount = 0
  let productsCount = 0
  let snippetsCount = 0

  try {
    const postsResult = await pgPool.query(`SELECT COUNT(*) FROM "posts"`)
    postsCount = parseInt(postsResult.rows[0].count) || 0

    const albumsResult = await pgPool.query(`SELECT COUNT(*) FROM "albums"`)
    albumsCount = parseInt(albumsResult.rows[0].count) || 0

    const productsResult = await pgPool.query(`SELECT COUNT(*) FROM "products"`)
    productsCount = parseInt(productsResult.rows[0].count) || 0

    const snippetsResult = await pgPool.query(`SELECT COUNT(*) FROM "code_snippets"`)
    snippetsCount = parseInt(snippetsResult.rows[0].count) || 0
  } catch (e) {
    console.error(e)
  }

  // 获取最近文章
  let posts: any[] = []
  try {
    const result = await pgPool.query(`
      SELECT p.*, u."name" as "authorName"
      FROM "posts" p
      LEFT JOIN "users" u ON p."authorId" = u."id"
      ORDER BY p."createdAt" DESC
      LIMIT 5
    `)
    posts = result.rows
  } catch (e) {
    console.error(e)
  }

  const managementCards = [
    {
      title: "📝 文章管理",
      description: "发布博客文章",
      href: "/admin/posts",
      count: postsCount,
      color: "bg-blue-50 text-blue-700",
    },
    {
      title: "💻 代码片段",
      description: "管理和分享代码",
      href: "/admin/snippets",
      count: snippetsCount,
      color: "bg-orange-50 text-orange-700",
    },
    {
      title: "📷 相册管理",
      description: "上传和管理照片",
      href: "/admin/albums",
      count: albumsCount,
      color: "bg-green-50 text-green-700",
    },
    {
      title: "🛒 商品管理",
      description: "上架和管理商品",
      href: "/admin/products",
      count: productsCount,
      color: "bg-purple-50 text-purple-700",
    },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">后台管理</h1>
        <p className="text-zinc-500">欢迎回来，{session.user.name || session.user.email}</p>
      </div>

      {/* 管理入口卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {managementCards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="p-6 border rounded-xl hover:shadow-lg transition-shadow bg-white dark:bg-zinc-900"
          >
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-medium">{card.title}</h2>
              <span className={`px-2 py-1 text-xs rounded-full ${card.color}`}>
                {card.count}
              </span>
            </div>
            <p className="text-sm text-zinc-500">{card.description}</p>
          </Link>
        ))}
      </div>

      {/* 最近文章 */}
      <div className="border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-zinc-50 dark:bg-zinc-800">
          <h2 className="font-medium">最近文章</h2>
          <Link href="/admin/posts" className="text-sm text-blue-600 hover:underline">
            查看全部
          </Link>
        </div>

        {posts.length === 0 ? (
          <div className="p-8 text-center text-zinc-500">
            暂无文章，<Link href="/admin/posts/new" className="text-blue-600 hover:underline">创建第一篇</Link>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-t">
                <th className="px-4 py-3 text-left text-sm font-medium">标题</th>
                <th className="px-4 py-3 text-left text-sm font-medium">分类</th>
                <th className="px-4 py-3 text-left text-sm font-medium">状态</th>
                <th className="px-4 py-3 text-left text-sm font-medium">日期</th>
                <th className="px-4 py-3 text-left text-sm font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {posts.map((post: any) => (
                <tr key={post.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800">
                  <td className="px-4 py-3">
                    <div className="font-medium">{post.title}</div>
                  </td>
                  <td className="px-4 py-3 text-sm">{post.category}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        post.published
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {post.published ? "已发布" : "草稿"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-500">
                    {new Date(post.createdAt).toLocaleDateString("zh-CN")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/posts/${post.id}/edit`}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        编辑
                      </Link>
                      <span className="text-zinc-300">|</span>
                      <DeletePostButton postId={post.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
