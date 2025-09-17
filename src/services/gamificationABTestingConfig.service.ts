import { abTestingService } from './abTesting.service'
import { GamificationEvent } from '@/types'

// 扩展游戏化事件类型以包含POINTS_EARNED
type ExtendedGamificationEvent = GamificationEvent & {
  type: 'REVIEW_COMPLETED' | 'MEMORY_CREATED' | 'STREAK_UPDATED' | 'LEVEL_UP' | 'ACHIEVEMENT_UNLOCKED' | 'CHALLENGE_COMPLETED' | 'POINTS_EARNED'
}

/**
 * 游戏化A/B测试配置管理器
 * 负责获取、缓存和应用用户的A/B测试配置到游戏化系统
 */
export class GamificationABTestingConfigService {
  private configCache: Map<string, { config: Record<string, unknown>; timestamp: number }> = new Map()
  private readonly CACHE_TTL = 5 * 60 * 1000 // 5分钟缓存

  /**
   * 获取用户的游戏化A/B测试配置
   */
  async getUserGamificationABTestConfig(userId: string): Promise<Record<string, unknown>> {
    // 检查缓存
    const cached = this.configCache.get(userId)
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.config
    }

    // 获取用户的所有测试分配
    const userTests = await abTestingService.getUserTestAssignments(userId)

    const config: Record<string, unknown> = {}

    // 为每个测试应用配置
    for (const [testId, variantId] of Object.entries(userTests)) {
      const variantConfig = await abTestingService.applyTestVariant(userId, testId)
      if (variantConfig) {
        // 合并配置，后面的测试会覆盖前面的同名配置
        Object.assign(config, variantConfig)
      }
    }

    // 缓存配置
    this.configCache.set(userId, { config, timestamp: Date.now() })

