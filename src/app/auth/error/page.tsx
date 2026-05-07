"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

function ErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  const errorMessages: Record<string, string> = {
    Configuration: "系统配置错误，请联系管理员",
    AccessDenied: "访问被拒绝",
    Verification: "验证链接已过期",
    Default: "登录出现问题，请重试",
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4">登录出错</h1>
        <p className="text-red-600 mb-6">
          {error ? (errorMessages[error] || error) : "未知错误"}
        </p>
        <Link
          href="/auth/signin"
          className="px-4 py-2 bg-zinc-900 text-white rounded-lg hover:bg-zinc-700 transition-colors"
        >
          重新登录
        </Link>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">加载中...</div>}>
      <ErrorContent />
    </Suspense>
  )
}
