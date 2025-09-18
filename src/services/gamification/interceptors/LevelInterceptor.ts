import { gamificationABTestingConfigService } from '@/services/gamificationABTestingConfig.service'

/**
 * 等级拦截器
 * 负责拦截等级相关的操作，并根据A/B测试配置动态调整等级行为
 */
export class LevelInterceptor {
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
    const originalLevel = this.calculateLevel(experience)
    
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
      
      adjustedLevel = this.calculateLevel(adjustedExperience)
    }
    
    return adjustedLevel
  }

  /**
   * 计算等级
   */
  private calculateLevel(experience: number): number {
    // 使用指数增长公式计算等级
    // 每级所需经验值 = 基础值 * (等级^系数)
    const baseExp = 100
    const exponent = 1.5
    
    // 通过二分查找确定等级
    let low = 1
    let high = 100
    let level = 1
    
    while (low <= high) {
      const mid = Math.floor((low + high) / 2)
      const requiredExp = baseExp * Math.pow(mid, exponent)
      
      if (experience >= requiredExp) {
        level = mid
        low = mid + 1
      } else {
        high = mid - 1
      }
    }
    
    return level
  }

  /**
   * 计算升级所需经验值
   */
  calculateExperienceForLevel(level: number): number {
    const baseExp = 100
    const exponent = 1.5
    return Math.floor(baseExp * Math.pow(level, exponent))
  }

  /**
   * 获取等级统计
   */
  async getLevelStats(userId: string, days: number = 30): Promise<{
    currentLevel: number
    originalLevel: number
    levelsGained: number
    experienceToNextLevel: number
    currentExperience: number
  }> {
    // 获取用户的A/B测试配置
    const config = await gamificationABTestingConfigService.getUserGamificationABTestConfig(userId)
    
    // 模拟数据
    const currentExperience = 5000 // 这里应该是从数据库获取的实际值
    const originalLevel = this.calculateLevel(currentExperience)
    
    let currentLevel = originalLevel
    
    // 应用A/B测试配置
    if (config.levelAdjustment && typeof config.levelAdjustment === 'number') {
      currentLevel = Math.max(1, originalLevel + config.levelAdjustment)
    }
    
    const levelsGained = currentLevel - originalLevel
    const experienceToNextLevel = this.calculateExperienceForLevel(currentLevel + 1) - currentExperience
    
    return {
      currentLevel,
      originalLevel,
      levelsGained,
      experienceToNextLevel,
      currentExperience
    }
  }

  /**
   * 获取等级调整配置
   */
  async getLevelAdjustmentConfig(userId: string): Promise<{
    levelAdjustment: number | null
    levelThresholds: Record<number, number> | null
    experienceMultiplier: number | null
  }> {
    // 获取用户的A/B测试配置
    const config = await gamificationABTestingConfigService.getUserGamificationABTestConfig(userId)
    
    const levelAdjustment = config.levelAdjustment && typeof config.levelAdjustment === 'number'
      ? config.levelAdjustment
      : null
    
    const levelThresholds = config.levelThresholds && typeof config.levelThresholds === 'object'
      ? config.levelThresholds as Record<number, number>
      : null
    
    const experienceMultiplier = config.experienceMultiplier && typeof config.experienceMultiplier === 'number'
      ? config.experienceMultiplier
      : null
    
    return {
      levelAdjustment,
      levelThresholds,
      experienceMultiplier
    }
  }

  /**
   * 获取等级提升趋势
   */
  async getLevelUpTrends(userId: string, days: number = 30): Promise<Array<{
    date: string
    level: number
    experience: number
    levelUp: boolean
    bonusPoints: number
  }>> {
    // 获取用户的A/B测试配置
    const config = await gamificationABTestingConfigService.getUserGamificationABTestConfig(userId)
    
    const levelAdjustment = config.levelAdjustment && typeof config.levelAdjustment === 'number'
      ? config.levelAdjustment
      : 0
    
    // 生成模拟趋势数据
    const trends: Array<{
      date: string
      level: number
      experience: number
      levelUp: boolean
      bonusPoints: number
    }> = []
    
    let currentLevel = 1
    let currentExperience = 0
    
    for (let i = 0; i < days; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      // 模拟每日经验值获取
      const experienceEarned = Math.floor(Math.random() * 200) + 50 // 50-250之间的随机数
      currentExperience += experienceEarned
      
      const newLevel = this.calculateLevel(currentExperience) + levelAdjustment
      const levelUp = newLevel > currentLevel
      const bonusPoints = levelUp ? (newLevel - currentLevel) * 50 : 0
      
      trends.unshift({
        date: dateStr,
        level: newLevel,
        experience: currentExperience,
        levelUp,
        bonusPoints
      })
      
      currentLevel = newLevel
    }
    
    return trends
  }

  /**
   * 获取等级提升排行榜
   */
  async getLevelUpLeaderboard(period: 'daily' | 'weekly' | 'monthly' | 'all_time', limit: number = 10): Promise<Array<{
    userId: string
    username: string
    avatar?: string | null
    level: number
    levelsGained: number
    rank: number
  }>> {
    // 模拟数据
    const leaderboardData = Array.from({ length: limit }, (_, index) => ({
      userId: `user_${index + 1}`,
      username: `用户${index + 1}`,
      avatar: null,
      level: Math.floor(Math.random() * 20) + 1, // 1-20之间的随机等级
      levelsGained: Math.floor(Math.random() * 5) // 0-5之间的随机等级提升
    }))
    
    // 按等级和等级提升排序
    leaderboardData.sort((a, b) => {
      if (a.level !== b.level) {
        return b.level - a.level
      }
      return b.levelsGained - a.levelsGained
    })
    
    // 添加排名
    return leaderboardData.map((data, index) => ({
      ...data,
      rank: index + 1
    }))
  }
}

// 导出单例实例
export const levelInterceptor = new LevelInterceptor()