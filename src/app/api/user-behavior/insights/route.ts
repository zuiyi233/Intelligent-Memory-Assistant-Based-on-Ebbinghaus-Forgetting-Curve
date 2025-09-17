import { NextRequest, NextResponse } from 'next/server'
import { UserBehaviorAnalysisService } from '@/services/userBehaviorAnalysis.service'

/**
 * 用户行为洞察API路由
 * 提供用户行为洞察数据的RESTful接口
 */
export async function GET(request: NextRequest) {
  try {
    // 获取查询参数
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const days = searchParams.get('days') ? parseInt(searchParams.get('days') as string, 10) : 30
    const insightType = searchParams.get('type') || 'all' // all, predictive, social, learning

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

    // 验证insightType参数
    const validInsightTypes = ['all', 'predictive', 'social', 'learning']
    if (!validInsightTypes.includes(insightType)) {
      return NextResponse.json(
        { error: `无效的type参数，必须是以下之一: ${validInsightTypes.join(', ')}` },
        { status: 400 }
      )
    }

    // 创建分析服务实例
    const analysisService = new UserBehaviorAnalysisService()

    // 获取用户行为分析数据
    const analysisData = await analysisService.getUserBehaviorAnalysis(userId, days)

    // 根据请求的洞察类型过滤数据
    let insightsData = {}
    
    switch (insightType) {
      case 'predictive':
        insightsData = {
          predictiveInsights: analysisData.predictiveInsights
        }
        break
      case 'social':
        insightsData = {
          socialBehavior: analysisData.socialBehavior
        }
        break
      case 'learning':
        insightsData = {
          learningPatterns: analysisData.learningPatterns,
          engagementMetrics: analysisData.engagementMetrics
        }
        break
      case 'all':
      default:
        insightsData = {
          predictiveInsights: analysisData.predictiveInsights,
          socialBehavior: analysisData.socialBehavior,
          learningPatterns: analysisData.learningPatterns,
          engagementMetrics: analysisData.engagementMetrics,
          behaviorChanges: analysisData.behaviorChanges
        }
        break
    }

    return NextResponse.json({
      success: true,
      data: insightsData,
      metadata: {
        userId,
        period: analysisData.period,
        insightType
      }
    })
  } catch (error) {
    console.error('获取用户行为洞察数据失败:', error)
    return NextResponse.json(
      { error: '获取用户行为洞察数据失败' },
      { status: 500 }
    )
  }
}