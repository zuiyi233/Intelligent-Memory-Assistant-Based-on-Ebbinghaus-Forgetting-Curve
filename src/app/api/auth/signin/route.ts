import { NextRequest, NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import { getServerSession } from "next-auth"
import { z } from "zod"

// 登录表单验证模式
const loginSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
  password: z.string().min(1, "密码不能为空"),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 验证请求数据
    const validatedFields = loginSchema.safeParse(body)
    
    if (!validatedFields.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: "输入数据无效",
          errors: validatedFields.error.issues 
        },
        { status: 400 }
      )
    }
    
    // 这里实际上不需要处理登录逻辑，因为 NextAuth 会处理
    // 这个路由主要用于验证输入数据
    // 实际的登录由 NextAuth 的 [...nextauth] 路由处理
    
    return NextResponse.json(
      { 
        success: true, 
        message: "登录数据验证通过"
      },
      { status: 200 }
    )
  } catch (error: unknown) {
    console.error("登录错误:", error)
    
    return NextResponse.json(
      { 
        success: false, 
        message: "登录失败，请稍后重试" 
      },
      { status: 500 }
    )
  }
}

// 获取当前会话用户信息
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (session) {
      return NextResponse.json(
        {
          success: true,
          data: session.user
        },
        { status: 200 }
      )
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: "未登录" 
      },
      { status: 401 }
    )
  } catch (error: unknown) {
    console.error("获取用户会话错误:", error)
    
    return NextResponse.json(
      { 
        success: false, 
        message: "获取用户信息失败" 
      },
      { status: 500 }
    )
  }
}