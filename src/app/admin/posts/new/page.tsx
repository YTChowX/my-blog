"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import dynamic from "next/dynamic"

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false })

const categories = ["生活", "购物", "编程", "摄影", "未分�?]

const moods = [
  { value: "happy", label: "😊 开�? },
  { value: "sad", label: "😔 难过" },
  { value: "excited", label: "🎉 兴奋" },
  { value: "calm", label: "😌 平静" },
  { value: "tired", label: "😴 疲惫" },
  { value: "loved", label: "❤️ 幸福" },
  { value: "thinking", label: "🤔 思�? },
  { value: "coffee", label: "�?咖啡" },
]

const weathers = ["☀�?晴天", "🌧�?雨天", "☁️ 阴天", "❄️ 雪天", "🌤�?多云"]

export default function NewPostPage() {
  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [content, setContent] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [category, setCategory] = useState("未分�?)
  const [tags, setTags] = useState("")
  const [published, setPublished] = useState(false)
  const [location, setLocation] = useState("")
  const [mood, setMood] = useState("")
  const [weather, setWeather] = useState("")
  const [coverImage, setCoverImage] = useState("")
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s\u4e00-\u9fa5-]/g, "")
      .replace(/\s+/g, "-")
      .substring(0, 50)
  }

  const handleTitleChange = (value: string) => {
    setTitle(value)
    if (!slug) {
      setSlug(generateSlug(value))
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (res.ok) {
        const data = await res.json()
        setCoverImage(data.url)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          content,
          excerpt,
          category,
          tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
          published,
          location,
          mood,
          weather,
          cover_image: coverImage,
        }),
      })

      if (res.ok) {
        router.push("/admin")
        router.refresh()
      } else {
        const data = await res.json()
        setError(data.error || "创建失败")
      }
    } catch {
      setError("创建失败，请重试")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">新建文章</h1>
        <Link href="/admin" className="text-zinc-500 hover:text-zinc-900">
          �?返回管理
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">标题 *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Slug (URL) *</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">分类</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              标签 (用逗号分隔)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="例如: 生活, 记录, 分享"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700"
            />
          </div>
        </div>

        {/* 生活板块专属字段 */}
        {category === "生活" && (
          <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg space-y-4">
            <h3 className="font-medium text-sm">生活记录专属</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm mb-1">📍 位置</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="例如: 北京·三里�?
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">心情</label>
                <select
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="">选择心情</option>
                  {moods.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">天气</label>
                <select
                  value={weather}
                  onChange={(e) => setWeather(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="">选择天气</option>
                  {weathers.map((w) => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* 封面�?*/}
        <div>
          <label className="block text-sm font-medium mb-2">封面�?/label>
          {coverImage ? (
            <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-zinc-100">
              <img src={coverImage} alt="封面" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setCoverImage("")}
                className="absolute top-2 right-2 px-2 py-1 bg-red-500 text-white text-sm rounded"
              >
                删除
              </button>
            </div>
          ) : (
            <label className="block w-full aspect-video border-2 border-dashed rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
              <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400">
                {uploading ? (
                  <span>上传�?..</span>
                ) : (
                  <>
                    <span className="text-3xl mb-2">📷</span>
                    <span className="text-sm">点击上传封面�?/span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </div>
            </label>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">摘要</label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700"
            placeholder="文章简短描述，会显示在列表�?
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">内容 *</label>
          <div data-color-mode="light">
            <MDEditor
              value={content}
              onChange={(value) => setContent(value || "")}
              height={400}
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="w-4 h-4"
            />
            <span>立即发布</span>
          </label>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "保存�?.." : "保存文章"}
          </button>
          <Link
            href="/admin"
            className="px-6 py-2 border rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            取消
          </Link>
        </div>
      </form>
    </div>
  )
}
