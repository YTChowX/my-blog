# 我的生活笔记

> 一个个人综合博客网站，涵盖生活、编程、摄影、购物四大板块

## 项目简介

**我的生活笔记** 是一个基于 Next.js 16 构建的个人博客系统，支持文章发布、代码片段分享、摄影相册展示和购物推荐等功能。项目采用现代化的技术栈，具备完整的后台管理系统和 SEO 优化。

### 技术栈

| 类别 | 技术 | 版本 |
|------|------|------|
| 前端框架 | Next.js (App Router) | 16.2.5 |
| UI 库 | React | 19.2.4 |
| 样式方案 | Tailwind CSS | v4 |
| 数据库 | PostgreSQL (Neon/Supabase) | - |
| 认证 | NextAuth v5 | beta.25 |
| 文件存储 | Vercel Blob / Cloudflare R2 | - |
| 部署平台 | Vercel / Cloudflare Pages | - |

### 功能模块

| 模块 | 前台 | 后台 | 说明 |
|------|------|------|------|
| 生活博客 | ✅ | ✅ | 生活类文章发布和浏览 |
| 编程技术 | ✅ | ✅ | 技术文章 + 代码片段管理 |
| 摄影相册 | ✅ | ✅ | 相册管理、照片展示（含 EXIF 信息） |
| 购物推荐 | ✅ | ✅ | 商品推荐（含价格、库存、分类） |
| 全文搜索 | ✅ | - | 跨内容类型搜索 |
| 暗黑模式 | ✅ | ✅ | 亮色/暗色/跟随系统 |
| SEO 优化 | ✅ | - | sitemap、robots、OpenGraph |

## 快速开始

### 环境要求

- Node.js 18+
- PostgreSQL 数据库
- npm 或 pnpm

### 安装依赖

```bash
npm install
```

### 环境变量配置

创建 `.env.local` 文件：

```env
# 数据库连接
DATABASE_URL="postgresql://user:password@host:port/database"

# NextAuth 配置
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# 初始管理员账户
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="your-password"
```

### 初始化数据库

首次部署需要初始化数据库表结构：

```bash
# 访问以下接口初始化数据库
curl http://localhost:3000/api/setup
curl http://localhost:3000/api/init-db
curl http://localhost:3000/api/init-snippets
```

### 开发运行

```bash
npm run dev
```

访问 http://localhost:3000

### 构建部署

```bash
npm run build
npm start
```

## 项目结构

```
my-blog/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx            # 首页
│   │   ├── blog/               # 博客页面
│   │   ├── tech/               # 技术页面
│   │   ├── photography/        # 摄影页面
│   │   ├── shopping/           # 购物页面
│   │   ├── admin/              # 后台管理
│   │   ├── auth/               # 认证页面
│   │   └── api/                # API 路由
│   ├── components/             # 公共组件
│   └── lib/                    # 工具库
│       ├── db.ts               # 数据库连接
│       └── auth.ts             # 认证配置
├── public/                     # 静态资源
├── package.json
├── next.config.ts
└── tailwind.config.ts
```

## 部署方案

### 方案 A：零成本启动（推荐初期）

| 组件 | 服务商 | 费用 |
|------|--------|------|
| 前端 | Cloudflare Pages | 免费 |
| 后端 | Cloudflare Workers | 免费 |
| 数据库 | Supabase | 免费 (500MB) |
| 文件存储 | Cloudflare R2 | 免费 (10GB) |
| CDN | Cloudflare | 免费 |
| 域名 | ClouDNS 或自定义 | 免费/¥60年 |

### 方案 B：最优性价比（推荐长期）

| 组件 | 服务商 | 费用 |
|------|--------|------|
| 服务器 | 腾讯云/阿里云轻量 | ¥30-50/月 |
| 数据库 | 自建 PostgreSQL | 包含 |
| 文件存储 | 本地磁盘 | 包含 |
| CDN | Cloudflare | 免费 |
| 域名 | 自定义 | ¥60/年 |

## 变现计划

1. **内容建设**：发布 20-30 篇原创文章
2. **SEO 优化**：提交 Google Search Console
3. **广告接入**：申请 Google AdSense
4. **持续运营**：定期更新内容，优化广告位

## 相关文档

- [Memory.md](./Memory.md) - 设计决策和功能来源记录
- [Rules.md](./Rules.md) - 开发规范和规则

## 许可证

MIT License
