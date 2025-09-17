/**
 * 游戏化A/B测试预设模板服务
 * 
 * 提供预定义的游戏化A/B测试模板，包括：
 * - 成就系统测试模板
 * - 积分系统测试模板
 * - 排行榜测试模板
 * - 挑战任务测试模板
 * - 通知系统测试模板
 * - 综合游戏化体验测试模板
 */

// A/B测试模板类型
export interface ABTestTemplate {
  id: string
  name: string
  description: string
  category: 'achievements' | 'points' | 'leaderboard' | 'challenges' | 'notifications' | 'comprehensive'
  targetMetrics: Array<{
    name: string
    description: string
    primary: boolean
    unit: string
  }>
  variants: Array<{
    id: string
    name: string
    description: string
    config: Record<string, unknown>
    isControl?: boolean
    trafficAllocation: number
  }>
  estimatedDuration: number // 预估测试天数
  recommendedSampleSize: number // 推荐样本量
  prerequisites: string[] // 前置条件
  tags: string[] // 标签
  difficulty: 'easy' | 'medium' | 'hard'
  riskLevel: 'low' | 'medium' | 'high'
}

/**
 * 游戏化A/B测试预设模板服务
 */
export class GamificationABTestingTemplates {
  private templates: ABTestTemplate[]

  constructor() {
    this.templates = this.initializeTemplates()
  }

