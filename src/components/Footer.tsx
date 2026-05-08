import Link from "next/link"

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 mt-auto">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">📝 我的生活笔记</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              记录生活、分享技术、留住美好瞬间
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">快速导航</h3>
            <ul className="space-y-1 text-sm text-zinc-500 dark:text-zinc-400">
              <li><Link href="/blog" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">博客文章</Link></li>
              <li><Link href="/tech" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">编程开发</Link></li>
              <li><Link href="/photography" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">摄影作品</Link></li>
              <li><Link href="/life" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">生活记录</Link></li>
              <li><Link href="/search" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">搜索</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">更多</h3>
            <ul className="space-y-1 text-sm text-zinc-500 dark:text-zinc-400">
              <li><Link href="/about" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">关于我</Link></li>
              <li><Link href="/sitemap.xml" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">网站地图</Link></li>
              <li>📧 hello@example.com</li>
              <li>🐙 github.com/yourname</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-4 border-t border-zinc-200 dark:border-zinc-800 text-center text-sm text-zinc-400">
          © {new Date().getFullYear()} 我的生活笔记. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
