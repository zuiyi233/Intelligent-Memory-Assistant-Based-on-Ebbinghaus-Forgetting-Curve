import { NextResponse } from 'next/server'
import { gamificationABTestingService } from '@/services/gamificationABTesting.service'

/**
 * 初始化游戏化A/B测试预设
 * 这个端点用于创建游戏化相关的预设A/B测试
 */
export async function POST() {
  try {
    // 创建游戏化相关的预设A/B测试
    await gamificationABTestingService.createGamificationABTestPresets()

    return NextResponse.json({
      success: true,
      message: '游戏化A/B测试预设初始化成功'
    })
  } catch (error) {
    console.error('初始化游戏化A/B测试预设失败:', error)
    return NextResponse.json(
      { success: false, error: '初始化游戏化A/B测试预设失败' },
      { status: 500 }
    )
  }
}