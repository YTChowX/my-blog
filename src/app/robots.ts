import { MetadataRoute } from "next"

const BASE_URL = process.env.NEXTAUTH_URL || "https://my-blog-one-snowy.vercel.app"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/auth/"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
