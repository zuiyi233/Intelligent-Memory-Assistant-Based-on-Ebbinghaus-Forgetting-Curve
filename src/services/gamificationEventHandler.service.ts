import { gamificationService } from './gamification.service'
import { gamificationABTestingService } from './gamificationABTesting.service'
import { useAuth } from '@/contexts/AuthContext'
import { showGamificationNotification } from '@/components/gamification/GamificationNotifications'
import {
  showPointsNotification,
  showExperienceNotification,
  showAchievementNotification,
  showLevelUpNotification,
  showChallengeCompletedNotification
} from '@/components/gamification/EnhancedGamificationNotifications'

// 导入子事件处理器
import { reviewEventHandler } from './gamification/eventHandlers/ReviewEventHandler'
import { memoryEventHandler } from './gamification/eventHandlers/MemoryEventHandler'
import { achievementEventHandler } from './gamification/eventHandlers/AchievementEventHandler'
import { levelUpEventHandler } from './gamification/eventHandlers/LevelUpEventHandler'
import { challengeEventHandler } from './gamification/eventHandlers/ChallengeEventHandler'

// 定义游戏化事件类型
export type GamificationEventType = 
  | 'REVIEW_COMPLETED'
  | 'MEMORY_CREATED'
  | 'STREAK_UPDATED'
  | 'LEVEL_UP'
  | 'ACHIEVEMENT_UNLOCKED'
  | 'CHALLENGE_COMPLETED'

// 定义游戏化事件数据接口
export interface GamificationEventData {
  type: GamificationEventType
  userId: string
  data?: unknown
  timestamp: Date
}

// 定义复习完成事件数据
export interface ReviewCompletedData {
  isCompleted: boolean
  responseTime?: number
  difficulty?: 'easy' | 'medium' | 'hard'
  reviewCount?: number
}

// 定义记忆创建事件数据
export interface MemoryCreatedData {
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
}

// 定义成就解锁事件数据
export interface AchievementUnlockedData {
  achievementId: string
  achievementName: string
  points: number
}

// 定义等级提升事件数据
export interface LevelUpData {
  oldLevel: number
  newLevel: number
  bonusPoints: number
}

// 定义挑战完成事件数据
export interface ChallengeCompletedData {
  challengeId: string
  challengeTitle: string
  points: number
}

// 扩展GamificationEventData以支持泛型
export interface TypedGamificationEventData<T = unknown> extends Omit<GamificationEventData, 'data'> {
  data?: T
}

/**
 * 游戏化事件处理器
 */
export class GamificationEventHandler {
  private static instance: GamificationEventHandler
  private eventQueue: GamificationEventData[] = []
  private isProcessing = false

  private constructor() {}

  /**
   * 获取单例实例
   */
  public static getInstance(): GamificationEventHandler {
    if (!GamificationEventHandler.instance) {
      GamificationEventHandler.instance = new GamificationEventHandler()
    }
    return GamificationEventHandler.instance
  }

  /**
   * 发送游戏化事件
   */
  public async sendEvent<T = unknown>(
    type: GamificationEventType,
    userId: string,
    data?: T
  ): Promise<void> {
    const event: GamificationEventData = {
      type,
      userId,
      data: data as unknown,
      timestamp: new Date()
    }

    this.eventQueue.push(event)
    
    // 如果没有正在处理的事件，开始处理队列
    if (!this.isProcessing) {
      this.processEventQueue()
    }
  }

  /**
   * 处理复习完成事件
   */
  public async handleReviewCompleted(userId: string, data: ReviewCompletedData): Promise<void> {
    try {
      // 委托给 ReviewEventHandler
      await reviewEventHandler.handleReviewCompleted(userId, data)
      
      // 显示游戏化通知
      const points = data.isCompleted ? 10 : 5
      const experience = data.isCompleted ? 20 : 10
      
      showPointsNotification(points, data.isCompleted ? '太棒了！你正确回忆了这个内容' : '继续努力，下次一定可以记住')
      
      showExperienceNotification(experience, '你获得了经验值')

      // 发送复习完成事件
      await this.sendEvent('REVIEW_COMPLETED', userId, data)
    } catch (error) {
      console.error('处理复习完成事件失败:', error)
    }
  }

  /**
   * 处理记忆创建事件
   */
  public async handleMemoryCreated(userId: string, data: MemoryCreatedData): Promise<void> {
    try {
      // 委托给 MemoryEventHandler
      await memoryEventHandler.handleMemoryCreated(userId, data)
      
      // 显示游戏化通知
      showPointsNotification(5, '创建记忆内容')

      // 发送记忆创建事件
      await this.sendEvent('MEMORY_CREATED', userId, data)
    } catch (error) {
      console.error('处理记忆创建事件失败:', error)
    }
  }

  /**
   * 处理成就解锁事件
   */
  public async handleAchievementUnlocked(userId: string, data: AchievementUnlockedData): Promise<void> {
    try {
      // 委托给 AchievementEventHandler
      await achievementEventHandler.handleAchievementUnlocked(userId, data)
      
      // 显示成就解锁通知
      showAchievementNotification(data.achievementName, data.points)

      // 发送成就解锁事件
      await this.sendEvent('ACHIEVEMENT_UNLOCKED', userId, data)
    } catch (error) {
      console.error('处理成就解锁事件失败:', error)
    }
  }

