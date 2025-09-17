import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { gamificationService } from '@/services/gamification.service'
import { RewardStatus } from '@/types'

/**
 * 获取用户的奖励列表
 * GET /api/gamification/user/rewards
 */
export async function GET(request: NextRequest) {
  try {
    // 获取用户会话
    const session = await getServerSession()
    
    // 获取查询参数
    const searchParams = request.nextUrl.searchParams
    const paramUserId = searchParams.get('userId')
    const status = searchParams.get('status') as RewardStatus | undefined

    // 如果没有提供userId参数，则从会话中获取
    let userId
    if (paramUserId) {
      userId = paramUserId
    } else {
      if (!session?.user?.id) {
        return NextResponse.json(
          {
            success: false,
            error: '请先登录或提供用户ID'
          },
          { status: 401 }
        )
      }
      userId = session.user.id
    }

    // 调用服务获取用户奖励列表
    const userRewards = await gamificationService.getUserRewards(userId, status)

    return NextResponse.json({
      success: true,
      data: userRewards
    })
  } catch (error) {
    console.error('获取用户奖励列表失败:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '获取用户奖励列表失败'
      },
      { status: 500 }
    )
  }
}