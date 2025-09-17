import { NextRequest, NextResponse } from 'next/server'
import { gamificationAnalysisService } from '@/services/gamificationAnalysis.service'

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

    const analysisData = await gamificationAnalysisService.getGamificationEffectAnalysis(userId, days)
    return NextResponse.json(analysisData)
  } catch (error) {
    console.error('获取游戏化效果分析失败:', error)
    return NextResponse.json(
      { error: '获取游戏化效果分析失败' },
      { status: 500 }
    )
  }
}