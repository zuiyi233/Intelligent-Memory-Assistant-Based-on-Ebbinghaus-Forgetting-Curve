import { NextRequest, NextResponse } from 'next/server'
import { gamificationABTestingService } from '@/services/gamificationABTesting.service'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

/**
 * 获取用户的游戏化A/B测试配置
 * 这个端点用于获取当前用户的所有A/B测试配置，以便在游戏化系统中应用
 */
export async function GET(request: NextRequest) {
  try {
    // 获取用户会话
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: '用户未登录' },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // 获取用户的A/B测试配置
    const config = await gamificationABTestingService.applyABTestConfigToGamification(userId)

    // 获取用户的A/B测试摘要
    const summary = await gamificationABTestingService.getUserGamificationABTestSummary(userId)

    return NextResponse.json({
      success: true,
      data: {
        config,
        summary,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('获取用户游戏化A/B测试配置失败:', error)
    return NextResponse.json(
      { success: false, error: '获取用户游戏化A/B测试配置失败' },
      { status: 500 }
    )
  }
}