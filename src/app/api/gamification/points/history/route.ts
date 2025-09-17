import { NextRequest, NextResponse } from 'next/server'
import { gamificationService } from '@/services/gamification.service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '20')
    
    if (!userId) {
      return NextResponse.json(
        { error: '缺少用户ID' },
        { status: 400 }
      )
    }

    const pointsHistory = await gamificationService.getPointsHistory(userId, limit)
    return NextResponse.json(pointsHistory)
  } catch (error) {
    console.error('获取用户积分历史失败:', error)
    return NextResponse.json(
      { error: '获取用户积分历史失败' },
      { status: 500 }
    )
  }
}