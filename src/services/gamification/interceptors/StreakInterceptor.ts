import { gamificationABTestingConfigService } from '@/services/gamificationABTestingConfig.service'

/**
 * 连续学习拦截器
 * 负责拦截连续学习相关的操作，并根据A/B测试配置动态调整连续学习行为
 */
export class StreakInterceptor {
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
   * 获取连续学习统计
   */
  async getStreakStats(userId: string, days: number = 30): Promise<{
    currentStreak: number
    originalStreak: number
    longestStreak: number
    totalActiveDays: number
    retentionRate: number
  }> {
    // 获取用户的A/B测试配置
    const config = await gamificationABTestingConfigService.getUserGamificationABTestConfig(userId)
    
    const streakMultiplier = config.streakMultiplier && typeof config.streakMultiplier === 'number'
      ? config.streakMultiplier
      : 1
    
    // 模拟数据
    const originalStreak = 7 // 这里应该是从数据库获取的实际值
    const currentStreak = Math.round(originalStreak * streakMultiplier)
    const longestStreak = Math.max(currentStreak, Math.floor(Math.random() * 30) + 7) // 7-37之间的随机数
    const totalActiveDays = Math.floor(Math.random() * 20) + 10 // 10-30之间的随机数
    const retentionRate = Math.min(0.95, totalActiveDays / days) // 最大95%
    
    return {
      currentStreak,
      originalStreak,
      longestStreak,
      totalActiveDays,
      retentionRate
    }
  }

  /**
   * 获取连续学习调整配置
   */
  async getStreakAdjustmentConfig(userId: string): Promise<{
    streakMultiplier: number | null
    streakBonus: number | null
    maxStreak: number | null
    streakResetThreshold: number | null
  }> {
    // 获取用户的A/B测试配置
    const config = await gamificationABTestingConfigService.getUserGamificationABTestConfig(userId)
    
    const streakMultiplier = config.streakMultiplier && typeof config.streakMultiplier === 'number'
      ? config.streakMultiplier
      : null
    
    const streakBonus = config.streakBonus && typeof config.streakBonus === 'number'
      ? config.streakBonus
      : null
    
    const maxStreak = config.maxStreak && typeof config.maxStreak === 'number'
      ? config.maxStreak
      : null
    
    const streakResetThreshold = config.streakResetThreshold && typeof config.streakResetThreshold === 'number'
      ? config.streakResetThreshold
      : null
    
    return {
      streakMultiplier,
      streakBonus,
      maxStreak,
      streakResetThreshold
    }
  }

  /**
   * 获取连续学习趋势
   */
  async getStreakTrends(userId: string, days: number = 30): Promise<Array<{
    date: string
    streak: number
    active: boolean
    streakExtended: boolean
  }>> {
    // 获取用户的A/B测试配置
    const config = await gamificationABTestingConfigService.getUserGamificationABTestConfig(userId)
    
    const streakMultiplier = config.streakMultiplier && typeof config.streakMultiplier === 'number'
      ? config.streakMultiplier
      : 1
    
    // 生成模拟趋势数据
    const trends: Array<{
      date: string
      streak: number
      active: boolean
      streakExtended: boolean
    }> = []
    
    let currentStreak = 1
    let lastActiveDate: Date | null = null
    
    for (let i = 0; i < days; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      // 模拟用户活跃情况，80%的概率活跃
      const active = Math.random() < 0.8
      let streakExtended = false
      
      if (active) {
        if (lastActiveDate) {
          const daysDiff = Math.floor((date.getTime() - lastActiveDate.getTime()) / (1000 * 60 * 60 * 24))
          if (daysDiff === 1) {
            // 连续学习
            currentStreak += 1
            streakExtended = true
          } else if (daysDiff > 1) {
            // 连续中断，重置
            currentStreak = 1
          }
        } else {
          // 第一次记录
          currentStreak = 1
        }
        lastActiveDate = date
      } else {
        // 检查是否连续中断
        if (lastActiveDate) {
          const daysDiff = Math.floor((date.getTime() - lastActiveDate.getTime()) / (1000 * 60 * 60 * 24))
          if (daysDiff > 1) {
            currentStreak = 0
          }
        }
      }
      
      trends.unshift({
        date: dateStr,
        streak: Math.round(currentStreak * streakMultiplier),
        active,
        streakExtended
      })
    }
    
    return trends
  }

  /**
   * 获取连续学习排行榜
   */
  async getStreakLeaderboard(period: 'daily' | 'weekly' | 'monthly' | 'all_time', limit: number = 10): Promise<Array<{
    userId: string
    username: string
    avatar?: string | null
    streak: number
    retentionRate: number
    rank: number
  }>> {
    // 模拟数据
    const leaderboardData = Array.from({ length: limit }, (_, index) => ({
      userId: `user_${index + 1}`,
      username: `用户${index + 1}`,
      avatar: null,
      streak: Math.floor(Math.random() * 30) + 1, // 1-30之间的随机连续学习天数
      retentionRate: Math.random() * 0.5 + 0.5 // 0.5-1.0之间的随机保留率
    }))
    
    // 按连续学习天数和保留率排序
    leaderboardData.sort((a, b) => {
      if (a.streak !== b.streak) {
        return b.streak - a.streak
      }
      return b.retentionRate - a.retentionRate
    })
    
    // 添加排名
    return leaderboardData.map((data, index) => ({
      ...data,
      rank: index + 1
    }))
  }

  /**
   * 计算连续学习奖励
   */
  async calculateStreakBonus(
    userId: string,
    currentStreak: number,
    baseBonus: number = 10
  ): Promise<number> {
    // 获取用户的A/B测试配置
    const config = await gamificationABTestingConfigService.getUserGamificationABTestConfig(userId)
    
    let bonus = baseBonus
    
    // 应用连续学习倍数奖励
    if (config.streakBonusMultiplier && typeof config.streakBonusMultiplier === 'number') {
      bonus = Math.round(bonus * config.streakBonusMultiplier)
    }
    
    // 应用连续学习天数奖励
    if (config.streakDayBonus && typeof config.streakDayBonus === 'object') {
      const dayBonus = config.streakDayBonus as Record<number, number>
      
      // 查找最接近的连续学习天数奖励
      const streakDays = Object.keys(dayBonus).map(Number).sort((a, b) => b - a)
      for (const day of streakDays) {
        if (currentStreak >= day) {
          bonus += dayBonus[day]
          break
        }
      }
    }
    
    // 应用连续学习上限
    if (config.maxStreakBonus && typeof config.maxStreakBonus === 'number') {
      bonus = Math.min(bonus, config.maxStreakBonus)
    }
    
    return bonus
  }
}

// 导出单例实例
export const streakInterceptor = new StreakInterceptor()