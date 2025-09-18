import { gamificationABTestingConfigService } from '@/services/gamificationABTestingConfig.service'

/**
 * 成就拦截器
 * 负责拦截成就相关的操作，并根据A/B测试配置动态调整成就行为
 */
export class AchievementInterceptor {
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
   * 获取成就统计
   */
  async getAchievementStats(userId: string, days: number = 30): Promise<{
    totalAchievements: number
    unlockedAchievements: number
    unlockedRate: number
    averageUnlockTime: number
    byCategory: Record<string, { total: number; unlocked: number }>
  }> {
    // 获取用户的A/B测试配置
    const config = await gamificationABTestingConfigService.getUserGamificationABTestConfig(userId)
    
    const progressMultiplier = config.achievementProgressMultiplier && typeof config.achievementProgressMultiplier === 'number'
      ? config.achievementProgressMultiplier
      : 1
    
    // 模拟数据
    const totalAchievements = 50 // 这里应该是从数据库获取的实际值
    const originalUnlocked = 20 // 原始解锁数量
    const unlockedAchievements = Math.min(totalAchievements, Math.round(originalUnlocked * progressMultiplier))
    const unlockedRate = unlockedAchievements / totalAchievements
    const averageUnlockTime = Math.floor(Math.random() * 10) + 5 // 5-15天的平均解锁时间
    
    const byCategory: Record<string, { total: number; unlocked: number }> = {
      '学习': { total: 15, unlocked: Math.round(8 * progressMultiplier) },
      '挑战': { total: 12, unlocked: Math.round(5 * progressMultiplier) },
      '连续学习': { total: 10, unlocked: Math.round(3 * progressMultiplier) },
      '社交': { total: 8, unlocked: Math.round(2 * progressMultiplier) },
      '其他': { total: 5, unlocked: Math.round(2 * progressMultiplier) }
    }
    
    return {
      totalAchievements,
      unlockedAchievements,
      unlockedRate,
      averageUnlockTime,
      byCategory
    }
  }

  /**
   * 获取成就调整配置
   */
  async getAchievementAdjustmentConfig(userId: string): Promise<{
    progressMultiplier: number | null
    unlockThreshold: number | null
    specificAchievements: Record<string, Record<string, unknown>> | null
    achievementVisibility: Record<string, boolean> | null
  }> {
    // 获取用户的A/B测试配置
    const config = await gamificationABTestingConfigService.getUserGamificationABTestConfig(userId)
    
    const progressMultiplier = config.achievementProgressMultiplier && typeof config.achievementProgressMultiplier === 'number'
      ? config.achievementProgressMultiplier
      : null
    
    const unlockThreshold = config.achievementUnlockThreshold && typeof config.achievementUnlockThreshold === 'number'
      ? config.achievementUnlockThreshold
      : null
    
    const specificAchievements = config.specificAchievements && typeof config.specificAchievements === 'object'
      ? config.specificAchievements as Record<string, Record<string, unknown>>
      : null
    
    const achievementVisibility = config.achievementVisibility && typeof config.achievementVisibility === 'object'
      ? config.achievementVisibility as Record<string, boolean>
      : null
    
    return {
      progressMultiplier,
      unlockThreshold,
      specificAchievements,
      achievementVisibility
    }
  }

  /**
   * 获取成就解锁趋势
   */
  async getAchievementUnlockTrends(userId: string, days: number = 30): Promise<Array<{
    date: string
    unlockedAchievements: number
    totalProgress: number
    averageTimeToUnlock: number
  }>> {
    // 获取用户的A/B测试配置
    const config = await gamificationABTestingConfigService.getUserGamificationABTestConfig(userId)
    
    const progressMultiplier = config.achievementProgressMultiplier && typeof config.achievementProgressMultiplier === 'number'
      ? config.achievementProgressMultiplier
      : 1
    
    // 生成模拟趋势数据
    const trends: Array<{
      date: string
      unlockedAchievements: number
      totalProgress: number
      averageTimeToUnlock: number
    }> = []
    
    let cumulativeUnlocked = 0
    let cumulativeProgress = 0
    
    for (let i = 0; i < days; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      // 模拟每日成就解锁情况
      const dailyUnlocked = Math.random() < 0.2 ? 1 : 0 // 20%的概率解锁一个成就
      const dailyProgress = Math.floor(Math.random() * 30) + 10 // 10-40的进度提升
      
      cumulativeUnlocked += dailyUnlocked
      cumulativeProgress = Math.min(100, cumulativeProgress + dailyProgress)
      
      // 模拟平均解锁时间
      const averageTimeToUnlock = Math.floor(Math.random() * 10) + 5 // 5-15天
      
      trends.unshift({
        date: dateStr,
        unlockedAchievements: Math.round(cumulativeUnlocked * progressMultiplier),
        totalProgress: Math.min(100, Math.round(cumulativeProgress * progressMultiplier)),
        averageTimeToUnlock
      })
    }
    
    return trends
  }

  /**
   * 获取成就解锁排行榜
   */
  async getAchievementUnlockLeaderboard(period: 'daily' | 'weekly' | 'monthly' | 'all_time', limit: number = 10): Promise<Array<{
    userId: string
    username: string
    avatar?: string | null
    unlockedAchievements: number
    totalAchievements: number
    unlockRate: number
    rank: number
  }>> {
    // 模拟数据
    const leaderboardData = Array.from({ length: limit }, (_, index) => {
      const totalAchievements = 50
      const unlockedAchievements = Math.floor(Math.random() * 40) + 10 // 10-50之间的解锁成就数
      
      return {
        userId: `user_${index + 1}`,
        username: `用户${index + 1}`,
        avatar: null,
        unlockedAchievements,
        totalAchievements,
        unlockRate: unlockedAchievements / totalAchievements
      }
    })
    
    // 按解锁成就数和解锁率排序
    leaderboardData.sort((a, b) => {
      if (a.unlockedAchievements !== b.unlockedAchievements) {
        return b.unlockedAchievements - a.unlockedAchievements
      }
      return b.unlockRate - a.unlockRate
    })
    
    // 添加排名
    return leaderboardData.map((data, index) => ({
      ...data,
      rank: index + 1
    }))
  }

  /**
   * 获取用户特定成就的解锁情况
   */
  async getAchievementUnlockStatus(
    userId: string,
    achievementIds: string[]
  ): Promise<Array<{
    achievementId: string
    progress: number
    unlocked: boolean
    unlockDate: Date | null
    estimatedUnlockTime: number | null
  }>> {
    // 获取用户的A/B测试配置
    const config = await gamificationABTestingConfigService.getUserGamificationABTestConfig(userId)
    
    const progressMultiplier = config.achievementProgressMultiplier && typeof config.achievementProgressMultiplier === 'number'
      ? config.achievementProgressMultiplier
      : 1
    
    // 模拟数据
    return achievementIds.map(achievementId => {
      // 随机生成进度和解锁状态
      const baseProgress = Math.floor(Math.random() * 100)
      const progress = Math.min(100, Math.round(baseProgress * progressMultiplier))
      const unlocked = progress >= 100
      
      return {
        achievementId,
        progress,
        unlocked,
        unlockDate: unlocked ? new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000) : null,
        estimatedUnlockTime: !unlocked ? Math.floor(Math.random() * 10) + 1 : null
      }
    })
  }
}

// 导出单例实例
export const achievementInterceptor = new AchievementInterceptor()