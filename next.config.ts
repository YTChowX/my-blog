import type { NextConfig } from "next";

const securityHeaders = [
  // 防止点击劫持
  { key: "X-Frame-Options", value: "DENY" },
  // 防止 MIME 类型嗅探
  { key: "X-Content-Type-Options", value: "nosniff" },
  // 控制 Referrer 信息泄露
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // 限制浏览器功能
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  // XSS 保护
  { key: "X-XSS-Protection", value: "1; mode=block" },
];

const nextConfig: NextConfig = {
  output: undefined,

  // 禁用 X-Powered-By 头，避免泄露框架信息
  poweredByHeader: false,

  // 图片优化配置
  images: {
    unoptimized: false,
  },

  // 添加安全响应头
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
