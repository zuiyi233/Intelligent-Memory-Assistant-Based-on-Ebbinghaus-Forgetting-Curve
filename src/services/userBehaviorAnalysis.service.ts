import { prisma } from '@/lib/db'

// 扩展用户行为事件类型
export enum ExtendedUserBehaviorEventType {
  // 原有事件类型
  REVIEW_COMPLETED = 'REVIEW_COMPLETED',
  MEMORY_CREATED = 'MEMORY_CREATED',
  CATEGORY_FOCUS = 'CATEGORY_FOCUS',
  TIME_SPENT = 'TIME_SPENT',
  ACCURACY_HIGH = 'ACCURACY_HIGH',
  ACCURACY_LOW = 'ACCURACY_LOW',
  STREAK_MAINTAINED = 'STREAK_MAINTAINED',
  CHALLENGE_COMPLETED = 'CHALLENGE_COMPLETED',
  ACHIEVEMENT_UNLOCKED = 'ACHIEVEMENT_UNLOCKED',
  LEVEL_UP = 'LEVEL_UP',
  POINTS_EARNED = 'POINTS_EARNED',
  UI_INTERACTION = 'UI_INTERACTION',
  THEME_CHANGED = 'THEME_CHANGED',
  CUSTOMIZATION = 'CUSTOMIZATION',
  // 新增事件类型
  SEARCH_PERFORMED = 'SEARCH_PERFORMED',         // 搜索操作
  FILTER_APPLIED = 'FILTER_APPLIED',           // 应用筛选
  SORT_CHANGED = 'SORT_CHANGED',               // 排序变更
  PAGE_NAVIGATION = 'PAGE_NAVIGATION',         // 页面导航
  CONTENT_SHARED = 'CONTENT_SHARED',           // 内容分享
  CONTENT_EXPORTED = 'CONTENT_EXPORTED',       // 内容导出
  SETTING_CHANGED = 'SETTING_CHANGED',         // 设置变更
  HELP_ACCESSED = 'HELP_ACCESSED',             // 访问帮助
  FEEDBACK_SUBMITTED = 'FEEDBACK_SUBMITTED',   // 提交反馈
  ERROR_ENCOUNTERED = 'ERROR_ENCOUNTERED',     // 遇到错误
  OFFLINE_MODE = 'OFFLINE_MODE',               // 离线模式
  SYNC_COMPLETED = 'SYNC_COMPLETED',           // 同步完成
  SOCIAL_INTERACTION = 'SOCIAL_INTERACTION'    // 社交互动
}

// 扩展学习内容类型
export enum ExtendedLearningContentType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  AUDIO = 'AUDIO',
  VIDEO = 'VIDEO',
  INTERACTIVE = 'INTERACTIVE',
  QUIZ = 'QUIZ',
  FLASHCARD = 'FLASHCARD',     // 新增：闪卡
  ARTICLE = 'ARTICLE',         // 新增：文章
  COURSE = 'COURSE',           // 新增：课程
  EXERCISE = 'EXERCISE'        // 新增：练习
}

