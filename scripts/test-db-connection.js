const { PrismaClient } = require('@prisma/client')

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

async function testDatabaseConnection() {
  console.log('Testing database connection...')
  console.log('Database URL:', finalDatabaseUrl?.replace(/:([^:@]+)@/, ':***@'))
  
  if (!finalDatabaseUrl) {
    console.error('ERROR: DATABASE_URL environment variable is not defined')
    console.log('Please ensure your .env file contains the DATABASE_URL variable')
    return false
  }
  
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: finalDatabaseUrl
      }
    },
    log: ['query', 'info', 'warn', 'error'],
  })
  
  try {
    // 尝试连接数据库
    await prisma.$connect()
    console.log('✅ Database connection successful!')
    
    // 尝试执行一个简单查询
    const result = await prisma.$queryRaw`SELECT NOW() as current_time`
    console.log('✅ Query execution successful!')
    console.log('Current database time:', result)
    
    return true
  } catch (error) {
    console.error('❌ Database connection failed:')
    console.error(error)
    
    // 提供一些常见问题的解决方案建议
    console.log('\nTroubleshooting suggestions:')
    console.log('1. Ensure PostgreSQL server is running on localhost:4090')
    console.log('2. Check if the database "memory_assistant" exists')
    console.log('3. Verify your username and password are correct')
    console.log('4. In PowerShell, run: $env:PGPASSWORD = "123456"')
    console.log('5. Check your .env file contains: DATABASE_URL="postgresql://postgres:123456@localhost:4090/memory_assistant"')
    
    return false
  } finally {
    await prisma.$disconnect()
    console.log('Database connection closed')
  }
}

// 运行测试
testDatabaseConnection()
  .then(success => {
    if (success) {
      console.log('\n🎉 All database tests passed!')
      process.exit(0)
    } else {
      console.log('\n💥 Database tests failed!')
      process.exit(1)
    }
  })
  .catch(error => {
    console.error('Unexpected error during database test:', error)
    process.exit(1)
  })