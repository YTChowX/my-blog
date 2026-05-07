import { prisma } from "../src/lib/prisma"
import bcrypt from "bcryptjs"

async function main() {
  // 创建管理员账号
  const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com"
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123456"

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  })

  if (existingAdmin) {
    console.log("管理员账号已存在")
    return
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 10)

  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      name: "管理员",
      password: hashedPassword,
      role: "ADMIN",
    },
  })

  console.log(`管理员账号创建成功: ${admin.email}`)
  console.log(`密码: ${adminPassword}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
