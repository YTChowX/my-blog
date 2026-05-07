export const metadata = {
  title: "关于 | 我的生活笔记",
  description: "关于我和这个博客",
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">关于我</h1>

      <div className="space-y-6 text-zinc-600 dark:text-zinc-400 leading-relaxed">
        <p>
          你好！欢迎来到我的个人博客 👋
        </p>
        <p>
          我是一个热爱生活的人，喜欢用文字和镜头记录生活中的点滴。这个博客是我的数字花园，在这里我分享：
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-8">
          <div className="p-4 rounded-xl bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
            <h3 className="font-semibold text-green-700 dark:text-green-400 mb-1">🌿 日常生活</h3>
            <p className="text-sm">咖啡探店、极简生活、旅行见闻</p>
          </div>
          <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800">
            <h3 className="font-semibold text-orange-700 dark:text-orange-400 mb-1">🛒 购物心得</h3>
            <p className="text-sm">数码产品评测、好物推荐、消费观</p>
          </div>
          <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
            <h3 className="font-semibold text-blue-700 dark:text-blue-400 mb-1">💻 编程开发</h3>
            <p className="text-sm">前端技术、教程分享、开发笔记</p>
          </div>
          <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800">
            <h3 className="font-semibold text-purple-700 dark:text-purple-400 mb-1">📷 摄影记录</h3>
            <p className="text-sm">拍摄技巧、后期修图、作品展示</p>
          </div>
        </div>

        <p>
          建站技术：这个博客使用 <strong>Next.js</strong> 构建，部署在 <strong>Vercel</strong> 上，样式使用 <strong>Tailwind CSS</strong>。文章以 Markdown 格式编写，简洁高效。
        </p>

        <p>
          如果你有任何问题或想和我交流，欢迎通过邮件或 GitHub 联系我！
        </p>
      </div>
    </div>
  );
}
