import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// 需要管理员认证的路由
const ADMIN_ROUTES = ["/admin"]
// 需要管理员认证的 API 路由（写操作）
const PROTECTED_API_ROUTES = [
  "/api/posts",
  "/api/albums",
  "/api/photos",
  "/api/products",
  "/api/categories",
  "/api/snippets",
  "/api/upload",
  "/api/setup",
  "/api/init-db",
  "/api/init-snippets",
  "/api/extend-posts",
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 检查是否为 admin 页面路由
  const isAdminRoute = ADMIN_ROUTES.some((route) => pathname.startsWith(route))
  // 检查是否为受保护的 API 路由
  const isProtectedApi = PROTECTED_API_ROUTES.some((route) => pathname.startsWith(route))

  if (isAdminRoute || isProtectedApi) {
    // 对于 admin 页面，检查 session cookie 是否存在
    // 注意：这只是第一层防护，各路由仍需独立验证 session 和 role
    const sessionToken = request.cookies.get("authjs.session-token")?.value
      || request.cookies.get("__Secure-authjs.session-token")?.value

    if (!sessionToken) {
      // API 路由返回 401，页面路由重定向到登录
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "未授权" }, { status: 401 })
      }
      const loginUrl = new URL("/auth/signin", request.url)
      loginUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // 匹配所有 admin 路由
    "/admin/:path*",
    // 匹配受保护的 API 路由
    "/api/posts/:path*",
    "/api/albums/:path*",
    "/api/photos/:path*",
    "/api/products/:path*",
    "/api/categories/:path*",
    "/api/snippets/:path*",
    "/api/upload/:path*",
    "/api/setup/:path*",
    "/api/init-db/:path*",
    "/api/init-snippets/:path*",
    "/api/extend-posts/:path*",
  ],
}
