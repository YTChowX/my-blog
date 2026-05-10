import Link from "next/link"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

const sidebarLinks = [
  { href: "/admin", label: "仪表�?, icon: "📊" },
  { href: "/admin/posts", label: "文章管理", icon: "📝" },
  { href: "/admin/snippets", label: "代码片段", icon: "💻" },
  { href: "/admin/albums", label: "相册管理", icon: "📷" },
  { href: "/admin/products", label: "商品管理", icon: "🛒" },
  { href: "/admin/settings", label: "系统设置", icon: "⚙️" },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") {
    redirect("/auth/signin")
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-60 flex-col border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
          <Link href="/" className="text-lg font-bold flex items-center gap-2">
            <span>📝</span>
            <span>管理后台</span>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {sidebarLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
            >
              <span>{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-zinc-200 dark:border-zinc-800">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          >
            <span>🏠</span>
            返回前台
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0">
        {/* Mobile header */}
        <div className="lg:hidden border-b border-zinc-200 dark:border-zinc-800 p-4">
          <div className="flex items-center justify-between">
            <Link href="/admin" className="font-bold flex items-center gap-2">
              <span>📝</span>
              <span>管理后台</span>
            </Link>
            <Link href="/" className="text-sm text-zinc-500">返回前台</Link>
          </div>
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
            {sidebarLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 whitespace-nowrap"
              >
                <span>{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
