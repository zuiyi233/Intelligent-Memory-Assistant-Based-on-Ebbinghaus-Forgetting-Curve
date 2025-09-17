import { NextRequest, NextResponse } from 'next/server'
import { abTestTemplateService } from '@/services/abTestTemplate.service'
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

interface RouteParams {
  params: {
    id: string
  }
}

/**
 * 使用模板创建A/B测试
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
    const testData = await request.json()

    // 获取模板数据
    const testForm = await abTestTemplateService.createTestFromTemplate(id, {
      name: testData.name,
      description: testData.description,
      createdBy: session.user.id
    })
    
    if (!testForm) {
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

    // 创建测试
    const newTest = await abTestingService.createABTest(testForm)

    return NextResponse.json({
      success: true,
      data: newTest,
      message: '使用模板创建A/B测试成功',
      timestamp: new Date().toISOString()
    }, { status: 201 })
  } catch (error) {
    console.error('使用模板创建A/B测试失败:', error)
    return NextResponse.json(
      { 
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '使用模板创建A/B测试失败',
          details: error instanceof Error ? error.message : '未知错误'
        },
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}