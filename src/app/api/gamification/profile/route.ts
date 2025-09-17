import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { gamificationService } from '@/services/gamification.service'

/**
 * 获取用户游戏化资料
 * GET /api/gamification/profile
 */
export async function GET(request: NextRequest) {
  try {
    // 获取用户会话
    const session = await getServerSession()
    
    // 获取查询参数
    const searchParams = request.nextUrl.searchParams
    const paramUserId = searchParams.get('userId')
    
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

    // 调用服务获取用户游戏化资料
    const profile = await gamificationService.getOrCreateProfile(userId)

    return NextResponse.json({
      success: true,
      data: profile
    })
  } catch (error) {
    console.error('获取用户游戏化资料失败:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '获取用户游戏化资料失败'
      },
      { status: 500 }
    )
  }
}