// 用户行为数据接口
export interface UserBehaviorData {
  userId: string
  period: string
  activityPatterns: {
    dailyActivity: Array<{
      date: string
      actionsCount: number
      timeSpent: number
    }>
    hourlyActivity: Array<{
      hour: number
      actionsCount: number
    }>
    weeklyActivity: Array<{
      day: string
      actionsCount: number
    }>
    // 新增：月度活动模式
    monthlyActivity: Array<{
      month: string
      actionsCount: number
      timeSpent: number
    }>
  }
  featureUsage: {
    mostUsedFeatures: Array<{
      featureName: string
      usageCount: number
      percentage: number
    }>
    featureInteractionDepth: {
      [featureName: string]: number
    }
    // 新增：功能使用趋势
    featureUsageTrends: Array<{
      featureName: string
      period: string
      usageCount: number
      changePercentage: number
    }>
  }
  learningPatterns: {
    learningSessions: Array<{
      date: string
      duration: number
      itemsReviewed: number
      accuracy: number
    }>
    retentionRate: number
    difficultyProgression: Array<{
      week: string
      averageDifficulty: number
      successRate: number
    }>
    // 新增：学习效率指标
    learningEfficiency: {
      optimalLearningTimes: Array<{
        hour: number
        efficiency: number
      }>
      averageTimePerItem: number
      learningVelocity: number  // 学习速度（单位时间掌握的知识点数量）
    }
    // 新增：学习偏好分析
    learningPreferences: {
      preferredContentTypes: Array<{
        contentType: ExtendedLearningContentType
        usagePercentage: number
        successRate: number
      }>
      preferredDifficulty: Array<{
        difficulty: number
        frequency: number
        successRate: number
      }>
      preferredCategories: Array<{
        category: string
        frequency: number
        retentionRate: number
      }>
    }
  }
  engagementMetrics: {
    sessionFrequency: number
    averageSessionLength: number
    bounceRate: number
    returnRate: number
    // 新增：深度参与指标
    depthEngagement: {
      averageActionsPerSession: number
      featureExplorationRate: number
      contentInteractionDepth: number
    }
    // 新增：时间分布指标
    timeDistribution: {
      peakUsageHours: Array<{
        hour: number
        activityLevel: number
      }>
      weekdayVsWeekend: {
        weekdayActivity: number
        weekendActivity: number
        differencePercentage: number
      }
    }
  }
  behaviorChanges: {
    beforeGamification: {
      sessionFrequency: number
      averageSessionLength: number
      featureDiversity: number
    }
    afterGamification: {
      sessionFrequency: number
      averageSessionLength: number
      featureDiversity: number
    }
    improvementPercentage: {
      sessionFrequency: number
      averageSessionLength: number
      featureDiversity: number
    }
  }
  // 新增：预测性行为分析
  predictiveInsights: {
    churnRisk: {
      score: number
      factors: Array<{
        factor: string
        impact: number
        description: string
      }>
      recommendations: string[]
    }
    engagementForecast: {
      trend: 'increasing' | 'stable' | 'decreasing'
      projectedValue: number
      confidence: number
    }
    nextActions: Array<{
      action: string
      probability: number
      timeframe: string
    }>
  }
  // 新增：社交行为分析
  socialBehavior: {
    sharingFrequency: number
    interactionTypes: Array<{
      type: string
      count: number
      percentage: number
    }>
    networkInfluence: {
      reach: number
      engagementGenerated: number
    }
  }
}

// 用户行为事件接口
export interface UserBehaviorEventLog {
  id: string
  userId: string
  eventType: ExtendedUserBehaviorEventType
  contentType?: ExtendedLearningContentType
  categoryId?: string
  timeSpent?: number
  accuracy?: number
  difficulty?: number
  success?: boolean
  metadata?: Record<string, unknown>
  timestamp: Date
}

// 用户行为分析服务
export class UserBehaviorAnalysisService {
  /**
   * 记录用户行为事件
   * @param userId 用户ID
   * @param eventType 事件类型
   * @param data 事件数据
   */
  async recordUserBehaviorEvent(
    userId: string,
    eventType: ExtendedUserBehaviorEventType,
    data?: {
      contentType?: ExtendedLearningContentType
      categoryId?: string
      timeSpent?: number
      accuracy?: number
      difficulty?: number
      success?: boolean
      metadata?: Record<string, unknown>
    }
  ): Promise<void> {
    try {
      await prisma.userBehaviorEvent.create({
        data: {
          userId,
          eventType,
          contentType: data?.contentType,
          categoryId: data?.categoryId,
          timeSpent: data?.timeSpent || 0,
          accuracy: data?.accuracy || 0.0,
          difficulty: data?.difficulty || 1,
          success: data?.success || false,
          metadata: data?.metadata || {},
          timestamp: new Date()
        }
      })
    } catch (error) {
      console.error('记录用户行为事件失败:', error)
      throw new Error('记录用户行为事件失败')
    }
  }

  /**
   * 批量记录用户行为事件
   * @param events 事件数组
   */
  async batchRecordUserBehaviorEvents(
    events: Array<{
      userId: string
      eventType: ExtendedUserBehaviorEventType
      data?: {
        contentType?: ExtendedLearningContentType
        categoryId?: string
        timeSpent?: number
        accuracy?: number
        difficulty?: number
        success?: boolean
        metadata?: Record<string, unknown>
      }
    }>
  ): Promise<void> {
    try {
      await prisma.userBehaviorEvent.createMany({
        data: events.map(event => ({
          userId: event.userId,
          eventType: event.eventType,
          contentType: event.data?.contentType,
          categoryId: event.data?.categoryId,
          timeSpent: event.data?.timeSpent || 0,
          accuracy: event.data?.accuracy || 0.0,
          difficulty: event.data?.difficulty || 1,
          success: event.data?.success || false,
          metadata: event.data?.metadata || {},
          timestamp: new Date()
        }))
      })
    } catch (error) {
      console.error('批量记录用户行为事件失败:', error)
      throw new Error('批量记录用户行为事件失败')
    }
  }

