import { NextRequest, NextResponse } from 'next/server'
import { UserBehaviorAnalysisService } from '@/services/userBehaviorAnalysis.service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const days = parseInt(searchParams.get('days') || '30')
    
    if (!userId) {
      return NextResponse.json(
        { error: '缺少用户ID' },
        { status: 400 }
      )
    }

    const userBehaviorAnalysisService = new UserBehaviorAnalysisService()
    const analysisData = await userBehaviorAnalysisService.getUserBehaviorAnalysis(userId, days)
    return NextResponse.json(analysisData)
  } catch (error) {
    console.error('获取用户行为分析数据失败:', error)
    return NextResponse.json(
      { error: '获取用户行为分析数据失败' },
      { status: 500 }
    )
  }
}