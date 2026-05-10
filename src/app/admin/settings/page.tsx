"use client"

import { useState, useEffect } from "react"

const defaultSettings: Record<string, string> = {
  site_name: "æˆ‘çš„ç”Ÿæ´»ç¬”è®°",
  site_description: "è®°å½•ç”Ÿæ´»ã€åˆ†äº«æŠ€æœ¯ã€ç•™ä½ç¾Žå¥½çž¬é—?,
  site_keywords: "åšå®¢, ç”Ÿæ´», ç¼–ç¨‹, æ‘„å½±, è´­ç‰©",
  author_name: "åšä¸»",
  author_bio: "ä¸€ä¸ªçƒ­çˆ±ç”Ÿæ´»å’ŒæŠ€æœ¯çš„æ™®é€šäºº",
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
        setError(err.error || "åŠ è½½è®¾ç½®å¤±è´¥")
      }
    } catch (e: any) {
      setError("åŠ è½½è®¾ç½®å¤±è´¥: " + e.message)
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
        setMessage("âœ?è®¾ç½®å·²ä¿å­?)
        setTimeout(() => setMessage(""), 3000)
      } else {
        const err = await res.json()
        setError(err.error || "ä¿å­˜å¤±è´¥")
      }
    } catch (e: any) {
      setError("ä¿å­˜å¤±è´¥: " + e.message)
    }
    setSaving(false)
  }

  const updateSetting = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  if (loading) {
    return <div className="text-center py-12">åŠ è½½ä¸?..</div>
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">âš™ï¸ ç³»ç»Ÿè®¾ç½®</h1>

      {message && (
        <div className="p-3 rounded-lg bg-green-50 text-green-700 text-sm mb-6">{message}</div>
      )}
      
      {error && (
        <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm mb-6">
          {error}
          <button onClick={fetchSettings} className="ml-2 underline">é‡è¯•</button>
        </div>
      )}

      <div className="space-y-8">
        {/* ç«™ç‚¹ä¿¡æ¯ */}
        <section className="border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">ç«™ç‚¹ä¿¡æ¯</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">ç«™ç‚¹åç§°</label>
              <input
                type="text"
                value={settings.site_name}
                onChange={(e) => updateSetting("site_name", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">ç«™ç‚¹æè¿°</label>
              <textarea
                value={settings.site_description}
                onChange={(e) => updateSetting("site_description", e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">ç«™ç‚¹å…³é”®è¯ï¼ˆé€—å·åˆ†éš”ï¼?/label>
              <input
                type="text"
                value={settings.site_keywords}
                onChange={(e) => updateSetting("site_keywords", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700"
              />
            </div>
          </div>
        </section>

        {/* ä½œè€…ä¿¡æ?*/}
        <section className="border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">ä½œè€…ä¿¡æ?/h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">ä½œè€…åç§?/label>
              <input
                type="text"
                value={settings.author_name}
                onChange={(e) => updateSetting("author_name", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">ä½œè€…ç®€ä»?/label>
              <textarea
                value={settings.author_bio}
                onChange={(e) => updateSetting("author_bio", e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">è”ç³»é‚®ç®±</label>
              <input
                type="email"
                value={settings.author_email}
                onChange={(e) => updateSetting("author_email", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700"
              />
            </div>
          </div>
        </section>

        {/* ç¤¾äº¤é“¾æŽ¥ */}
        <section className="border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">ç¤¾äº¤é“¾æŽ¥</h2>
          <div className="space-y-4">
            {[
              { key: "github_url", label: "GitHub", placeholder: "https://github.com/yourname" },
              { key: "twitter_url", label: "Twitter / X", placeholder: "https://twitter.com/yourname" },
              { key: "weibo_url", label: "å¾®åš", placeholder: "https://weibo.com/yourname" },
              { key: "bilibili_url", label: "Bç«?, placeholder: "https://space.bilibili.com/yourid" },
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

        {/* è¿ç»´è®¾ç½® */}
        <section className="border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">è¿ç»´è®¾ç½®</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">ICP å¤‡æ¡ˆå·ï¼ˆé€‰å¡«ï¼?/label>
              <input
                type="text"
                value={settings.icp_number}
                onChange={(e) => updateSetting("icp_number", e.target.value)}
                placeholder="äº¬ICPå¤‡XXXXXXXXå?
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Google Analytics IDï¼ˆé€‰å¡«ï¼?/label>
              <input
                type="text"
                value={settings.google_analytics}
                onChange={(e) => updateSetting("google_analytics", e.target.value)}
                placeholder="G-XXXXXXXXXX"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">ç™¾åº¦ç»Ÿè®¡ IDï¼ˆé€‰å¡«ï¼?/label>
              <input
                type="text"
                value={settings.baidu_analytics}
                onChange={(e) => updateSetting("baidu_analytics", e.target.value)}
                placeholder="ç™¾åº¦ç»Ÿè®¡ä»£ç "
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700"
              />
            </div>
          </div>
        </section>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {saving ? "ä¿å­˜ä¸?.." : "ä¿å­˜æ‰€æœ‰è®¾ç½?}
        </button>
      </div>
    </div>
  )
}
