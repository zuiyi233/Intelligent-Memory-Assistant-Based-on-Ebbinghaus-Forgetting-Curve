import { NextRequest, NextResponse } from 'next/server'
import { PersonalizedAchievementService } from '@/services/personalizedAchievement.service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json(
        { error: '缺少用户ID' },
        { status: 400 }
      )
    }

    const personalizedAchievementService = new PersonalizedAchievementService()
    const achievements = await personalizedAchievementService.getPersonalizedAchievements(userId)
    
    return NextResponse.json(achievements)
  } catch (error) {
    console.error('获取个性化成就推荐失败:', error)
    return NextResponse.json(
      { error: '获取个性化成就推荐失败' },
      { status: 500 }
    )
  }
}