import { NextRequest, NextResponse } from 'next/server'
import { gamificationService } from '@/services/gamification.service'

/**
 * 获取奖励商店统计信息
 * GET /api/gamification/rewards/stats
 */
export async function GET() {
  try {
    // 调用服务获取奖励商店统计信息
    const stats = await gamificationService.getRewardStoreStats()

    return NextResponse.json({
      success: true,
      data: stats
    })
  } catch (error) {
    console.error('获取奖励商店统计信息失败:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '获取奖励商店统计信息失败'
      },
      { status: 500 }
    )
  }
}