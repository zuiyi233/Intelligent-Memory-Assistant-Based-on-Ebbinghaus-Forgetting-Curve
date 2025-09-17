import { NextRequest, NextResponse } from 'next/server'
import { gamificationService } from '@/services/gamification.service'
import { prisma } from '@/lib/db'

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

    const achievements = await prisma.userAchievement.findMany({
      where: { userId },
      include: {
        achievement: true
      },
      orderBy: { unlockedAt: 'desc' }
    })
    
    return NextResponse.json(achievements)
  } catch (error) {
    console.error('获取用户成就列表失败:', error)
    return NextResponse.json(
      { error: '获取用户成就列表失败' },
      { status: 500 }
    )
  }
}