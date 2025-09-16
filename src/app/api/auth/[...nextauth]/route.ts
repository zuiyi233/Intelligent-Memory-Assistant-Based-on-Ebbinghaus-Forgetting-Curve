import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }