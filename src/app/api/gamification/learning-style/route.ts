import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { LearningStyleService } from '@/services/learningStyle.service'

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

    const learningStyleService = new LearningStyleService()
    const analysis = await learningStyleService.analyzeLearningStyle(userId)
    
    return NextResponse.json(analysis)
  } catch (error) {
    console.error('分析学习风格失败:', error)
    return NextResponse.json(
      { error: '分析学习风格失败' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, eventType, data } = await request.json()
    
    if (!userId || !eventType) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      )
    }

    const learningStyleService = new LearningStyleService()
    await learningStyleService.recordBehaviorEvent(userId, eventType, data)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('记录用户行为事件失败:', error)
    return NextResponse.json(
      { error: '记录用户行为事件失败' },
      { status: 500 }
    )
  }
}