import { NextRequest, NextResponse } from 'next/server'
import { gamificationService } from '@/services/gamification.service'

/**
 * 初始化默认奖励物品
 * POST /api/gamification/rewards/initialize
 */
export async function POST(request: NextRequest) {
  try {
    // 调用服务初始化默认奖励物品
    await gamificationService.initializeDefaultRewards()

    return NextResponse.json({
      success: true,
      message: '默认奖励物品初始化成功'
    })
  } catch (error) {
    console.error('初始化默认奖励物品失败:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '初始化默认奖励物品失败'
      },
      { status: 500 }
    )
  }
}