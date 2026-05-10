import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { pgPool } from "@/lib/db"
import Link from "next/link"
import { DeletePostButton } from "../DeletePostButton"

export default async function AdminPostsPage() {
  const session = await auth()

  if (!session || session.user.role !== "ADMIN") {
    redirect("/auth/signin?callbackUrl=/admin/posts")
  }

  let posts: any[] = []
  try {
    const result = await pgPool.query(`
      SELECT p.*, u."name" as "authorName"
      FROM "posts" p
      LEFT JOIN "users" u ON p."authorId" = u."id"
      ORDER BY p."createdAt" DESC
    `)
    posts = result.rows
  } catch (e) {
    console.error(e)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">📝 文章管理</h1>
          <p className="text-zinc-500">发布和管理博客文�?/p>
        </div>
        <Link
          href="/admin/posts/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + 新建文章
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-xl">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-medium mb-2">还没有文�?/h3>
          <p className="text-zinc-500 mb-4">创建你的第一篇博客文�?/p>
          <Link
            href="/admin/posts/new"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            创建文章
          </Link>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-zinc-50 dark:bg-zinc-800">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">标题</th>
                <th className="px-4 py-3 text-left text-sm font-medium">分类</th>
                <th className="px-4 py-3 text-left text-sm font-medium">状�?/th>
                <th className="px-4 py-3 text-left text-sm font-medium">日期</th>
                <th className="px-4 py-3 text-left text-sm font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {posts.map((post: any) => (
                <tr key={post.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800">
                  <td className="px-4 py-3">
                    <div className="font-medium">{post.title}</div>
                    <div className="text-sm text-zinc-500">{post.slug}</div>
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
                      {post.published ? "已发�? : "草稿"}
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
        </div>
      )}
    </div>
  )
}
