import Link from "next/link";
import { getAllPosts } from "@/lib/posts";

const categories = [
  { name: "生活", href: "/life", emoji: "🌿", color: "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800" },
  { name: "购物", href: "/shopping", emoji: "🛒", color: "bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800" },
  { name: "编程", href: "/tech", emoji: "💻", color: "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800" },
  { name: "摄影", href: "/photography", emoji: "📷", color: "bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800" },
];

export default function Home() {
  const posts = getAllPosts();
  const recentPosts = posts.slice(0, 6);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
        <div className="max-w-5xl mx-auto px-4 py-20 md:py-32 text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            记录生活
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              分享美好
            </span>
          </h1>
          <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto mb-10">
            这里是我的个人空间，记录日常生活的点滴、编程开发的心得、购物好物推荐，以及用镜头捕捉的美好瞬间。
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/blog"
              className="px-6 py-3 bg-zinc-900 text-white rounded-lg font-medium hover:bg-zinc-700 transition-colors"
            >
              浏览文章 →
            </Link>
            <Link
              href="/about"
              className="px-6 py-3 border border-zinc-300 dark:border-zinc-700 rounded-lg font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              了解更多
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold mb-8">内容板块</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              href={cat.href}
              className={`p-6 rounded-xl border ${cat.color} hover:scale-105 transition-transform text-center`}
            >
              <span className="text-3xl mb-3 block">{cat.emoji}</span>
              <span className="font-semibold">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Posts Section */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">最新文章</h2>
          <Link href="/blog" className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
            查看全部 →
          </Link>
        </div>
        {recentPosts.length === 0 ? (
          <p className="text-zinc-500 dark:text-zinc-400">暂无文章，快去添加第一篇吧！</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group block p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 hover:shadow-lg transition-all"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                    {post.category}
                  </span>
                  <span className="text-xs text-zinc-400">{post.date}</span>
                </div>
                <h3 className="font-semibold mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {post.title}
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2">
                  {post.excerpt}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
