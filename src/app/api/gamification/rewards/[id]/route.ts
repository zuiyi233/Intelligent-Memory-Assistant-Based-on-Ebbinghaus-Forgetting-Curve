import { NextRequest, NextResponse } from 'next/server'
import { gamificationService } from '@/services/gamification.service'

/**
 * 获取奖励物品详情
 * GET /api/gamification/rewards/[id]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // 调用服务获取奖励物品详情
    const rewardItem = await gamificationService.getRewardItemById(id)

    if (!rewardItem) {
      return NextResponse.json(
        {
          success: false,
          error: '奖励物品不存在'
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: rewardItem
    })
  } catch (error) {
    console.error('获取奖励物品详情失败:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '获取奖励物品详情失败'
      },
      { status: 500 }
    )
  }
}