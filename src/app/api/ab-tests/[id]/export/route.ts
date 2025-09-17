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
 * 导出A/B测试数据
 */
export async function GET(request: NextRequest, context: RouteParams) {
  try {
    const { id } = context.params
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'json' // 'json', 'csv'
    const includeResults = searchParams.get('includeResults') === 'true'
    const includeAssignments = searchParams.get('includeAssignments') === 'true'
    const includeReport = searchParams.get('includeReport') === 'true'

    // 验证格式参数
    if (!['json', 'csv'].includes(format)) {
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: 'INVALID_FORMAT',
            message: '导出格式无效，支持json和csv格式'
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

    // 构建导出数据
    const exportData: {
      test: ABTest
      results?: ABTestResult[]
      assignments?: ABTestUserAssignment[]
      report?: ABTestReport
    } = {
      test: test as ABTest
    }

    // 根据请求添加相应数据
    if (includeResults) {
      const results = await abTestingService.getTestResults(id)
      exportData.results = results
    }

    if (includeAssignments) {
      // 获取用户分配数据
      // 注意：这里可能需要根据实际的数据模型调整
      // const assignments = await abTestingService.getTestUserAssignments(id)
      // exportData.assignments = assignments
      exportData.assignments = []
    }

    if (includeReport && test.status === 'COMPLETED') {
      try {
        const report = await abTestingService.getTestReport(id)
        if (report) {
          exportData.report = report
        }
      } catch (error) {
        console.error('获取测试报告失败:', error)
      }
    }

    // 根据格式返回数据
    if (format === 'json') {
      return NextResponse.json({
        success: true,
        data: exportData,
        timestamp: new Date().toISOString()
      })
    } else if (format === 'csv') {
      // 转换为CSV格式
      const csvData = convertToCSV(exportData)
      
      return new NextResponse(csvData, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="ab-test-${id}-export.csv"`
        }
      })
    }

    return NextResponse.json(
      { 
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '导出失败'
        },
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  } catch (error) {
    console.error('导出A/B测试数据失败:', error)
    return NextResponse.json(
      { 
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '导出A/B测试数据失败',
          details: error instanceof Error ? error.message : '未知错误'
        },
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

/**
 * 将A/B测试数据转换为CSV格式
 */
function convertToCSV(data: {
  test: ABTest
  results?: ABTestResult[]
  assignments?: ABTestUserAssignment[]
  report?: ABTestReport
}): string {
  const { test, results = [], assignments = [], report } = data
  
  // 创建测试基本信息CSV
  const testInfo = [
    ['测试ID', test.id],
    ['测试名称', test.name],
    ['测试描述', test.description],
    ['状态', test.status],
    ['开始日期', test.startDate?.toISOString() || ''],
    ['结束日期', test.endDate?.toISOString() || ''],
    ['创建时间', test.createdAt.toISOString()],
    ['更新时间', test.updatedAt.toISOString()],
    []
  ]
  
  // 创建测试变体CSV
  const variantsHeader = ['变体ID', '变体名称', '描述', '流量占比', '是否为对照组']
  const variantsData = test.variants.map(variant => [
    variant.id,
    variant.name,
    variant.description,
    variant.trafficPercentage.toString(),
    variant.isControl ? '是' : '否'
  ])
  
  // 创建测试指标CSV
  const metricsHeader = ['指标ID', '指标名称', '描述', '类型', '单位', '是否激活']
  const metricsData = test.metrics.map(metric => [
    metric.id,
    metric.name,
    metric.description,
    metric.type,
    metric.unit || '',
    metric.isActive ? '是' : '否'
  ])
  
  // 创建测试结果CSV
  const resultsHeader = ['结果ID', '变体ID', '指标ID', '数值', '变化量', '变化百分比', '置信度', '是否显著', '样本量']
  const resultsData = results.map(result => [
    result.id,
    result.variantId,
    result.metricId,
    result.value.toString(),
    result.change.toString(),
    result.changePercentage.toString(),
    result.confidence.toString(),
    result.significance ? '是' : '否',
    result.sampleSize.toString()
  ])
  
  // 创建用户分配CSV
  const assignmentsHeader = ['分配ID', '用户ID', '变体ID', '分配时间']
  const assignmentsData = assignments.map(assignment => [
    assignment.id,
    assignment.userId,
    assignment.variantId,
    assignment.assignedAt.toISOString()
  ])
  
  // 创建报告摘要CSV
  let reportData: string[][] = []
  if (report) {
    reportData = [
      ['报告摘要'],
      ['获胜变体ID', report.winner?.variantId || ''],
      ['获胜变体置信度', report.winner?.confidence.toString() || ''],
      ['总用户数', report.summary.totalUsers.toString()],
      ['测试持续时间(天)', report.summary.testDuration.toString()],
      ['关键发现', report.summary.keyFindings.join('; ')],
      ['建议', report.recommendations.join('; ')],
      []
    ]
  }
  
  // 合并所有CSV数据
  const allData = [
    ['A/B测试数据导出'],
    [],
    ['测试基本信息'],
    ...testInfo,
    ['测试变体'],
    variantsHeader,
    ...variantsData,
    [],
    ['测试指标'],
    metricsHeader,
    ...metricsData,
    []
  ]
  
  if (results.length > 0) {
    allData.push(
      ['测试结果'],
      resultsHeader,
      ...resultsData,
      []
    )
  }
  
  if (assignments.length > 0) {
    allData.push(
      ['用户分配'],
      assignmentsHeader,
      ...assignmentsData,
      []
    )
  }
  
  if (reportData.length > 0) {
    allData.push(...reportData)
  }
  
  // 转换为CSV字符串
  return convertToCSVString(allData)
}

/**
 * 将二维数组转换为CSV字符串
 */
export function convertToCSVString(data: string[][]): string {
  return data.map(row =>
    row.map(field =>
      // 如果字段包含逗号、引号或换行符，则需要用引号包裹并转义内部引号
      field.includes(',') || field.includes('"') || field.includes('\n')
        ? `"${field.replace(/"/g, '""')}"`
        : field
    ).join(',')
  ).join('\n')
}