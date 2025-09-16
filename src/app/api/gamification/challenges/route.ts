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

    const challenges = await gamificationService.getDailyChallenges()
    return NextResponse.json(challenges)
  } catch (error) {
    console.error('获取每日挑战失败:', error)
    return NextResponse.json(
      { error: '获取每日挑战失败' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, challengeId, progress } = await request.json()
    
    if (!userId || !challengeId) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      )
    }

    const userChallenge = await gamificationService.updateChallengeProgress(userId, challengeId, progress || 0)
    return NextResponse.json(userChallenge)
  } catch (error) {
    console.error('更新挑战进度失败:', error)
    return NextResponse.json(
      { error: '更新挑战进度失败' },
      { status: 500 }
    )
  }
}