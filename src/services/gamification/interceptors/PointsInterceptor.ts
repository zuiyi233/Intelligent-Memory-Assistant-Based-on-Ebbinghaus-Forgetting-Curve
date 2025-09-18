import { gamificationABTestingConfigService } from '@/services/gamificationABTestingConfig.service'
import { GamificationEvent } from '@/types'
import { PointTransactionType } from '@prisma/client'

// 定义积分事件数据类型
interface PointsEventData {
  originalAmount: number
  adjustedAmount: number
  type: PointTransactionType
  source: string
  [key: string]: unknown // 添加索引签名以兼容 Record<string, unknown>
}

// 定义扩展的积分事件类型
interface PointsGamificationEvent extends GamificationEvent {
  type: 'POINTS_EARNED'
  data: PointsEventData
}

/**
 * 积分拦截器
 * 负责拦截积分相关的操作，并根据A/B测试配置动态调整积分行为
 */
export class PointsInterceptor {
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
   * 获取积分统计
   */
  async getPointsStats(userId: string, days: number = 30): Promise<{
    totalPoints: number
    adjustedPoints: number
    averageMultiplier: number
    byType: Record<string, { original: number; adjusted: number; multiplier: number }>
  }> {
    // 获取用户的A/B测试配置
    const config = await gamificationABTestingConfigService.getUserGamificationABTestConfig(userId)
    
    // 这里应该从数据库或缓存中获取用户的积分事件
    // 由于 gamificationABTestingConfigService 没有提供 getUserGamificationEvents 方法，
    // 我们返回基于当前配置的估计值
    const globalMultiplier = config.pointsMultiplier && typeof config.pointsMultiplier === 'number'
      ? config.pointsMultiplier
      : 1
    
    // 模拟数据
    const totalPoints = 1000 // 这里应该是从数据库获取的实际值
    const adjustedPoints = Math.round(totalPoints * globalMultiplier)
    const averageMultiplier = globalMultiplier
    
    const byType: Record<string, { original: number; adjusted: number; multiplier: number }> = {
      'REVIEW_COMPLETED': {
        original: 400,
        adjusted: Math.round(400 * globalMultiplier),
        multiplier: globalMultiplier
      },
      'CHALLENGE_COMPLETED': {
        original: 300,
        adjusted: Math.round(300 * globalMultiplier),
        multiplier: globalMultiplier
      },
      'ACHIEVEMENT_UNLOCKED': {
        original: 200,
        adjusted: Math.round(200 * globalMultiplier),
        multiplier: globalMultiplier
      },
      'LEVEL_UP': {
        original: 100,
        adjusted: Math.round(100 * globalMultiplier),
        multiplier: globalMultiplier
      }
    }
    
    return {
      totalPoints,
      adjustedPoints,
      averageMultiplier,
      byType
    }
  }

  /**
   * 获取积分倍率配置
   */
  async getPointsMultiplierConfig(userId: string): Promise<{
    globalMultiplier: number | null
    typeMultipliers: Record<string, number>
    maxPointsPerTransaction: number | null
  }> {
    // 获取用户的A/B测试配置
    const config = await gamificationABTestingConfigService.getUserGamificationABTestConfig(userId)
    
    const globalMultiplier = config.pointsMultiplier && typeof config.pointsMultiplier === 'number'
      ? config.pointsMultiplier
      : null
    
    const typeMultipliers: Record<string, number> = {}
    if (config.pointsAdjustments && typeof config.pointsAdjustments === 'object') {
      const typeAdjustments = config.pointsAdjustments as Record<string, number>
      Object.assign(typeMultipliers, typeAdjustments)
    }
    
    const maxPointsPerTransaction = config.maxPointsPerTransaction && typeof config.maxPointsPerTransaction === 'number'
      ? config.maxPointsPerTransaction
      : null
    
    return {
      globalMultiplier,
      typeMultipliers,
      maxPointsPerTransaction
    }
  }

  /**
   * 获取积分倍率趋势
   */
  async getPointsMultiplierTrends(userId: string, days: number = 30): Promise<Array<{
    date: string
    multiplier: number
    pointsEarned: number
    adjustedPoints: number
  }>> {
    // 获取用户的A/B测试配置
    const config = await gamificationABTestingConfigService.getUserGamificationABTestConfig(userId)
    
    const globalMultiplier = config.pointsMultiplier && typeof config.pointsMultiplier === 'number'
      ? config.pointsMultiplier
      : 1
    
    // 生成模拟趋势数据
    const trends: Array<{
      date: string
      multiplier: number
      pointsEarned: number
      adjustedPoints: number
    }> = []
    
    for (let i = 0; i < days; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      // 模拟每日积分获取
      const pointsEarned = Math.floor(Math.random() * 50) + 10 // 10-60之间的随机数
      const adjustedPoints = Math.round(pointsEarned * globalMultiplier)
      
      trends.unshift({
        date: dateStr,
        multiplier: globalMultiplier,
        pointsEarned,
        adjustedPoints
      })
    }
    
    return trends
  }
}

// 导出单例实例
export const pointsInterceptor = new PointsInterceptor()