import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { pgPool } from "@/lib/db"

// 启动时校验 NEXTAUTH_SECRET
if (!process.env.NEXTAUTH_SECRET) {
  console.error("[SECURITY] NEXTAUTH_SECRET 环境变量未设置，JWT 签名将不安全")
}

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "请输入密码"),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  // 生产环境需要 trustHost，开发环境不需要
  trustHost: process.env.NODE_ENV === "production",
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 天过期
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "邮箱", type: "email" },
        password: { label: "密码", type: "password" },
      },
      async authorize(credentials) {
        try {
          const { email, password } = credentialsSchema.parse(credentials)

          const result = await pgPool.query(
            `SELECT * FROM "users" WHERE "email" = $1 LIMIT 1`,
            [email]
          )

          const user = result.rows[0]

          if (!user || !user.password) {
            return null
          }

          const isValid = await bcrypt.compare(password, user.password)

          if (!isValid) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
          }
        } catch (err) {
          console.error("[Authorize] Error occurred:", {
            errorMessage: err instanceof Error ? err.message : "Unknown error",
            errorStack: err instanceof Error ? err.stack : undefined,
          })
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role as "USER" | "ADMIN"
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.role = token.role as "USER" | "ADMIN"
        session.user.id = token.id as string
      }
      return session
    },
  },
  debug: process.env.NODE_ENV !== "production",
})

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: "USER" | "ADMIN"
      email?: string | null
      name?: string | null
      image?: string | null
    }
  }

  interface User {
    role: "USER" | "ADMIN"
  }

  interface JWT {
    role: "USER" | "ADMIN"
    id: string
  }
}
