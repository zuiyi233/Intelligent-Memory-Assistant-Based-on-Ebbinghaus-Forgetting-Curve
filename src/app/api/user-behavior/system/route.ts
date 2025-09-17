import { NextRequest, NextResponse } from 'next/server'
import { UserBehaviorAnalysisService } from '@/services/userBehaviorAnalysis.service'

/**
 * 系统级行为分析API路由
 * 提供系统级别行为分析数据的RESTful接口
 */
export async function GET(request: NextRequest) {
  try {
    // 获取查询参数
    const { searchParams } = new URL(request.url)
    const days = searchParams.get('days') ? parseInt(searchParams.get('days') as string, 10) : 30

    // 验证days参数
    if (isNaN(days) || days < 1 || days > 365) {
      return NextResponse.json(
        { error: 'days参数必须是1到365之间的整数' },
        { status: 400 }
      )
    }

    // 创建分析服务实例
    const analysisService = new UserBehaviorAnalysisService()

    // 获取系统行为分析摘要
    const systemSummary = await analysisService.getSystemBehaviorSummary(days)

    return NextResponse.json({
      success: true,
      data: systemSummary,
      metadata: {
        period: `最近${days}天`,
        generatedAt: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('获取系统行为分析数据失败:', error)
    return NextResponse.json(
      { error: '获取系统行为分析数据失败' },
      { status: 500 }
    )
  }
}