# Rules - 开发规范与规则

> 本文档定义项目开发过程中必须遵循的规范和规则，确保代码质量和项目可维护性。

---

## 一、代码规范

### 1.1 文件命名

| 类型 | 规范 | 示例 |
|------|------|------|
| 组件文件 | PascalCase | `Navbar.tsx`, `ThemeToggle.tsx` |
| 页面文件 | 小写 | `page.tsx`, `layout.tsx` |
| API 路由 | 小写 | `route.ts` |
| 工具函数 | camelCase | `db.ts`, `auth.ts` |
| 样式文件 | 小写 | `globals.css` |

### 1.2 组件结构

```tsx
// 1. 导入语句（按类型分组）
import { useState, useEffect } from "react"
import Link from "next/link"
import { pgPool } from "@/lib/db"

// 2. 类型定义
interface Props {
  title: string
  content?: string
}

// 3. 组件定义
export default function Component({ title, content }: Props) {
  // 3.1 状态声明
  const [loading, setLoading] = useState(false)
  
  // 3.2 副作用
  useEffect(() => {
    // ...
  }, [])
  
  // 3.3 事件处理
  const handleClick = () => {
    // ...
  }
  
  // 3.4 渲染
  return (
    <div>
      {/* ... */}
    </div>
  )
}
```

### 1.3 TypeScript 规范

| 规则 | 说明 |
|------|------|
| 显式类型 | 函数参数和返回值必须有类型 |
| 避免 any | 使用 unknown 或具体类型 |
| 接口优先 | 优先使用 interface 而非 type |
| 枚举使用 | 使用 const enum 或字符串字面量联合 |

```tsx
// ✅ 正确
interface User {
  id: string
  name: string
  role: "USER" | "ADMIN"
}

function getUser(id: string): Promise<User | null> {
  // ...
}

// ❌ 错误
function getUser(id: any) {
  // ...
}
```

### 1.4 CSS 规范

| 规则 | 说明 |
|------|------|
| Tailwind 优先 | 优先使用 Tailwind 类名 |
| 语义化命名 | 自定义类名使用语义化命名 |
| 暗黑模式 | 使用 `dark:` 前缀 |

```tsx
// ✅ 正确
<div className="p-4 bg-white dark:bg-zinc-900 rounded-lg">

// ❌ 错误
<div className="p-4 bg-white rounded-lg" style={{ backgroundColor: isDark ? '#000' : '#fff' }}>
```

---

## 二、API 规范

### 2.1 路由结构

```
/api
├── /posts          # 文章 CRUD
│   ├── route.ts    # GET(列表), POST(创建)
│   └── [id]/route.ts  # GET(详情), PUT(更新), DELETE(删除)
├── /auth/[...nextauth]/route.ts  # 认证
└── /upload/route.ts  # 文件上传
```

### 2.2 响应格式

**成功响应：**
```json
{
  "success": true,
  "data": { ... }
}
```

**错误响应：**
```json
{
  "error": "错误信息描述"
}
```

### 2.3 错误处理

```tsx
// ✅ 正确：详细错误日志 + 用户友好提示
export async function PUT(req: NextRequest) {
  try {
    // 业务逻辑
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[API] PUT 错误:", error)
    return NextResponse.json({ error: "操作失败: " + (error.message || "未知错误") }, { status: 500 })
  }
}

// ❌ 错误：静默捕获
export async function PUT(req: NextRequest) {
  try {
    // ...
  } catch (e) {
    return NextResponse.json({ error: "失败" }, { status: 500 })
  }
}
```

### 2.4 权限校验

```tsx
// 所有管理 API 必须校验权限
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "未授权" }, { status: 401 })
  }
  // 业务逻辑
}
```

---

## 三、数据库规范

### 3.1 表命名

| 规则 | 说明 |
|------|------|
| 小写 | 表名使用小写 |
| 下划线分隔 | 多词使用下划线 |
| 复数形式 | 表名使用复数 |

```
✅ users, posts, code_snippets
❌ Users, Post, CodeSnippets
```

### 3.2 字段命名

| 规则 | 说明 |
|------|------|
| 驼峰命名 | 字段名使用驼峰命名（createdAt, updatedAt） |
| 主键 | 使用 id (UUID) |
| 外键 | 使用 xxxId (authorId, albumId) |

### 3.3 索引设计

```sql
-- 唯一索引
CREATE UNIQUE INDEX posts_slug_key ON posts(slug);

-- 查询索引
CREATE INDEX posts_published_idx ON posts(published);
CREATE INDEX posts_category_idx ON posts(category);
```

### 3.4 连接池配置

```tsx
// db.ts
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,                    // 最大连接数
  idleTimeoutMillis: 30000,  // 空闲超时
  connectionTimeoutMillis: 10000, // 连接超时
})
```