    return config
  }

  /**
   * 获取用户的游戏化A/B测试配置摘要
   */
  async getUserGamificationABTestSummary(userId: string): Promise<Record<string, Record<string, unknown>>> {
    // 获取用户的所有测试分配
    const userTests = await abTestingService.getUserTestAssignments(userId)

    const summary: Record<string, Record<string, unknown>> = {}

    // 为每个测试获取摘要信息
    for (const [testId, variantId] of Object.entries(userTests)) {
      const test = await abTestingService.getABTest(testId)
      if (test && test.status === 'ACTIVE') {
        const variant = test.variants.find(v => v.id === variantId)
        if (variant) {
          summary[testId] = {
            testName: test.name,
            variantName: variant.name,
            config: variant.config
          }
        }
      }
    }

    return summary
  }

  /**
   * 清除用户的配置缓存
   */
  clearUserConfigCache(userId: string): void {
    this.configCache.delete(userId)
  }

  /**
   * 批量清除多个用户的配置缓存
   */
  clearUsersConfigCache(userIds: string[]): void {
    userIds.forEach(userId => this.configCache.delete(userId))
  }

  /**
   * 清除所有配置缓存
   */
  clearAllConfigCache(): void {
    this.configCache.clear()
  }

  /**
   * 获取指定配置项的值
   */
  async getConfigValue<T>(userId: string, key: string, defaultValue: T): Promise<T> {
    const config = await this.getUserGamificationABTestConfig(userId)
    return (config[key] as T) ?? defaultValue
  }

  /**
   * 检查用户是否在特定的A/B测试中
   */
  async isUserInTest(userId: string, testId: string): Promise<boolean> {
    const variantId = await abTestingService.getUserTestVariant(userId, testId)
    return variantId !== null
  }

  /**
   * 获取用户在特定测试中的变体ID
   */
  async getUserTestVariant(userId: string, testId: string): Promise<string | null> {
    return await abTestingService.getUserTestVariant(userId, testId)
  }

  /**
   * 获取用户在特定测试中的变体配置
   */
  async getUserTestVariantConfig(userId: string, testId: string): Promise<Record<string, unknown> | null> {
    const variantId = await this.getUserTestVariant(userId, testId)
    if (!variantId) return null

    const test = await abTestingService.getABTest(testId)
    if (!test) return null

    const variant = test.variants.find(v => v.id === variantId)
    if (!variant) return null

    return variant.config as Record<string, unknown>
  }

  /**
   * 应用A/B测试配置到游戏化参数
   */
  async applyConfigToGamificationParams<T extends Record<string, unknown>>(
    userId: string,
    baseParams: T
  ): Promise<T> {
    const config = await this.getUserGamificationABTestConfig(userId)
    
    // 创建配置应用函数
    const applyConfig = (target: T, source: Record<string, unknown>): T => {
      const result = { ...target }
      
      for (const [key, value] of Object.entries(source)) {
        if (key in result && typeof result[key] === 'object' && typeof value === 'object') {
          // 递归合并对象
          result[key] = applyConfig(result[key] as Record<string, unknown>, value as Record<string, unknown>) as unknown as T[keyof T]
        } else {
          // 直接覆盖值
          result[key] = value as unknown as T[keyof T]
        }
      }
      
      return result
    }
    
    return applyConfig(baseParams, config)
  }

  /**
   * 记录游戏化事件并触发A/B测试指标收集
   */
  async recordGamificationEvent(event: GamificationEvent): Promise<void> {
    try {
      // 获取用户参与的所有活跃A/B测试
      const userTests = await abTestingService.getUserTestAssignments(event.userId)

      // 为每个测试记录指标
      for (const [testId, variantId] of Object.entries(userTests)) {
        await this.recordEventMetrics(event, testId, variantId)
      }
    } catch (error) {
      console.error('处理游戏化A/B测试事件失败:', error)
    }
  }

  /**
   * 根据事件类型记录相应的指标
   */
  private async recordEventMetrics(event: GamificationEvent, testId: string, variantId: string): Promise<void> {
    switch (event.type) {
      case 'REVIEW_COMPLETED':
        await this.recordReviewMetrics(event, testId, variantId)
        break
      case 'MEMORY_CREATED':
        await this.recordMemoryMetrics(event, testId, variantId)
        break
      case 'STREAK_UPDATED':
        await this.recordStreakMetrics(event, testId, variantId)
        break
      case 'LEVEL_UP':
        await this.recordLevelMetrics(event, testId, variantId)
        break
      case 'ACHIEVEMENT_UNLOCKED':
        await this.recordAchievementMetrics(event, testId, variantId)
        break
      case 'CHALLENGE_COMPLETED':
        await this.recordChallengeMetrics(event, testId, variantId)
        break
      case 'POINTS_EARNED':
        await this.recordPointsMetrics(event as ExtendedGamificationEvent, testId, variantId)
        break
      default:
        // 忽略不支持的事件类型
        break
    }
  }

  /**
   * 记录复习相关指标
   */
  private async recordReviewMetrics(event: GamificationEvent, testId: string, variantId: string): Promise<void> {
    const eventData = event.data as Record<string, unknown> | null | undefined
    
    // 记录复习次数
    await abTestingService.recordTestMetric(
      testId,
      variantId,
      this.getMetricId(testId, 'review_count'),
      1
    )

    // 记录复习准确率
    if (eventData?.accuracy !== undefined && typeof eventData.accuracy === 'number') {
      await abTestingService.recordTestMetric(
        testId,
        variantId,
        this.getMetricId(testId, 'review_accuracy'),
        eventData.accuracy
      )
    }

    // 记录复习时间
    if (eventData?.timeSpent !== undefined && typeof eventData.timeSpent === 'number') {
      await abTestingService.recordTestMetric(
        testId,
        variantId,
        this.getMetricId(testId, 'review_time'),
        eventData.timeSpent
      )
    }

    // 记录复习间隔
    if (eventData?.interval !== undefined && typeof eventData.interval === 'number') {
      await abTestingService.recordTestMetric(
        testId,
        variantId,
        this.getMetricId(testId, 'review_interval'),
        eventData.interval
      )
    }
  }

  /**
   * 记录记忆内容创建相关指标
   */
  private async recordMemoryMetrics(event: GamificationEvent, testId: string, variantId: string): Promise<void> {
    const eventData = event.data as Record<string, unknown> | null | undefined

    // 记录创建的记忆内容数量
    await abTestingService.recordTestMetric(
      testId,
      variantId,
      this.getMetricId(testId, 'memory_created'),
      1
    )

    // 记录内容难度分布
    if (eventData?.difficulty !== undefined && typeof eventData.difficulty === 'number') {
      await abTestingService.recordTestMetric(
        testId,
        variantId,
        this.getMetricId(testId, 'memory_difficulty'),
        eventData.difficulty
      )
    }

    // 记录内容类别分布
    if (eventData?.category !== undefined && typeof eventData.category === 'string') {
      await abTestingService.recordTestMetric(
        testId,
        variantId,
        this.getMetricId(testId, 'category_diversity'),
        1
      )
    }
  }

  /**
   * 记录连续学习相关指标
   */
  private async recordStreakMetrics(event: GamificationEvent, testId: string, variantId: string): Promise<void> {
    const eventData = event.data as Record<string, unknown> | null | undefined

    // 记录连续学习天数
    if (eventData?.currentStreak !== undefined && typeof eventData.currentStreak === 'number') {
      await abTestingService.recordTestMetric(
        testId,
        variantId,
        this.getMetricId(testId, 'current_streak'),
        eventData.currentStreak
      )
    }

    // 记录最长连续学习天数
    if (eventData?.longestStreak !== undefined && typeof eventData.longestStreak === 'number') {
      await abTestingService.recordTestMetric(
        testId,
        variantId,
        this.getMetricId(testId, 'longest_streak'),
        eventData.longestStreak
      )
    }

    // 记录连续学习保持率
    if (eventData?.retentionRate !== undefined && typeof eventData.retentionRate === 'number') {
      await abTestingService.recordTestMetric(
        testId,
        variantId,
        this.getMetricId(testId, 'streak_retention'),
        eventData.retentionRate
      )
    }
  }

  /**
   * 记录等级提升相关指标
   */
  private async recordLevelMetrics(event: GamificationEvent, testId: string, variantId: string): Promise<void> {
    const eventData = event.data as Record<string, unknown> | null | undefined

    // 记录等级提升次数
    await abTestingService.recordTestMetric(
      testId,
      variantId,
      this.getMetricId(testId, 'level_up_count'),
      1
    )

    // 记录当前等级
    if (eventData?.currentLevel !== undefined && typeof eventData.currentLevel === 'number') {
      await abTestingService.recordTestMetric(
        testId,
        variantId,
        this.getMetricId(testId, 'current_level'),
        eventData.currentLevel
      )
    }

    // 记录升级所需时间
    if (eventData?.timeToLevelUp !== undefined && typeof eventData.timeToLevelUp === 'number') {
      await abTestingService.recordTestMetric(
        testId,
        variantId,
        this.getMetricId(testId, 'time_to_level_up'),
        eventData.timeToLevelUp
      )
    }
  }

  /**
   * 记录成就解锁相关指标
   */
  private async recordAchievementMetrics(event: GamificationEvent, testId: string, variantId: string): Promise<void> {
    const eventData = event.data as Record<string, unknown> | null | undefined

    // 记录成就解锁次数
    await abTestingService.recordTestMetric(
      testId,
      variantId,
      this.getMetricId(testId, 'achievement_unlocked'),
      1
    )

    // 记录成就解锁率
    if (eventData?.unlockRate !== undefined && typeof eventData.unlockRate === 'number') {
      await abTestingService.recordTestMetric(
        testId,
        variantId,
        this.getMetricId(testId, 'achievement_unlock_rate'),
        eventData.unlockRate
      )
    }

    // 记录成就类别分布
    if (eventData?.category !== undefined && typeof eventData.category === 'string') {
      await abTestingService.recordTestMetric(
        testId,
        variantId,
        this.getMetricId(testId, `achievement_${eventData.category}`),
        1
      )
    }

    // 记录成就解锁时间
    if (eventData?.timeToUnlock !== undefined && typeof eventData.timeToUnlock === 'number') {
      await abTestingService.recordTestMetric(
        testId,
        variantId,
        this.getMetricId(testId, 'time_to_unlock_achievement'),
        eventData.timeToUnlock
      )
    }
  }

  /**
   * 记录挑战完成相关指标
   */
  private async recordChallengeMetrics(event: GamificationEvent, testId: string, variantId: string): Promise<void> {
    const eventData = event.data as Record<string, unknown> | null | undefined

    // 记录挑战完成次数
    await abTestingService.recordTestMetric(
      testId,
      variantId,
      this.getMetricId(testId, 'challenge_completed'),
      1
    )

    // 记录挑战完成率
    if (eventData?.completionRate !== undefined && typeof eventData.completionRate === 'number') {
      await abTestingService.recordTestMetric(
        testId,
        variantId,
        this.getMetricId(testId, 'challenge_completion_rate'),
        eventData.completionRate
      )
    }

    // 记录挑战难度偏好
    if (eventData?.difficulty !== undefined && typeof eventData.difficulty === 'number') {
      await abTestingService.recordTestMetric(
        testId,
        variantId,
        this.getMetricId(testId, 'challenge_difficulty'),
        eventData.difficulty
      )
    }

    // 记录挑战完成时间
    if (eventData?.completionTime !== undefined && typeof eventData.completionTime === 'number') {
      await abTestingService.recordTestMetric(
        testId,
        variantId,
        this.getMetricId(testId, 'challenge_completion_time'),
        eventData.completionTime
      )
    }
  }

  /**
   * 记录积分相关指标
   */
  private async recordPointsMetrics(event: GamificationEvent, testId: string, variantId: string): Promise<void> {
    const eventData = event.data as Record<string, unknown> | null | undefined

    // 记录获得积分数
    if (eventData?.points !== undefined && typeof eventData.points === 'number') {
      await abTestingService.recordTestMetric(
        testId,
        variantId,
        this.getMetricId(testId, 'points_earned'),
        eventData.points
      )
    }

    // 记录积分获取率
    if (eventData?.earningRate !== undefined && typeof eventData.earningRate === 'number') {
      await abTestingService.recordTestMetric(
        testId,
        variantId,
        this.getMetricId(testId, 'points_earning_rate'),
        eventData.earningRate
      )
    }

    // 记录积分来源分布
    if (eventData?.source !== undefined && typeof eventData.source === 'string') {
      await abTestingService.recordTestMetric(
        testId,
        variantId,
        this.getMetricId(testId, `points_from_${eventData.source}`),
        typeof eventData.points === 'number' ? eventData.points : 1
      )
    }

    // 记录积分使用情况
    if (eventData?.spent !== undefined && typeof eventData.spent === 'number') {
      await abTestingService.recordTestMetric(
        testId,
        variantId,
        this.getMetricId(testId, 'points_spent'),
        eventData.spent
      )
    }
  }

  /**
   * 获取指标ID（简化版，实际可能需要更复杂的逻辑）
   */
  private getMetricId(testId: string, metricName: string): string {
    // 在实际应用中，这里可能需要查询数据库来获取正确的指标ID
    // 为了简化，我们使用一个映射或约定来生成指标ID
    return `${testId}_${metricName}`
  }
}

// 导出单例实例
export const gamificationABTestingConfigService = new GamificationABTestingConfigService()