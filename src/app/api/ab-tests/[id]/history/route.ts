import { NextRequest, NextResponse } from 'next/server'
import { abTestingService } from '@/services/abTesting.service'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  ABTest,
  ABTestVariant,
  ABTestMetric,
  ABTestResult,
  ABTestUserAssignment,
  ABTestReport
} from '@/types'

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
 * 获取特定A/B测试的历史数据
 */
export async function GET(request: NextRequest, context: RouteParams) {
  try {
    const { id } = context.params
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const dataType = searchParams.get('dataType') || 'all' // 'all', 'results', 'assignments'

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

    // 验证测试是否存在
    const test = await abTestingService.getABTest(id)
    if (!test) {
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'A/B测试不存在'
          },
          timestamp: new Date().toISOString()
        },
        { status: 404 }
      )
    }

    // 构建历史数据
    const historyData: {
      test: {
        id: string
        name: string
        description: string
        status: string
        createdAt: Date
        startDate?: Date | null
        endDate?: Date | null
      }
      variants: ABTestVariant[]
      metrics: ABTestMetric[]
      results?: ABTestResult[]
      assignments?: ABTestUserAssignment[]
      report?: {
        winner?: {
          variantId: string
          confidence: number
        }
        recommendations: string[]
        summary: {
          totalUsers: number
          testDuration: number
          keyFindings: string[]
        }
      }
    } = {
      test: {
        id: test.id,
        name: test.name,
        description: test.description,
        status: test.status,
        createdAt: test.createdAt,
        startDate: test.startDate,
        endDate: test.endDate
      },
      variants: test.variants as ABTestVariant[],
      metrics: test.metrics as ABTestMetric[]
    }

    // 根据请求的数据类型添加相应数据
    if (dataType === 'all' || dataType === 'results') {
      // 获取测试结果
      const results = await abTestingService.getTestResults(id)
      historyData.results = results
    }

    if (dataType === 'all' || dataType === 'assignments') {
      // 获取用户分配数据
      // 注意：这里可能需要根据实际的数据模型调整
      // const assignments = await abTestingService.getTestUserAssignments(id)
      // historyData.assignments = assignments
      historyData.assignments = []
    }

    // 获取测试报告（如果测试已完成）
    if (test.status === 'COMPLETED') {
      try {
        const report = await abTestingService.getTestReport(id)
        if (report) {
          historyData.report = {
            winner: report.winner,
            recommendations: report.recommendations,
            summary: report.summary
          }
        }
      } catch (error) {
        console.error('获取测试报告失败:', error)
      }
    }

    return NextResponse.json({
      success: true,
      data: historyData,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('获取A/B测试历史数据失败:', error)
    return NextResponse.json(
      { 
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '获取A/B测试历史数据失败',
          details: error instanceof Error ? error.message : '未知错误'
        },
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}