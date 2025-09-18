import { ExtendedUserBehaviorEventType, ExtendedLearningContentType } from './userBehaviorAnalysis.service'

/**
 * 用户行为数据收集服务
 * 负责收集、记录和处理用户行为事件
 * 注意：此服务在客户端运行，通过 API 路由与服务端通信
 */
export class UserBehaviorDataCollectionService {
  private static instance: UserBehaviorDataCollectionService
  private eventQueue: Array<{
    userId: string
    eventType: ExtendedUserBehaviorEventType
    data?: {
      contentType?: ExtendedLearningContentType
      categoryId?: string
      timeSpent?: number
      accuracy?: number
      difficulty?: number
      success?: boolean
      metadata?: Record<string, unknown>
    }
    timestamp: Date
  }> = []
  private isProcessing = false
  private batchSize = 10
  private isClientSide: boolean

  private constructor() {
    // 检查是否在客户端运行
    this.isClientSide = typeof window !== 'undefined'
    
    if (!this.isClientSide) {
      console.error('UserBehaviorDataCollectionService 应该只在客户端运行')
      return
    }
    
    // 启动定时处理队列
    setInterval(() => this.processEventQueue(), 5000) // 每5秒处理一次队列
  }

  /**
   * 获取单例实例
   */
  public static getInstance(): UserBehaviorDataCollectionService {
    if (!UserBehaviorDataCollectionService.instance) {
      UserBehaviorDataCollectionService.instance = new UserBehaviorDataCollectionService()
    }
    return UserBehaviorDataCollectionService.instance
  }

  /**
   * 记录用户行为事件
   * @param userId 用户ID
   * @param eventType 事件类型
   * @param data 事件数据
   */
  public async recordEvent(
    userId: string,
    eventType: ExtendedUserBehaviorEventType,
    data?: {
      contentType?: ExtendedLearningContentType
      categoryId?: string
      timeSpent?: number
      accuracy?: number
      difficulty?: number
      success?: boolean
      metadata?: Record<string, unknown>
    }
  ): Promise<void> {
    try {
      // 将事件添加到队列
      this.eventQueue.push({
        userId,
        eventType,
        data,
        timestamp: new Date()
      })

      // 如果队列达到批量大小，立即处理
      if (this.eventQueue.length >= this.batchSize) {
        await this.processEventQueue()
      }
    } catch (error) {
      console.error('记录用户行为事件失败:', error)
      // 不抛出错误，避免影响主流程
    }
  }

  /**
   * 批量记录用户行为事件
   * @param events 事件数组
   */
  public async batchRecordEvents(
    events: Array<{
      userId: string
      eventType: ExtendedUserBehaviorEventType
      data?: {
        contentType?: ExtendedLearningContentType
        categoryId?: string
        timeSpent?: number
        accuracy?: number
        difficulty?: number
        success?: boolean
        metadata?: Record<string, unknown>
      }
    }>
  ): Promise<void> {
    try {
      // 将所有事件添加到队列
      events.forEach(event => {
        this.eventQueue.push({
          userId: event.userId,
          eventType: event.eventType,
          data: event.data,
          timestamp: new Date()
        })
      })

      // 立即处理队列
      await this.processEventQueue()
    } catch (error) {
      console.error('批量记录用户行为事件失败:', error)
      // 不抛出错误，避免影响主流程
    }
  }

  /**
   * 处理事件队列
   */
  private async processEventQueue(): Promise<void> {
    if (this.isProcessing || this.eventQueue.length === 0) {
      return
    }

    this.isProcessing = true

    try {
      // 取出队列中的事件
      const eventsToProcess = this.eventQueue.splice(0, this.batchSize)
      
      // 通过 API 路由发送事件到服务端
      await this.sendEventsToServer(eventsToProcess)

      console.log(`成功处理 ${eventsToProcess.length} 个用户行为事件`)
    } catch (error) {
      console.error('处理用户行为事件队列失败:', error)
    } finally {
      this.isProcessing = false
    }
  }

