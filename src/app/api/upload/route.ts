import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { put } from "@vercel/blob"
import { randomUUID } from "crypto"

// 允许的图片扩展名白名单（排除 SVG 防止 XSS）
const ALLOWED_EXTENSIONS = new Set(["jpg", "jpeg", "png", "gif", "webp", "avif", "bmp"])
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "未授权" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "没有文件" }, { status: 400 })
    }

    // 验证文件大小
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "文件大小不能超过 10MB" }, { status: 400 })
    }

    // 验证 MIME type（排除 SVG）
    if (!file.type.startsWith("image/") || file.type === "image/svg+xml") {
      return NextResponse.json({ error: "不支持的文件类型" }, { status: 400 })
    }

    // 验证文件扩展名白名单
    const ext = file.name.split(".").pop()?.toLowerCase()
    if (!ext || !ALLOWED_EXTENSIONS.has(ext)) {
      return NextResponse.json({ error: "不支持的文件格式" }, { status: 400 })
    }

    // 使用 UUID 生成安全的随机文件名
    const filename = `${randomUUID()}.${ext}`

    // 上传到 Vercel Blob
    const blob = await put(filename, file, {
      access: "public",
    })

    return NextResponse.json({
      url: blob.url,
      success: true,
    })
  } catch (error) {
    console.error("Upload error")
    return NextResponse.json({ error: "上传失败" }, { status: 500 })
  }
}
