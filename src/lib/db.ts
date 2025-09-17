import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// 从环境变量中获取数据库连接信息
const databaseUrl = process.env.DATABASE_URL
const pgPassword = process.env.PGPASSWORD

// 如果提供了PGPASSWORD但DATABASE_URL中没有密码，则构建新的DATABASE_URL
let finalDatabaseUrl = databaseUrl
if (pgPassword && databaseUrl && !databaseUrl.includes(':') && databaseUrl.includes('@')) {
  const urlParts = databaseUrl.split('@')
  const userPart = urlParts[0] // postgresql://postgres
  const hostPart = urlParts[1] // localhost:4090/memory_assistant
  
  if (userPart && !userPart.includes(':')) {
    // 如果用户部分没有密码，添加密码
    const userOnly = userPart.split('://')[1] // postgres
    finalDatabaseUrl = `postgresql://${userOnly}:${pgPassword}@${hostPart}`
    console.log('Database URL updated with PGPASSWORD environment variable')
  }
}

// 创建Prisma客户端并添加错误处理
const createPrismaClient = () => {
  if (!finalDatabaseUrl) {
    console.error('DATABASE_URL environment variable is not defined')
    console.error('Current environment variables:', {
      DATABASE_URL: process.env.DATABASE_URL,
      PGPASSWORD: process.env.PGPASSWORD ? '***' : undefined
    })
    throw new Error('DATABASE_URL environment variable is not defined')
  }
  
  console.log('Initializing Prisma client with database URL:', finalDatabaseUrl.replace(/:([^:@]+)@/, ':***@'))
  
  try {
    const client = new PrismaClient({
      datasources: {
        db: {
          url: finalDatabaseUrl
        }
      },
      log: ['query', 'info', 'warn', 'error'],
    })
    
    // 添加连接错误处理
    // 注意：Prisma 5.0.0+ 版本中，库引擎不再支持 "beforeExit" 钩子
    // 改为监听 Node.js 的 process 对象的 'beforeExit' 事件
    process.on('beforeExit', async () => {
      try {
        await client.$disconnect()
        console.log('Prisma client disconnected')
      } catch (disconnectError) {
        console.error('Error disconnecting Prisma client:', disconnectError)
      }
    })
    
    return client
  } catch (error) {
    console.error('Failed to initialize Prisma client:', error)
    console.error('Database connection details:', {
      host: new URL(finalDatabaseUrl).hostname,
      port: new URL(finalDatabaseUrl).port,
      database: new URL(finalDatabaseUrl).pathname.replace('/', ''),
      user: new URL(finalDatabaseUrl).username
    })
    throw new Error(`Failed to initialize Prisma client: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// 安全地导出 Prisma 客户端
let prismaInstance: PrismaClient

try {
  prismaInstance = globalForPrisma.prisma ?? createPrismaClient()
  
  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prismaInstance
    console.log('Prisma client initialized in development mode')
  } else {
    console.log('Prisma client initialized in production mode')
  }
} catch (error) {
  console.error('Failed to initialize Prisma client:', error)
  // 在开发环境中，我们希望立即看到错误
  if (process.env.NODE_ENV !== 'production') {
    throw error
  }
  // 在生产环境中，我们创建一个空对象以防止应用崩溃
  // 但会在实际使用时抛出错误
  prismaInstance = {} as PrismaClient
}

export const prisma = prismaInstance

// 添加一个辅助函数来检查 Prisma 客户端是否已正确初始化
export const isPrismaInitialized = (): boolean => {
  return prisma && typeof prisma.$connect === 'function'
}