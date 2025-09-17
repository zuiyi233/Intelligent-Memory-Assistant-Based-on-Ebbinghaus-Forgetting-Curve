import { NextRequest, NextResponse } from 'next/server'
import { abSegmentService } from '@/services/abSegment.service'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// 扩展会话类型以包含id字段
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      username: string
      isPremium: boolean
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}

interface RouteParams {
  params: {
    id: string
    userId: string
  }
}

/**
 * 检查用户是否在细分中
 */
export async function GET(request: NextRequest, context: RouteParams) {
  try {
    const { id, userId } = context.params

    // 验证细分是否存在
    const segment = await abSegmentService.getSegment(id)
    if (!segment) {
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'A/B测试用户细分不存在'
          },
          timestamp: new Date().toISOString()
        },
        { status: 404 }
      )
    }

    // 检查用户是否在细分中
    const isInSegment = await abSegmentService.isUserInSegment(id, userId)

    return NextResponse.json({
      success: true,
      data: {
        segmentId: id,
        userId,
        isInSegment
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('检查用户是否在细分中失败:', error)
    return NextResponse.json(
      { 
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '检查用户是否在细分中失败',
          details: error instanceof Error ? error.message : '未知错误'
        },
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

/**
 * 向细分添加单个用户
 */
export async function POST(request: NextRequest, context: RouteParams) {
  try {
    // 获取用户会话
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: '用户未登录'
          },
          timestamp: new Date().toISOString()
        },
        { status: 401 }
      )
    }

    const { id, userId } = context.params

    // 验证细分是否存在
    const segment = await abSegmentService.getSegment(id)
    if (!segment) {
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'A/B测试用户细分不存在'
          },
          timestamp: new Date().toISOString()
        },
        { status: 404 }
      )
    }

    // 添加用户到细分
    const result = await abSegmentService.addUserToSegment(id, userId)
    
    if (!result) {
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: 'ADD_FAILED',
            message: '向细分添加用户失败'
          },
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: '用户已成功添加到细分',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('向细分添加用户失败:', error)
    return NextResponse.json(
      { 
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '向细分添加用户失败',
          details: error instanceof Error ? error.message : '未知错误'
        },
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

/**
 * 从细分中移除用户
 */
export async function DELETE(request: NextRequest, context: RouteParams) {
  try {
    // 获取用户会话
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: '用户未登录'
          },
          timestamp: new Date().toISOString()
        },
        { status: 401 }
      )
    }

    const { id, userId } = context.params

    // 验证细分是否存在
    const segment = await abSegmentService.getSegment(id)
    if (!segment) {
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'A/B测试用户细分不存在'
          },
          timestamp: new Date().toISOString()
        },
        { status: 404 }
      )
    }

    // 从细分中移除用户
    const success = await abSegmentService.removeUserFromSegment(id, userId)
    
    if (!success) {
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: 'REMOVE_FAILED',
            message: '从细分中移除用户失败'
          },
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '用户已成功从细分中移除',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('从细分中移除用户失败:', error)
    return NextResponse.json(
      { 
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '从细分中移除用户失败',
          details: error instanceof Error ? error.message : '未知错误'
        },
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}