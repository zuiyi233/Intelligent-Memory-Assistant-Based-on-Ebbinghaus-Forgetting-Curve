import { NextRequest, NextResponse } from "next/server"
import { registerUser } from "@/lib/auth"
import { z } from "zod"

// 注册表单验证模式
const registerSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
  username: z.string().min(3, "用户名至少需要3个字符"),
  password: z.string().min(6, "密码至少需要6个字符"),
  name: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 验证请求数据
    const validatedFields = registerSchema.safeParse(body)
    
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
    
    const { email, username, password, name } = validatedFields.data
    
    // 注册用户
    const user = await registerUser(email, username, password, name)
    
    return NextResponse.json(
      { 
        success: true, 
        message: "注册成功",
        data: {
          id: user.id,
          email: user.email,
          username: user.username,
          name: user.name,
        }
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("注册错误:", error)
    
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || "注册失败，请稍后重试" 
      },
      { status: 500 }
    )
  }
}