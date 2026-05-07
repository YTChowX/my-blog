import Link from "next/link";
import { getAllPosts } from "@/lib/posts";

export const metadata = {
  title: "博客 | 我的生活笔记",
  description: "所有博客文章列表",
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">博客文章</h1>
      <p className="text-zinc-500 dark:text-zinc-400 mb-8">所有文章按时间倒序排列</p>

      {posts.length === 0 ? (
        <p className="text-zinc-500 dark:text-zinc-400">暂无文章。</p>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group block p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 hover:shadow-lg transition-all"
            >
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                  {post.category}
                </span>
                <span className="text-xs text-zinc-400">{post.date}</span>
                {post.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="text-xs text-zinc-400">#{tag}</span>
                ))}
              </div>
              <h2 className="text-xl font-semibold mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {post.title}
              </h2>
              <p className="text-zinc-500 dark:text-zinc-400">{post.excerpt}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
