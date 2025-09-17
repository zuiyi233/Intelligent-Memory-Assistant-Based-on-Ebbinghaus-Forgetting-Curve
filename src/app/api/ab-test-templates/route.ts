import { NextRequest, NextResponse } from 'next/server'
import { abTestTemplateService } from '@/services/abTestTemplate.service'
import { ABTestTemplateCreateForm, ABTestTemplate } from '@/types'
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
 * 获取所有A/B测试模板
 * 支持分页、过滤和排序
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const category = searchParams.get('category')
    const isActive = searchParams.get('isActive')
    const sortBy = searchParams.get('sortBy') || 'updatedAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

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

    let templates
    let total

    // 根据查询参数获取模板
    if (category) {
      templates = await abTestTemplateService.getTemplatesByCategory(category)
      total = templates.length
    } else {
      templates = await abTestTemplateService.getAllTemplates()
      total = templates.length

      // 过滤活跃状态
      if (isActive !== null) {
        const isActiveBool = isActive === 'true'
        templates = templates.filter(template => template.isActive === isActiveBool)
        total = templates.length
      }

      // 排序
      templates.sort((a, b) => {
        switch (sortBy) {
          case 'name':
          case 'description':
          case 'category':
            const aValue = a[sortBy as keyof ABTestTemplate] as string
            const bValue = b[sortBy as keyof ABTestTemplate] as string
            return sortOrder === 'asc'
              ? aValue.localeCompare(bValue)
              : bValue.localeCompare(aValue)
          case 'createdAt':
          case 'updatedAt':
            const aDate = a[sortBy as keyof ABTestTemplate] as Date
            const bDate = b[sortBy as keyof ABTestTemplate] as Date
            return sortOrder === 'asc'
              ? aDate.getTime() - bDate.getTime()
              : bDate.getTime() - aDate.getTime()
          case 'isActive':
            const aActive = a.isActive
            const bActive = b.isActive
            return sortOrder === 'asc'
              ? (aActive === bActive ? 0 : aActive ? 1 : -1)
              : (aActive === bActive ? 0 : aActive ? -1 : 1)
          default:
            return 0
        }
      })
    }

    // 分页
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedTemplates = templates.slice(startIndex, endIndex)

    return NextResponse.json({
      success: true,
      data: paginatedTemplates,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('获取A/B测试模板列表失败:', error)
    return NextResponse.json(
      { 
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '获取A/B测试模板列表失败',
          details: error instanceof Error ? error.message : '未知错误'
        },
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

/**
 * 创建新的A/B测试模板
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

    const templateData = await request.json() as ABTestTemplateCreateForm
    
    // 验证必填字段
    if (!templateData.name || !templateData.description || !templateData.category) {
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '缺少必填字段：名称、描述或类别'
          },
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      )
    }

    // 验证变体和指标
    if (!templateData.variants || templateData.variants.length < 2) {
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '至少需要两个测试变体'
          },
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      )
    }

    if (!templateData.metrics || templateData.metrics.length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '至少需要一个测试指标'
          },
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      )
    }

    // 验证流量分配
    const totalTrafficPercentage = templateData.variants.reduce(
      (sum, variant) => sum + variant.trafficPercentage, 0
    )
    
    if (Math.abs(totalTrafficPercentage - 100) > 0.1) {
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '所有变体的流量分配总和必须等于100%'
          },
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      )
    }

    // 验证是否有且仅有一个对照组
    const controlVariants = templateData.variants.filter(variant => variant.isControl)
    if (controlVariants.length !== 1) {
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '必须有且仅有一个对照组变体'
          },
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      )
    }

    // 创建模板
    const newTemplate = await abTestTemplateService.createTemplate(
      templateData, 
      session.user.id
    )

    return NextResponse.json({
      success: true,
      data: newTemplate,
      message: 'A/B测试模板创建成功',
      timestamp: new Date().toISOString()
    }, { status: 201 })
  } catch (error) {
    console.error('创建A/B测试模板失败:', error)
    return NextResponse.json(
      { 
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '创建A/B测试模板失败',
          details: error instanceof Error ? error.message : '未知错误'
        },
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}