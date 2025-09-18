import { gamificationABTestingConfigService } from '@/services/gamificationABTestingConfig.service'
import { ChallengeType } from '@prisma/client'

/**
 * 挑战拦截器
 * 负责拦截挑战相关的操作，并根据A/B测试配置动态调整挑战行为
 */
export class ChallengeInterceptor {
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
   * 获取挑战统计
   */
  async getChallengeStats(userId: string, days: number = 30): Promise<{
    totalChallenges: number
    completedChallenges: number
    completionRate: number
    averageCompletionTime: number
    byType: Record<string, { total: number; completed: number }>
  }> {
    // 获取用户的A/B测试配置
    const config = await gamificationABTestingConfigService.getUserGamificationABTestConfig(userId)
    
    const progressMultiplier = config.challengeProgressMultiplier && typeof config.challengeProgressMultiplier === 'number'
      ? config.challengeProgressMultiplier
      : 1
    
    const completionThreshold = config.challengeCompletionThreshold && typeof config.challengeCompletionThreshold === 'number'
      ? config.challengeCompletionThreshold
      : 100
    
    // 模拟数据
    const totalChallenges = 20 // 这里应该是从数据库获取的实际值
    const originalCompleted = 12 // 原始完成数量
    const adjustedCompleted = Math.min(totalChallenges, Math.round(originalCompleted * progressMultiplier))
    
    // 考虑完成阈值调整
    const completedChallenges = adjustedCompleted * (completionThreshold / 100)
    const completionRate = completedChallenges / totalChallenges
    const averageCompletionTime = Math.floor(Math.random() * 5) + 2 // 2-7天的平均完成时间
    
    const byType: Record<string, { total: number; completed: number }> = {
      'REVIEW_COUNT': { total: 8, completed: Math.round(5 * progressMultiplier * (completionThreshold / 100)) },
      'MEMORY_CREATED': { total: 6, completed: Math.round(4 * progressMultiplier * (completionThreshold / 100)) },
      'CATEGORY_FOCUS': { total: 4, completed: Math.round(2 * progressMultiplier * (completionThreshold / 100)) },
      'REVIEW_ACCURACY': { total: 2, completed: Math.round(1 * progressMultiplier * (completionThreshold / 100)) }
    }
    
    return {
      totalChallenges,
      completedChallenges,
      completionRate,
      averageCompletionTime,
      byType
    }
  }

  /**
   * 获取挑战调整配置
   */
  async getChallengeAdjustmentConfig(userId: string): Promise<{
    progressMultiplier: number | null
    completionThreshold: number | null
    targetAdjustment: number | null
    pointsAdjustment: number | null
    typeAdjustments: Record<string, Record<string, unknown>> | null
  }> {
    // 获取用户的A/B测试配置
    const config = await gamificationABTestingConfigService.getUserGamificationABTestConfig(userId)
    
    const progressMultiplier = config.challengeProgressMultiplier && typeof config.challengeProgressMultiplier === 'number'
      ? config.challengeProgressMultiplier
      : null
    
    const completionThreshold = config.challengeCompletionThreshold && typeof config.challengeCompletionThreshold === 'number'
      ? config.challengeCompletionThreshold
      : null
    
    const targetAdjustment = config.challengeTargetAdjustment && typeof config.challengeTargetAdjustment === 'number'
      ? config.challengeTargetAdjustment
      : null
    
    const pointsAdjustment = config.challengePointsAdjustment && typeof config.challengePointsAdjustment === 'number'
      ? config.challengePointsAdjustment
      : null
    
    const typeAdjustments = config.challengeTypeAdjustments && typeof config.challengeTypeAdjustments === 'object'
      ? config.challengeTypeAdjustments as Record<string, Record<string, unknown>>
      : null
    
    return {
      progressMultiplier,
      completionThreshold,
      targetAdjustment,
      pointsAdjustment,
      typeAdjustments
    }
  }

  /**
   * 获取挑战完成趋势
   */
  async getChallengeCompletionTrends(userId: string, days: number = 30): Promise<Array<{
    date: string
    completedChallenges: number
    totalChallenges: number
    completionRate: number
  }>> {
    // 获取用户的A/B测试配置
    const config = await gamificationABTestingConfigService.getUserGamificationABTestConfig(userId)
    
    const progressMultiplier = config.challengeProgressMultiplier && typeof config.challengeProgressMultiplier === 'number'
      ? config.challengeProgressMultiplier
      : 1
    
    const completionThreshold = config.challengeCompletionThreshold && typeof config.challengeCompletionThreshold === 'number'
      ? config.challengeCompletionThreshold
      : 100
    
    // 生成模拟趋势数据
    const trends: Array<{
      date: string
      completedChallenges: number
      totalChallenges: number
      completionRate: number
    }> = []
    
    for (let i = 0; i < days; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      // 模拟每日挑战完成情况
      const totalChallenges = Math.floor(Math.random() * 3) + 1 // 1-3个挑战
      const originalCompleted = Math.floor(Math.random() * totalChallenges) // 0-totalChallenges之间的完成数
      const adjustedCompleted = Math.min(totalChallenges, Math.round(originalCompleted * progressMultiplier))
      
      // 考虑完成阈值调整
      const completedChallenges = adjustedCompleted * (completionThreshold / 100)
      const completionRate = totalChallenges > 0 ? completedChallenges / totalChallenges : 0
      
      trends.unshift({
        date: dateStr,
        completedChallenges,
        totalChallenges,
        completionRate
      })
    }
    
    return trends
  }

