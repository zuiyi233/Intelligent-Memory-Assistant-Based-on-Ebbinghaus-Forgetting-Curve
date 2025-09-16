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
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        return { success: false, message: "登录失败，请检查邮箱和密码" }
      }

      return { success: true, message: "登录成功" }
    } catch (error) {
      console.error("登录错误:", error)
      return { success: false, message: "登录失败，请稍后重试" }
    }
  }

  const register = async (email: string, username: string, password: string, name?: string) => {
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, username, password, name }),
      })

      const data = await response.json()

      if (!data.success) {
        return { success: false, message: data.message || "注册失败" }
      }

      // 注册成功后自动登录
      await login(email, password)

      return { success: true, message: "注册成功" }
    } catch (error) {
      console.error("注册错误:", error)
      return { success: false, message: "注册失败，请稍后重试" }
    }
  }

  const logout = async () => {
    await signOut({ redirect: false })
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