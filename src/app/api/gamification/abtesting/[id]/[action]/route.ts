import { NextRequest, NextResponse } from 'next/server'
import { abTestingService } from '@/services/abTesting.service'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; action: string } }
) {
  try {
    const { action } = params
    let result

    switch (action) {
      case 'start':
        result = await abTestingService.startABTest(params.id)
        break
      case 'pause':
        result = await abTestingService.pauseABTest(params.id)
        break
      case 'complete':
        result = await abTestingService.completeABTest(params.id)
        break
      default:
        return NextResponse.json(
          { error: '不支持的操作' },
          { status: 400 }
        )
    }

    if (!result) {
      return NextResponse.json(
        { error: 'A/B测试不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error(`A/B测试${params.action}操作失败:`, error)
    return NextResponse.json(
      { error: `A/B测试${params.action}操作失败` },
      { status: 500 }
    )
  }
}