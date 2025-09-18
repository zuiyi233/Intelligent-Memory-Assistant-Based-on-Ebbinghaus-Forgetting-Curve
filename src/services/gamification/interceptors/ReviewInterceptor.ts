import { gamificationABTestingConfigService } from '@/services/gamificationABTestingConfig.service'

/**
 * 复习拦截器
 * 负责拦截复习相关的操作，并根据A/B测试配置动态调整复习行为
 */
export class ReviewInterceptor {
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
      console.log(`用户 ${userId} 的复习通知已启用`)
    }
    
    if (config.reviewFeedbackEnabled && config.reviewFeedbackEnabled === true) {
      // 可以在这里添加反馈逻辑
      console.log(`用户 ${userId} 的复习反馈已启用`)
    }
  }

  /**
   * 获取复习统计
   */
  async getReviewStats(userId: string, days: number = 30): Promise<{
    totalReviews: number
    completedReviews: number
    averageAccuracy: number
    averageTimeSpent: number
    completionRate: number
  }> {
    // 获取用户的A/B测试配置
    const config = await gamificationABTestingConfigService.getUserGamificationABTestConfig(userId)
    
    const enableNotifications = config.enableReviewNotifications !== undefined 
      ? !!config.enableReviewNotifications
      : false
    
    const enableFeedback = config.reviewFeedbackEnabled !== undefined 
      ? !!config.reviewFeedbackEnabled
      : false
    
    // 模拟数据
    const totalReviews = Math.floor(Math.random() * 50) + 20 // 20-70之间的总复习次数
    const completedReviews = Math.floor(totalReviews * (0.7 + Math.random() * 0.2)) // 70-90%的完成率
    const averageAccuracy = 0.6 + Math.random() * 0.3 // 0.6-0.9之间的平均准确率
    const averageTimeSpent = Math.floor(Math.random() * 60) + 30 // 30-90秒的平均花费时间
    const completionRate = completedReviews / totalReviews
    
    return {
      totalReviews,
      completedReviews,
      averageAccuracy,
      averageTimeSpent,
      completionRate
    }
  }

  /**
   * 获取复习调整配置
   */
  async getReviewAdjustmentConfig(userId: string): Promise<{
    enableNotifications: boolean | null
    enableFeedback: boolean | null
    difficultyAdjustment: number | null
    reminderFrequency: number | null
    reviewIntervalMultiplier: number | null
  }> {
    // 获取用户的A/B测试配置
    const config = await gamificationABTestingConfigService.getUserGamificationABTestConfig(userId)
    
    const enableNotifications = config.enableReviewNotifications !== undefined 
      ? !!config.enableReviewNotifications
      : null
    
    const enableFeedback = config.reviewFeedbackEnabled !== undefined 
      ? !!config.reviewFeedbackEnabled
      : null
    
    const difficultyAdjustment = config.reviewDifficultyAdjustment && typeof config.reviewDifficultyAdjustment === 'number'
      ? config.reviewDifficultyAdjustment
      : null
    
    const reminderFrequency = config.reviewReminderFrequency && typeof config.reviewReminderFrequency === 'number'
      ? config.reviewReminderFrequency
      : null
    
    const reviewIntervalMultiplier = config.reviewIntervalMultiplier && typeof config.reviewIntervalMultiplier === 'number'
      ? config.reviewIntervalMultiplier
      : null
    
    return {
      enableNotifications,
      enableFeedback,
      difficultyAdjustment,
      reminderFrequency,
      reviewIntervalMultiplier
    }
  }

  /**
   * 获取复习完成趋势
   */
  async getReviewCompletionTrends(userId: string, days: number = 30): Promise<Array<{
    date: string
    totalReviews: number
    completedReviews: number
    averageAccuracy: number
    averageTimeSpent: number
  }>> {
    // 获取用户的A/B测试配置
    const config = await gamificationABTestingConfigService.getUserGamificationABTestConfig(userId)
    
    const difficultyAdjustment = config.reviewDifficultyAdjustment && typeof config.reviewDifficultyAdjustment === 'number'
      ? config.reviewDifficultyAdjustment
      : 0
    
    // 生成模拟趋势数据
    const trends: Array<{
      date: string
      totalReviews: number
      completedReviews: number
      averageAccuracy: number
      averageTimeSpent: number
    }> = []
    
    for (let i = 0; i < days; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      // 模拟每日复习情况
      const totalReviews = Math.floor(Math.random() * 5) + 1 // 1-5次复习
      const baseCompletionRate = 0.7 + Math.random() * 0.2 // 70-90%的基础完成率
      const adjustedCompletionRate = Math.max(0.1, Math.min(0.95, baseCompletionRate + difficultyAdjustment))
      const completedReviews = Math.floor(totalReviews * adjustedCompletionRate)
      
      // 模拟准确率和时间
      const averageAccuracy = 0.6 + Math.random() * 0.3 // 0.6-0.9之间的平均准确率
      const averageTimeSpent = Math.floor(Math.random() * 60) + 30 // 30-90秒的平均花费时间
      
      trends.unshift({
        date: dateStr,
        totalReviews,
        completedReviews,
        averageAccuracy,
        averageTimeSpent
      })
    }
    
    return trends
  }

  /**
   * 获取复习难度建议
   */
  async getReviewDifficultySuggestions(userId: string): Promise<Array<{
    difficulty: 'easy' | 'medium' | 'hard'
    reason: string
    confidence: number
  }>> {
    // 获取用户的A/B测试配置
    const config = await gamificationABTestingConfigService.getUserGamificationABTestConfig(userId)
    
    const difficultyAdjustment = config.reviewDifficultyAdjustment && typeof config.reviewDifficultyAdjustment === 'number'
      ? config.reviewDifficultyAdjustment
      : 0
    
    // 模拟数据
    const suggestions = [
      {
        difficulty: 'easy' as const,
        reason: '用户最近准确率较低，建议降低难度',
        confidence: Math.max(0.1, Math.min(0.9, 0.5 - difficultyAdjustment))
      },
      {
        difficulty: 'medium' as const,
        reason: '用户表现稳定，建议保持中等难度',
        confidence: 0.7
      },
      {
        difficulty: 'hard' as const,
        reason: '用户最近准确率较高，建议提高难度',
        confidence: Math.max(0.1, Math.min(0.9, 0.5 + difficultyAdjustment))
      }
    ]
    
    // 根据难度调整排序建议
    if (difficultyAdjustment > 0) {
      // 如果配置偏向更高难度，将hard建议排在前面
      suggestions.sort((a, b) => (b.difficulty === 'hard' ? 1 : 0) - (a.difficulty === 'hard' ? 1 : 0))
    } else if (difficultyAdjustment < 0) {
      // 如果配置偏向更低难度，将easy建议排在前面
      suggestions.sort((a, b) => (b.difficulty === 'easy' ? 1 : 0) - (a.difficulty === 'easy' ? 1 : 0))
    }
    
    return suggestions
  }

  /**
   * 获取复习时间建议
   */
  async getReviewTimingSuggestions(userId: string): Promise<Array<{
    timeOfDay: string
    reason: string
    effectiveness: number
  }>> {
    // 获取用户的A/B测试配置
    const config = await gamificationABTestingConfigService.getUserGamificationABTestConfig(userId)
    
    const reminderFrequency = config.reviewReminderFrequency && typeof config.reviewReminderFrequency === 'number'
      ? config.reviewReminderFrequency
      : 24 // 默认24小时
    
    // 模拟数据
    const suggestions = [
      {
        timeOfDay: '早上 (8:00-10:00)',
        reason: '用户在早上记忆力较好，适合复习',
        effectiveness: 0.8
      },
      {
        timeOfDay: '下午 (14:00-16:00)',
        reason: '用户在下午注意力较集中，适合复习',
        effectiveness: 0.7
      },
      {
        timeOfDay: '晚上 (20:00-22:00)',
        reason: '用户在晚上有较多空闲时间，适合复习',
        effectiveness: 0.9
      }
    ]
    
    // 根据提醒频率调整建议
    if (reminderFrequency < 12) {
      // 高频提醒，强调晚上时间
      suggestions[2].effectiveness = 0.95
    } else if (reminderFrequency > 36) {
      // 低频提醒，强调早上时间
      suggestions[0].effectiveness = 0.85
    }
    
    // 按效果排序
    suggestions.sort((a, b) => b.effectiveness - a.effectiveness)
    
    return suggestions
  }

  /**
   * 调整复习间隔
   */
  async adjustReviewInterval(
    userId: string,
    baseInterval: number,
    performanceData: {
      accuracy?: number
      timeSpent?: number
      difficulty?: 'easy' | 'medium' | 'hard'
    }
  ): Promise<number> {
    // 获取用户的A/B测试配置
    const config = await gamificationABTestingConfigService.getUserGamificationABTestConfig(userId)
    
    let adjustedInterval = baseInterval
    
    // 根据准确率调整间隔
    if (performanceData.accuracy !== undefined && typeof performanceData.accuracy === 'number') {
      const intervalMultiplier = config.reviewIntervalMultiplier && typeof config.reviewIntervalMultiplier === 'number'
        ? config.reviewIntervalMultiplier
        : 1.0 // 默认间隔倍率
      
      if (performanceData.accuracy > 0.8) {
        // 准确率高，延长间隔
        adjustedInterval = Math.round(baseInterval * (1 + intervalMultiplier))
      } else if (performanceData.accuracy < 0.5) {
        // 准确率低，缩短间隔
        adjustedInterval = Math.round(baseInterval * (1 - intervalMultiplier * 0.5))
      }
    }
    
    // 根据花费时间调整间隔
    if (performanceData.timeSpent !== undefined && typeof performanceData.timeSpent === 'number') {
      const idealTime = 30 // 理想复习时间为30秒
      const timeDiff = Math.abs(performanceData.timeSpent - idealTime)
      const timeAdjustment = Math.max(0.8, 1 - (timeDiff / idealTime) * 0.2) // 最多调整20%
      
      adjustedInterval = Math.round(adjustedInterval * timeAdjustment)
    }
    
    // 根据难度调整间隔
    if (performanceData.difficulty) {
      const difficultyMultipliers = {
        'easy': 1.2, // 简单内容间隔延长20%
        'medium': 1.0, // 中等内容间隔不变
        'hard': 0.8 // 困难内容间隔缩短20%
      }
      
      adjustedInterval = Math.round(adjustedInterval * difficultyMultipliers[performanceData.difficulty])
    }
    
    // 确保间隔在合理范围内
    adjustedInterval = Math.max(1, Math.min(365, adjustedInterval)) // 1天到1年之间
    
    return adjustedInterval
  }
}

// 导出单例实例
export const reviewInterceptor = new ReviewInterceptor()