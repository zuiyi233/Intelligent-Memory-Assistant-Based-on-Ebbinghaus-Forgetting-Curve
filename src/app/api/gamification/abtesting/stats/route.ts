import { NextRequest, NextResponse } from 'next/server'
import { abTestingService } from '@/services/abTesting.service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const testId = searchParams.get('testId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const segment = searchParams.get('segment')
    const metricIds = searchParams.get('metricIds')?.split(',')

    if (!testId) {
      return NextResponse.json(
        { error: '缺少测试ID' },
        { status: 400 }
      )
    }

    const params = {
      testId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      segment: segment || undefined,
      metricIds: metricIds || undefined
    }

    const stats = await abTestingService.getTestStats(params)
    return NextResponse.json(stats)
  } catch (error) {
    console.error('获取A/B测试统计数据失败:', error)
    return NextResponse.json(
      { error: '获取A/B测试统计数据失败' },
      { status: 500 }
    )
  }
}