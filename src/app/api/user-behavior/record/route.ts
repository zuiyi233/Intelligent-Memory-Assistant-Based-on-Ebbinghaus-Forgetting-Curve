import { NextRequest, NextResponse } from 'next/server'
import { userBehaviorDataCollectionService } from '@/services/userBehaviorDataCollection.service'
import { ExtendedUserBehaviorEventType, ExtendedLearningContentType } from '@/services/userBehaviorAnalysis.service'

/**
 * 用户行为事件记录API路由
 * 提供记录用户行为事件的RESTful接口
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, eventType, data, sessionId } = body

    // 验证必需参数
    if (!userId || !eventType) {
      return NextResponse.json(
        { error: '缺少必需参数: userId 或 eventType' },
        { status: 400 }
      )
    }

    // 验证事件类型
    if (!Object.values(ExtendedUserBehaviorEventType).includes(eventType)) {
      return NextResponse.json(
        { error: '无效的事件类型' },
        { status: 400 }
      )
    }

    // 验证内容类型（如果提供）
    if (data?.contentType && !Object.values(ExtendedLearningContentType).includes(data.contentType)) {
      return NextResponse.json(
        { error: '无效的内容类型' },
        { status: 400 }
      )
    }

    // 添加会话ID到元数据（如果提供）
    const enhancedData = {
      ...data,
      metadata: {
        ...data?.metadata,
        sessionId,
        timestamp: new Date().toISOString(),
        userAgent: request.headers.get('user-agent') || 'unknown'
      }
    }

    // 记录事件
    await userBehaviorDataCollectionService.recordEvent(userId, eventType, enhancedData)

    return NextResponse.json({
      success: true,
      message: '用户行为事件记录成功',
      eventId: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    })
  } catch (error) {
    console.error('记录用户行为事件失败:', error)
    return NextResponse.json(
      { error: '记录用户行为事件失败' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { events, sessionId } = body

    // 验证必需参数
    if (!events || !Array.isArray(events) || events.length === 0) {
      return NextResponse.json(
        { error: '缺少或无效的 events 参数' },
        { status: 400 }
      )
    }

    // 验证事件数量限制
    if (events.length > 100) {
      return NextResponse.json(
        { error: '批量事件数量不能超过100个' },
        { status: 400 }
      )
    }

    // 验证每个事件
    for (const event of events) {
      if (!event.userId || !event.eventType) {
        return NextResponse.json(
          { error: '事件缺少必需参数: userId 或 eventType' },
          { status: 400 }
        )
      }

      if (!Object.values(ExtendedUserBehaviorEventType).includes(event.eventType)) {
        return NextResponse.json(
          { error: `无效的事件类型: ${event.eventType}` },
          { status: 400 }
        )
      }

      if (event.data?.contentType && !Object.values(ExtendedLearningContentType).includes(event.data.contentType)) {
        return NextResponse.json(
          { error: `无效的内容类型: ${event.data.contentType}` },
          { status: 400 }
        )
      }
    }

    // 添加会话ID和用户代理到每个事件的元数据
    const enhancedEvents = events.map(event => ({
      ...event,
      data: {
        ...event.data,
        metadata: {
          ...event.data?.metadata,
          sessionId,
          timestamp: new Date().toISOString(),
          userAgent: request.headers.get('user-agent') || 'unknown'
        }
      }
    }))

    // 批量记录事件
    await userBehaviorDataCollectionService.batchRecordEvents(enhancedEvents)

    return NextResponse.json({
      success: true,
      message: `成功记录 ${events.length} 个用户行为事件`,
      batchId: `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    })
  } catch (error) {
    console.error('批量记录用户行为事件失败:', error)
    return NextResponse.json(
      { error: '批量记录用户行为事件失败' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    // 根据不同的action参数执行不同的操作
    switch (action) {
      case 'queue-status':
        // 获取队列状态
        const queueStatus = userBehaviorDataCollectionService.getQueueStatus()
        return NextResponse.json({
          success: true,
          data: queueStatus
        })

      case 'flush-queue':
        // 强制处理队列中的所有事件
        await userBehaviorDataCollectionService.flushQueue()
        return NextResponse.json({
          success: true,
          message: '队列已刷新'
        })

      default:
        return NextResponse.json(
          { error: '无效的action参数，必须是queue-status或flush-queue' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('处理GET请求失败:', error)
    return NextResponse.json(
      { error: '处理请求失败' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // 强制处理队列中的所有事件
    await userBehaviorDataCollectionService.flushQueue()
    
    return NextResponse.json({
      success: true,
      message: '队列已清空'
    })
  } catch (error) {
    console.error('清空队列失败:', error)
    return NextResponse.json(
      { error: '清空队列失败' },
      { status: 500 }
    )
  }
}