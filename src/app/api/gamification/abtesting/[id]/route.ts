import { NextRequest, NextResponse } from 'next/server'
import { abTestingService } from '@/services/abTesting.service'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const test = await abTestingService.getABTest(params.id)
    
    if (!test) {
      return NextResponse.json(
        { error: 'A/B测试不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json(test)
  } catch (error) {
    console.error('获取A/B测试详情失败:', error)
    return NextResponse.json(
      { error: '获取A/B测试详情失败' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const updates = await request.json()
    
    const updatedTest = await abTestingService.updateABTest(params.id, updates)
    
    if (!updatedTest) {
      return NextResponse.json(
        { error: 'A/B测试不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json(updatedTest)
  } catch (error) {
    console.error('更新A/B测试失败:', error)
    return NextResponse.json(
      { error: '更新A/B测试失败' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = await abTestingService.deleteABTest(params.id)
    
    if (!success) {
      return NextResponse.json(
        { error: 'A/B测试不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('删除A/B测试失败:', error)
    return NextResponse.json(
      { error: '删除A/B测试失败' },
      { status: 500 }
    )
  }
}