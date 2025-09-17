import { abTestingService } from './abTesting.service'
import { prisma } from '@/lib/db'
import { GamificationEvent } from '@/types'

/**
 * 游戏化A/B测试指标收集服务
 * 负责收集、聚合和分析游戏化系统的A/B测试指标数据
 */
export class GamificationABTestingMetricsService {
  /**
   * 收集用户参与度指标
   */
  async collectEngagementMetrics(userId: string, testId: string, variantId: string): Promise<void> {
    // 获取用户最近7天的活动数据
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    // 计算登录频率
    const loginFrequency = 0 // 简化实现，实际需要从用户活动表中获取
    
    // 计算会话时长
    const averageSessionDuration = 0 // 简化实现，实际需要从用户活动表中获取
    
    // 计算页面浏览量
    const pageViews = 0 // 简化实现，实际需要从用户活动表中获取
    
    // 计算参与度指数
    const engagementIndex = (loginFrequency * 0.3) + (averageSessionDuration / 60 * 0.4) + (pageViews * 0.01 * 0.3)
    
    // 记录指标
    await abTestingService.recordTestMetric(testId, variantId, this.getMetricId(testId, 'login_frequency'), loginFrequency)
    await abTestingService.recordTestMetric(testId, variantId, this.getMetricId(testId, 'avg_session_duration'), averageSessionDuration)
    await abTestingService.recordTestMetric(testId, variantId, this.getMetricId(testId, 'page_views'), pageViews)
    await abTestingService.recordTestMetric(testId, variantId, this.getMetricId(testId, 'engagement_index'), engagementIndex)
  }

