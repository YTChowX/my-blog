import Link from "next/link";
import { getPostsByCategory } from "@/lib/posts";

export const metadata = {
  title: "购物 | 我的生活笔记",
  description: "好物推荐、购物心得、数码产品评测",
};

export default function ShoppingPage() {
  const posts = getPostsByCategory("购物");

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">🛒 购物</h1>
        <p className="text-zinc-500 dark:text-zinc-400">分享购物心得和好物推荐，帮你做出更好的消费选择。</p>
      </div>

      {posts.length === 0 ? (
        <p className="text-zinc-500 dark:text-zinc-400">暂无购物类文章。</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group block p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-orange-400 dark:hover:border-orange-600 hover:shadow-lg transition-all"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs text-zinc-400">{post.date}</span>
              </div>
              <h2 className="text-xl font-semibold mb-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
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