  /**
   * 初始化所有预设模板
   */
  private initializeTemplates(): ABTestTemplate[] {
    return [
      // 成就系统测试模板
      {
        id: 'achievement-notification-optimization',
        name: '成就通知优化测试',
        description: '测试不同类型的成就通知对用户参与度和成就解锁率的影响',
        category: 'achievements',
        targetMetrics: [
          {
            name: '成就解锁率',
            description: '用户解锁成就的比例',
            primary: true,
            unit: '%'
          },
          {
            name: '用户参与度',
            description: '用户与成就系统互动的频率',
            primary: false,
            unit: '次/天'
          },
          {
            name: '通知点击率',
            description: '用户点击成就通知的比例',
            primary: false,
            unit: '%'
          }
        ],
        variants: [
          {
            id: 'control',
            name: '标准通知',
            description: '使用标准的通知样式和动画',
            config: {
              animationType: 'default',
              notificationSound: true,
              celebrationEffect: false,
              showProgress: true,
              autoDismiss: 5000
            },
            isControl: true,
            trafficAllocation: 50
          },
          {
            id: 'enhanced',
            name: '增强通知',
            description: '使用增强的动画效果和庆祝特效',
            config: {
              animationType: 'enhanced',
              notificationSound: true,
              celebrationEffect: true,
              showProgress: true,
              autoDismiss: 8000
            },
            trafficAllocation: 50
          }
        ],
        estimatedDuration: 14,
        recommendedSampleSize: 1000,
        prerequisites: ['基础成就系统已实现'],
        tags: ['成就', '通知', '用户体验'],
        difficulty: 'easy',
        riskLevel: 'low'
      },
      {
        id: 'achievement-threshold-testing',
        name: '成就阈值测试',
        description: '测试不同成就解锁阈值对用户动机和完成率的影响',
        category: 'achievements',
        targetMetrics: [
          {
            name: '成就完成率',
            description: '用户完成成就的比例',
            primary: true,
            unit: '%'
          },
          {
            name: '用户留存率',
            description: '用户在测试期间继续使用应用的比例',
            primary: false,
            unit: '%'
          },
          {
            name: '平均完成时间',
            description: '用户完成一个成就所需的平均时间',
            primary: false,
            unit: '小时'
          }
        ],
        variants: [
          {
            id: 'low-threshold',
            name: '低阈值',
            description: '降低成就解锁的难度要求',
            config: {
              thresholdMultiplier: 0.7,
              partialProgress: true,
              bonusPoints: 5
            },
            isControl: false,
            trafficAllocation: 33
          },
          {
            id: 'medium-threshold',
            name: '中阈值',
            description: '使用标准的成就解锁难度',
            config: {
              thresholdMultiplier: 1.0,
              partialProgress: false,
              bonusPoints: 10
            },
            isControl: true,
            trafficAllocation: 34
          },
          {
            id: 'high-threshold',
            name: '高阈值',
            description: '提高成就解锁的难度要求但增加奖励',
            config: {
              thresholdMultiplier: 1.5,
              partialProgress: false,
              bonusPoints: 20
            },
            isControl: false,
            trafficAllocation: 33
          }
        ],
        estimatedDuration: 21,
        recommendedSampleSize: 1500,
        prerequisites: ['基础成就系统已实现'],
        tags: ['成就', '难度', '动机'],
        difficulty: 'medium',
        riskLevel: 'medium'
      },

      // 积分系统测试模板
      {
        id: 'points-reward-structure',
        name: '积分奖励结构测试',
        description: '测试不同的积分奖励结构对用户行为和参与度的影响',
        category: 'points',
        targetMetrics: [
          {
            name: '日均获取积分',
            description: '用户每天平均获得的积分数量',
            primary: true,
            unit: '积分'
          },
          {
            name: '任务完成率',
            description: '用户完成可获得积分的任务的比例',
            primary: false,
            unit: '%'
          },
          {
            name: '积分消费行为',
            description: '用户使用积分兑换奖励的频率',
            primary: false,
            unit: '次/周'
          }
        ],
        variants: [
          {
            id: 'fixed-points',
            name: '固定积分',
            description: '每种行为获得固定数量的积分',
            config: {
              rewardType: 'fixed',
              basePoints: 10,
              bonusMultiplier: 1,
              dailyCap: 100
            },
            isControl: true,
            trafficAllocation: 50
          },
          {
            id: 'dynamic-points',
            name: '动态积分',
            description: '根据行为难度和频率动态调整积分',
            config: {
              rewardType: 'dynamic',
              basePoints: 5,
              bonusMultiplier: 1.5,
              difficultyFactor: true,
              dailyCap: 150
            },
            isControl: false,
            trafficAllocation: 50
          }
        ],
        estimatedDuration: 14,
        recommendedSampleSize: 1200,
        prerequisites: ['基础积分系统已实现'],
        tags: ['积分', '奖励', '动机'],
        difficulty: 'medium',
        riskLevel: 'medium'
      },
      {
        id: 'points-expiration-testing',
        name: '积分过期机制测试',
        description: '测试积分过期策略对用户活跃度和参与度的影响',
        category: 'points',
        targetMetrics: [
          {
            name: '用户活跃度',
            description: '用户登录和使用的频率',
            primary: true,
            unit: '天/周'
          },
          {
            name: '积分消费率',
            description: '用户在积分过期前的消费比例',
            primary: false,
            unit: '%'
          },
          {
            name: '用户满意度',
            description: '用户对积分系统的满意度评分',
            primary: false,
            unit: '分'
          }
        ],
        variants: [
          {
            id: 'no-expiration',
            name: '永不过期',
            description: '积分永不过期，用户可以长期累积',
            config: {
              expirationPolicy: 'none',
              reminderNotifications: false
            },
            isControl: true,
            trafficAllocation: 33
          },
          {
            id: 'long-expiration',
            name: '长期过期',
            description: '积分在12个月后过期',
            config: {
              expirationPolicy: 'long-term',
              expirationMonths: 12,
              reminderNotifications: true,
              reminderMonths: [11, 11.5]
            },
            isControl: false,
            trafficAllocation: 33
          },
          {
            id: 'short-expiration',
            name: '短期过期',
            description: '积分在3个月后过期，但提供额外奖励',
            config: {
              expirationPolicy: 'short-term',
              expirationMonths: 3,
              reminderNotifications: true,
              reminderMonths: [2, 2.5, 2.75],
              earlySpendingBonus: 1.2
            },
            isControl: false,
            trafficAllocation: 34
          }
        ],
        estimatedDuration: 90,
        recommendedSampleSize: 2000,
        prerequisites: ['基础积分系统已实现'],
        tags: ['积分', '过期', '用户留存'],
        difficulty: 'hard',
        riskLevel: 'high'
      },

      // 排行榜测试模板
      {
        id: 'leaderboard-display-format',
        name: '排行榜展示格式测试',
        description: '测试不同排行榜展示格式对用户竞争行为和参与度的影响',
        category: 'leaderboard',
        targetMetrics: [
          {
            name: '排行榜查看频率',
            description: '用户查看排行榜的频率',
            primary: true,
            unit: '次/天'
          },
          {
            name: '排名提升行为',
            description: '用户为提升排名而采取的行动频率',
            primary: false,
            unit: '次/周'
          },
          {
            name: '社交分享率',
            description: '用户分享自己排名的比例',
            primary: false,
            unit: '%'
          }
        ],
        variants: [
          {
            id: 'classic-leaderboard',
            name: '经典排行',
            description: '按总积分进行排名的单一排行榜',
            config: {
              displayType: 'classic',
              rankingBy: 'total-points',
              showFriendsOnly: false,
              updateFrequency: 'daily'
            },
            isControl: true,
            trafficAllocation: 33
          },
          {
            id: 'category-leaderboard',
            name: '分类排行',
            description: '按不同类别分别排名的多个排行榜',
            config: {
              displayType: 'category',
              rankingBy: ['achievements', 'points', 'streak'],
              showFriendsOnly: false,
              updateFrequency: 'daily'
            },
            isControl: false,
            trafficAllocation: 33
          },
          {
            id: 'social-leaderboard',
            name: '社交排行',
            description: '主要显示好友排名，突出社交比较',
            config: {
              displayType: 'social',
              rankingBy: 'total-points',
              showFriendsOnly: true,
              showGlobalRank: true,
              updateFrequency: 'real-time'
            },
            isControl: false,
            trafficAllocation: 34
          }
        ],
        estimatedDuration: 14,
        recommendedSampleSize: 1500,
        prerequisites: ['基础排行榜系统已实现'],
        tags: ['排行榜', '社交', '竞争'],
        difficulty: 'medium',
        riskLevel: 'low'
      },

      // 挑战任务测试模板
      {
        id: 'challenge-difficulty-curve',
        name: '挑战难度曲线测试',
        description: '测试不同难度曲线的挑战任务对用户完成率和留存率的影响',
        category: 'challenges',
        targetMetrics: [
          {
            name: '挑战完成率',
            description: '用户完成挑战的比例',
            primary: true,
            unit: '%'
          },
          {
            name: '用户留存率',
            description: '用户在挑战期间继续使用应用的比例',
            primary: false,
            unit: '%'
          },
          {
            name: '平均完成时间',
            description: '用户完成挑战所需的平均时间',
            primary: false,
            unit: '天'
          }
        ],
        variants: [
          {
            id: 'linear-difficulty',
            name: '线性难度',
            description: '挑战难度随时间线性增加',
            config: {
              difficultyCurve: 'linear',
              initialDifficulty: 1,
              difficultyIncrement: 1,
              challengeFrequency: 'daily'
            },
            isControl: true,
            trafficAllocation: 33
          },
          {
            id: 'exponential-difficulty',
            name: '指数难度',
            description: '挑战难度随时间指数级增加',
            config: {
              difficultyCurve: 'exponential',
              initialDifficulty: 1,
              difficultyMultiplier: 1.5,
              challengeFrequency: 'daily'
            },
            isControl: false,
            trafficAllocation: 33
          },
          {
            id: 'adaptive-difficulty',
            name: '自适应难度',
            description: '根据用户表现动态调整挑战难度',
            config: {
              difficultyCurve: 'adaptive',
              adaptiveAlgorithm: 'performance-based',
              challengeFrequency: 'daily',
              adaptiveWindow: 3
            },
            isControl: false,
            trafficAllocation: 34
          }
        ],
        estimatedDuration: 30,
        recommendedSampleSize: 1800,
        prerequisites: ['基础挑战系统已实现'],
        tags: ['挑战', '难度', '自适应'],
        difficulty: 'hard',
        riskLevel: 'medium'
      },

      // 通知系统测试模板
      {
        id: 'notification-timing-frequency',
        name: '通知时机与频率测试',
        description: '测试不同通知时机和频率对用户参与度和响应率的影响',
        category: 'notifications',
        targetMetrics: [
          {
            name: '通知打开率',
            description: '用户打开通知的比例',
            primary: true,
            unit: '%'
          },
          {
            name: '通知响应率',
            description: '用户在通知后采取行动的比例',
            primary: false,
            unit: '%'
          },
          {
            name: '用户满意度',
            description: '用户对通知频率和时机的满意度',
            primary: false,
            unit: '分'
          }
        ],
        variants: [
          {
            id: 'immediate-notifications',
            name: '即时通知',
            description: '事件发生后立即发送通知',
            config: {
              timingStrategy: 'immediate',
              frequency: 'event-based',
              quietHours: false,
              maxDailyNotifications: 10
            },
            isControl: true,
            trafficAllocation: 33
          },
          {
            id: 'batched-notifications',
            name: '批量通知',
            description: '将多个通知合并后在特定时间发送',
            config: {
              timingStrategy: 'batched',
              frequency: 'scheduled',
              batchTimes: ['09:00', '12:00', '18:00'],
              quietHours: true,
              quietHoursStart: '22:00',
              quietHoursEnd: '08:00'
            },
            isControl: false,
            trafficAllocation: 33
          },
          {
            id: 'adaptive-notifications',
            name: '自适应通知',
            description: '根据用户行为模式智能选择通知时机',
            config: {
              timingStrategy: 'adaptive',
              frequency: 'adaptive',
              learningPeriod: 7,
              maxDailyNotifications: 8,
              userPreferenceWeight: 0.7
            },
            isControl: false,
            trafficAllocation: 34
          }
        ],
        estimatedDuration: 21,
        recommendedSampleSize: 2000,
        prerequisites: ['基础通知系统已实现'],
        tags: ['通知', '时机', '用户体验'],
        difficulty: 'medium',
        riskLevel: 'medium'
      },

      // 综合游戏化体验测试模板
      {
        id: 'comprehensive-gamification-experience',
        name: '综合游戏化体验测试',
        description: '测试不同游戏化元素组合对整体用户体验和长期参与度的影响',
        category: 'comprehensive',
        targetMetrics: [
          {
            name: '用户留存率',
            description: '用户在30天后继续使用应用的比例',
            primary: true,
            unit: '%'
          },
          {
            name: '日均活跃时间',
            description: '用户每天在应用中活跃的平均时间',
            primary: false,
            unit: '分钟'
          },
          {
            name: '功能使用深度',
            description: '用户使用应用功能的深度和广度',
            primary: false,
            unit: '分'
          },
          {
            name: '用户满意度',
            description: '用户对整体游戏化体验的满意度',
            primary: false,
            unit: '分'
          }
        ],
        variants: [
          {
            id: 'minimal-gamification',
            name: '最小游戏化',
            description: '仅提供基本的游戏化元素',
            config: {
              achievements: {
                enabled: true,
                complexity: 'low',
                visibility: 'minimal'
              },
              points: {
                enabled: true,
                complexity: 'low',
                rewards: 'basic'
              },
              leaderboard: {
                enabled: false
              },
              challenges: {
                enabled: false
              },
              notifications: {
                enabled: true,
                frequency: 'low'
              }
            },
            isControl: true,
            trafficAllocation: 25
          },
          {
            id: 'balanced-gamification',
            name: '平衡游戏化',
            description: '提供适中的游戏化元素，注重平衡',
            config: {
              achievements: {
                enabled: true,
                complexity: 'medium',
                visibility: 'standard'
              },
              points: {
                enabled: true,
                complexity: 'medium',
                rewards: 'standard'
              },
              leaderboard: {
                enabled: true,
                visibility: 'standard'
              },
              challenges: {
                enabled: true,
                frequency: 'weekly',
                difficulty: 'adaptive'
              },
              notifications: {
                enabled: true,
                frequency: 'medium'
              }
            },
            isControl: false,
            trafficAllocation: 25
          },
          {
            id: 'rich-gamification',
            name: '丰富游戏化',
            description: '提供全面且丰富的游戏化体验',
            config: {
              achievements: {
                enabled: true,
                complexity: 'high',
                visibility: 'prominent'
              },
              points: {
                enabled: true,
                complexity: 'high',
                rewards: 'varied'
              },
              leaderboard: {
                enabled: true,
                visibility: 'prominent',
                categories: true
              },
              challenges: {
                enabled: true,
                frequency: 'daily',
                difficulty: 'progressive'
              },
              notifications: {
                enabled: true,
                frequency: 'high',
                personalization: true
              }
            },
            isControl: false,
            trafficAllocation: 25
          },
          {
            id: 'social-gamification',
            name: '社交游戏化',
            description: '强调社交互动和合作的游戏化体验',
            config: {
              achievements: {
                enabled: true,
                complexity: 'medium',
                visibility: 'social',
                teamAchievements: true
              },
              points: {
                enabled: true,
                complexity: 'medium',
                rewards: 'social',
                teamPoints: true
              },
              leaderboard: {
                enabled: true,
                visibility: 'social',
                teamLeaderboard: true
              },
              challenges: {
                enabled: true,
                frequency: 'weekly',
                difficulty: 'medium',
                teamChallenges: true
              },
              notifications: {
                enabled: true,
                frequency: 'medium',
                socialSharing: true
              }
            },
            isControl: false,
            trafficAllocation: 25
          }
        ],
        estimatedDuration: 60,
        recommendedSampleSize: 4000,
        prerequisites: [
          '基础成就系统已实现',
          '基础积分系统已实现',
          '基础排行榜系统已实现',
          '基础挑战系统已实现',
          '基础通知系统已实现'
        ],
        tags: ['综合', '用户体验', '长期参与'],
        difficulty: 'hard',
        riskLevel: 'high'
      }
    ]
  }

