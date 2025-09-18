import { gamificationABTestingConfigService } from '@/services/gamificationABTestingConfig.service'

/**
 * 排行榜拦截器
 * 负责拦截排行榜相关的操作，并根据A/B测试配置动态调整排行榜行为
 */
export class LeaderboardInterceptor {
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
   * 获取排行榜统计
   */
  async getLeaderboardStats(userId: string, days: number = 30): Promise<{
    totalViews: number
    averageTimeSpent: number
    preferredType: string
    socialInteractions: number
  }> {
    // 获取用户的A/B测试配置
    const config = await gamificationABTestingConfigService.getUserGamificationABTestConfig(userId)
    
    const leaderboardType = config.leaderboardType && typeof config.leaderboardType === 'string'
      ? config.leaderboardType
      : 'POINTS'
    
    const leaderboardLimit = config.leaderboardLimit && typeof config.leaderboardLimit === 'number'
      ? config.leaderboardLimit
      : 10
    
    // 模拟数据
    const totalViews = Math.floor(Math.random() * 50) + 10 // 10-60之间的查看次数
    const averageTimeSpent = Math.floor(Math.random() * 120) + 30 // 30-150秒的平均停留时间
    const preferredType = leaderboardType
    const socialInteractions = config.socialLeaderboard ? Math.floor(Math.random() * 20) + 5 : 0 // 5-25之间的社交互动次数
    
    return {
      totalViews,
      averageTimeSpent,
      preferredType,
      socialInteractions
    }
  }

  /**
   * 获取排行榜调整配置
   */
  async getLeaderboardAdjustmentConfig(userId: string): Promise<{
    leaderboardType: string | null
    leaderboardLimit: number | null
    socialLeaderboard: boolean | null
    leaderboardFilters: Record<string, unknown> | null
    highlightUser: boolean | null
  }> {
    // 获取用户的A/B测试配置
    const config = await gamificationABTestingConfigService.getUserGamificationABTestConfig(userId)
    
    const leaderboardType = config.leaderboardType && typeof config.leaderboardType === 'string'
      ? config.leaderboardType
      : null
    
    const leaderboardLimit = config.leaderboardLimit && typeof config.leaderboardLimit === 'number'
      ? config.leaderboardLimit
      : null
    
    const socialLeaderboard = config.socialLeaderboard !== undefined 
      ? !!config.socialLeaderboard
      : null
    
    const leaderboardFilters = config.leaderboardFilters && typeof config.leaderboardFilters === 'object'
      ? config.leaderboardFilters as Record<string, unknown>
      : null
    
    const highlightUser = config.highlightUser !== undefined 
      ? !!config.highlightUser
      : null
    
    return {
      leaderboardType,
      leaderboardLimit,
      socialLeaderboard,
      leaderboardFilters,
      highlightUser
    }
  }

  /**
   * 获取排行榜查看趋势
   */
  async getLeaderboardViewTrends(userId: string, days: number = 30): Promise<Array<{
    date: string
    views: number
    timeSpent: number
    interactions: number
  }>> {
    // 获取用户的A/B测试配置
    const config = await gamificationABTestingConfigService.getUserGamificationABTestConfig(userId)
    
    const socialLeaderboard = config.socialLeaderboard !== undefined 
      ? !!config.socialLeaderboard
      : false
    
    // 生成模拟趋势数据
    const trends: Array<{
      date: string
      views: number
      timeSpent: number
      interactions: number
    }> = []
    
    for (let i = 0; i < days; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      // 模拟每日排行榜查看情况
      const views = Math.floor(Math.random() * 5) // 0-5次查看
      const timeSpent = views > 0 ? Math.floor(Math.random() * 120) + 30 : 0 // 30-150秒的停留时间
      const interactions = socialLeaderboard && views > 0 ? Math.floor(Math.random() * 3) : 0 // 0-3次社交互动
      
      trends.unshift({
        date: dateStr,
        views,
        timeSpent,
        interactions
      })
    }
    
    return trends
  }

  /**
   * 获取个性化排行榜推荐
   */
  async getPersonalizedLeaderboardRecommendations(userId: string): Promise<Array<{
    type: string
    title: string
    description: string
    relevanceScore: number
  }>> {
    // 获取用户的A/B测试配置
    const config = await gamificationABTestingConfigService.getUserGamificationABTestConfig(userId)
    
    const preferredType = config.leaderboardType && typeof config.leaderboardType === 'string'
      ? config.leaderboardType
      : 'POINTS'
    
    const socialPreference = config.socialLeaderboard !== undefined 
      ? !!config.socialLeaderboard
      : false
    
    // 模拟推荐数据
    const recommendations = [
      {
        type: 'POINTS',
        title: '积分排行榜',
        description: '查看积分最高的用户排名',
        relevanceScore: preferredType === 'POINTS' ? 0.9 : 0.6
      },
      {
        type: 'LEVEL',
        title: '等级排行榜',
        description: '查看等级最高的用户排名',
        relevanceScore: preferredType === 'LEVEL' ? 0.9 : 0.6
      },
      {
        type: 'STREAK',
        title: '连续学习排行榜',
        description: '查看连续学习天数最长的用户排名',
        relevanceScore: preferredType === 'STREAK' ? 0.9 : 0.6
      },
      {
        type: 'SOCIAL',
        title: '好友排行榜',
        description: '查看你的好友在游戏化系统中的表现',
        relevanceScore: socialPreference ? 0.8 : 0.4
      },
      {
        type: 'SIMILAR',
        title: '相似用户排行榜',
        description: '查看与你相似的用户排名',
        relevanceScore: socialPreference ? 0.7 : 0.5
      }
    ]
    
    // 按相关性分数排序
    recommendations.sort((a, b) => b.relevanceScore - a.relevanceScore)
    
    return recommendations
  }

  /**
   * 调整排行榜显示内容
   */
  async adjustLeaderboardContent(
    userId: string,
    baseContent: Array<{
      userId: string
      username: string
      avatar?: string | null
      value: number
      rank: number
    }>,
    context: {
      userRank?: number
      showFriends?: boolean
      highlightUser?: boolean
    }
  ): Promise<Array<{
    userId: string
    username: string
    avatar?: string | null
    value: number
    rank: number
    highlighted?: boolean
    isFriend?: boolean
    isCurrentUser?: boolean
  }>> {
    // 获取用户的A/B测试配置
    const config = await gamificationABTestingConfigService.getUserGamificationABTestConfig(userId)
    
    const highlightUser = config.highlightUser !== undefined 
      ? !!config.highlightUser
      : context.highlightUser || false
    
    // 调整内容
    const adjustedContent = baseContent.map(item => {
      const isCurrentUser = item.userId === userId
      const isFriend = context.showFriends && Math.random() < 0.3 // 30%的概率是好友
      
      return {
        ...item,
        highlighted: highlightUser && (isCurrentUser || isFriend),
        isFriend,
        isCurrentUser
      }
    })
    
    // 如果需要高亮用户，确保当前用户在列表中
    if (highlightUser && context.userRank && !adjustedContent.some(item => item.isCurrentUser)) {
      // 模拟当前用户数据
      adjustedContent.push({
        userId,
        username: '你',
        avatar: null,
        value: Math.floor(Math.random() * 1000),
        rank: context.userRank,
        highlighted: true,
        isFriend: false,
        isCurrentUser: true
      })
      
      // 重新排序
      adjustedContent.sort((a, b) => a.rank - b.rank)
    }
    
    return adjustedContent
  }
}

// 导出单例实例
export const leaderboardInterceptor = new LeaderboardInterceptor()