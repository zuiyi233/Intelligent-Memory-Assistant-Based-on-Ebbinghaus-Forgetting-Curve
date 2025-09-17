import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { LearningStyleService } from '@/services/learningStyle.service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json(
        { error: '缺少用户ID' },
        { status: 400 }
      )
    }

    const learningStyleService = new LearningStyleService()
    const config = await learningStyleService.getPersonalizedGamificationConfig(userId)
    
    return NextResponse.json(config)
  } catch (error) {
    console.error('获取个性化游戏化配置失败:', error)
    return NextResponse.json(
      { error: '获取个性化游戏化配置失败' },
      { status: 500 }
    )
  }
}