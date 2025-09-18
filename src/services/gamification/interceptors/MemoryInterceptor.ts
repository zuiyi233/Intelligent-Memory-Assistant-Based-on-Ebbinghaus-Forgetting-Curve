import { gamificationABTestingConfigService } from '@/services/gamificationABTestingConfig.service'

/**
 * 记忆拦截器
 * 负责拦截记忆相关的操作，并根据A/B测试配置动态调整记忆行为
 */
export class MemoryInterceptor {
  /**
   * 拦截记忆创建操作
   */
  async interceptMemoryCreation(
    userId: string,
    memoryData: { content: string; difficulty?: number; tags?: string[] }
  ): Promise<void> {
    // 获取用户的A/B测试配置
    const config = await gamificationABTestingConfigService.getUserGamificationABTestConfig(userId)
    
    // 记录原始事件用于A/B测试分析
    await gamificationABTestingConfigService.recordGamificationEvent({
      type: 'MEMORY_CREATED',
      userId,
      data: {
        content: memoryData.content,
        difficulty: memoryData.difficulty,
        tags: memoryData.tags
      },
      timestamp: new Date()
    })
    
    // 根据配置执行额外的操作
    if (config.enableMemoryHints && config.enableMemoryHints === true) {
      // 可以在这里添加提示逻辑
      console.log(`用户 ${userId} 的记忆提示已启用`)
    }
    
    if (config.memoryVisualizationEnabled && config.memoryVisualizationEnabled === true) {
      // 可以在这里添加可视化逻辑
      console.log(`用户 ${userId} 的记忆可视化已启用`)
    }
  }

  /**
   * 获取记忆统计
   */
  async getMemoryStats(userId: string, days: number = 30): Promise<{
    totalMemories: number
    averageDifficulty: number
    retentionRate: number
    averageReviewCount: number
    favoriteTags: Array<{ tag: string; count: number }>
  }> {
    // 获取用户的A/B测试配置
    const config = await gamificationABTestingConfigService.getUserGamificationABTestConfig(userId)
    
    const enableHints = config.enableMemoryHints !== undefined 
      ? !!config.enableMemoryHints
      : false
    
    const enableVisualization = config.memoryVisualizationEnabled !== undefined 
      ? !!config.memoryVisualizationEnabled
      : false
    
    // 模拟数据
    const totalMemories = Math.floor(Math.random() * 100) + 50 // 50-150之间的总记忆数
    const averageDifficulty = Math.random() * 2 + 3 // 3-5之间的平均难度
    const retentionRate = 0.6 + Math.random() * 0.3 // 0.6-0.9之间的保留率
    const averageReviewCount = Math.floor(Math.random() * 5) + 2 // 2-7之间的平均复习次数
    
    // 模拟常用标签
    const allTags = ['学习', '工作', '生活', '健康', '娱乐', '技术', '艺术', '科学']
    const favoriteTags = allTags
      .sort(() => Math.random() - 0.5)
      .slice(0, 3 + Math.floor(Math.random() * 3)) // 3-5个随机标签
      .map(tag => ({
        tag,
        count: Math.floor(Math.random() * 10) + 1 // 1-10之间的计数
      }))
    
    return {
      totalMemories,
      averageDifficulty,
      retentionRate,
      averageReviewCount,
      favoriteTags
    }
  }

  /**
   * 获取记忆调整配置
   */
  async getMemoryAdjustmentConfig(userId: string): Promise<{
    enableHints: boolean | null
    enableVisualization: boolean | null
    difficultyAdjustment: number | null
    reviewIntervalMultiplier: number | null
    tagSuggestionEnabled: boolean | null
  }> {
    // 获取用户的A/B测试配置
    const config = await gamificationABTestingConfigService.getUserGamificationABTestConfig(userId)
    
    const enableHints = config.enableMemoryHints !== undefined 
      ? !!config.enableMemoryHints
      : null
    
    const enableVisualization = config.memoryVisualizationEnabled !== undefined 
      ? !!config.memoryVisualizationEnabled
      : null
    
    const difficultyAdjustment = config.memoryDifficultyAdjustment && typeof config.memoryDifficultyAdjustment === 'number'
      ? config.memoryDifficultyAdjustment
      : null
    
    const reviewIntervalMultiplier = config.memoryReviewIntervalMultiplier && typeof config.memoryReviewIntervalMultiplier === 'number'
      ? config.memoryReviewIntervalMultiplier
      : null
    
    const tagSuggestionEnabled = config.memoryTagSuggestionEnabled !== undefined 
      ? !!config.memoryTagSuggestionEnabled
      : null
    
    return {
      enableHints,
      enableVisualization,
      difficultyAdjustment,
      reviewIntervalMultiplier,
      tagSuggestionEnabled
    }
  }

