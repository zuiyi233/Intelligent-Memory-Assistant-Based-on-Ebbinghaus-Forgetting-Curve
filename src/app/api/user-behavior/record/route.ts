import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// 从 Prisma 模型导入枚举类型
type UserBehaviorEventType =
  | 'REVIEW_COMPLETED'
  | 'MEMORY_CREATED'
  | 'CATEGORY_FOCUS'
  | 'TIME_SPENT'
  | 'ACCURACY_HIGH'
  | 'ACCURACY_LOW'
  | 'STREAK_MAINTAINED'
  | 'CHALLENGE_COMPLETED'
  | 'ACHIEVEMENT_UNLOCKED'
  | 'LEVEL_UP'
  | 'POINTS_EARNED'
  | 'UI_INTERACTION'
  | 'THEME_CHANGED'
  | 'CUSTOMIZATION'

// 从 Prisma 模型导入内容类型枚举
type LearningContentType =
  | 'TEXT'
  | 'IMAGE'
  | 'AUDIO'
  | 'VIDEO'
  | 'INTERACTIVE'
  | 'QUIZ'

// 定义事件接口
interface UserBehaviorEvent {
  userId: string
  eventType: string
  data?: {
    contentType?: string
    categoryId?: string
    timeSpent?: number
    accuracy?: number
    difficulty?: number
    success?: boolean
    metadata?: Record<string, unknown>
  }
  timestamp: string
}

/**
 * 批量记录用户行为事件的 API 路由
 * 此路由仅在服务端运行，处理来自客户端的用户行为事件
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { events } = body

    if (!events || !Array.isArray(events)) {
      return NextResponse.json(
        { success: false, error: 'Invalid events data' },
        { status: 400 }
      )
    }

    // 验证事件数据格式并转换为 Prisma 兼容格式
    const validatedEvents = events.map((event: UserBehaviorEvent) => {
      if (!event.userId || !event.eventType) {
        throw new Error('Invalid event format: missing userId or eventType')
      }

      // 检查事件类型是否在 Prisma 枚举中
      const validEventTypes: UserBehaviorEventType[] = [
        'REVIEW_COMPLETED',
        'MEMORY_CREATED',
        'CATEGORY_FOCUS',
        'TIME_SPENT',
        'ACCURACY_HIGH',
        'ACCURACY_LOW',
        'STREAK_MAINTAINED',
        'CHALLENGE_COMPLETED',
        'ACHIEVEMENT_UNLOCKED',
        'LEVEL_UP',
        'POINTS_EARNED',
        'UI_INTERACTION',
        'THEME_CHANGED',
        'CUSTOMIZATION'
      ]

      // 检查内容类型是否在 Prisma 枚举中
      const validContentTypes: LearningContentType[] = [
        'TEXT',
        'IMAGE',
        'AUDIO',
        'VIDEO',
        'INTERACTIVE',
        'QUIZ'
      ]

      // 如果事件类型不在枚举中，使用默认值
      const eventType = validEventTypes.includes(event.eventType as UserBehaviorEventType)
        ? event.eventType as UserBehaviorEventType
        : 'UI_INTERACTION'

      // 如果内容类型不在枚举中，使用默认值或 null
      const contentType = event.data?.contentType && validContentTypes.includes(event.data.contentType as LearningContentType)
        ? event.data.contentType as LearningContentType
        : undefined

      return {
        userId: event.userId,
        eventType,
        contentType,
        categoryId: event.data?.categoryId,
        timeSpent: event.data?.timeSpent || 0,
        accuracy: event.data?.accuracy || 0.0,
        difficulty: event.data?.difficulty || 1,
        success: event.data?.success || false,
        metadata: event.data?.metadata || {},
        timestamp: event.timestamp ? new Date(event.timestamp) : new Date()
      }
    })

    // 批量插入用户行为事件
    await prisma.userBehaviorEvent.createMany({
      data: validatedEvents.map(event => ({
        userId: event.userId,
        eventType: event.eventType,
        contentType: event.contentType,
        categoryId: event.categoryId,
        timeSpent: event.timeSpent,
        accuracy: event.accuracy,
        difficulty: event.difficulty,
        success: event.success,
        metadata: JSON.parse(JSON.stringify(event.metadata || {})),
        timestamp: event.timestamp
      }))
    })

    console.log(`成功记录 ${validatedEvents.length} 个用户行为事件`)

    return NextResponse.json({
      success: true,
      message: `Successfully recorded ${validatedEvents.length} events`
    })
  } catch (error) {
    console.error('批量记录用户行为事件失败:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    )
  }
}