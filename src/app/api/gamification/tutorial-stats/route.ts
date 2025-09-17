import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { tutorialService } from '@/services/tutorial.service'
import { prisma, isPrismaInitialized } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // 检查 Prisma 是否已初始化
    if (!isPrismaInitialized()) {
      console.error('Prisma 客户端未初始化')
      return NextResponse.json(
        { error: '数据库连接未初始化' },
        { status: 500 }
      )
    }

    // 获取用户会话
    const session = await getServerSession(authOptions)
    
    // 获取用户 ID
    const userId = session?.user?.id
    
    console.log('调试 - Session 信息:', JSON.stringify(session, null, 2))
    console.log('调试 - 用户 ID:', userId)

    // 获取教程统计
    const stats = await tutorialService.getTutorialStats(userId)
    
    return NextResponse.json(stats)
  } catch (error) {
    console.error('获取教程统计失败:', error)
    return NextResponse.json(
      { error: '获取教程统计失败' },
      { status: 500 }
    )
  }
}