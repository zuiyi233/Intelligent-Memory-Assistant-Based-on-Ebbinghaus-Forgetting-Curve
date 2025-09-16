import { NextRequest, NextResponse } from 'next/server'
import { gamificationService } from '@/services/gamification.service'

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

    const profile = await gamificationService.getOrCreateProfile(userId)
    return NextResponse.json(profile)
  } catch (error) {
    console.error('获取游戏化资料失败:', error)
    return NextResponse.json(
      { error: '获取游戏化资料失败' },
      { status: 500 }
    )
  }
}