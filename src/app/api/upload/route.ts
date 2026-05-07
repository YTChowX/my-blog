import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { put } from "@vercel/blob"

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

    // 验证文件类型
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "只支持图片文件" }, { status: 400 })
    }

    // 验证文件大小 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "文件大小不能超过 10MB" }, { status: 400 })
    }

    // 生成文件名
    const ext = file.name.split(".").pop()
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`

    // 上传到 Vercel Blob
    const blob = await put(filename, file, {
      access: "public",
    })

    return NextResponse.json({
      url: blob.url,
      success: true,
    })
  } catch (error: any) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "上传失败: " + error.message }, { status: 500 })
  }
}
