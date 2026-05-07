import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { DeletePostButton } from "./DeletePostButton"

export default async function AdminPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    redirect("/auth/signin?callbackUrl=/admin")
  }

  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      author: {
        select: { name: true, email: true },
      },
    },
  })

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">内容管理</h1>
          <p className="text-zinc-500">管理博客文章</p>
        </div>
        <Link
          href="/admin/posts/new"
          className="px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-700 transition-colors"
        >
          + 新建文章
        </Link>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-zinc-50 dark:bg-zinc-800">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium">标题</th>
              <th className="px-4 py-3 text-left text-sm font-medium">分类</th>
              <th className="px-4 py-3 text-left text-sm font-medium">状态</th>
              <th className="px-4 py-3 text-left text-sm font-medium">日期</th>
              <th className="px-4 py-3 text-left text-sm font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {posts.map((post) => (
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

        {posts.length === 0 && (
          <div className="p-8 text-center text-zinc-500">
            暂无文章，点击"新建文章"开始创作
          </div>
        )}
      </div>
    </div>
  )
}
