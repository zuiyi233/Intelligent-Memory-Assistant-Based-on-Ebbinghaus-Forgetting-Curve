import { NextRequest, NextResponse } from 'next/server'
import { abTestingService } from '@/services/abTesting.service'
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
 * 获取历史A/B测试数据
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
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

    // 获取所有测试
    let tests = await abTestingService.getAllABTests()

    // 过滤
    if (status) {
      tests = tests.filter(test => test.status === status)
    }

    if (createdBy) {
      // 注意：这里需要根据实际的数据模型调整
      // tests = tests.filter(test => test.createdBy === createdBy)
    }

    if (startDate) {
      const start = new Date(startDate)
      tests = tests.filter(test => new Date(test.createdAt) >= start)
    }

    if (endDate) {
      const end = new Date(endDate)
      tests = tests.filter(test => new Date(test.createdAt) <= end)
    }

    const total = tests.length

    // 分页
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedTests = tests.slice(startIndex, endIndex)

    return NextResponse.json({
      success: true,
      data: paginatedTests,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('获取历史A/B测试数据失败:', error)
    return NextResponse.json(
      { 
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '获取历史A/B测试数据失败',
          details: error instanceof Error ? error.message : '未知错误'
        },
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}