import { NextRequest, NextResponse } from 'next/server'
import { abSegmentService } from '@/services/abSegment.service'
import { ABSegmentUpdateForm } from '@/types'
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
  }
}

/**
 * 获取特定A/B测试用户细分
 */
export async function GET(request: NextRequest, context: RouteParams) {
  try {
    const { id } = context.params

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

    return NextResponse.json({
      success: true,
      data: segment,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('获取A/B测试用户细分详情失败:', error)
    return NextResponse.json(
      { 
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '获取A/B测试用户细分详情失败',
          details: error instanceof Error ? error.message : '未知错误'
        },
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

/**
 * 更新A/B测试用户细分
 */
export async function PUT(request: NextRequest, context: RouteParams) {
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

    const { id } = context.params
    const updates = await request.json() as ABSegmentUpdateForm

    const updatedSegment = await abSegmentService.updateSegment(id, updates)
    
    if (!updatedSegment) {
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

    return NextResponse.json({
      success: true,
      data: updatedSegment,
      message: 'A/B测试用户细分更新成功',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('更新A/B测试用户细分失败:', error)
    return NextResponse.json(
      { 
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '更新A/B测试用户细分失败',
          details: error instanceof Error ? error.message : '未知错误'
        },
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

/**
 * 删除A/B测试用户细分
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

    const { id } = context.params

    const success = await abSegmentService.deleteSegment(id)
    
    if (!success) {
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

    return NextResponse.json({
      success: true,
      message: 'A/B测试用户细分删除成功',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('删除A/B测试用户细分失败:', error)
    return NextResponse.json(
      { 
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '删除A/B测试用户细分失败',
          details: error instanceof Error ? error.message : '未知错误'
        },
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}