  /**
   * 收集用户保留率指标
   */
  async collectRetentionMetrics(userId: string, testId: string, variantId: string): Promise<void> {
    // 获取用户注册时间
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })
    
    if (!user) return
    
    const registrationDate = user.createdAt
    const now = new Date()
    
    // 计算1天保留率
    const day1Date = new Date(registrationDate.getTime() + 24 * 60 * 60 * 1000)
    const day1Retention = 0 // 简化实现，实际需要从用户活动表中获取
    
    // 计算7天保留率
    const day7Date = new Date(registrationDate.getTime() + 7 * 24 * 60 * 60 * 1000)
    const day7Retention = 0 // 简化实现，实际需要从用户活动表中获取
    
    // 计算30天保留率
    const day30Date = new Date(registrationDate.getTime() + 30 * 24 * 60 * 60 * 1000)
    const day30Retention = 0 // 简化实现，实际需要从用户活动表中获取
    
    // 记录指标
    await abTestingService.recordTestMetric(testId, variantId, this.getMetricId(testId, 'day1_retention'), day1Retention)
    await abTestingService.recordTestMetric(testId, variantId, this.getMetricId(testId, 'day7_retention'), day7Retention)
    await abTestingService.recordTestMetric(testId, variantId, this.getMetricId(testId, 'day30_retention'), day30Retention)
  }

  /**
   * 收集转化率指标
   */
  async collectConversionMetrics(userId: string, testId: string, variantId: string): Promise<void> {
    // 计算复习转化率
    const totalReviews = await prisma.review.count({
      where: { userId }
    })
    const completedReviews = await prisma.review.count({
      where: {
        userId,
        isCompleted: true
      }
    })
    const reviewConversionRate = totalReviews > 0 ? completedReviews / totalReviews : 0
    
    // 计算挑战完成率
    const totalChallenges = await prisma.userDailyChallenge.count({
      where: { userId }
    })
    const completedChallenges = await prisma.userDailyChallenge.count({
      where: {
        userId,
        completed: true
      }
    })
    const challengeCompletionRate = totalChallenges > 0 ? completedChallenges / totalChallenges : 0
    
    // 计算成就解锁率
    const profile = await prisma.gamificationProfile.findUnique({
      where: { userId },
      include: {
        achievements: true
      }
    })
    
    if (!profile) return
    
    const totalAchievements = await prisma.achievement.count({
      where: { isActive: true }
    })
    const unlockedAchievements = profile.achievements.length
    const achievementUnlockRate = totalAchievements > 0 ? unlockedAchievements / totalAchievements : 0
    
    // 记录指标
    await abTestingService.recordTestMetric(testId, variantId, this.getMetricId(testId, 'review_conversion_rate'), reviewConversionRate)
    await abTestingService.recordTestMetric(testId, variantId, this.getMetricId(testId, 'challenge_completion_rate'), challengeCompletionRate)
    await abTestingService.recordTestMetric(testId, variantId, this.getMetricId(testId, 'achievement_unlock_rate'), achievementUnlockRate)
  }

  /**
   * 收集学习效果指标
   */
  async collectLearningEffectivenessMetrics(userId: string, testId: string, variantId: string): Promise<void> {
    // 计算平均复习分数
    const reviews = await prisma.review.findMany({
      where: { userId }
    })
    
    if (reviews.length === 0) return
    
    const totalScore = reviews.reduce((sum, review) => sum + (review.reviewScore || 0), 0)
    const averageReviewScore = totalScore / reviews.length
    
    // 计算记忆保留率
    const memoryContents = await prisma.memoryContent.findMany({
      where: { userId }
    })
    
    if (memoryContents.length === 0) return
    
    const totalRetentionRate = memoryContents.reduce((sum, content) => sum + 0, 0) // 简化实现，实际需要从记忆内容表中获取
    const averageRetentionRate = totalRetentionRate / memoryContents.length
    
    // 计算学习进度
    const totalProgress = memoryContents.reduce((sum, content) => sum + 0, 0) // 简化实现，实际需要从记忆内容表中获取
    const averageProgress = totalProgress / memoryContents.length
    
    // 计算学习效率（复习次数与记忆内容数量的比率）
    const learningEfficiency = reviews.length / memoryContents.length
    
    // 记录指标
    await abTestingService.recordTestMetric(testId, variantId, this.getMetricId(testId, 'avg_review_score'), averageReviewScore)
    await abTestingService.recordTestMetric(testId, variantId, this.getMetricId(testId, 'avg_retention_rate'), averageRetentionRate)
    await abTestingService.recordTestMetric(testId, variantId, this.getMetricId(testId, 'avg_learning_progress'), averageProgress)
    await abTestingService.recordTestMetric(testId, variantId, this.getMetricId(testId, 'learning_efficiency'), learningEfficiency)
  }

  /**
   * 收集社交互动指标
   */
  async collectSocialInteractionMetrics(userId: string, testId: string, variantId: string): Promise<void> {
    // 计算好友数量
    const friendsCount = 0 // 简化实现，实际需要从用户好友表中获取
    
    // 计算分享次数
    const shareEvents = 0 // 简化实现，实际需要从用户活动表中获取
    
    // 计算评论次数
    const commentEvents = 0 // 简化实现，实际需要从用户活动表中获取
    
    // 计算点赞次数
    const likeEvents = 0 // 简化实现，实际需要从用户活动表中获取
    
    // 计算社交互动指数
    const socialInteractionIndex = (friendsCount * 0.3) + (shareEvents * 0.2) + (commentEvents * 0.3) + (likeEvents * 0.2)
    
    // 记录指标
    await abTestingService.recordTestMetric(testId, variantId, this.getMetricId(testId, 'friends_count'), friendsCount)
    await abTestingService.recordTestMetric(testId, variantId, this.getMetricId(testId, 'share_count'), shareEvents)
    await abTestingService.recordTestMetric(testId, variantId, this.getMetricId(testId, 'comment_count'), commentEvents)
    await abTestingService.recordTestMetric(testId, variantId, this.getMetricId(testId, 'like_count'), likeEvents)
    await abTestingService.recordTestMetric(testId, variantId, this.getMetricId(testId, 'social_interaction_index'), socialInteractionIndex)
  }

  /**
   * 收集用户满意度指标
   */
  async collectSatisfactionMetrics(userId: string, testId: string, variantId: string): Promise<void> {
    // 计算应用评分
    const averageRating = 0 // 简化实现，实际需要从用户活动表中获取
    
    // 计算反馈次数
    const feedbackEvents = 0 // 简化实现，实际需要从用户活动表中获取
    
    // 计算推荐次数
    const recommendEvents = 0 // 简化实现，实际需要从用户活动表中获取
    
    // 计算投诉次数
    const complaintEvents = 0 // 简化实现，实际需要从用户活动表中获取
    
    // 计算满意度指数
    const satisfactionIndex = (averageRating / 5 * 0.5) + (feedbackEvents * 0.2) + (recommendEvents * 0.3) - (complaintEvents * 0.1)
    
    // 记录指标
    await abTestingService.recordTestMetric(testId, variantId, this.getMetricId(testId, 'average_rating'), averageRating)
    await abTestingService.recordTestMetric(testId, variantId, this.getMetricId(testId, 'feedback_count'), feedbackEvents)
    await abTestingService.recordTestMetric(testId, variantId, this.getMetricId(testId, 'recommend_count'), recommendEvents)
    await abTestingService.recordTestMetric(testId, variantId, this.getMetricId(testId, 'complaint_count'), complaintEvents)
    await abTestingService.recordTestMetric(testId, variantId, this.getMetricId(testId, 'satisfaction_index'), satisfactionIndex)
  }

  /**
   * 收集系统性能指标
   */
  async collectPerformanceMetrics(userId: string, testId: string, variantId: string): Promise<void> {
    // 计算平均响应时间
    const averageResponseTime = 0 // 简化实现，实际需要从用户活动表中获取
    
    // 计算错误率
    const errorRate = 0 // 简化实现，实际需要从用户活动表中获取
    
    // 计算崩溃率
    const crashRate = 0 // 简化实现，实际需要从用户活动表中获取
    
    // 计算性能指数
    const performanceIndex = (1000 / (averageResponseTime + 100) * 0.5) + ((1 - errorRate) * 0.3) + ((1 - crashRate) * 0.2)
    
    // 记录指标
    await abTestingService.recordTestMetric(testId, variantId, this.getMetricId(testId, 'avg_response_time'), averageResponseTime)
    await abTestingService.recordTestMetric(testId, variantId, this.getMetricId(testId, 'error_rate'), errorRate)
    await abTestingService.recordTestMetric(testId, variantId, this.getMetricId(testId, 'crash_rate'), crashRate)
    await abTestingService.recordTestMetric(testId, variantId, this.getMetricId(testId, 'performance_index'), performanceIndex)
  }

  /**
   * 批量收集所有指标
   */
  async collectAllMetrics(userId: string, testId: string, variantId: string): Promise<void> {
    try {
      // 并行收集所有指标
      await Promise.all([
        this.collectEngagementMetrics(userId, testId, variantId),
        this.collectRetentionMetrics(userId, testId, variantId),
        this.collectConversionMetrics(userId, testId, variantId),
        this.collectLearningEffectivenessMetrics(userId, testId, variantId),
        this.collectSocialInteractionMetrics(userId, testId, variantId),
        this.collectSatisfactionMetrics(userId, testId, variantId),
        this.collectPerformanceMetrics(userId, testId, variantId)
      ])
    } catch (error) {
      console.error('收集A/B测试指标失败:', error)
    }
  }

  /**
   * 获取指标摘要
   */
  async getMetricsSummary(testId: string, variantId: string): Promise<Record<string, Record<string, unknown>>> {
    const test = await prisma.aBTest.findUnique({
      where: { id: testId },
      include: {
        variants: true,
        metrics: true,
        results: {
          where: { variantId }
        }
      }
    })
    
    if (!test) return {}
    
    const summary: Record<string, Record<string, unknown>> = {}
    
    // 按指标类型分组
    for (const metric of test.metrics) {
      const result = test.results.find((r: {metricId: string}) => r.metricId === metric.id)
      if (result) {
        summary[metric.name] = {
          value: result.value,
          change: result.change,
          changePercentage: result.changePercentage,
          confidence: result.confidence,
          significance: result.significance,
          sampleSize: result.sampleSize
        }
      }
    }
    
    return summary
  }

  /**
   * 获取指标ID
   */
  private getMetricId(testId: string, metricName: string): string {
    return `${testId}_${metricName}`
  }
}

// 导出单例实例
export const gamificationABTestingMetricsService = new GamificationABTestingMetricsService()