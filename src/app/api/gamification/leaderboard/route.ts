import { NextRequest, NextResponse } from 'next/server'
import { gamificationService } from '@/services/gamification.service'
import { LeaderboardType, LeaderboardPeriod } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'points'
    const period = searchParams.get('period') || 'weekly'
    const limit = parseInt(searchParams.get('limit') || '10')
    
    const leaderboard = await gamificationService.getLeaderboard(type as LeaderboardType, period as LeaderboardPeriod, limit)
    return NextResponse.json(leaderboard)
  } catch (error) {
    console.error('获取排行榜数据失败:', error)
    return NextResponse.json(
      { error: '获取排行榜数据失败' },
      { status: 500 }
    )
  }
}