import { gamificationABTestingConfigService } from './gamificationABTestingConfig.service'
import { gamificationService } from './gamification.service'
import { GamificationEvent } from '@/types'
import { PointTransactionType, ChallengeType, AchievementType } from '@prisma/client'

/**
 * 游戏化行为拦截器
 * 负责拦截游戏化系统的调用，并根据A/B测试配置动态调整游戏化行为
 */
export class GamificationABTestingInterceptorService {
  /**
   * 拦截添加积分操作
   */
  async interceptAddPoints(
    userId: string,
    originalAmount: number,
    type: PointTransactionType,
    description: string
  ): Promise<{ amount: number; type: PointTransactionType; description: string }> {
    // 获取用户的A/B测试配置
    const config = await gamificationABTestingConfigService.getUserGamificationABTestConfig(userId)
    
    // 应用A/B测试配置
    let adjustedAmount = originalAmount
    const adjustedType = type
    const adjustedDescription = description
    
    // 检查是否有积分倍率配置
    if (config.pointsMultiplier && typeof config.pointsMultiplier === 'number') {
      adjustedAmount = Math.round(originalAmount * config.pointsMultiplier)
    }
    
    // 检查是否有特定类型的积分调整
    if (config.pointsAdjustments && typeof config.pointsAdjustments === 'object') {
      const typeAdjustments = config.pointsAdjustments as Record<string, number>
      if (typeAdjustments[type]) {
        adjustedAmount = Math.round(originalAmount * typeAdjustments[type])
      }
    }
    
    // 检查是否有积分上限配置
    if (config.maxPointsPerTransaction && typeof config.maxPointsPerTransaction === 'number') {
      adjustedAmount = Math.min(adjustedAmount, config.maxPointsPerTransaction)
    }
    
    // 记录原始事件用于A/B测试分析
    await gamificationABTestingConfigService.recordGamificationEvent({
      type: 'POINTS_EARNED',
      userId,
      data: {
        originalAmount,
        adjustedAmount,
        type,
        source: description
      },
      timestamp: new Date()
    } as unknown as GamificationEvent)
    
    return {
      amount: adjustedAmount,
      type: adjustedType,
      description: adjustedDescription
    }
  }

  /**
   * 拦截添加经验值操作
   */
  async interceptAddExperience(
    userId: string,
    originalAmount: number
  ): Promise<number> {
    // 获取用户的A/B测试配置
    const config = await gamificationABTestingConfigService.getUserGamificationABTestConfig(userId)
    
    // 应用A/B测试配置
    let adjustedAmount = originalAmount
    
    // 检查是否有经验倍率配置
    if (config.experienceMultiplier && typeof config.experienceMultiplier === 'number') {
      adjustedAmount = Math.round(originalAmount * config.experienceMultiplier)
    }
    
    // 检查是否有经验上限配置
    if (config.maxExperiencePerAction && typeof config.maxExperiencePerAction === 'number') {
      adjustedAmount = Math.min(adjustedAmount, config.maxExperiencePerAction)
    }
    
    return adjustedAmount
  }

  /**
   * 拦截等级计算操作
   */
  async interceptLevelCalculation(
    userId: string,
    experience: number
  ): Promise<number> {
    // 获取用户的A/B测试配置
    const config = await gamificationABTestingConfigService.getUserGamificationABTestConfig(userId)
    
    // 获取原始等级计算
    const originalLevel = await gamificationService.calculateLevel(experience)
    
    // 应用A/B测试配置
    let adjustedLevel = originalLevel
    
    // 检查是否有等级调整配置
    if (config.levelAdjustment && typeof config.levelAdjustment === 'number') {
      adjustedLevel = Math.max(1, originalLevel + config.levelAdjustment)
    }
    
    // 检查是否有等级阈值调整配置
    if (config.levelThresholds && typeof config.levelThresholds === 'object') {
      const thresholds = config.levelThresholds as Record<number, number>
      let adjustedExperience = experience
      
      for (const [level, threshold] of Object.entries(thresholds)) {
        const levelNum = parseInt(level)
        if (originalLevel >= levelNum) {
          adjustedExperience = Math.max(adjustedExperience, threshold)
        }
      }
      
      adjustedLevel = await gamificationService.calculateLevel(adjustedExperience)
    }
    
    return adjustedLevel
  }

