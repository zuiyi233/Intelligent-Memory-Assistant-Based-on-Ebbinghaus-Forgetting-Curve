import { NextRequest, NextResponse } from 'next/server'
import { gamificationService } from '@/services/gamification.service'

export async function POST(request: NextRequest) {
  try {
    const { userId, challengeId } = await request.json()
    
    if (!userId || !challengeId) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      )
    }

    const userChallenge = await gamificationService.claimChallengeReward(userId, challengeId)
    return NextResponse.json(userChallenge)
  } catch (error) {
    console.error('领取挑战奖励失败:', error)
    return NextResponse.json(
      { error: '领取挑战奖励失败' },
      { status: 500 }
    )
  }
}