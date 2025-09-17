import { NextRequest, NextResponse } from 'next/server'
import { abSegmentService } from '@/services/abSegment.service'
import { ABSegmentCreateForm } from '@/types'
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

/**
 * 获取所有A/B测试用户细分
 * 支持分页、过滤和排序
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const isActive = searchParams.get('isActive')
    const createdBy = searchParams.get('createdBy')

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

    // 获取所有细分
    let segments = await abSegmentService.getAllSegments()

    // 过滤
    if (isActive !== null) {
      const isActiveBool = isActive === 'true'
      segments = segments.filter(segment => segment.isActive === isActiveBool)
    }

    if (createdBy) {
      segments = segments.filter(segment => segment.createdBy === createdBy)
    }

    const total = segments.length

    // 分页
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedSegments = segments.slice(startIndex, endIndex)

    return NextResponse.json({
      success: true,
      data: paginatedSegments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('获取A/B测试用户细分列表失败:', error)
    return NextResponse.json(
      { 
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '获取A/B测试用户细分列表失败',
          details: error instanceof Error ? error.message : '未知错误'
        },
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

/**
 * 创建新的A/B测试用户细分
 */
export async function POST(request: NextRequest) {
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

    const segmentData = await request.json() as ABSegmentCreateForm
    
    // 验证必填字段
    if (!segmentData.name || !segmentData.description) {
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '缺少必填字段：名称或描述'
          },
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      )
    }

    // 验证条件
    if (!segmentData.criteria || Object.keys(segmentData.criteria).length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '至少需要一个细分条件'
          },
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      )
    }

    // 创建细分
    const newSegment = await abSegmentService.createSegment(
      segmentData, 
      session.user.id
    )

    return NextResponse.json({
      success: true,
      data: newSegment,
      message: 'A/B测试用户细分创建成功',
      timestamp: new Date().toISOString()
    }, { status: 201 })
  } catch (error) {
    console.error('创建A/B测试用户细分失败:', error)
    return NextResponse.json(
      { 
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '创建A/B测试用户细分失败',
          details: error instanceof Error ? error.message : '未知错误'
        },
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}