  /**
   * 拦截连续学习更新操作
   */
  async interceptStreakUpdate(
    userId: string,
    originalStreak: number
  ): Promise<number> {
    // 获取用户的A/B测试配置
    const config = await gamificationABTestingConfigService.getUserGamificationABTestConfig(userId)
    
    // 应用A/B测试配置
    let adjustedStreak = originalStreak
    
    // 检查是否有连续学习倍率配置
    if (config.streakMultiplier && typeof config.streakMultiplier === 'number') {
      adjustedStreak = Math.round(originalStreak * config.streakMultiplier)
    }
    
    // 检查是否有连续学习奖励配置
    if (config.streakBonus && typeof config.streakBonus === 'number') {
      adjustedStreak += config.streakBonus
    }
    
    // 检查是否有连续学习上限配置
    if (config.maxStreak && typeof config.maxStreak === 'number') {
      adjustedStreak = Math.min(adjustedStreak, config.maxStreak)
    }
    
    // 记录事件用于A/B测试分析
    await gamificationABTestingConfigService.recordGamificationEvent({
      type: 'STREAK_UPDATED',
      userId,
      data: {
        originalStreak,
        adjustedStreak
      },
      timestamp: new Date()
    })
    
    return adjustedStreak
  }

  /**
   * 拦截成就解锁操作
   */
  async interceptAchievementUnlock(
    userId: string,
    achievementId: string,
    originalProgress: number
  ): Promise<{ progress: number; shouldUnlock: boolean }> {
    // 获取用户的A/B测试配置
    const config = await gamificationABTestingConfigService.getUserGamificationABTestConfig(userId)
    
    // 应用A/B测试配置
    let adjustedProgress = originalProgress
    let shouldUnlock = originalProgress >= 100
    
    // 检查是否有成就进度倍率配置
    if (config.achievementProgressMultiplier && typeof config.achievementProgressMultiplier === 'number') {
      adjustedProgress = Math.min(100, Math.round(originalProgress * config.achievementProgressMultiplier))
    }
    
    // 检查是否有成就解锁阈值调整配置
    if (config.achievementUnlockThreshold && typeof config.achievementUnlockThreshold === 'number') {
      shouldUnlock = adjustedProgress >= config.achievementUnlockThreshold
    }
    
    // 检查是否有特定成就的调整配置
    if (config.specificAchievements && typeof config.specificAchievements === 'object') {
      const specificConfigs = config.specificAchievements as Record<string, Record<string, unknown>>
      if (specificConfigs[achievementId]) {
        const achievementConfig = specificConfigs[achievementId]
        
        if (achievementConfig.progressMultiplier && typeof achievementConfig.progressMultiplier === 'number') {
          adjustedProgress = Math.min(100, Math.round(originalProgress * achievementConfig.progressMultiplier))
        }
        
        if (achievementConfig.unlockThreshold && typeof achievementConfig.unlockThreshold === 'number') {
          shouldUnlock = adjustedProgress >= achievementConfig.unlockThreshold
        }
      }
    }
    
    if (shouldUnlock) {
      // 记录事件用于A/B测试分析
      await gamificationABTestingConfigService.recordGamificationEvent({
        type: 'ACHIEVEMENT_UNLOCKED',
        userId,
        data: {
          achievementId,
          originalProgress,
          adjustedProgress,
          timeToUnlock: Date.now() // 简化计算，实际应该基于成就创建时间
        },
        timestamp: new Date()
      })
    }
    
    return {
      progress: adjustedProgress,
      shouldUnlock
    }
  }