  /**
   * 获取所有模板
   */
  getAllTemplates(): ABTestTemplate[] {
    return [...this.templates]
  }

  /**
   * 根据ID获取模板
   */
  getTemplateById(id: string): ABTestTemplate | undefined {
    return this.templates.find(template => template.id === id)
  }

  /**
   * 根据类别获取模板
   */
  getTemplatesByCategory(category: ABTestTemplate['category']): ABTestTemplate[] {
    return this.templates.filter(template => template.category === category)
  }

  /**
   * 根据标签获取模板
   */
  getTemplatesByTag(tag: string): ABTestTemplate[] {
    return this.templates.filter(template => 
      template.tags.some(templateTag => 
        templateTag.toLowerCase().includes(tag.toLowerCase())
      )
    )
  }

  /**
   * 根据难度获取模板
   */
  getTemplatesByDifficulty(difficulty: ABTestTemplate['difficulty']): ABTestTemplate[] {
    return this.templates.filter(template => template.difficulty === difficulty)
  }

  /**
   * 根据风险等级获取模板
   */
  getTemplatesByRiskLevel(riskLevel: ABTestTemplate['riskLevel']): ABTestTemplate[] {
    return this.templates.filter(template => template.riskLevel === riskLevel)
  }

  /**
   * 搜索模板
   */
  searchTemplates(query: string): ABTestTemplate[] {
    const lowerQuery = query.toLowerCase()
    return this.templates.filter(template => 
      template.name.toLowerCase().includes(lowerQuery) ||
      template.description.toLowerCase().includes(lowerQuery) ||
      template.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    )
  }