  /**
   * 处理等级提升事件
   */
  public async handleLevelUp(userId: string, data: LevelUpData): Promise<void> {
    try {
      // 委托给 LevelUpEventHandler
      await levelUpEventHandler.handleLevelUp(userId, data)
      
      // 显示等级提升通知
      showLevelUpNotification(data.oldLevel, data.newLevel, data.bonusPoints)

      // 发送等级提升事件
      await this.sendEvent('LEVEL_UP', userId, data)
    } catch (error) {
      console.error('处理等级提升事件失败:', error)
    }
  }

  /**
   * 处理挑战完成事件
   */
  public async handleChallengeCompleted(userId: string, data: ChallengeCompletedData): Promise<void> {
    try {
      // 委托给 ChallengeEventHandler
      await challengeEventHandler.handleChallengeCompleted(userId, data)
      
      // 显示挑战完成通知
      showChallengeCompletedNotification(data.challengeTitle, data.points)

      // 发送挑战完成事件
      await this.sendEvent('CHALLENGE_COMPLETED', userId, data)
    } catch (error) {
      console.error('处理挑战完成事件失败:', error)
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
      // 使用批量处理提高性能
      const batchSize = 10
      while (this.eventQueue.length > 0) {
        const batch = this.eventQueue.splice(0, batchSize)
        await Promise.all(batch.map(event => this.processEvent(event).catch(error => {
          console.error('处理单个游戏化事件失败:', error, event)
        })))
      }
    } catch (error) {
      console.error('处理游戏化事件队列失败:', error)
    } finally {
      this.isProcessing = false
    }
  }

  /**
   * 处理单个事件
   */
  private async processEvent(event: GamificationEventData): Promise<void> {
    // 这里可以添加事件处理逻辑，例如发送到分析服务器或记录日志
    console.log('处理游戏化事件:', event)
    
    // 处理A/B测试指标记录
    try {
      // 将GamificationEventData转换为GamificationEvent格式
      const abTestEvent: {
        type: 'REVIEW_COMPLETED' | 'MEMORY_CREATED' | 'STREAK_UPDATED' | 'LEVEL_UP' | 'ACHIEVEMENT_UNLOCKED' | 'CHALLENGE_COMPLETED' | 'POINTS_EARNED'
        userId: string
        data?: Record<string, unknown>
        timestamp: Date
      } = {
        type: event.type as 'REVIEW_COMPLETED' | 'MEMORY_CREATED' | 'STREAK_UPDATED' | 'LEVEL_UP' | 'ACHIEVEMENT_UNLOCKED' | 'CHALLENGE_COMPLETED' | 'POINTS_EARNED',
        userId: event.userId,
        data: event.data as Record<string, unknown>,
        timestamp: event.timestamp
      }
      
      // 调用A/B测试服务处理事件
      await gamificationABTestingService.handleGamificationEvent(abTestEvent)
    } catch (error) {
      console.error('处理A/B测试事件失败:', error)
    }
    
    // 根据事件类型执行不同的处理逻辑
    switch (event.type) {
      case 'REVIEW_COMPLETED':
        // 可以在这里添加额外的复习完成逻辑
        break
      case 'MEMORY_CREATED':
        // 可以在这里添加额外的记忆创建逻辑
        break
      case 'ACHIEVEMENT_UNLOCKED':
        // 可以在这里添加额外的成就解锁逻辑
        break
      case 'LEVEL_UP':
        // 可以在这里添加额外的等级提升逻辑
        break
      case 'CHALLENGE_COMPLETED':
        // 可以在这里添加额外的挑战完成逻辑
        break
      default:
        break
    }
  }
}

// 导出单例实例
export const gamificationEventHandler = GamificationEventHandler.getInstance()

/**
 * React Hook 用于游戏化事件处理
 */
// 扩展SessionUser类型以包含id
interface ExtendedSessionUser {
  id?: string
  sub?: string
  name?: string | null
  email?: string | null
  image?: string | null
}

// 缓存用户ID以避免重复的类型转换
const getUserId = (user: unknown): string | null => {
  return (user as ExtendedSessionUser)?.id || (user as ExtendedSessionUser)?.sub || null
}

export function useGamificationEventHandler() {
  const { user } = useAuth()

  // 缓存用户ID以避免重复计算
  const userId = getUserId(user)

  const handleReviewCompleted = async (data: ReviewCompletedData) => {
    if (!userId) {
      console.warn('用户未登录，无法处理游戏化事件')
      return
    }
    await gamificationEventHandler.handleReviewCompleted(userId, data)
  }

  const handleMemoryCreated = async (data: MemoryCreatedData) => {
    if (!userId) {
      console.warn('用户未登录，无法处理游戏化事件')
      return
    }
    await gamificationEventHandler.handleMemoryCreated(userId, data)
  }

  return {
    handleReviewCompleted,
    handleMemoryCreated
  }
}