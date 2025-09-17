import { NextRequest, NextResponse } from 'next/server'
import { abTestTemplateService } from '@/services/abTestTemplate.service'
import { ABTestTemplateUpdateForm } from '@/types'
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
 * 获取特定A/B测试模板
 */
export async function GET(request: NextRequest, context: RouteParams) {
  try {
    const { id } = context.params

    const template = await abTestTemplateService.getTemplate(id)
    
    if (!template) {
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'A/B测试模板不存在'
          },
          timestamp: new Date().toISOString()
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: template,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('获取A/B测试模板详情失败:', error)
    return NextResponse.json(
      { 
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '获取A/B测试模板详情失败',
          details: error instanceof Error ? error.message : '未知错误'
        },
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

/**
 * 更新A/B测试模板
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
    const updates = await request.json() as ABTestTemplateUpdateForm

    // 验证流量分配（如果更新了变体）
    if (updates.variants) {
      const totalTrafficPercentage = updates.variants.reduce(
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
      const controlVariants = updates.variants.filter(variant => variant.isControl)
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
    }

    const updatedTemplate = await abTestTemplateService.updateTemplate(id, updates)
    
    if (!updatedTemplate) {
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'A/B测试模板不存在'
          },
          timestamp: new Date().toISOString()
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: updatedTemplate,
      message: 'A/B测试模板更新成功',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('更新A/B测试模板失败:', error)
    return NextResponse.json(
      { 
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '更新A/B测试模板失败',
          details: error instanceof Error ? error.message : '未知错误'
        },
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

/**
 * 删除A/B测试模板
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

    const success = await abTestTemplateService.deleteTemplate(id)
    
    if (!success) {
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'A/B测试模板不存在'
          },
          timestamp: new Date().toISOString()
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'A/B测试模板删除成功',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('删除A/B测试模板失败:', error)
    return NextResponse.json(
      { 
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '删除A/B测试模板失败',
          details: error instanceof Error ? error.message : '未知错误'
        },
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}