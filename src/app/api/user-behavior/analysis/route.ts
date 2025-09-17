import { NextRequest, NextResponse } from 'next/server'
import { UserBehaviorAnalysisService } from '@/services/userBehaviorAnalysis.service'

/**
 * 用户行为分析API路由
 * 提供用户行为分析数据的RESTful接口
 */
export async function GET(request: NextRequest) {
  try {
    // 获取查询参数
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const days = searchParams.get('days') ? parseInt(searchParams.get('days') as string, 10) : 30

    // 验证必需参数
    if (!userId) {
      return NextResponse.json(
        { error: '缺少必需参数: userId' },
        { status: 400 }
      )
    }

    // 验证days参数
    if (isNaN(days) || days < 1 || days > 365) {
      return NextResponse.json(
        { error: 'days参数必须是1到365之间的整数' },
        { status: 400 }
      )
    }

    // 创建分析服务实例
    const analysisService = new UserBehaviorAnalysisService()

    // 获取用户行为分析数据
    const analysisData = await analysisService.getUserBehaviorAnalysis(userId, days)

    return NextResponse.json({
      success: true,
      data: analysisData
    })
  } catch (error) {
    console.error('获取用户行为分析数据失败:', error)
    return NextResponse.json(
      { error: '获取用户行为分析数据失败' },
      { status: 500 }
    )
  }
}