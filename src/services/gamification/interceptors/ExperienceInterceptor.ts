import { gamificationABTestingConfigService } from '@/services/gamificationABTestingConfig.service'

/**
 * 经验值拦截器
 * 负责拦截经验值相关的操作，并根据A/B测试配置动态调整经验值行为
 */
export class ExperienceInterceptor {
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
   * 获取经验值统计
   */
  async getExperienceStats(userId: string, days: number = 30): Promise<{
    totalExperience: number
    adjustedExperience: number
    averageMultiplier: number
    dailyAverage: number
  }> {
    // 获取用户的A/B测试配置
    const config = await gamificationABTestingConfigService.getUserGamificationABTestConfig(userId)
    
    const experienceMultiplier = config.experienceMultiplier && typeof config.experienceMultiplier === 'number'
      ? config.experienceMultiplier
      : 1
    
    // 模拟数据
    const totalExperience = 2000 // 这里应该是从数据库获取的实际值
    const adjustedExperience = Math.round(totalExperience * experienceMultiplier)
    const averageMultiplier = experienceMultiplier
    const dailyAverage = Math.round(totalExperience / days)
    
    return {
      totalExperience,
      adjustedExperience,
      averageMultiplier,
      dailyAverage
    }
  }

  /**
   * 获取经验值倍率配置
   */
  async getExperienceMultiplierConfig(userId: string): Promise<{
    multiplier: number | null
    maxExperiencePerAction: number | null
    bonusExperience: number | null
  }> {
    // 获取用户的A/B测试配置
    const config = await gamificationABTestingConfigService.getUserGamificationABTestConfig(userId)
    
    const multiplier = config.experienceMultiplier && typeof config.experienceMultiplier === 'number'
      ? config.experienceMultiplier
      : null
    
    const maxExperiencePerAction = config.maxExperiencePerAction && typeof config.maxExperiencePerAction === 'number'
      ? config.maxExperiencePerAction
      : null
    
    const bonusExperience = config.bonusExperience && typeof config.bonusExperience === 'number'
      ? config.bonusExperience
      : null
    
    return {
      multiplier,
      maxExperiencePerAction,
      bonusExperience
    }
  }

  /**
   * 获取经验值倍率趋势
   */
  async getExperienceMultiplierTrends(userId: string, days: number = 30): Promise<Array<{
    date: string
    multiplier: number
    experienceEarned: number
    adjustedExperience: number
  }>> {
    // 获取用户的A/B测试配置
    const config = await gamificationABTestingConfigService.getUserGamificationABTestConfig(userId)
    
    const experienceMultiplier = config.experienceMultiplier && typeof config.experienceMultiplier === 'number'
      ? config.experienceMultiplier
      : 1
    
    // 生成模拟趋势数据
    const trends: Array<{
      date: string
      multiplier: number
      experienceEarned: number
      adjustedExperience: number
    }> = []
    
    for (let i = 0; i < days; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      // 模拟每日经验值获取
      const experienceEarned = Math.floor(Math.random() * 100) + 20 // 20-120之间的随机数
      const adjustedExperience = Math.round(experienceEarned * experienceMultiplier)
      
      trends.unshift({
        date: dateStr,
        multiplier: experienceMultiplier,
        experienceEarned,
        adjustedExperience
      })
    }
    
    return trends
  }

  /**
   * 根据用户行为调整经验值
   */
  async adjustExperienceBasedOnBehavior(
    userId: string,
    baseAmount: number,
    behaviorData: {
      accuracy?: number
      timeSpent?: number
      difficulty?: 'easy' | 'medium' | 'hard'
      streak?: number
    }
  ): Promise<number> {
    // 获取用户的A/B测试配置
    const config = await gamificationABTestingConfigService.getUserGamificationABTestConfig(userId)
    
    let adjustedAmount = baseAmount
    
    // 根据准确率调整经验值
    if (behaviorData.accuracy !== undefined && typeof behaviorData.accuracy === 'number') {
      const accuracyBonus = config.accuracyBonus && typeof config.accuracyBonus === 'number'
        ? config.accuracyBonus
        : 0.5 // 默认准确率奖励系数
      
      if (behaviorData.accuracy > 0.8) {
        adjustedAmount = Math.round(adjustedAmount * (1 + accuracyBonus))
      } else if (behaviorData.accuracy < 0.5) {
        adjustedAmount = Math.round(adjustedAmount * (1 - accuracyBonus * 0.5))
      }
    }
    
    // 根据花费时间调整经验值
    if (behaviorData.timeSpent !== undefined && typeof behaviorData.timeSpent === 'number') {
      const timeMultiplier = config.timeMultiplier && typeof config.timeMultiplier === 'number'
        ? config.timeMultiplier
        : 1.0 // 默认时间倍率
      
      // 假设理想时间是30秒，实际时间越接近理想时间，倍率越高
      const idealTime = 30
      const timeDiff = Math.abs(behaviorData.timeSpent - idealTime)
      const timeAdjustment = Math.max(0.5, 1 - (timeDiff / idealTime) * 0.5)
      
      adjustedAmount = Math.round(adjustedAmount * timeMultiplier * timeAdjustment)
    }
    
    // 根据难度调整经验值
    if (behaviorData.difficulty) {
      const difficultyMultipliers = config.difficultyMultipliers && typeof config.difficultyMultipliers === 'object'
        ? config.difficultyMultipliers as Record<string, number>
        : { easy: 0.8, medium: 1.0, hard: 1.5 }
      
      const difficultyMultiplier = difficultyMultipliers[behaviorData.difficulty] || 1.0
      adjustedAmount = Math.round(adjustedAmount * difficultyMultiplier)
    }
    
    // 根据连续学习天数调整经验值
    if (behaviorData.streak !== undefined && typeof behaviorData.streak === 'number') {
      const streakBonus = config.streakBonus && typeof config.streakBonus === 'number'
        ? config.streakBonus
        : 0.1 // 默认连续学习奖励系数
      
      const streakMultiplier = 1 + Math.min(behaviorData.streak * streakBonus, 1.0) // 最多100%奖励
      adjustedAmount = Math.round(adjustedAmount * streakMultiplier)
    }
    
    // 应用全局经验值倍率
    if (config.experienceMultiplier && typeof config.experienceMultiplier === 'number') {
      adjustedAmount = Math.round(adjustedAmount * config.experienceMultiplier)
    }
    
    // 应用经验值上限
    if (config.maxExperiencePerAction && typeof config.maxExperiencePerAction === 'number') {
      adjustedAmount = Math.min(adjustedAmount, config.maxExperiencePerAction)
    }
    
    return adjustedAmount
  }
}

// 导出单例实例
export const experienceInterceptor = new ExperienceInterceptor()