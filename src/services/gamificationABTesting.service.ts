import { abTestingService } from './abTesting.service'
import { GamificationEvent } from '@/types'

/**
 * 游戏化A/B测试集成服务
 * 负责将游戏化事件与A/B测试系统集成
 */
export class GamificationABTestingService {
  /**
   * 处理游戏化事件并记录相关A/B测试指标
   */
  async handleGamificationEvent(event: GamificationEvent): Promise<void> {
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
        await this.recordPointsMetrics(event, testId, variantId)
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
    const eventData = event.data as any
    
    // 记录复习次数
    await abTestingService.recordTestMetric(
      testId,
      variantId,
      this.getMetricId(testId, 'review_count'),
      1
    )

    // 记录复习准确率
    if (eventData.accuracy !== undefined) {
      await abTestingService.recordTestMetric(
        testId,
        variantId,
        this.getMetricId(testId, 'review_accuracy'),
        eventData.accuracy
      )
    }

    // 记录复习时间
    if (eventData.timeSpent !== undefined) {
      await abTestingService.recordTestMetric(
        testId,
        variantId,
        this.getMetricId(testId, 'review_time'),
        eventData.timeSpent
      )
    }

    // 记录复习间隔
    if (eventData.interval !== undefined) {
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
    const eventData = event.data as any

    // 记录创建的记忆内容数量
    await abTestingService.recordTestMetric(
      testId,
      variantId,
      this.getMetricId(testId, 'memory_created'),
      1
    )

    // 记录内容难度分布
    if (eventData.difficulty !== undefined) {
      await abTestingService.recordTestMetric(
        testId,
        variantId,
        this.getMetricId(testId, 'memory_difficulty'),
        eventData.difficulty
      )
    }

    // 记录内容类别分布
    if (eventData.category !== undefined) {
      // 这里可能需要更复杂的逻辑来处理类别指标
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
    const eventData = event.data as any

    // 记录连续学习天数
    if (eventData.currentStreak !== undefined) {
      await abTestingService.recordTestMetric(
        testId,
        variantId,
        this.getMetricId(testId, 'current_streak'),
        eventData.currentStreak
      )
    }

    // 记录最长连续学习天数
    if (eventData.longestStreak !== undefined) {
      await abTestingService.recordTestMetric(
        testId,
        variantId,
        this.getMetricId(testId, 'longest_streak'),
        eventData.longestStreak
      )
    }

    // 记录连续学习保持率
    if (eventData.retentionRate !== undefined) {
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
    const eventData = event.data as any

    // 记录等级提升次数
    await abTestingService.recordTestMetric(
      testId,
      variantId,
      this.getMetricId(testId, 'level_up_count'),
      1
    )

    // 记录当前等级
    if (eventData.currentLevel !== undefined) {
      await abTestingService.recordTestMetric(
        testId,
        variantId,
        this.getMetricId(testId, 'current_level'),
        eventData.currentLevel
      )
    }

    // 记录升级所需时间
    if (eventData.timeToLevelUp !== undefined) {
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
    const eventData = event.data as any

    // 记录成就解锁次数
    await abTestingService.recordTestMetric(
      testId,
      variantId,
      this.getMetricId(testId, 'achievement_unlocked'),
      1
    )

    // 记录成就解锁率
    if (eventData.unlockRate !== undefined) {
      await abTestingService.recordTestMetric(
        testId,
        variantId,
        this.getMetricId(testId, 'achievement_unlock_rate'),
        eventData.unlockRate
      )
    }

    // 记录成就类别分布
    if (eventData.category !== undefined) {
      await abTestingService.recordTestMetric(
        testId,
        variantId,
        this.getMetricId(testId, `achievement_${eventData.category}`),
        1
      )
    }

    // 记录成就解锁时间
    if (eventData.timeToUnlock !== undefined) {
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
    const eventData = event.data as any

    // 记录挑战完成次数
    await abTestingService.recordTestMetric(
      testId,
      variantId,
      this.getMetricId(testId, 'challenge_completed'),
      1
    )

    // 记录挑战完成率
    if (eventData.completionRate !== undefined) {
      await abTestingService.recordTestMetric(
        testId,
        variantId,
        this.getMetricId(testId, 'challenge_completion_rate'),
        eventData.completionRate
      )
    }

    // 记录挑战难度偏好
    if (eventData.difficulty !== undefined) {
      await abTestingService.recordTestMetric(
        testId,
        variantId,
        this.getMetricId(testId, 'challenge_difficulty'),
        eventData.difficulty
      )
    }

    // 记录挑战完成时间
    if (eventData.completionTime !== undefined) {
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
    const eventData = event.data as any

    // 记录获得积分数
    if (eventData.points !== undefined) {
      await abTestingService.recordTestMetric(
        testId,
        variantId,
        this.getMetricId(testId, 'points_earned'),
        eventData.points
      )
    }

    // 记录积分获取率
    if (eventData.earningRate !== undefined) {
      await abTestingService.recordTestMetric(
        testId,
        variantId,
        this.getMetricId(testId, 'points_earning_rate'),
        eventData.earningRate
      )
    }

    // 记录积分来源分布
    if (eventData.source !== undefined) {
      await abTestingService.recordTestMetric(
        testId,
        variantId,
        this.getMetricId(testId, `points_from_${eventData.source}`),
        eventData.points || 1
      )
    }

    // 记录积分使用情况
    if (eventData.spent !== undefined) {
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

  /**
   * 应用A/B测试配置到游戏化系统
   */
  async applyABTestConfigToGamification(userId: string): Promise<Record<string, unknown>> {
    try {
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

      return config
    } catch (error) {
      console.error('应用A/B测试配置到游戏化系统失败:', error)
      return {}
    }
  }

  /**
   * 获取用户的游戏化A/B测试配置摘要
   */
  async getUserGamificationABTestSummary(userId: string): Promise<Record<string, any>> {
    try {
      // 获取用户的所有测试分配
      const userTests = await abTestingService.getUserTestAssignments(userId)

      const summary: Record<string, any> = {}

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
    } catch (error) {
      console.error('获取用户游戏化A/B测试摘要失败:', error)
      return {}
    }
  }

  /**
   * 创建游戏化相关的预设测试
   */
  async createGamificationABTestPresets(): Promise<void> {
    try {
      await abTestingService.createGamificationPresets()
    } catch (error) {
      console.error('创建游戏化A/B测试预设失败:', error)
    }
  }
}

// 导出单例实例
export const gamificationABTestingService = new GamificationABTestingService()