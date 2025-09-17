import { NextRequest, NextResponse } from 'next/server'
import { abTestingService } from '@/services/abTesting.service'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const report = searchParams.get('report') === 'true'
    
    if (report) {
      const testReport = await abTestingService.getTestReport(params.id)
      
      if (!testReport) {
        return NextResponse.json(
          { error: 'A/B测试不存在或没有足够的数据生成报告' },
          { status: 404 }
        )
      }

      return NextResponse.json(testReport)
    } else {
      const results = await abTestingService.getTestResults(params.id)
      return NextResponse.json(results)
    }
  } catch (error) {
    console.error('获取A/B测试结果失败:', error)
    return NextResponse.json(
      { error: '获取A/B测试结果失败' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { variantId, metricId, value } = await request.json()
    
    if (!variantId || !metricId || value === undefined) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      )
    }

    const success = await abTestingService.recordTestMetric(
      params.id,
      variantId,
      metricId,
      value
    )

    if (!success) {
      return NextResponse.json(
        { error: '记录测试指标失败' },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('记录A/B测试指标失败:', error)
    return NextResponse.json(
      { error: '记录A/B测试指标失败' },
      { status: 500 }
    )
  }
}