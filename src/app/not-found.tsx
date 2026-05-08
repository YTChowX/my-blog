import Link from "next/link"

export default function NotFound() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-24 text-center">
      <div className="text-8xl mb-6">🔍</div>
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-xl text-zinc-500 dark:text-zinc-400 mb-8">
        抱歉，你访问的页面不存在
      </p>
      <div className="flex justify-center gap-4">
        <Link
          href="/"
          className="px-6 py-3 bg-zinc-900 text-white rounded-lg font-medium hover:bg-zinc-700 transition-colors"
        >
          返回首页
        </Link>
        <Link
          href="/search"
          className="px-6 py-3 border rounded-lg font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          搜索内容
        </Link>
      </div>
    </div>
  )
}