  /**
   * 获取推荐模板
   */
  getRecommendedTemplates(
    userExperience: 'beginner' | 'intermediate' | 'advanced',
    availableResources: 'low' | 'medium' | 'high',
    targetGoals: string[]
  ): ABTestTemplate[] {
    // 根据用户经验水平筛选难度
    let difficultyFilter: ABTestTemplate['difficulty'][]
    switch (userExperience) {
      case 'beginner':
        difficultyFilter = ['easy']
        break
      case 'intermediate':
        difficultyFilter = ['easy', 'medium']
        break
      case 'advanced':
        difficultyFilter = ['medium', 'hard']
        break
    }

    // 根据可用资源筛选风险等级
    let riskFilter: ABTestTemplate['riskLevel'][]
    switch (availableResources) {
      case 'low':
        riskFilter = ['low']
        break
      case 'medium':
        riskFilter = ['low', 'medium']
        break
      case 'high':
        riskFilter = ['low', 'medium', 'high']
        break
    }

    // 根据目标筛选相关模板
    const goalFiltered = this.templates.filter(template => 
      targetGoals.some(goal => 
        template.description.toLowerCase().includes(goal.toLowerCase()) ||
        template.tags.some(tag => tag.toLowerCase().includes(goal.toLowerCase()))
      )
    )

    // 结合所有筛选条件
    return goalFiltered.filter(template =>
      difficultyFilter.includes(template.difficulty) &&
      riskFilter.includes(template.riskLevel)
    )
  }

