import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 确保不使用静态导出，支持 API Routes 和 SSR
  output: undefined,
  
  // 图片优化配置（Vercel 支持）
  images: {
    unoptimized: false,
  },
};

export default nextConfig;