  /**
   * 将事件发送到服务端 API
   */
  private async sendEventsToServer(events: Array<{
    userId: string
    eventType: ExtendedUserBehaviorEventType
    data?: {
      contentType?: ExtendedLearningContentType
      categoryId?: string
      timeSpent?: number
      accuracy?: number
      difficulty?: number
      success?: boolean
      metadata?: Record<string, unknown>
    }
    timestamp: Date
  }>): Promise<void> {
    try {
      const response = await fetch('/api/user-behavior/record', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          events: events.map(event => ({
            userId: event.userId,
            eventType: event.eventType,
            data: event.data,
            timestamp: event.timestamp.toISOString()
          }))
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error || 'Failed to record user behavior events')
      }
    } catch (error) {
      console.error('发送用户行为事件到服务端失败:', error)
      throw error
    }
  }

  /**
   * 记录复习完成事件
   * @param userId 用户ID
   * @param data 复习数据
   */
  public async recordReviewCompleted(
    userId: string,
    data: {
      contentId?: string
      isCorrect: boolean
      responseTime?: number
      difficulty?: number
      timeSpent?: number
    }
  ): Promise<void> {
    await this.recordEvent(userId, ExtendedUserBehaviorEventType.REVIEW_COMPLETED, {
      contentType: ExtendedLearningContentType.QUIZ,
      timeSpent: data.timeSpent,
      accuracy: data.isCorrect ? 1.0 : 0.0,
      difficulty: data.difficulty || 1,
      success: data.isCorrect,
      metadata: {
        contentId: data.contentId,
        responseTime: data.responseTime
      }
    })
  }

  /**
   * 记录记忆创建事件
   * @param userId 用户ID
   * @param data 记忆数据
   */
  public async recordMemoryCreated(
    userId: string,
    data: {
      contentId?: string
      category: string
      difficulty: number
      contentType?: ExtendedLearningContentType
    }
  ): Promise<void> {
    await this.recordEvent(userId, ExtendedUserBehaviorEventType.MEMORY_CREATED, {
      contentType: data.contentType || ExtendedLearningContentType.TEXT,
      categoryId: data.category,
      difficulty: data.difficulty,
      metadata: {
        contentId: data.contentId
      }
    })
  }

  /**
   * 记录搜索操作事件
   * @param userId 用户ID
   * @param data 搜索数据
   */
  public async recordSearchPerformed(
    userId: string,
    data: {
      query: string
      resultsCount: number
      categoryId?: string
    }
  ): Promise<void> {
    await this.recordEvent(userId, ExtendedUserBehaviorEventType.SEARCH_PERFORMED, {
      categoryId: data.categoryId,
      metadata: {
        query: data.query,
        resultsCount: data.resultsCount
      }
    })
  }

  /**
   * 记录页面导航事件
   * @param userId 用户ID
   * @param data 导航数据
   */
  public async recordPageNavigation(
    userId: string,
    data: {
      fromPage: string
      toPage: string
      timeSpent?: number
    }
  ): Promise<void> {
    await this.recordEvent(userId, ExtendedUserBehaviorEventType.PAGE_NAVIGATION, {
      timeSpent: data.timeSpent,
      metadata: {
        fromPage: data.fromPage,
        toPage: data.toPage
      }
    })
  }

  /**
   * 记录内容分享事件
   * @param userId 用户ID
   * @param data 分享数据
   */
  public async recordContentShared(
    userId: string,
    data: {
      contentId: string
      contentType: ExtendedLearningContentType
      shareMethod: string // 'link', 'social', 'export' 等
    }
  ): Promise<void> {
    await this.recordEvent(userId, ExtendedUserBehaviorEventType.CONTENT_SHARED, {
      contentType: data.contentType,
      metadata: {
        contentId: data.contentId,
        shareMethod: data.shareMethod
      }
    })
  }

  /**
   * 记录设置变更事件
   * @param userId 用户ID
   * @param data 设置数据
   */
  public async recordSettingChanged(
    userId: string,
    data: {
      settingName: string
      oldValue: unknown
      newValue: unknown
    }
  ): Promise<void> {
    await this.recordEvent(userId, ExtendedUserBehaviorEventType.SETTING_CHANGED, {
      metadata: {
        settingName: data.settingName,
        oldValue: data.oldValue,
        newValue: data.newValue
      }
    })
  }

  /**
   * 记录错误事件
   * @param userId 用户ID
   * @param data 错误数据
   */
  public async recordErrorEncountered(
    userId: string,
    data: {
      errorType: string
      errorMessage: string
      context?: Record<string, unknown>
    }
  ): Promise<void> {
    await this.recordEvent(userId, ExtendedUserBehaviorEventType.ERROR_ENCOUNTERED, {
      metadata: {
        errorType: data.errorType,
        errorMessage: data.errorMessage,
        context: data.context
      }
    })
  }

  /**
   * 记录社交互动事件
   * @param userId 用户ID
   * @param data 社交数据
   */
  public async recordSocialInteraction(
    userId: string,
    data: {
      interactionType: string // 'comment', 'like', 'share' 等
      targetUserId?: string
      contentId?: string
    }
  ): Promise<void> {
    await this.recordEvent(userId, ExtendedUserBehaviorEventType.SOCIAL_INTERACTION, {
      metadata: {
        interactionType: data.interactionType,
        targetUserId: data.targetUserId,
        contentId: data.contentId
      }
    })
  }

  /**
   * 获取队列状态
   */
  public getQueueStatus(): {
    queueSize: number
    isProcessing: boolean
    batchSize: number
  } {
    return {
      queueSize: this.eventQueue.length,
      isProcessing: this.isProcessing,
      batchSize: this.batchSize
    }
  }

  /**
   * 强制处理队列中的所有事件
   */
  public async flushQueue(): Promise<void> {
    if (this.eventQueue.length > 0) {
      await this.processEventQueue()
    }
  }
}

// 导出单例实例
export const userBehaviorDataCollectionService = UserBehaviorDataCollectionService.getInstance()