  /**
   * 获取记忆创建趋势
   */
  async getMemoryCreationTrends(userId: string, days: number = 30): Promise<Array<{
    date: string
    totalMemories: number
    averageDifficulty: number
    averageTagsPerMemory: number
  }>> {
    // 获取用户的A/B测试配置
    const config = await gamificationABTestingConfigService.getUserGamificationABTestConfig(userId)
    
    const difficultyAdjustment = config.memoryDifficultyAdjustment && typeof config.memoryDifficultyAdjustment === 'number'
      ? config.memoryDifficultyAdjustment
      : 0
    
    // 生成模拟趋势数据
    const trends: Array<{
      date: string
      totalMemories: number
      averageDifficulty: number
      averageTagsPerMemory: number
    }> = []
    
    for (let i = 0; i < days; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      // 模拟每日记忆创建情况
      const totalMemories = Math.floor(Math.random() * 5) + 1 // 1-5个记忆
      const baseDifficulty = 3 + Math.random() * 2 // 3-5的基础难度
      const adjustedDifficulty = Math.max(1, Math.min(5, baseDifficulty + difficultyAdjustment))
      const averageTagsPerMemory = Math.floor(Math.random() * 3) + 1 // 1-3个平均标签数
      
      trends.unshift({
        date: dateStr,
        totalMemories,
        averageDifficulty: adjustedDifficulty,
        averageTagsPerMemory
      })
    }
    
    return trends
  }

  /**
   * 获取记忆难度建议
   */
  async getMemoryDifficultySuggestions(userId: string): Promise<Array<{
    difficulty: number
    reason: string
    confidence: number
  }>> {
    // 获取用户的A/B测试配置
    const config = await gamificationABTestingConfigService.getUserGamificationABTestConfig(userId)
    
    const difficultyAdjustment = config.memoryDifficultyAdjustment && typeof config.memoryDifficultyAdjustment === 'number'
      ? config.memoryDifficultyAdjustment
      : 0
    
    // 模拟数据
    const suggestions = [
      {
        difficulty: 2,
        reason: '用户最近记忆保留率较低，建议降低难度',
        confidence: Math.max(0.1, Math.min(0.9, 0.5 - difficultyAdjustment))
      },
      {
        difficulty: 3,
        reason: '用户表现稳定，建议保持中等难度',
        confidence: 0.7
      },
      {
        difficulty: 4,
        reason: '用户最近记忆保留率较高，建议提高难度',
        confidence: Math.max(0.1, Math.min(0.9, 0.5 + difficultyAdjustment))
      }
    ]
    
    // 根据难度调整排序建议
    if (difficultyAdjustment > 0) {
      // 如果配置偏向更高难度，将高难度建议排在前面
      suggestions.sort((a, b) => b.difficulty - a.difficulty)
    } else if (difficultyAdjustment < 0) {
      // 如果配置偏向更低难度，将低难度建议排在前面
      suggestions.sort((a, b) => a.difficulty - b.difficulty)
    }
    
    return suggestions
  }

  /**
   * 获取记忆标签建议
   */
  async getMemoryTagSuggestions(userId: string, content: string): Promise<Array<{
    tag: string
    relevance: number
    category: string
  }>> {
    // 获取用户的A/B测试配置
    const config = await gamificationABTestingConfigService.getUserGamificationABTestConfig(userId)
    
    const tagSuggestionEnabled = config.memoryTagSuggestionEnabled !== undefined 
      ? !!config.memoryTagSuggestionEnabled
      : false
    
    if (!tagSuggestionEnabled) {
      return []
    }
    
    // 模拟标签建议
    const allTags = [
      { tag: '学习', category: '教育', keywords: ['学习', '教育', '知识', '课程'] },
      { tag: '工作', category: '职业', keywords: ['工作', '项目', '会议', '任务'] },
      { tag: '生活', category: '日常', keywords: ['生活', '日常', '家庭', '朋友'] },
      { tag: '健康', category: '健康', keywords: ['健康', '运动', '饮食', '医疗'] },
      { tag: '娱乐', category: '休闲', keywords: ['娱乐', '游戏', '电影', '音乐'] },
      { tag: '技术', category: '专业', keywords: ['技术', '编程', '开发', '代码'] },
      { tag: '艺术', category: '创意', keywords: ['艺术', '设计', '创意', '绘画'] },
      { tag: '科学', category: '学术', keywords: ['科学', '研究', '实验', '数据'] }
    ]
    
    // 根据内容计算相关性
    const suggestions = allTags
      .map(tagData => {
        let relevance = 0
        tagData.keywords.forEach(keyword => {
          if (content.includes(keyword)) {
            relevance += 0.3
          }
        })
        
        // 添加一些随机性
        relevance += Math.random() * 0.2
        
        return {
          tag: tagData.tag,
          relevance: Math.min(1, relevance),
          category: tagData.category
        }
      })
      .filter(suggestion => suggestion.relevance > 0.1) // 只保留相关性较高的标签
      .sort((a, b) => b.relevance - a.relevance) // 按相关性排序
      .slice(0, 5) // 取前5个
    
    return suggestions
  }