  /**
   * 创建自定义模板
   */
  createCustomTemplate(
    baseTemplateId: string,
    customizations: {
      name?: string
      description?: string
      variants?: Array<{
        id: string
        name: string
        description: string
        config: Record<string, unknown>
        trafficAllocation: number
      }>
      targetMetrics?: Array<{
        name: string
        description: string
        primary: boolean
        unit: string
      }>
      estimatedDuration?: number
      recommendedSampleSize?: number
    }
  ): ABTestTemplate | null {
    const baseTemplate = this.getTemplateById(baseTemplateId)
    if (!baseTemplate) {
      return null
    }

    return {
      ...baseTemplate,
      name: customizations.name || baseTemplate.name,
      description: customizations.description || baseTemplate.description,
      variants: customizations.variants || baseTemplate.variants,
      targetMetrics: customizations.targetMetrics || baseTemplate.targetMetrics,
      estimatedDuration: customizations.estimatedDuration || baseTemplate.estimatedDuration,
      recommendedSampleSize: customizations.recommendedSampleSize || baseTemplate.recommendedSampleSize,
      id: `custom-${Date.now()}` // 生成唯一ID
    }
  }

  /**
   * 验证模板配置
   */
  validateTemplate(template: ABTestTemplate): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    // 验证基本信息
    if (!template.name || template.name.trim() === '') {
      errors.push('模板名称不能为空')
    }

