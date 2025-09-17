import { NextRequest, NextResponse } from 'next/server'
import { gamificationAnalysisService } from '@/services/gamificationAnalysis.service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')

    const summaryData = await gamificationAnalysisService.getSystemGamificationSummary(days)
    return NextResponse.json(summaryData)
  } catch (error) {
    console.error('获取系统游戏化总结失败:', error)
    return NextResponse.json(
      { error: '获取系统游戏化总结失败' },
      { status: 500 }
    )
  }
}