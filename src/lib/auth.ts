import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import bcrypt from "bcryptjs"
import { prisma } from "./db"

// 添加日志以验证 NEXTAUTH_URL 环境变量
console.log("NextAuth 配置 - NEXTAUTH_URL:", process.env.NEXTAUTH_URL);

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        })

        if (!user || !user.isActive) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          username: user.username,
          avatar: user.avatar,
          isPremium: user.isPremium,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const typedUser = user as {
          id: string;
          email: string;
          name?: string;
          username: string;
          isPremium: boolean;
        };
        
        return {
          ...token,
          username: typedUser.username,
          isPremium: typedUser.isPremium,
        }
      }
      return token
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.sub,
          username: token.username,
          isPremium: token.isPremium,
        },
      }
    },
  },
}

// 注册新用户
export async function registerUser(email: string, username: string, password: string, name?: string) {
  try {
    // 检查邮箱是否已存在
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email }
    })
    
    if (existingUserByEmail) {
      throw new Error('该邮箱已被注册')
    }
    
    // 检查用户名是否已存在
    const existingUserByUsername = await prisma.user.findUnique({
      where: { username }
    })
    
    if (existingUserByUsername) {
      throw new Error('该用户名已被使用')
    }
    
    // 哈希密码
    const hashedPassword = await bcrypt.hash(password, 12)
    
    // 创建用户
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        name: name || username
      }
    })
    
    // 创建游戏化资料
    await prisma.gamificationProfile.create({
      data: {
        userId: user.id
      }
    })
    
    // 返回不包含密码的用户信息
    const { password: _, ...userWithoutPassword } = user
    return userWithoutPassword
  } catch (error) {
    console.error('注册用户失败:', error)
    throw error
  }
}