  /**
   * 拦截挑战进度更新操作
   */
  async interceptChallengeProgressUpdate(
    userId: string,
    challengeId: string,
    originalProgress: number,
    challengeType: ChallengeType
  ): Promise<{ progress: number; shouldComplete: boolean }> {
    // 获取用户的A/B测试配置
    const config = await gamificationABTestingConfigService.getUserGamificationABTestConfig(userId)
    
    // 应用A/B测试配置
    let adjustedProgress = originalProgress
    let shouldComplete = originalProgress >= 100
    
    // 检查是否有挑战进度倍率配置
    if (config.challengeProgressMultiplier && typeof config.challengeProgressMultiplier === 'number') {
      adjustedProgress = Math.min(100, Math.round(originalProgress * config.challengeProgressMultiplier))
    }
    
    // 检查是否有挑战完成阈值调整配置
    if (config.challengeCompletionThreshold && typeof config.challengeCompletionThreshold === 'number') {
      shouldComplete = adjustedProgress >= config.challengeCompletionThreshold
    }
    
    // 检查是否有特定类型挑战的调整配置
    if (config.challengeTypeAdjustments && typeof config.challengeTypeAdjustments === 'object') {
      const typeAdjustments = config.challengeTypeAdjustments as Record<string, Record<string, unknown>>
      if (typeAdjustments[challengeType]) {
        const typeConfig = typeAdjustments[challengeType]
        
        if (typeConfig.progressMultiplier && typeof typeConfig.progressMultiplier === 'number') {
          adjustedProgress = Math.min(100, Math.round(originalProgress * typeConfig.progressMultiplier))
        }
        
        if (typeConfig.completionThreshold && typeof typeConfig.completionThreshold === 'number') {
          shouldComplete = adjustedProgress >= typeConfig.completionThreshold
        }
      }
    }
    
    if (shouldComplete) {
      // 记录事件用于A/B测试分析
      await gamificationABTestingConfigService.recordGamificationEvent({
        type: 'CHALLENGE_COMPLETED',
        userId,
        data: {
          challengeId,
          challengeType,
          originalProgress,
          adjustedProgress,
          completionTime: Date.now() // 简化计算，实际应该基于挑战开始时间
        },
        timestamp: new Date()
      })
    }
    
    return {
      progress: adjustedProgress,
      shouldComplete
    }
  }

  /**
   * 拦截挑战创建操作
   */
  async interceptChallengeCreation(
    userId: string,
    originalTarget: number,
    originalPoints: number,
    challengeType: ChallengeType
  ): Promise<{ target: number; points: number }> {
    // 获取用户的A/B测试配置
    const config = await gamificationABTestingConfigService.getUserGamificationABTestConfig(userId)
    
    // 应用A/B测试配置
    let adjustedTarget = originalTarget
    let adjustedPoints = originalPoints
    
    // 检查是否有挑战目标调整配置
    if (config.challengeTargetAdjustment && typeof config.challengeTargetAdjustment === 'number') {
      adjustedTarget = Math.max(1, Math.round(originalTarget * config.challengeTargetAdjustment))
    }
    
    // 检查是否有挑战积分调整配置
    if (config.challengePointsAdjustment && typeof config.challengePointsAdjustment === 'number') {
      adjustedPoints = Math.round(originalPoints * config.challengePointsAdjustment)
    }
    
    // 检查是否有特定类型挑战的调整配置
    if (config.challengeTypeAdjustments && typeof config.challengeTypeAdjustments === 'object') {
      const typeAdjustments = config.challengeTypeAdjustments as Record<string, Record<string, unknown>>
      if (typeAdjustments[challengeType]) {
        const typeConfig = typeAdjustments[challengeType]
        
        if (typeConfig.targetAdjustment && typeof typeConfig.targetAdjustment === 'number') {
          adjustedTarget = Math.max(1, Math.round(originalTarget * typeConfig.targetAdjustment))
        }
        
        if (typeConfig.pointsAdjustment && typeof typeConfig.pointsAdjustment === 'number') {
          adjustedPoints = Math.round(originalPoints * typeConfig.pointsAdjustment)
        }
      }
    }
    
    return {
      target: adjustedTarget,
      points: adjustedPoints
    }
  }