  /**
   * 获取用户行为分析数据
   * @param userId 用户ID
   * @param days 分析天数（默认为30天）
   * @returns 用户行为分析数据
   */
  async getUserBehaviorAnalysis(userId: string, days: number = 30): Promise<UserBehaviorData> {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // 获取用户的基本信息
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      throw new Error('用户不存在')
    }

    // 获取用户的行为事件日志
    const userBehaviorEvents = await prisma.userBehaviorEvent.findMany({
      where: {
        userId,
        timestamp: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: {
        timestamp: 'asc'
      }
    })

    // 获取用户的记忆内容记录
    const memories = await prisma.memoryContent.findMany({
      where: {
        userId,
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      }
    })

    // 获取用户的复习记录
    const reviews = await prisma.review.findMany({
      where: {
        userId,
        reviewTime: {
          gte: startDate,
          lte: endDate
        }
      }
    })

    // 获取用户的积分交易记录
    const pointTransactions = await prisma.pointTransaction.findMany({
      where: {
        userId,
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      }
    })

    // 计算活动模式
    const activityPatterns = this.calculateActivityPatterns(userBehaviorEvents, startDate, endDate)

    // 计算功能使用情况
    const featureUsage = this.calculateFeatureUsage(userBehaviorEvents)

    // 计算学习模式
    const learningPatterns = this.calculateLearningPatterns(memories, reviews, startDate, endDate)

    // 计算参与度指标
    const engagementMetrics = this.calculateEngagementMetrics(userBehaviorEvents)

    // 计算行为变化
    const behaviorChanges = await this.calculateBehaviorChanges(userId, userBehaviorEvents)

    // 计算预测性洞察
    const predictiveInsights = this.calculatePredictiveInsights(userBehaviorEvents, reviews)

    // 计算社交行为
    const socialBehavior = this.calculateSocialBehavior(userBehaviorEvents)

    return {
      userId,
      period: `${startDate.toISOString().split('T')[0]} 至 ${endDate.toISOString().split('T')[0]}`,
      activityPatterns,
      featureUsage,
      learningPatterns,
      engagementMetrics,
      behaviorChanges,
      predictiveInsights,
      socialBehavior
    }
  }

  /**
   * 获取系统行为分析摘要
   * @returns 系统行为分析摘要
   */
  async getSystemBehaviorSummary(days: number = 30): Promise<{
    totalUsers: number
    activeUsers: number
    averageSessionLength: number
    topFeatures: Array<{
      featureName: string
      usageCount: number
    }>
    behaviorTrends: {
      increasing: Array<{ featureName: string; growthRate: number }>
      decreasing: Array<{ featureName: string; growthRate: number }>
    }
  }> {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // 获取总用户数
    const totalUsers = await prisma.user.count()

    // 获取活跃用户数（在过去30天内有活动）
    const activeUsers = await prisma.user.count({
      where: {
        userBehaviorEvents: {
          some: {
            timestamp: {
              gte: startDate
            }
          }
        }
      }
    })

    // 获取所有用户行为事件
    const allUserBehaviorEvents = await prisma.userBehaviorEvent.findMany({
      where: {
        timestamp: {
          gte: startDate,
          lte: endDate
        }
      }
    })

    // 计算平均会话长度
    const averageSessionLength = this.calculateAverageSessionLength(allUserBehaviorEvents)

    // 获取热门功能
    const topFeatures = this.getTopFeatures(allUserBehaviorEvents)

    // 获取行为趋势
    const behaviorTrends = await this.getBehaviorTrends(startDate, endDate)

    return {
      totalUsers,
      activeUsers,
      averageSessionLength,
      topFeatures,
      behaviorTrends
    }
  }