---

## 四、Git 规范

### 4.1 提交信息

```
<type>(<scope>): <subject>

<body>
```

**Type 类型：**
| 类型 | 说明 |
|------|------|
| feat | 新功能 |
| fix | Bug 修复 |
| docs | 文档更新 |
| style | 代码格式（不影响功能） |
| refactor | 重构 |
| perf | 性能优化 |
| test | 测试相关 |
| chore | 构建/工具相关 |

**示例：**
```
feat(posts): 添加文章置顶功能

- 支持设置文章置顶
- 首页优先显示置顶文章
- 后台管理界面添加置顶开关
```

### 4.2 分支策略

| 分支 | 说明 |
|------|------|
| main | 生产分支，受保护 |
| develop | 开发分支 |
| feature/* | 功能分支 |
| fix/* | 修复分支 |

---

## 五、部署规范

### 5.1 构建验证

**强制规则：每次推送前必须确保构建通过**

```bash
# 推送前必须执行
npm run build

# 确认无错误后再推送
git push origin main
```

### 5.2 环境变量

| 变量 | 必需 | 说明 |
|------|------|------|
| DATABASE_URL | ✅ | 数据库连接字符串 |
| NEXTAUTH_SECRET | ✅ | JWT 签名密钥 |
| NEXTAUTH_URL | ✅ | 站点 URL |
| ADMIN_EMAIL | ✅ | 初始管理员邮箱 |
| ADMIN_PASSWORD | ✅ | 初始管理员密码 |

### 5.3 安全检查清单

- [ ] 所有管理 API 有权限校验
- [ ] 用户输入有 Zod 验证
- [ ] 文件上传有白名单限制
- [ ] 敏感信息不在日志中输出
- [ ] HTTPS 强制启用
- [ ] 安全响应头已配置

---

## 六、测试规范

### 6.1 手动测试清单

**每次发布前必须测试：**

| 功能 | 测试项 |
|------|--------|
| 登录/登出 | 正确账号密码登录、错误提示、登出 |
| 文章管理 | 创建、编辑、删除、发布状态切换 |
| 代码片段 | 创建、编辑、删除、语言切换 |
| 相册管理 | 创建、上传照片、删除 |
| 商品管理 | 创建、编辑、删除、状态切换 |
| 暗黑模式 | 切换、刷新保持 |
| 搜索 | 关键词搜索、无结果提示 |
| 响应式 | 手机、平板、桌面布局 |

---

## 七、文档规范

### 7.1 代码注释

```tsx
// ✅ 正确：解释为什么
// 使用 localStorage 存储主题，避免服务端渲染不一致
const theme = localStorage.getItem("theme")

// ❌ 错误：解释是什么
// 获取主题
const theme = localStorage.getItem("theme")
```

### 7.2 函数文档

```tsx
/**
 * 创建文章
 * @param data - 文章数据
 * @returns 创建的文章 ID
 * @throws {Error} 当 slug 已存在时抛出错误
 */
async function createPost(data: PostData): Promise<string> {
  // ...
}
```

---

## 八、禁止事项

### 8.1 代码禁止

| 禁止 | 原因 |
|------|------|
| 使用 `any` 类型 | 丢失类型安全 |
| 硬编码敏感信息 | 安全风险 |
| 未处理的 Promise | 可能导致静默失败 |
| 直接使用 `eval()` | 安全风险 |
| 未校验的用户输入 | SQL 注入/XSS 风险 |

### 8.2 Git 禁止

| 禁止 | 原因 |
|------|------|
| 直接推送到 main | 绕过代码审查 |
| 提交敏感信息 | 安全风险 |
| 提交 node_modules | 仓库膨胀 |
| 构建失败的代码 | 影响部署 |

### 8.3 部署禁止

| 禁止 | 原因 |
|------|------|
| 未测试直接发布 | 可能影响用户 |
| 跳过构建验证 | 可能部署失败 |
| 删除数据库备份 | 数据丢失风险 |

---

## 九、检查清单

### 9.1 提交前检查

- [ ] 代码无 TypeScript 错误
- [ ] 代码无 ESLint 警告
- [ ] `npm run build` 构建通过
- [ ] 手动测试核心功能
- [ ] 提交信息符合规范

### 9.2 发布前检查

- [ ] 环境变量已配置
- [ ] 数据库已备份
- [ ] 安全检查清单通过
- [ ] 手动测试清单通过
- [ ] 文档已更新

---

## 十、参考资源

- [Next.js 最佳实践](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [TypeScript 风格指南](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)
- [Tailwind CSS 最佳实践](https://tailwindcss.com/docs/reusing-styles)
- [PostgreSQL 性能优化](https://www.postgresql.org/docs/current/performance-tips.html)