  /**
   * 调整记忆复习间隔
   */
  async adjustMemoryReviewInterval(
    userId: string,
    baseInterval: number,
    performanceData: {
      retentionRate?: number
      difficulty?: number
      tags?: string[]
    }
  ): Promise<number> {
    // 获取用户的A/B测试配置
    const config = await gamificationABTestingConfigService.getUserGamificationABTestConfig(userId)
    
    let adjustedInterval = baseInterval
    
    // 根据保留率调整间隔
    if (performanceData.retentionRate !== undefined && typeof performanceData.retentionRate === 'number') {
      const intervalMultiplier = config.memoryReviewIntervalMultiplier && typeof config.memoryReviewIntervalMultiplier === 'number'
        ? config.memoryReviewIntervalMultiplier
        : 1.0 // 默认间隔倍率
      
      if (performanceData.retentionRate > 0.8) {
        // 保留率高，延长间隔
        adjustedInterval = Math.round(baseInterval * (1 + intervalMultiplier))
      } else if (performanceData.retentionRate < 0.5) {
        // 保留率低，缩短间隔
        adjustedInterval = Math.round(baseInterval * (1 - intervalMultiplier * 0.5))
      }
    }
    
    // 根据难度调整间隔
    if (performanceData.difficulty !== undefined && typeof performanceData.difficulty === 'number') {
      const difficultyMultipliers: Record<number, number> = {
        1: 1.5, // 非常简单内容间隔延长50%
        2: 1.3, // 简单内容间隔延长30%
        3: 1.0, // 中等内容间隔不变
        4: 0.8, // 困难内容间隔缩短20%
        5: 0.6 // 非常困难内容间隔缩短40%
      }
      
      const difficulty = Math.round(performanceData.difficulty) // 确保是整数
      const multiplier = difficultyMultipliers[difficulty] || 1.0
      adjustedInterval = Math.round(adjustedInterval * multiplier)
    }
    
    // 根据标签数量调整间隔
    if (performanceData.tags && Array.isArray(performanceData.tags)) {
      const tagCount = performanceData.tags.length
      const tagAdjustment = Math.max(0.8, 1 - (tagCount / 10) * 0.2) // 标签越多，间隔略微缩短，最多调整20%
      
      adjustedInterval = Math.round(adjustedInterval * tagAdjustment)
    }
    
    // 确保间隔在合理范围内
    adjustedInterval = Math.max(1, Math.min(365, adjustedInterval)) // 1天到1年之间
    
    return adjustedInterval
  }

  /**
   * 获取记忆可视化建议
   */
  async getMemoryVisualizationSuggestions(userId: string, memoryIds: string[]): Promise<Array<{
    type: 'mindmap' | 'timeline' | 'network' | 'tagcloud'
    description: string
    relevance: number
  }>> {
    // 获取用户的A/B测试配置
    const config = await gamificationABTestingConfigService.getUserGamificationABTestConfig(userId)
    
    const enableVisualization = config.memoryVisualizationEnabled !== undefined 
      ? !!config.memoryVisualizationEnabled
      : false
    
    if (!enableVisualization || !memoryIds || memoryIds.length === 0) {
      return []
    }
    
    // 模拟可视化建议
    const suggestions = [
      {
        type: 'mindmap' as const,
        description: '将记忆内容以思维导图形式展示，便于理解记忆之间的关系',
        relevance: 0.8
      },
      {
        type: 'timeline' as const,
        description: '按时间顺序展示记忆内容，便于理解记忆的发展过程',
        relevance: 0.7
      },
      {
        type: 'network' as const,
        description: '以网络图形式展示记忆之间的关联，便于发现隐藏的联系',
        relevance: 0.9
      },
      {
        type: 'tagcloud' as const,
        description: '以标签云形式展示记忆中的关键词，便于突出重点内容',
        relevance: 0.6
      }
    ]
    
    // 根据记忆数量调整相关性
    if (memoryIds.length < 5) {
      // 记忆数量少，思维导图更合适
      suggestions[0].relevance = 0.9
      suggestions[2].relevance = 0.7
    } else if (memoryIds.length > 20) {
      // 记忆数量多，标签云和网络图更合适
      suggestions[2].relevance = 0.95
      suggestions[3].relevance = 0.8
      suggestions[0].relevance = 0.6
    }
    
    // 按相关性排序
    suggestions.sort((a, b) => b.relevance - a.relevance)
    
    return suggestions
  }
}

// 导出单例实例
export const memoryInterceptor = new MemoryInterceptor()