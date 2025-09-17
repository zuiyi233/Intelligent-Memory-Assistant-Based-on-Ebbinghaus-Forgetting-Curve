import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { gamificationService } from '@/services/gamification.service'

/**
 * 兑换奖励
 * POST /api/gamification/rewards/claim
 */
export async function POST(request: NextRequest) {
  try {
    // 获取用户会话
    const session = await getServerSession()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: '请先登录'
        },
        { status: 401 }
      )
    }

    const userId = session.user.id
    const body = await request.json()
    const { rewardItemId, quantity = 1 } = body

    if (!rewardItemId) {
      return NextResponse.json(
        {
          success: false,
          error: '奖励物品ID不能为空'
        },
        { status: 400 }
      )
    }

    if (quantity <= 0 || quantity > 99) {
      return NextResponse.json(
        {
          success: false,
          error: '兑换数量必须大于0且小于99'
        },
        { status: 400 }
      )
    }

    // 调用服务兑换奖励
    const result = await gamificationService.claimReward(userId, {
      rewardItemId,
      quantity
    })

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        userReward: result.userReward,
        message: result.message
      }
    })
  } catch (error) {
    console.error('兑换奖励失败:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '兑换奖励失败'
      },
      { status: 500 }
    )
  }
}