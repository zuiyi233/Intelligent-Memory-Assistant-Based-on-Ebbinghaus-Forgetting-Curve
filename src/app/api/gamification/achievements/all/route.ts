import { NextRequest, NextResponse } from 'next/server'
import { gamificationService } from '@/services/gamification.service'

export async function GET(request: NextRequest) {
  try {
    const achievements = await gamificationService.getAllAchievements()
    return NextResponse.json(achievements)
  } catch (error) {
    console.error('获取成就详情失败:', error)
    return NextResponse.json(
      { error: '获取成就详情失败' },
      { status: 500 }
    )
  }
}