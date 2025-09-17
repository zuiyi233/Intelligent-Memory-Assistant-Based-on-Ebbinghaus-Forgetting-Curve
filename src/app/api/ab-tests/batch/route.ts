import { NextRequest, NextResponse } from 'next/server'
import { abTestingService } from '@/services/abTesting.service'
import { ABTestCreateForm } from '@/types'

/**
 * 批量创建A/B测试
 * 接受一个测试定义数组，并批量创建多个A/B测试
 */
export async function POST(request: NextRequest) {
  try {
    const testsData = await request.json() as ABTestCreateForm[]
    
    if (!Array.isArray(testsData) || testsData.length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: '请求体必须是非空的测试定义数组'
          },
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      )
    }

    // 验证每个测试定义
    const validationErrors: string[] = []
    testsData.forEach((testData, index) => {
      if (!testData.name || !testData.description) {
        validationErrors.push(`测试定义 ${index + 1}: 缺少名称或描述`)
      }
      if (!testData.variants || testData.variants.length < 2) {
        validationErrors.push(`测试定义 ${index + 1}: 至少需要两个变体`)
      }
      if (!testData.metrics || testData.metrics.length === 0) {
        validationErrors.push(`测试定义 ${index + 1}: 至少需要一个指标`)
      }
    })

    if (validationErrors.length > 0) {
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '测试定义验证失败',
            details: validationErrors
          },
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      )
    }

    // 批量创建测试
    const createdTests = []
    const failedTests: { index: number; error: string }[] = []

    for (let i = 0; i < testsData.length; i++) {
      try {
        const test = await abTestingService.createABTest(testsData[i])
        createdTests.push(test)
      } catch (error) {
        console.error(`创建测试 ${i + 1} 失败:`, error)
        failedTests.push({
          index: i + 1,
          error: error instanceof Error ? error.message : '未知错误'
        })
      }
    }

    // 返回创建结果
    return NextResponse.json({
      success: true,
      data: {
        createdTests,
        failedTests,
        totalRequested: testsData.length,
        totalCreated: createdTests.length,
        totalFailed: failedTests.length
      },
      message: `批量创建测试完成，成功创建 ${createdTests.length} 个测试`,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('批量创建A/B测试失败:', error)
    return NextResponse.json(
      { 
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '批量创建A/B测试失败',
          details: error instanceof Error ? error.message : '未知错误'
        },
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}