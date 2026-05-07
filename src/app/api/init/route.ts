import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function GET() {
  try {
    // 检查是否已初始化
    const existingAdmin = await prisma.user.findFirst({
      where: { role: "ADMIN" },
    })

    if (existingAdmin) {
      return NextResponse.json({
        success: false,
        message: "已初始化，管理员账户已存在",
        admin: {
          email: existingAdmin.email,
          name: existingAdmin.name,
        },
      })
    }

    // 从环境变量获取管理员信息
    const adminEmail = process.env.ADMIN_EMAIL
    const adminPassword = process.env.ADMIN_PASSWORD

    if (!adminEmail || !adminPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "环境变量 ADMIN_EMAIL 或 ADMIN_PASSWORD 未设置",
        },
        { status: 500 }
      )
    }

    // 创建管理员账户
    const hashedPassword = await bcrypt.hash(adminPassword, 10)

    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        name: "管理员",
        password: hashedPassword,
        role: "ADMIN",
      },
    })

    return NextResponse.json({
      success: true,
      message: "初始化成功！管理员账户已创建",
      admin: {
        email: admin.email,
        name: admin.name,
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: "初始化失败",
        error: error.message,
      },
      { status: 500 }
    )
  }
}
