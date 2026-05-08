import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Providers from "@/components/Providers";

const SITE_URL = process.env.NEXTAUTH_URL || "https://my-blog-one-snowy.vercel.app"

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "我的生活笔记 | 生活·技术·摄影",
    template: "%s | 我的生活笔记",
  },
  description: "记录日常生活、购物心得、编程开发、摄影照片，分享生活的方方面面。",
  keywords: ["博客", "生活", "编程", "摄影", "购物", "技术", "Next.js"],
  authors: [{ name: "博主" }],
  creator: "博主",
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: SITE_URL,
    siteName: "我的生活笔记",
    title: "我的生活笔记 | 生活·技术·摄影",
    description: "记录日常生活、购物心得、编程开发、摄影照片，分享生活的方方面面。",
  },
  twitter: {
    card: "summary_large_image",
    title: "我的生活笔记 | 生活·技术·摄影",
    description: "记录日常生活、购物心得、编程开发、摄影照片，分享生活的方方面面。",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
