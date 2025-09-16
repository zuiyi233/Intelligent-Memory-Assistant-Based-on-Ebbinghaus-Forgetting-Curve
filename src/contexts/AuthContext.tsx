"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { useSession, signIn, signOut } from "next-auth/react"
import { Session } from "next-auth"

interface AuthContextType {
  user: Session["user"] | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>
  register: (email: string, username: string, password: string, name?: string) => Promise<{ success: boolean; message: string }>
  logout: () => Promise<void>
}

// 定义错误响应类型
interface ErrorResponse {
  success: boolean
  message?: string
  errors?: Array<{ message: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status !== "loading") {
      setLoading(false)
    }
  }, [status])

  const login = async (email: string, password: string) => {
    try {
      // 验证输入
      if (!email || !password) {
        return { success: false, message: "请输入邮箱和密码" }
      }

      if (!email.includes('@')) {
        return { success: false, message: "请输入有效的邮箱地址" }
      }

      if (password.length < 6) {
        return { success: false, message: "密码长度至少需要6个字符" }
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        // 根据错误类型返回更具体的错误信息
        if (result.error.includes("CredentialsSignin") || result.error.includes("Invalid credentials")) {
          return { success: false, message: "登录失败，请检查邮箱和密码" }
        }
        if (result.error.includes("User not found")) {
          return { success: false, message: "用户不存在，请先注册" }
        }
        if (result.error.includes("Incorrect password")) {
          return { success: false, message: "密码错误，请重试" }
        }
        if (result.error.includes("Too many requests")) {
          return { success: false, message: "请求过于频繁，请稍后重试" }
        }
        return { success: false, message: result.error || "登录失败，请稍后重试" }
      }

      if (!result?.ok) {
        return { success: false, message: "登录失败，服务器响应异常" }
      }

      return { success: true, message: "登录成功" }
    } catch (error) {
      console.error("登录错误:", error)
      if (error instanceof Error) {
        // 处理网络错误
        if (error.message.includes("NetworkError") || error.message.includes("fetch")) {
          return { success: false, message: "网络连接失败，请检查网络设置" }
        }
        return { success: false, message: `登录失败: ${error.message}` }
      }
      return { success: false, message: "登录失败，请稍后重试" }
    }
  }

  const register = async (email: string, username: string, password: string, name?: string) => {
    try {
      // 验证输入
      if (!email || !username || !password) {
        return { success: false, message: "请填写所有必填字段" }
      }

      if (!email.includes('@')) {
        return { success: false, message: "请输入有效的邮箱地址" }
      }

      if (username.length < 3) {
        return { success: false, message: "用户名长度至少需要3个字符" }
      }

      if (password.length < 6) {
        return { success: false, message: "密码长度至少需要6个字符" }
      }

      // 检查用户名是否包含特殊字符
      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        return { success: false, message: "用户名只能包含字母、数字和下划线" }
      }

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, username, password, name }),
      })

      if (!response.ok) {
        // 处理HTTP错误状态
        if (response.status === 409) {
          return { success: false, message: "邮箱或用户名已存在" }
        }
        if (response.status === 400) {
          return { success: false, message: "请求数据格式错误" }
        }
        if (response.status === 500) {
          return { success: false, message: "服务器内部错误，请稍后重试" }
        }
        return { success: false, message: "注册失败，服务器响应异常" }
      }

      const data = await response.json() as ErrorResponse

      if (!data.success) {
        // 如果有详细的错误信息，显示给用户
        if (data.errors && Array.isArray(data.errors)) {
          const errorMessages = data.errors.map(err => err.message).join(", ")
          return { success: false, message: errorMessages }
        }
        return { success: false, message: data.message || "注册失败" }
      }

      // 注册成功后自动登录
      const loginResult = await login(email, password)
      if (!loginResult.success) {
        return { success: true, message: "注册成功，但自动登录失败，请手动登录" }
      }

      return { success: true, message: "注册成功" }
    } catch (error) {
      console.error("注册错误:", error)
      if (error instanceof Error) {
        // 处理网络错误
        if (error.message.includes("NetworkError") || error.message.includes("fetch")) {
          return { success: false, message: "网络连接失败，请检查网络设置" }
        }
        return { success: false, message: `注册失败: ${error.message}` }
      }
      return { success: false, message: "注册失败，请稍后重试" }
    }
  }

  const logout = async () => {
    try {
      await signOut({ redirect: false })
    } catch (error) {
      console.error("登出错误:", error)
      // 即使登出失败，也尝试重定向到登录页
      window.location.href = "/auth/signin"
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user: session?.user || null,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}