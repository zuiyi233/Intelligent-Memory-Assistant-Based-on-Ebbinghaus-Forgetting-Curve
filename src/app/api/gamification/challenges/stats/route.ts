import { NextRequest, NextResponse } from 'next/server'
import { gamificationService } from '@/services/gamification.service'

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

    const stats = await gamificationService.getUserChallengeStats(userId)
    return NextResponse.json(stats)
  } catch (error) {
    console.error('获取用户挑战统计失败:', error)
    return NextResponse.json(
      { error: '获取用户挑战统计失败' },
      { status: 500 }
    )
  }
}