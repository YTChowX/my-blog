"use client"

import { useState, useEffect } from "react"

const defaultSettings: Record<string, string> = {
  site_name: "我的生活笔记",
  site_description: "记录生活、分享技术、留住美好瞬间",
  site_keywords: "博客, 生活, 编程, 摄影, 购物",
  author_name: "博主",
  author_bio: "一个热爱生活和技术的普通人",
  author_email: "hello@example.com",
  github_url: "",
  twitter_url: "",
  weibo_url: "",
  bilibili_url: "",
  icp_number: "",
  google_analytics: "",
  baidu_analytics: "",
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/settings")
      if (res.ok) {
        const data = await res.json()
        setSettings({ ...defaultSettings, ...data })
      } else {
        const err = await res.json()
        setError(err.error || "加载设置失败")
      }
    } catch (e: any) {
      setError("加载设置失败: " + e.message)
    }
    setLoading(false)
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage("")
    setError("")
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })
      if (res.ok) {
        setMessage("✅ 设置已保存")
        setTimeout(() => setMessage(""), 3000)
      } else {
        const err = await res.json()
        setError(err.error || "保存失败")
      }
    } catch (e: any) {
      setError("保存失败: " + e.message)
    }
    setSaving(false)
  }

  const updateSetting = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  if (loading) {
    return <div className="text-center py-12">加载中...</div>
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">⚙️ 系统设置</h1>

      {message && (
        <div className="p-3 rounded-lg bg-green-50 text-green-700 text-sm mb-6">{message}</div>
      )}
      
      {error && (
        <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm mb-6">
          {error}
          <button onClick={fetchSettings} className="ml-2 underline">重试</button>
        </div>
      )}

      <div className="space-y-8">
        {/* 站点信息 */}
        <section className="border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">站点信息</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">站点名称</label>
              <input
                type="text"
                value={settings.site_name}
                onChange={(e) => updateSetting("site_name", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">站点描述</label>
              <textarea
                value={settings.site_description}
                onChange={(e) => updateSetting("site_description", e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">站点关键词（逗号分隔）</label>
              <input
                type="text"
                value={settings.site_keywords}
                onChange={(e) => updateSetting("site_keywords", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700"
              />
            </div>
          </div>
        </section>

        {/* 作者信息 */}
        <section className="border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">作者信息</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">作者名称</label>
              <input
                type="text"
                value={settings.author_name}
                onChange={(e) => updateSetting("author_name", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">作者简介</label>
              <textarea
                value={settings.author_bio}
                onChange={(e) => updateSetting("author_bio", e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">联系邮箱</label>
              <input
                type="email"
                value={settings.author_email}
                onChange={(e) => updateSetting("author_email", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700"
              />
            </div>
          </div>
        </section>

        {/* 社交链接 */}
        <section className="border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">社交链接</h2>
          <div className="space-y-4">
            {[
              { key: "github_url", label: "GitHub", placeholder: "https://github.com/yourname" },
              { key: "twitter_url", label: "Twitter / X", placeholder: "https://twitter.com/yourname" },
              { key: "weibo_url", label: "微博", placeholder: "https://weibo.com/yourname" },
              { key: "bilibili_url", label: "B站", placeholder: "https://space.bilibili.com/yourid" },
            ].map((item) => (
              <div key={item.key}>
                <label className="block text-sm font-medium mb-1">{item.label}</label>
                <input
                  type="url"
                  value={settings[item.key]}
                  onChange={(e) => updateSetting(item.key, e.target.value)}
                  placeholder={item.placeholder}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700"
                />
              </div>
            ))}
          </div>
        </section>

        {/* 运维设置 */}
        <section className="border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">运维设置</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">ICP 备案号（选填）</label>
              <input
                type="text"
                value={settings.icp_number}
                onChange={(e) => updateSetting("icp_number", e.target.value)}
                placeholder="京ICP备XXXXXXXX号"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Google Analytics ID（选填）</label>
              <input
                type="text"
                value={settings.google_analytics}
                onChange={(e) => updateSetting("google_analytics", e.target.value)}
                placeholder="G-XXXXXXXXXX"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">百度统计 ID（选填）</label>
              <input
                type="text"
                value={settings.baidu_analytics}
                onChange={(e) => updateSetting("baidu_analytics", e.target.value)}
                placeholder="百度统计代码"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700"
              />
            </div>
          </div>
        </section>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3 bg-zinc-900 text-white rounded-lg font-medium hover:bg-zinc-700 disabled:opacity-50 transition-colors"
        >
          {saving ? "保存中..." : "保存所有设置"}
        </button>
      </div>
    </div>
  )
}
