import { NextRequest, NextResponse } from 'next/server'
import { gamificationService } from '@/services/gamification.service'
import { prisma } from '@/lib/db'
import { PointTransactionType } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const { userId, challengeId } = await request.json()
    
    if (!userId || !challengeId) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      )
    }

    // 获取用户挑战信息
    const userChallenge = await gamificationService.claimChallengeReward(userId, challengeId)
    
    // 获取挑战详情以添加奖励积分
    const challengeDetails = await prisma.dailyChallenge.findUnique({
      where: { id: challengeId }
    })
    
    // 如果挑战已完成且未领取，则添加奖励积分
    if (userChallenge.completed && !userChallenge.claimed && challengeDetails) {
      await gamificationService.addPoints(
        userId,
        challengeDetails.points,
        PointTransactionType.CHALLENGE_COMPLETED,
        `领取挑战奖励: ${challengeDetails.title}`
      )
    }
    
    return NextResponse.json(userChallenge)
  } catch (error) {
    console.error('领取挑战奖励失败:', error)
    return NextResponse.json(
      { error: '领取挑战奖励失败' },
      { status: 500 }
    )
  }
}