  /**
   * 拦截排行榜显示操作
   */
  async interceptLeaderboardDisplay(
    userId: string,
    originalLeaderboardType: string,
    originalLimit: number
  ): Promise<{ leaderboardType: string; limit: number; filters: Record<string, unknown> }> {
    // 获取用户的A/B测试配置
    const config = await gamificationABTestingConfigService.getUserGamificationABTestConfig(userId)
    
    // 应用A/B测试配置
    let adjustedLeaderboardType = originalLeaderboardType
    let adjustedLimit = originalLimit
    const filters: Record<string, unknown> = {}
    
    // 检查是否有排行榜类型配置
    if (config.leaderboardType && typeof config.leaderboardType === 'string') {
      adjustedLeaderboardType = config.leaderboardType
    }
    
    // 检查是否有排行榜显示数量配置
    if (config.leaderboardLimit && typeof config.leaderboardLimit === 'number') {
      adjustedLimit = config.leaderboardLimit
    }
    
    // 检查是否有社交排行榜配置
    if (config.socialLeaderboard && config.socialLeaderboard === true) {
      filters.onlyFriends = true
      filters.similarUsers = true
    }
    
    // 检查是否有排行榜过滤配置
    if (config.leaderboardFilters && typeof config.leaderboardFilters === 'object') {
      Object.assign(filters, config.leaderboardFilters)
    }
    
    return {
      leaderboardType: adjustedLeaderboardType,
      limit: adjustedLimit,
      filters
    }
  }

  /**
   * 拦截复习完成操作
   */
  async interceptReviewCompletion(
    userId: string,
    reviewData: { isCompleted: boolean; accuracy?: number; timeSpent?: number }
  ): Promise<void> {
    // 获取用户的A/B测试配置
    const config = await gamificationABTestingConfigService.getUserGamificationABTestConfig(userId)
    
    // 记录原始事件用于A/B测试分析
    await gamificationABTestingConfigService.recordGamificationEvent({
      type: 'REVIEW_COMPLETED',
      userId,
      data: {
        isCompleted: reviewData.isCompleted,
        accuracy: reviewData.accuracy,
        timeSpent: reviewData.timeSpent
      },
      timestamp: new Date()
    })
    
    // 根据配置执行额外的操作
    if (config.enableReviewNotifications && config.enableReviewNotifications === true) {
      // 可以在这里添加通知逻辑
    }
    
    if (config.reviewFeedbackEnabled && config.reviewFeedbackEnabled === true) {
      // 可以在这里添加反馈逻辑
    }
  }

  /**
   * 拦截记忆内容创建操作
   */
  async interceptMemoryCreation(
    userId: string,
    memoryData: { difficulty: number; category: string }
  ): Promise<void> {
    // 获取用户的A/B测试配置
    const config = await gamificationABTestingConfigService.getUserGamificationABTestConfig(userId)
    
    // 记录原始事件用于A/B测试分析
    await gamificationABTestingConfigService.recordGamificationEvent({
      type: 'MEMORY_CREATED',
      userId,
      data: {
        difficulty: memoryData.difficulty,
        category: memoryData.category
      },
      timestamp: new Date()
    })
    
    // 根据配置执行额外的操作
    if (config.enableMemoryCreationTips && config.enableMemoryCreationTips === true) {
      // 可以在这里添加提示逻辑
    }
    
    if (config.memoryDifficultyAdjustment && typeof config.memoryDifficultyAdjustment === 'number') {
      // 可以在这里添加难度调整逻辑
    }
  }
}

// 导出单例实例
export const gamificationABTestingInterceptorService = new GamificationABTestingInterceptorService()