    if (!template.description || template.description.trim() === '') {
      errors.push('模板描述不能为空')
    }

    // 验证变体
    if (!template.variants || template.variants.length < 2) {
      errors.push('至少需要两个测试变体')
    }

    // 验证流量分配
    if (template.variants) {
      const totalAllocation = template.variants.reduce((sum, variant) => sum + variant.trafficAllocation, 0)
      if (totalAllocation !== 100) {
        errors.push(`流量分配总和必须为100%，当前为${totalAllocation}%`)
      }

      // 验证是否有控制组
      const hasControl = template.variants.some(variant => variant.isControl)
      if (!hasControl) {
        errors.push('必须有一个控制组变体')
      }
    }

    // 验证目标指标
    if (!template.targetMetrics || template.targetMetrics.length === 0) {
      errors.push('至少需要一个目标指标')
    }

    if (template.targetMetrics) {
      const primaryMetrics = template.targetMetrics.filter(metric => metric.primary)
      if (primaryMetrics.length !== 1) {
        errors.push('必须有且仅有一个主要指标')
      }
    }

    // 验证预估持续时间和样本量
    if (template.estimatedDuration <= 0) {
      errors.push('预估持续时间必须大于0')
    }

    if (template.recommendedSampleSize <= 0) {
      errors.push('推荐样本量必须大于0')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * 获取模板使用统计
   */
  getTemplateUsageStats(): Array<{
    templateId: string
    templateName: string
    usageCount: number
    averageImprovement: number
    successRate: number
  }> {
    // 简化实现，实际应该从数据库获取真实统计数据
    return [
      {
        templateId: 'achievement-notification-optimization',
        templateName: '成就通知优化测试',
        usageCount: 25,
        averageImprovement: 12.5,
        successRate: 0.84
      },
      {
        templateId: 'points-reward-structure',
        templateName: '积分奖励结构测试',
        usageCount: 18,
        averageImprovement: 8.3,
        successRate: 0.72
      },
      {
        templateId: 'leaderboard-display-format',
        templateName: '排行榜展示格式测试',
        usageCount: 15,
        averageImprovement: 9.7,
        successRate: 0.80
      }
    ]
  }
}