  /**
   * 计算活动模式
   */
  private calculateActivityPatterns(userLogs: UserBehaviorEventLog[], startDate: Date, endDate: Date) {
    // 初始化每日、每小时和每周的活动数据
    const dailyActivity: Record<string, { actionsCount: number; timeSpent: number }> = {}
    const hourlyActivity: Record<number, number> = {}
    const weeklyActivity: Record<string, number> = {}

    // 初始化数据结构
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0]
      dailyActivity[dateStr] = { actionsCount: 0, timeSpent: 0 }
    }

    for (let i = 0; i < 24; i++) {
      hourlyActivity[i] = 0
    }

    const daysOfWeek = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    for (const day of daysOfWeek) {
      weeklyActivity[day] = 0
    }

    // 处理用户日志
    for (const log of userLogs) {
      const date = new Date(log.createdAt)
      const dateStr = date.toISOString().split('T')[0]
      const hour = date.getHours()
      const dayOfWeek = daysOfWeek[date.getDay()]

      // 更新每日活动
      if (dailyActivity[dateStr]) {
        dailyActivity[dateStr].actionsCount += 1
        // 假设每个操作平均花费2分钟
        dailyActivity[dateStr].timeSpent += 2
      }

      // 更新每小时活动
      hourlyActivity[hour] += 1

      // 更新每周活动
      weeklyActivity[dayOfWeek] += 1
    }

    // 转换为数组格式
    const dailyActivityArray = Object.entries(dailyActivity).map(([date, data]) => ({
      date,
      actionsCount: data.actionsCount,
      timeSpent: data.timeSpent
    }))

    const hourlyActivityArray = Object.entries(hourlyActivity).map(([hour, actionsCount]) => ({
      hour: parseInt(hour),
      actionsCount
    }))

    const weeklyActivityArray = Object.entries(weeklyActivity).map(([day, actionsCount]) => ({
      day,
      actionsCount
    }))

    return {
      dailyActivity: dailyActivityArray,
      hourlyActivity: hourlyActivityArray,
      weeklyActivity: weeklyActivityArray
    }
  }

  /**
   * 计算功能使用情况
   */
  private calculateFeatureUsage(userLogs: UserBehaviorEventLog[]) {
    const featureCounts: Record<string, number> = {}
    const featureInteractionDepth: Record<string, number> = {}

    // 统计每个功能的使用次数
    for (const log of userLogs) {
      const feature = log.eventType || '未知'
      featureCounts[feature] = (featureCounts[feature] || 0) + 1

      // 假设交互深度与操作次数成正比
      featureInteractionDepth[feature] = (featureInteractionDepth[feature] || 0) + 1
    }

    // 计算总操作次数
    const totalActions = Object.values(featureCounts).reduce((sum, count) => sum + count, 0)

    // 转换为数组格式并计算百分比
    const mostUsedFeatures = Object.entries(featureCounts)
      .map(([featureName, usageCount]) => ({
        featureName,
        usageCount,
        percentage: totalActions > 0 ? (usageCount / totalActions) * 100 : 0
      }))
      .sort((a, b) => b.usageCount - a.usageCount)

    return {
      mostUsedFeatures,
      featureInteractionDepth
    }
  }

  /**
   * 计算学习模式
   */
  private calculateLearningPatterns(memories: any[], reviews: any[], startDate: Date, endDate: Date) {
    // 按日期分组复习记录
    const reviewsByDate: Record<string, any[]> = {}
    
    for (const review of reviews) {
      const date = new Date(review.createdAt).toISOString().split('T')[0]
      if (!reviewsByDate[date]) {
        reviewsByDate[date] = []
      }
      reviewsByDate[date].push(review)
    }

    // 计算每日学习会话数据
    const learningSessions: Array<{
      date: string
      duration: number
      itemsReviewed: number
      accuracy: number
    }> = []

    for (const [date, dayReviews] of Object.entries(reviewsByDate)) {
      const itemsReviewed = dayReviews.length
      const correctReviews = dayReviews.filter((review: any) => review.isCorrect).length
      const accuracy = itemsReviewed > 0 ? (correctReviews / itemsReviewed) * 100 : 0
      
      // 假设每个复习项目平均花费1分钟
      const duration = itemsReviewed * 1

      learningSessions.push({
        date,
        duration,
        itemsReviewed,
        accuracy
      })
    }

    // 计算保留率（简化计算）
    let totalReviewed = 0
    let totalCorrect = 0
    
    for (const review of reviews) {
      totalReviewed += 1
      if (review.isCorrect) {
        totalCorrect += 1
      }
    }

    const retentionRate = totalReviewed > 0 ? (totalCorrect / totalReviewed) * 100 : 0

    // 计算难度进展（按周分组）
    const difficultyProgression: Array<{
      week: string
      averageDifficulty: number
      successRate: number
    }> = []

    // 按周分组复习记录
    const reviewsByWeek: Record<string, any[]> = {}
    
    for (const review of reviews) {
      const date = new Date(review.createdAt)
      const weekStart = new Date(date)
      weekStart.setDate(date.getDate() - date.getDay())
      const weekKey = weekStart.toISOString().split('T')[0]
      
      if (!reviewsByWeek[weekKey]) {
        reviewsByWeek[weekKey] = []
      }
      reviewsByWeek[weekKey].push(review)
    }

    // 计算每周的平均难度和成功率
    for (const [week, weekReviews] of Object.entries(reviewsByWeek)) {
      const totalDifficulty = weekReviews.reduce((sum: number, review: any) => sum + (review.difficulty || 1), 0)
      const averageDifficulty = weekReviews.length > 0 ? totalDifficulty / weekReviews.length : 0
      
      const correctReviews = weekReviews.filter((review: any) => review.isCorrect).length
      const successRate = weekReviews.length > 0 ? (correctReviews / weekReviews.length) * 100 : 0

      difficultyProgression.push({
        week,
        averageDifficulty,
        successRate
      })
    }

    // 按周排序
    difficultyProgression.sort((a, b) => a.week.localeCompare(b.week))

    return {
      learningSessions,
      retentionRate,
      difficultyProgression
    }
  }

  /**
   * 计算参与度指标
   */
  private calculateEngagementMetrics(userLogs: any[]) {
    // 按用户分组日志
    const logsByUser: Record<string, any[]> = {}
    
    for (const log of userLogs) {
      if (!logsByUser[log.userId]) {
        logsByUser[log.userId] = []
      }
      logsByUser[log.userId].push(log)
    }

    // 计算每个用户的会话数据
    const userSessionData: Array<{
      sessionCount: number
      totalSessionLength: number
      bounced: boolean
      returned: boolean
    }> = []

    for (const [userId, userLogs] of Object.entries(logsByUser)) {
      // 按日期分组日志
      const logsByDate: Record<string, any[]> = {}
      
      for (const log of userLogs) {
        const date = new Date(log.createdAt).toISOString().split('T')[0]
        if (!logsByDate[date]) {
          logsByDate[date] = []
        }
        logsByDate[date].push(log)
      }

      const sessionCount = Object.keys(logsByDate).length
      
      // 假设每个操作平均花费2分钟
      const totalSessionLength = userLogs.length * 2
      
      // 简化判断：如果只有一次会话且操作少于5次，则视为跳出
      const bounced = sessionCount === 1 && userLogs.length < 5
      
      // 简化判断：如果会话次数超过3次，则视为返回用户
      const returned = sessionCount >= 3

      userSessionData.push({
        sessionCount,
        totalSessionLength,
        bounced,
        returned
      })
    }

    // 计算平均参与度指标
    const totalUsers = userSessionData.length
    const totalSessions = userSessionData.reduce((sum, data) => sum + data.sessionCount, 0)
    const totalSessionLength = userSessionData.reduce((sum, data) => sum + data.totalSessionLength, 0)
    const bouncedUsers = userSessionData.filter(data => data.bounced).length
    const returnedUsers = userSessionData.filter(data => data.returned).length

    const sessionFrequency = totalUsers > 0 ? totalSessions / totalUsers : 0
    const averageSessionLength = totalSessions > 0 ? totalSessionLength / totalSessions : 0
    const bounceRate = totalUsers > 0 ? (bouncedUsers / totalUsers) * 100 : 0
    const returnRate = totalUsers > 0 ? (returnedUsers / totalUsers) * 100 : 0

    return {
      sessionFrequency,
      averageSessionLength,
      bounceRate,
      returnRate
    }
  }

  /**
   * 计算平均会话长度
   */
  private calculateAverageSessionLength(userLogs: any[]) {
    // 按用户和日期分组日志
    const logsByUserAndDate: Record<string, Record<string, any[]>> = {}
    
    for (const log of userLogs) {
      if (!logsByUserAndDate[log.userId]) {
        logsByUserAndDate[log.userId] = {}
      }
      
      const date = new Date(log.createdAt).toISOString().split('T')[0]
      if (!logsByUserAndDate[log.userId][date]) {
        logsByUserAndDate[log.userId][date] = []
      }
      logsByUserAndDate[log.userId][date].push(log)
    }

    // 计算每个会话的长度
    const sessionLengths: number[] = []
    
    for (const userLogs of Object.values(logsByUserAndDate)) {
      for (const dayLogs of Object.values(userLogs)) {
        // 假设每个操作平均花费2分钟
        sessionLengths.push(dayLogs.length * 2)
      }
    }

    // 计算平均会话长度
    return sessionLengths.length > 0 
      ? sessionLengths.reduce((sum, length) => sum + length, 0) / sessionLengths.length 
      : 0
  }

  /**
   * 获取热门功能
   */
  private getTopFeatures(userLogs: any[]) {
    const featureCounts: Record<string, number> = {}

    // 统计每个功能的使用次数
    for (const log of userLogs) {
      const feature = log.action || '未知'
      featureCounts[feature] = (featureCounts[feature] || 0) + 1
    }

    // 转换为数组格式并排序
    const topFeatures = Object.entries(featureCounts)
      .map(([featureName, usageCount]) => ({
        featureName,
        usageCount
      }))
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 10) // 取前10个

    return topFeatures
  }

  /**
   * 获取行为趋势
   */
  private async getBehaviorTrends(startDate: Date, endDate: Date) {
    // 获取前一个周期的数据
    const periodLength = endDate.getTime() - startDate.getTime()
    const previousStartDate = new Date(startDate.getTime() - periodLength)
    const previousEndDate = new Date(startDate)

    // 获取当前周期的功能使用情况
    const currentPeriodEvents = await prisma.userBehaviorEvent.findMany({
      where: {
        timestamp: {
          gte: startDate,
          lte: endDate
        }
      }
    })

    const currentFeatureCounts: Record<string, number> = {}
    for (const event of currentPeriodEvents) {
      const feature = event.eventType || '未知'
      currentFeatureCounts[feature] = (currentFeatureCounts[feature] || 0) + 1
    }

    // 获取前一个周期的功能使用情况
    const previousPeriodEvents = await prisma.userBehaviorEvent.findMany({
      where: {
        timestamp: {
          gte: previousStartDate,
          lte: previousEndDate
        }
      }
    })

    const previousFeatureCounts: Record<string, number> = {}
    for (const event of previousPeriodEvents) {
      const feature = event.eventType || '未知'
      previousFeatureCounts[feature] = (previousFeatureCounts[feature] || 0) + 1
    }

    // 计算增长率
    const growthRates: Array<{ featureName: string; growthRate: number }> = []

    // 获取所有功能的名称
    const allFeatures = new Set([
      ...Object.keys(currentFeatureCounts),
      ...Object.keys(previousFeatureCounts)
    ])

    for (const feature of allFeatures) {
      const currentCount = currentFeatureCounts[feature] || 0
      const previousCount = previousFeatureCounts[feature] || 0

      // 计算增长率
      let growthRate = 0
      if (previousCount > 0) {
        growthRate = ((currentCount - previousCount) / previousCount) * 100
      } else if (currentCount > 0) {
        growthRate = 100 // 从无到有，增长率为100%
      }

      growthRates.push({
        featureName: feature,
        growthRate
      })
    }

    // 分离增长和下降的功能
    const increasing = growthRates
      .filter(item => item.growthRate > 10) // 增长率超过10%视为增长
      .sort((a, b) => b.growthRate - a.growthRate)

    const decreasing = growthRates
      .filter(item => item.growthRate < -10) // 下降率超过10%视为下降
      .sort((a, b) => a.growthRate - b.growthRate)

    return {
      increasing,
      decreasing
    }
  }

  /**
   * 计算行为变化
   */
  private async calculateBehaviorChanges(userId: string, userLogs: any[]) {
    // 获取用户游戏化开始时间（假设为第一次获得积分的时间）
    const firstPointTransaction = await prisma.pointTransaction.findFirst({
      where: {
        userId,
        amount: {
          gt: 0
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    if (!firstPointTransaction) {
      // 如果没有游戏化记录，返回默认值
      return {
        beforeGamification: {
          sessionFrequency: 0,
          averageSessionLength: 0,
          featureDiversity: 0
        },
        afterGamification: {
          sessionFrequency: 0,
          averageSessionLength: 0,
          featureDiversity: 0
        },
        improvementPercentage: {
          sessionFrequency: 0,
          averageSessionLength: 0,
          featureDiversity: 0
        }
      }
    }

    const gamificationStartDate = new Date(firstPointTransaction.createdAt)

    // 分割游戏化前后的日志
    const beforeGamificationLogs = userLogs.filter(log => new Date(log.createdAt) < gamificationStartDate)
    const afterGamificationLogs = userLogs.filter(log => new Date(log.createdAt) >= gamificationStartDate)

    // 计算游戏化前的指标
    const beforeGamification = this.calculateBehaviorMetrics(beforeGamificationLogs)

    // 计算游戏化后的指标
    const afterGamification = this.calculateBehaviorMetrics(afterGamificationLogs)

    // 计算改进百分比
    const improvementPercentage = {
      sessionFrequency: beforeGamification.sessionFrequency > 0 
        ? ((afterGamification.sessionFrequency - beforeGamification.sessionFrequency) / beforeGamification.sessionFrequency) * 100 
        : 0,
      averageSessionLength: beforeGamification.averageSessionLength > 0 
        ? ((afterGamification.averageSessionLength - beforeGamification.averageSessionLength) / beforeGamification.averageSessionLength) * 100 
        : 0,
      featureDiversity: beforeGamification.featureDiversity > 0 
        ? ((afterGamification.featureDiversity - beforeGamification.featureDiversity) / beforeGamification.featureDiversity) * 100 
        : 0
    }

    return {
      beforeGamification,
      afterGamification,
      improvementPercentage
    }
  }

  /**
   * 计算行为指标
   */
  private calculateBehaviorMetrics(userLogs: any[]) {
    if (userLogs.length === 0) {
      return {
        sessionFrequency: 0,
        averageSessionLength: 0,
        featureDiversity: 0
      }
    }

    // 按日期分组日志
    const logsByDate: Record<string, any[]> = {}
    
    for (const log of userLogs) {
      const date = new Date(log.createdAt).toISOString().split('T')[0]
      if (!logsByDate[date]) {
        logsByDate[date] = []
      }
      logsByDate[date].push(log)
    }

    // 计算会话频率（平均每天会话数）
    const sessionCount = Object.keys(logsByDate).length
    const dayCount = Math.max(1, this.getDayCount(userLogs))
    const sessionFrequency = sessionCount / dayCount

    // 计算平均会话长度（假设每个操作平均花费2分钟）
    const totalSessionLength = userLogs.length * 2
    const averageSessionLength = sessionCount > 0 ? totalSessionLength / sessionCount : 0

    // 计算功能多样性（不同功能的使用数量）
    const uniqueFeatures = new Set(userLogs.map(log => log.action || '未知'))
    const featureDiversity = uniqueFeatures.size

    return {
      sessionFrequency,
      averageSessionLength,
      featureDiversity
    }
  }

  /**
   * 获取日志覆盖的天数
   */
  private getDayCount(userLogs: UserBehaviorEventLog[]) {
    if (userLogs.length === 0) return 1

    const dates = userLogs.map(log => new Date(log.timestamp).toISOString().split('T')[0])
    const uniqueDates = new Set(dates)
    
    return uniqueDates.size
  }

  /**
   * 计算预测性洞察
   */
  private calculatePredictiveInsights(
    userBehaviorEvents: UserBehaviorEventLog[],
    reviews: any[]
  ) {
    // 计算流失风险
    const churnRiskFactors = []
    let churnRiskScore = 0

    // 基于活动频率的流失风险
    const recentActivity = userBehaviorEvents.filter(
      event => new Date(event.timestamp).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
    )
    
    if (recentActivity.length < 3) {
      churnRiskScore += 30
      churnRiskFactors.push({
        factor: '低活跃度',
        impact: 30,
        description: '最近7天内活动少于3次'
      })
    }

    // 基于复习准确率的流失风险
    const recentReviews = reviews.filter(
      review => new Date(review.reviewTime).getTime() > Date.now() - 14 * 24 * 60 * 60 * 1000
    )
    
    if (recentReviews.length > 0) {
      const accuracyRate = recentReviews.filter(
        review => review.isCorrect || (review.reviewScore && review.reviewScore >= 3)
      ).length / recentReviews.length
      
      if (accuracyRate < 0.5) {
        churnRiskScore += 25
        churnRiskFactors.push({
          factor: '低准确率',
          impact: 25,
          description: '最近2周内复习准确率低于50%'
        })
      }
    }

    // 基于连续登录天数的流失风险
    const loginEvents = userBehaviorEvents.filter(
      event => event.eventType === ExtendedUserBehaviorEventType.UI_INTERACTION
    )
    
    if (loginEvents.length < 5) {
      churnRiskScore += 20
      churnRiskFactors.push({
        factor: '低登录频率',
        impact: 20,
        description: '总体登录频率较低'
      })
    }

    // 生成建议
    const recommendations = []
    
    if (churnRiskScore > 30) {
      recommendations.push('发送个性化提醒通知')
      recommendations.push('提供难度适中的复习内容')
      recommendations.push('推荐用户可能感兴趣的学习类别')
    }
    
    if (churnRiskScore > 50) {
      recommendations.push('提供一对一学习指导')
      recommendations.push('调整学习计划以降低难度')
      recommendations.push('提供额外的学习激励')
    }

    // 预测参与度趋势
    const lastWeekActivity = userBehaviorEvents.filter(
      event => new Date(event.timestamp).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
    ).length
    
    const previousWeekActivity = userBehaviorEvents.filter(
      event => {
        const timestamp = new Date(event.timestamp).getTime()
        return timestamp > Date.now() - 14 * 24 * 60 * 60 * 1000 &&
               timestamp <= Date.now() - 7 * 24 * 60 * 60 * 1000
      }
    ).length
    
    let engagementTrend: 'increasing' | 'stable' | 'decreasing'
    let projectedValue = lastWeekActivity
    let confidence = 0.7 // 默认置信度
    
    if (lastWeekActivity > previousWeekActivity * 1.2) {
      engagementTrend = 'increasing'
      projectedValue = lastWeekActivity * 1.1
      confidence = 0.8
    } else if (lastWeekActivity < previousWeekActivity * 0.8) {
      engagementTrend = 'decreasing'
      projectedValue = lastWeekActivity * 0.9
      confidence = 0.8
    } else {
      engagementTrend = 'stable'
      projectedValue = lastWeekActivity
      confidence = 0.9
    }

    // 预测下一步行动
    const nextActions = []
    
    // 基于历史模式预测
    const lastActions = userBehaviorEvents
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5)
      .map(event => event.eventType)
    
    const actionFrequency: Record<string, number> = {}
    lastActions.forEach(action => {
      actionFrequency[action] = (actionFrequency[action] || 0) + 1
    })
    
    // 预测最可能的下一步行动
    const mostFrequentAction = Object.entries(actionFrequency)
      .sort((a, b) => b[1] - a[1])[0]
    
    if (mostFrequentAction) {
      nextActions.push({
        action: mostFrequentAction[0],
        probability: Math.min(0.9, 0.5 + (mostFrequentAction[1] / lastActions.length) * 0.4),
        timeframe: '24小时内'
      })
    }
    
    // 添加复习预测
    const reviewEvents = userBehaviorEvents.filter(
      event => event.eventType === ExtendedUserBehaviorEventType.REVIEW_COMPLETED
    )
    
    if (reviewEvents.length > 0) {
      const lastReviewTime = new Date(
        Math.max(...reviewEvents.map(event => new Date(event.timestamp).getTime()))
      )
      
      const daysSinceLastReview = Math.floor(
        (Date.now() - lastReviewTime.getTime()) / (24 * 60 * 60 * 1000)
      )
      
      if (daysSinceLastReview >= 1 && daysSinceLastReview <= 3) {
        nextActions.push({
          action: 'REVIEW_COMPLETED',
          probability: 0.7,
          timeframe: '今天'
        })
      }
    }

    return {
      churnRisk: {
        score: Math.min(100, churnRiskScore),
        factors: churnRiskFactors,
        recommendations
      },
      engagementForecast: {
        trend: engagementTrend,
        projectedValue: Math.round(projectedValue),
        confidence: Math.round(confidence * 100)
      },
      nextActions
    }
  }

  /**
   * 计算社交行为
   */
  private calculateSocialBehavior(userBehaviorEvents: UserBehaviorEventLog[]) {
    // 计算分享频率
    const sharingEvents = userBehaviorEvents.filter(
      event => event.eventType === ExtendedUserBehaviorEventType.CONTENT_SHARED
    )
    
    const sharingFrequency = sharingEvents.length
    
    // 计算交互类型
    const interactionEvents = userBehaviorEvents.filter(
      event => [
        ExtendedUserBehaviorEventType.CONTENT_SHARED,
        ExtendedUserBehaviorEventType.SOCIAL_INTERACTION,
        ExtendedUserBehaviorEventType.FEEDBACK_SUBMITTED
      ].includes(event.eventType)
    )
    
    const interactionTypeCount: Record<string, number> = {}
    interactionEvents.forEach(event => {
      const type = event.eventType
      interactionTypeCount[type] = (interactionTypeCount[type] || 0) + 1
    })
    
    const totalInteractions = interactionEvents.length
    const interactionTypes = Object.entries(interactionTypeCount).map(([type, count]) => ({
      type,
      count,
      percentage: totalInteractions > 0 ? (count / totalInteractions) * 100 : 0
    }))
    
    // 计算网络影响力（简化计算）
    const socialEvents = userBehaviorEvents.filter(
      event => event.eventType === ExtendedUserBehaviorEventType.SOCIAL_INTERACTION
    )
    
    const reach = sharingEvents.length * 5 // 假设每次分享平均到达5人
    const engagementGenerated = sharingEvents.length * 2 // 假设每次分享平均产生2次互动
    
    return {
      sharingFrequency,
      interactionTypes,
      networkInfluence: {
        reach,
        engagementGenerated
      }
    }
  }
}