  /**
   * 获取挑战完成排行榜
   */
  async getChallengeCompletionLeaderboard(period: 'daily' | 'weekly' | 'monthly' | 'all_time', type: 'completion' | 'points' | 'streak', limit: number = 10): Promise<Array<{
    userId: string
    username: string
    avatar?: string | null
    value: number
    rank: number
  }>> {
    // 模拟数据
    const leaderboardData = Array.from({ length: limit }, (_, index) => {
      let value: number
      
      switch (type) {
        case 'completion':
          value = Math.random() * 0.5 + 0.5 // 0.5-1.0之间的完成率
          break
        case 'points':
          value = Math.floor(Math.random() * 500) + 100 // 100-600之间的积分
          break
        case 'streak':
          value = Math.floor(Math.random() * 10) + 1 // 1-10之间的连续完成天数
          break
        default:
          value = Math.random() * 100
      }
      
      return {
        userId: `user_${index + 1}`,
        username: `用户${index + 1}`,
        avatar: null,
        value
      }
    })
    
    // 按值排序
    leaderboardData.sort((a, b) => b.value - a.value)
    
    // 添加排名
    return leaderboardData.map((data, index) => ({
      ...data,
      rank: index + 1
    }))
  }

  /**
   * 根据用户行为调整挑战难度
   */
  async adjustChallengeDifficulty(
    userId: string,
    baseDifficulty: number,
    performanceData: {
      completionRate?: number
      averageTime?: number
      successRate?: number
    }
  ): Promise<number> {
    // 获取用户的A/B测试配置
    const config = await gamificationABTestingConfigService.getUserGamificationABTestConfig(userId)
    
    let adjustedDifficulty = baseDifficulty
    
    // 根据完成率调整难度
    if (performanceData.completionRate !== undefined && typeof performanceData.completionRate === 'number') {
      const difficultyAdjustment = config.difficultyAdjustment && typeof config.difficultyAdjustment === 'number'
        ? config.difficultyAdjustment
        : 0.1 // 默认难度调整系数
      
      if (performanceData.completionRate > 0.8) {
        // 完成率太高，增加难度
        adjustedDifficulty = Math.min(1.0, adjustedDifficulty + difficultyAdjustment)
      } else if (performanceData.completionRate < 0.3) {
        // 完成率太低，降低难度
        adjustedDifficulty = Math.max(0.1, adjustedDifficulty - difficultyAdjustment)
      }
    }
    
    // 根据完成时间调整难度
    if (performanceData.averageTime !== undefined && typeof performanceData.averageTime === 'number') {
      const timeMultiplier = config.timeMultiplier && typeof config.timeMultiplier === 'number'
        ? config.timeMultiplier
        : 0.05 // 默认时间倍率
      
      // 假设理想时间是5秒，实际时间越短，难度可以适当增加
      const idealTime = 5
      const timeDiff = Math.abs(performanceData.averageTime - idealTime)
      const timeAdjustment = Math.max(0, 1 - (timeDiff / idealTime) * timeMultiplier)
      
      adjustedDifficulty = Math.min(1.0, adjustedDifficulty * timeAdjustment)
    }
    
    // 根据成功率调整难度
    if (performanceData.successRate !== undefined && typeof performanceData.successRate === 'number') {
      const successMultiplier = config.successMultiplier && typeof config.successMultiplier === 'number'
        ? config.successMultiplier
        : 0.1 // 默认成功率倍率
      
      if (performanceData.successRate > 0.9) {
        // 成功率太高，增加难度
        adjustedDifficulty = Math.min(1.0, adjustedDifficulty + successMultiplier)
      } else if (performanceData.successRate < 0.5) {
        // 成功率太低，降低难度
        adjustedDifficulty = Math.max(0.1, adjustedDifficulty - successMultiplier)
      }
    }
    
    return adjustedDifficulty
  }
}

// 导出单例实例
export const challengeInterceptor = new ChallengeInterceptor()