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
  }
}

/**
 * 获取细分中的所有用户
 */
export async function GET(request: NextRequest, context: RouteParams) {
  try {
    const { id } = context.params
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // 验证分页参数
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: 'INVALID_PAGINATION',
            message: '分页参数无效，页码必须大于0，每页数量必须在1-100之间'
          },
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      )
    }

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

    // 获取细分中的用户
    const result = await abSegmentService.getSegmentUsers(id, page, limit)

    return NextResponse.json({
      success: true,
      data: result.users,
      pagination: result.pagination,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('获取A/B测试细分用户失败:', error)
    return NextResponse.json(
      { 
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '获取A/B测试细分用户失败',
          details: error instanceof Error ? error.message : '未知错误'
        },
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

/**
 * 批量向细分添加用户
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

    const { id } = context.params
    const { userIds } = await request.json()

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: '请求体必须是非空的用户ID数组'
          },
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      )
    }

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

    // 批量添加用户
    const result = await abSegmentService.batchAddUsersToSegment(id, userIds)

    return NextResponse.json({
      success: true,
      data: result,
      message: `批量添加用户完成，成功添加 ${result.successful.length} 个用户`,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('批量向细分添加用户失败:', error)
    return NextResponse.json(
      { 
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '批量向细分添加用户失败',
          details: error instanceof Error ? error.message : '未知错误'
        },
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}