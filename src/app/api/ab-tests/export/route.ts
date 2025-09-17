import { NextRequest, NextResponse } from 'next/server'
import { abTestingService } from '@/services/abTesting.service'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ABTest, ABTestResult, ABTestUserAssignment, ABTestReport } from '@/types'
import { convertToCSVString } from '../[id]/export/route'

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
 * 批量导出A/B测试数据
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'json' // 'json', 'csv'
    const status = searchParams.get('status') // 'DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED'
    const testIds = searchParams.get('testIds')?.split(',').filter(Boolean) || []
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

    // 获取测试列表
    let tests: ABTest[] = []
    
    if (testIds.length > 0) {
      // 根据ID获取指定测试
      for (const id of testIds) {
        const test = await abTestingService.getABTest(id)
        if (test) {
          tests.push(test as ABTest)
        }
      }
    } else {
      // 获取所有测试或按状态过滤
      tests = await abTestingService.getAllABTests() as ABTest[]
      if (status) {
        tests = tests.filter(test => test.status === status)
      }
    }

    if (tests.length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: '未找到符合条件的A/B测试'
          },
          timestamp: new Date().toISOString()
        },
        { status: 404 }
      )
    }

    // 构建导出数据
    const exportData: {
      tests: ABTest[]
      results?: Record<string, ABTestResult[]>
      assignments?: Record<string, ABTestUserAssignment[]>
      reports?: Record<string, ABTestReport>
    } = {
      tests
    }

    // 根据请求添加相应数据
    if (includeResults) {
      exportData.results = {}
      for (const test of tests) {
        const results = await abTestingService.getTestResults(test.id)
        exportData.results[test.id] = results
      }
    }

    if (includeAssignments) {
      exportData.assignments = {}
      for (const test of tests) {
        // 获取用户分配数据
        // 注意：这里可能需要根据实际的数据模型调整
        // const assignments = await abTestingService.getTestUserAssignments(test.id)
        // exportData.assignments[test.id] = assignments
        exportData.assignments[test.id] = []
      }
    }

    if (includeReport) {
      exportData.reports = {}
      for (const test of tests) {
        if (test.status === 'COMPLETED') {
          try {
            const report = await abTestingService.getTestReport(test.id)
            if (report) {
              exportData.reports[test.id] = report
            }
          } catch (error) {
            console.error(`获取测试 ${test.id} 报告失败:`, error)
          }
        }
      }
    }

    // 根据格式返回数据
    if (format === 'json') {
      return NextResponse.json({
        success: true,
        data: exportData,
        summary: {
          totalTests: tests.length,
          statusDistribution: tests.reduce((acc, test) => {
            acc[test.status] = (acc[test.status] || 0) + 1
            return acc
          }, {} as Record<string, number>)
        },
        timestamp: new Date().toISOString()
      })
    } else if (format === 'csv') {
      // 转换为CSV格式
      const csvData = convertBatchToCSV(exportData)
      
      return new NextResponse(csvData, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="ab-tests-batch-export.csv"`
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
    console.error('批量导出A/B测试数据失败:', error)
    return NextResponse.json(
      { 
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '批量导出A/B测试数据失败',
          details: error instanceof Error ? error.message : '未知错误'
        },
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

/**
 * 将批量A/B测试数据转换为CSV格式
 */
function convertBatchToCSV(data: {
  tests: ABTest[]
  results?: Record<string, ABTestResult[]>
  assignments?: Record<string, ABTestUserAssignment[]>
  reports?: Record<string, ABTestReport>
}): string {
  const { tests, results = {}, assignments = {}, reports = {} } = data
  
  // 创建测试基本信息CSV
  const testsHeader = ['测试ID', '测试名称', '测试描述', '状态', '开始日期', '结束日期', '创建时间', '更新时间']
  const testsData = tests.map(test => [
    test.id,
    test.name,
    test.description,
    test.status,
    test.startDate?.toISOString() || '',
    test.endDate?.toISOString() || '',
    test.createdAt.toISOString(),
    test.updatedAt.toISOString()
  ])
  
  // 创建测试变体CSV
  const variantsHeader = ['测试ID', '变体ID', '变体名称', '描述', '流量占比', '是否为对照组']
  const variantsData: string[][] = []
  
  tests.forEach(test => {
    test.variants.forEach(variant => {
      variantsData.push([
        test.id,
        variant.id,
        variant.name,
        variant.description,
        variant.trafficPercentage.toString(),
        variant.isControl ? '是' : '否'
      ])
    })
  })
  
  // 创建测试指标CSV
  const metricsHeader = ['测试ID', '指标ID', '指标名称', '描述', '类型', '单位', '是否激活']
  const metricsData: string[][] = []
  
  tests.forEach(test => {
    test.metrics.forEach(metric => {
      metricsData.push([
        test.id,
        metric.id,
        metric.name,
        metric.description,
        metric.type,
        metric.unit || '',
        metric.isActive ? '是' : '否'
      ])
    })
  })
  
  // 创建测试结果CSV
  const resultsHeader = ['测试ID', '结果ID', '变体ID', '指标ID', '数值', '变化量', '变化百分比', '置信度', '是否显著', '样本量']
  const resultsData: string[][] = []
  
  Object.entries(results).forEach(([testId, testResults]) => {
    testResults.forEach((result: ABTestResult) => {
      resultsData.push([
        testId,
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
    })
  })
  
  // 创建用户分配CSV
  const assignmentsHeader = ['测试ID', '分配ID', '用户ID', '变体ID', '分配时间']
  const assignmentsData: string[][] = []
  
  Object.entries(assignments).forEach(([testId, testAssignments]) => {
    testAssignments.forEach((assignment: ABTestUserAssignment) => {
      assignmentsData.push([
        testId,
        assignment.id,
        assignment.userId,
        assignment.variantId,
        assignment.assignedAt.toISOString()
      ])
    })
  })
  
  // 创建报告摘要CSV
  const reportsHeader = ['测试ID', '获胜变体ID', '获胜变体置信度', '总用户数', '测试持续时间(天)', '关键发现', '建议']
  const reportsData: string[][] = []
  
  Object.entries(reports).forEach(([testId, report]) => {
    reportsData.push([
      testId,
      report.winner?.variantId || '',
      report.winner?.confidence.toString() || '',
      report.summary.totalUsers.toString(),
      report.summary.testDuration.toString(),
      report.summary.keyFindings.join('; '),
      report.recommendations.join('; ')
    ])
  })
  
  // 合并所有CSV数据
  const allData = [
    ['批量A/B测试数据导出'],
    [],
    ['测试基本信息'],
    testsHeader,
    ...testsData,
    [],
    ['测试变体'],
    variantsHeader,
    ...variantsData,
    [],
    ['测试指标'],
    metricsHeader,
    ...metricsData,
    []
  ]
  
  if (resultsData.length > 0) {
    allData.push(
      ['测试结果'],
      resultsHeader,
      ...resultsData,
      []
    )
  }
  
  if (assignmentsData.length > 0) {
    allData.push(
      ['用户分配'],
      assignmentsHeader,
      ...assignmentsData,
      []
    )
  }
  
  if (reportsData.length > 0) {
    allData.push(
      ['测试报告'],
      reportsHeader,
      ...reportsData,
      []
    )
  }
  
  // 转换为CSV字符串
  return convertToCSVString(allData)
}