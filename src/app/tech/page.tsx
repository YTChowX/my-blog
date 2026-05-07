import Link from "next/link";
import { getPostsByCategory } from "@/lib/posts";

export const metadata = {
  title: "编程 | 我的生活笔记",
  description: "编程开发教程、技术分享、前端后端学习笔记",
};

export default function TechPage() {
  const posts = getPostsByCategory("编程");

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">💻 编程</h1>
        <p className="text-zinc-500 dark:text-zinc-400">编程开发学习笔记和技术分享，记录成长之路。</p>
      </div>

      {posts.length === 0 ? (
        <p className="text-zinc-500 dark:text-zinc-400">暂无编程类文章。</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group block p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-lg transition-all"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs text-zinc-400">{post.date}</span>
              </div>
              <h2 className="text-xl font-semibold mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {post.title}
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{post.excerpt}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
