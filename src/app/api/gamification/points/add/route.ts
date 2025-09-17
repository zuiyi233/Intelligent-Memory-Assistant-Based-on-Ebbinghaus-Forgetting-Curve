import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { gamificationService } from '@/services/gamification.service'
import { PointTransactionType } from '@prisma/client'

/**
 * 添加积分
 * POST /api/gamification/points/add
 */
export async function POST(request: NextRequest) {
  try {
    // 获取用户会话
    const session = await getServerSession()
    
    // 如果不是通过会话调用，则从请求体中获取用户ID
    const body = await request.json()
    const { userId, amount, type, description } = body

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: '用户ID不能为空'
        },
        { status: 400 }
      )
    }

    if (!amount || amount <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: '积分数量必须大于0'
        },
        { status: 400 }
      )
    }

    // 调用服务添加积分
    const profile = await gamificationService.addPoints(
      userId,
      amount,
      type || PointTransactionType.MANUAL_ADJUST,
      description || '手动添加积分'
    )

    return NextResponse.json({
      success: true,
      data: {
        userId: profile.userId,
        points: profile.points,
        addedPoints: amount
      },
      message: '积分添加成功'
    })
  } catch (error) {
    console.error('添加积分失败:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '添加积分失败'
      },
      { status: 500 }
    )
  }
}