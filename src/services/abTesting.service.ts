import { prisma } from '@/lib/db'
import type {
  ABTest,
  ABTestVariant,
  ABTestMetric,
  ABTestResult,
  ABTestUserAssignment,
  ABTestCreateForm,
  ABTestReport,
  ABTestStatsParams,
  ExtendedTargetAudience,
  TargetAudienceCriteria,
  AllocationStrategy,
  FeatureRule,
  CohortRule
} from '@/types'

// A/B测试服务
export class ABTestingService {
  /**
   * 创建新的A/B测试
   */
  async createABTest(testData: ABTestCreateForm): Promise<ABTest> {
    const { variants, metrics, ...testDataOnly } = testData

    // 创建测试
    const test = await prisma.abTest.create({
      data: {
        ...testDataOnly,
        status: 'DRAFT',
        targetAudience: testData.targetAudience as any
      }
    })

    // 创建变体
    const createdVariants = await Promise.all(
      variants.map(variant =>
        prisma.abTestVariant.create({
          data: {
            testId: test.id,
            name: variant.name,
            description: variant.description,
            config: variant.config as any,
            trafficPercentage: variant.trafficPercentage,
            isControl: variant.isControl
          }
        })
      )
    )

    // 创建指标
    const createdMetrics = await Promise.all(
      metrics.map(metric =>
        prisma.abTestMetric.create({
          data: {
            testId: test.id,
            name: metric.name,
            description: metric.description,
            type: metric.type,
            formula: metric.formula,
            unit: metric.unit,
            isActive: metric.isActive
          }
        })
      )
    )

    // 返回完整测试对象
    return {
      ...test,
      targetAudience: testData.targetAudience,
      variants: createdVariants,
      metrics: createdMetrics,
      results: []
    } as ABTest
  }

  /**
   * 获取A/B测试详情
   */
  async getABTest(testId: string): Promise<ABTest | null> {
    const test = await prisma.abTest.findUnique({
      where: { id: testId },
      include: {
        variants: true,
        metrics: true,
        results: true
      }
    })

    if (!test) return null

    return {
      ...test,
      targetAudience: test.targetAudience as any
    } as ABTest
  }

  /**
   * 获取所有A/B测试
   */
  async getAllABTests(): Promise<ABTest[]> {
    const tests = await prisma.abTest.findMany({
      include: {
        variants: true,
        metrics: true,
        results: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return tests.map(test => ({
      ...test,
      targetAudience: test.targetAudience as any
    })) as ABTest[]
  }

  /**
   * 更新A/B测试
   */
  async updateABTest(testId: string, updates: Partial<ABTest>): Promise<ABTest | null> {
    const { variants, metrics, results, ...testDataOnly } = updates

    // 更新测试基本信息
    const updatedTest = await prisma.abTest.update({
      where: { id: testId },
      data: {
        ...testDataOnly,
        targetAudience: updates.targetAudience as any
      },
      include: {
        variants: true,
        metrics: true,
        results: true
      }
    })

    return {
      ...updatedTest,
      targetAudience: updatedTest.targetAudience as any
    } as ABTest
  }

  /**
   * 删除A/B测试
   */
  async deleteABTest(testId: string): Promise<boolean> {
    try {
      await prisma.abTest.delete({
        where: { id: testId }
      })
      return true
    } catch (error) {
      console.error('删除A/B测试失败:', error)
      return false
    }
  }

  /**
   * 启动A/B测试
   */
  async startABTest(testId: string): Promise<ABTest | null> {
    const test = await prisma.abTest.update({
      where: { id: testId },
      data: {
        status: 'ACTIVE',
        startDate: new Date()
      },
      include: {
        variants: true,
        metrics: true,
        results: true
      }
    })

    if (!test) return null

    return {
      ...test,
      targetAudience: test.targetAudience as any
    } as ABTest
  }

  /**
   * 暂停A/B测试
   */
  async pauseABTest(testId: string): Promise<ABTest | null> {
    const test = await prisma.abTest.update({
      where: { id: testId },
      data: {
        status: 'PAUSED'
      },
      include: {
        variants: true,
        metrics: true,
        results: true
      }
    })

    if (!test) return null

    return {
      ...test,
      targetAudience: test.targetAudience as any
    } as ABTest
  }

  /**
   * 完成A/B测试
   */
  async completeABTest(testId: string): Promise<ABTest | null> {
    const test = await prisma.abTest.update({
      where: { id: testId },
      data: {
        status: 'COMPLETED',
        endDate: new Date()
      },
      include: {
        variants: true,
        metrics: true,
        results: true
      }
    })

    if (!test) return null

    return {
      ...test,
      targetAudience: test.targetAudience as any
    } as ABTest
  }

  /**
   * 为用户分配测试变体 - 优化版本支持更精细的用户分组
   */
  async assignUserToTestVariant(userId: string, testId: string): Promise<string | null> {
    const test = await prisma.abTest.findUnique({
      where: { id: testId },
      include: {
        variants: true
      }
    })

    if (!test || test.status !== 'ACTIVE') return null

    // 检查用户是否已经分配了变体
    const existingAssignment = await prisma.abTestUserAssignment.findUnique({
      where: {
        testId_userId: {
          testId,
          userId
        }
      }
    })

    if (existingAssignment) {
      return existingAssignment.variantId
    }

    // 检查用户是否符合目标受众条件
    const isEligible = await this.checkUserEligibility(userId, test)
    if (!isEligible) {
      return null
    }

    // 获取用户特征用于更智能的分配
    const userFeatures = await this.getUserFeatures(userId)

    // 根据流量分配和用户特征选择变体
    const variantId = await this.selectVariantForUser(test.variants, userFeatures, test.targetAudience as any)

    // 分配用户到该变体
    const assignment = await prisma.abTestUserAssignment.create({
      data: {
        testId,
        userId,
        variantId
      }
    })

    return assignment.variantId
  }

  /**
   * 检查用户是否符合目标受众条件
   */
  private async checkUserEligibility(userId: string, test: ABTest): Promise<boolean> {
    if (!test.targetAudience) return true // 如果没有目标受众限制，所有用户都符合

    const { userSegments, percentage, criteria } = test.targetAudience

    // 检查用户是否属于指定的用户细分
    if (userSegments && userSegments.length > 0) {
      const userSegment = await this.getUserSegment(userId)
      if (!userSegments.includes(userSegment)) {
        return false
      }
    }

    // 检查自定义条件
    if (criteria && Object.keys(criteria).length > 0) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          gamificationProfile: true,
          userLearningStyle: true
        }
      })

      if (!user) return false

      // 检查用户类型条件
      if (criteria.isPremium !== undefined && user.isPremium !== criteria.isPremium) {
        return false
      }

      // 检查游戏化相关条件
      if (user.gamificationProfile) {
        if (criteria.minLevel !== undefined && user.gamificationProfile.level < criteria.minLevel) {
          return false
        }
        if (criteria.maxLevel !== undefined && user.gamificationProfile.level > criteria.maxLevel) {
          return false
        }
        if (criteria.minPoints !== undefined && user.gamificationProfile.points < criteria.minPoints) {
          return false
        }
        if (criteria.maxPoints !== undefined && user.gamificationProfile.points > criteria.maxPoints) {
          return false
        }
        if (criteria.minStreak !== undefined && user.gamificationProfile.streak < criteria.minStreak) {
          return false
        }
      }

      // 检查学习风格条件
      if (criteria.learningStyle && user.userLearningStyle) {
        if (criteria.learningStyle.primary && user.userLearningStyle.primaryStyle !== criteria.learningStyle.primary) {
          return false
        }
      }

      // 检查注册时间条件
      if (criteria.minAccountAgeDays !== undefined) {
        const accountAgeDays = Math.floor((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24))
        if (accountAgeDays < criteria.minAccountAgeDays) {
          return false
        }
      }
      if (criteria.maxAccountAgeDays !== undefined) {
        const accountAgeDays = Math.floor((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24))
        if (accountAgeDays > criteria.maxAccountAgeDays) {
          return false
        }
      }
    }

    // 随机抽样检查 - 只有percentage百分比的符合条件的用户会被选中
    if (percentage !== undefined && percentage < 100) {
      const randomSample = Math.random() * 100
      if (randomSample > percentage) {
        return false
      }
    }

    return true
  }

  /**
   * 获取用户细分类型
   */
  private async getUserSegment(userId: string): Promise<string> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        gamificationProfile: true,
        reviews: {
          orderBy: { reviewTime: 'desc' },
          take: 1
        },
        memoryContents: {
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        _count: {
          select: {
            reviews: true,
            memoryContents: true,
            userAchievements: true
          }
        }
      }
    })

    if (!user) return 'unknown'

    const now = new Date()
    const accountAgeDays = Math.floor((now.getTime() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24))
    const lastActive = user.gamificationProfile?.lastActiveAt || user.updatedAt
    const inactiveDays = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24))

    // 新用户：注册时间少于30天
    if (accountAgeDays < 30) {
      return 'new_users'
    }

    // 活跃用户：最近7天内有活动
    if (inactiveDays < 7) {
      return 'active_users'
    }

    // 非活跃用户：最近7-30天内没有活动
    if (inactiveDays >= 7 && inactiveDays < 30) {
      return 'inactive_users'
    }

    // 回归用户：30天以上不活动后重新活跃
    if (inactiveDays >= 30 && user._count.reviews > 0 &&
        user.reviews[0] && (now.getTime() - user.reviews[0].reviewTime.getTime()) < (1000 * 60 * 60 * 24 * 7)) {
      return 'returning_users'
    }

    // 高参与度用户：有大量内容或复习记录
    if (user._count.memoryContents > 10 || user._count.reviews > 50) {
      return 'high_engagement_users'
    }

    // 付费用户
    if (user.isPremium) {
      return 'premium_users'
    }

    // 默认为普通用户
    return 'regular_users'
  }

  /**
   * 获取用户特征用于智能分配
   */
  private async getUserFeatures(userId: string): Promise<Record<string, any>> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        gamificationProfile: true,
        userLearningStyle: true,
        _count: {
          select: {
            reviews: true,
            memoryContents: true,
            userAchievements: true
          }
        }
      }
    })

    if (!user) return {}

    const accountAgeDays = Math.floor((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24))
    const features: Record<string, any> = {
      userId,
      isPremium: user.isPremium,
      accountAgeDays,
      activityLevel: user._count.reviews + user._count.memoryContents
    }

    if (user.gamificationProfile) {
      features.level = user.gamificationProfile.level
      features.points = user.gamificationProfile.points
      features.streak = user.gamificationProfile.streak
      features.experience = user.gamificationProfile.experience
    }

    if (user.userLearningStyle) {
      features.primaryLearningStyle = user.userLearningStyle.primaryStyle
      features.visualScore = user.userLearningStyle.visualScore
      features.auditoryScore = user.userLearningStyle.auditoryScore
      features.kinestheticScore = user.userLearningStyle.kinestheticScore
      features.readingScore = user.userLearningStyle.readingScore
    }

    return features
  }

  /**
   * 根据用户特征和测试配置选择合适的变体
   */
  private async selectVariantForUser(
    variants: any[],
    userFeatures: Record<string, any>,
    targetAudience?: any
  ): Promise<string> {
    // 如果没有特殊的分配策略，使用随机分配
    if (!targetAudience || !targetAudience.allocationStrategy) {
      const random = Math.random() * 100
      let cumulativePercentage = 0

      for (const variant of variants) {
        cumulativePercentage += variant.trafficPercentage
        if (random <= cumulativePercentage) {
          return variant.id
        }
      }

      // 如果没有匹配到任何变体，默认使用第一个变体
      return variants[0].id
    }

    // 根据分配策略选择变体
    const strategy = targetAudience.allocationStrategy

    switch (strategy.type) {
      case 'FEATURE_BASED':
        // 基于用户特征的分配
        return this.selectVariantByFeatures(variants, userFeatures, strategy.featureRules)

      case 'COHORT_BASED':
        // 基于用户分组的分配
        return this.selectVariantByCohort(variants, userFeatures, strategy.cohortRules)

      case 'HASH_BASED':
        // 基于用户ID哈希的分配（确保一致性）
        return this.selectVariantByHash(variants, userFeatures.userId)

      default:
        // 默认使用随机分配
        const random = Math.random() * 100
        let cumulativePercentage = 0

        for (const variant of variants) {
          cumulativePercentage += variant.trafficPercentage
          if (random <= cumulativePercentage) {
            return variant.id
          }
        }

        return variants[0].id
    }
  }

  /**
   * 基于用户特征选择变体
   */
  private selectVariantByFeatures(
    variants: any[],
    userFeatures: Record<string, any>,
    featureRules: any[]
  ): string {
    // 按优先级评估规则
    for (const rule of featureRules) {
      const { feature, operator, value, variantId } = rule

      if (userFeatures[feature] === undefined) continue

      let isMatch = false
      switch (operator) {
        case 'equals':
          isMatch = userFeatures[feature] === value
          break
        case 'greater_than':
          isMatch = userFeatures[feature] > value
          break
        case 'less_than':
          isMatch = userFeatures[feature] < value
          break
        case 'in':
          isMatch = Array.isArray(value) && value.includes(userFeatures[feature])
          break
      }

      if (isMatch) {
        // 确保该变体存在
        const variant = variants.find(v => v.id === variantId)
        if (variant) return variant.id
      }
    }

    // 如果没有匹配的规则，使用随机分配
    const random = Math.random() * 100
    let cumulativePercentage = 0

    for (const variant of variants) {
      cumulativePercentage += variant.trafficPercentage
      if (random <= cumulativePercentage) {
        return variant.id
      }
    }

    return variants[0].id
  }

  /**
   * 基于用户分组选择变体
   */
  private selectVariantByCohort(
    variants: any[],
    userFeatures: Record<string, any>,
    cohortRules: any[]
  ): string {
    // 确定用户所属的分组
    let userCohort = 'default'
    
    for (const rule of cohortRules) {
      const { conditions, cohortName } = rule
      let isMatch = true

      for (const condition of conditions) {
        const { feature, operator, value } = condition
        if (userFeatures[feature] === undefined) {
          isMatch = false
          break
        }

        switch (operator) {
          case 'equals':
            isMatch = userFeatures[feature] === value
            break
          case 'greater_than':
            isMatch = userFeatures[feature] > value
            break
          case 'less_than':
            isMatch = userFeatures[feature] < value
            break
          case 'in':
            isMatch = Array.isArray(value) && value.includes(userFeatures[feature])
            break
        }

        if (!isMatch) break
      }

      if (isMatch) {
        userCohort = cohortName
        break
      }
    }

    // 根据分组和流量分配选择变体
    // 这里简化处理，实际可能需要更复杂的逻辑
    const random = Math.random() * 100
    let cumulativePercentage = 0

    for (const variant of variants) {
      cumulativePercentage += variant.trafficPercentage
      if (random <= cumulativePercentage) {
        return variant.id
      }
    }

    return variants[0].id
  }

  /**
   * 基于用户ID哈希选择变体（确保一致性）
   */
  private selectVariantByHash(variants: any[], userId: string): string {
    // 使用简单的哈希函数
    let hash = 0
    for (let i = 0; i < userId.length; i++) {
      hash = ((hash << 5) - hash) + userId.charCodeAt(i)
      hash |= 0 // 转换为32位整数
    }

    // 确保哈希值为正数
    const positiveHash = Math.abs(hash)
    const scaledHash = positiveHash % 100

    // 根据流量分配选择变体
    let cumulativePercentage = 0
    for (const variant of variants) {
      cumulativePercentage += variant.trafficPercentage
      if (scaledHash <= cumulativePercentage) {
        return variant.id
      }
    }

    return variants[0].id
  }

  /**
   * 获取用户的测试变体分配
   */
  async getUserTestVariant(userId: string, testId: string): Promise<string | null> {
    const assignment = await prisma.abTestUserAssignment.findUnique({
      where: {
        testId_userId: {
          testId,
          userId
        }
      }
    })

    return assignment?.variantId || null
  }

  /**
   * 获取用户的所有测试分配
   */
  async getUserTestAssignments(userId: string): Promise<Record<string, string>> {
    const assignments = await prisma.abTestUserAssignment.findMany({
      where: { userId }
    })

    return assignments.reduce((acc: Record<string, string>, assignment) => {
      acc[assignment.testId] = assignment.variantId
      return acc
    }, {})
  }

  /**
   * 记录测试指标数据
   */
  async recordTestMetric(
    testId: string,
    variantId: string,
    metricId: string,
    value: number
  ): Promise<boolean> {
    try {
      // 查找或创建测试结果
      const existingResult = await prisma.abTestResult.findUnique({
        where: {
          testId_variantId_metricId: {
            testId,
            variantId,
            metricId
          }
        }
      })

      if (existingResult) {
        // 更新现有结果
        const updatedResult = await prisma.abTestResult.update({
          where: { id: existingResult.id },
          data: {
            value: (existingResult.value * existingResult.sampleSize + value) / (existingResult.sampleSize + 1),
            sampleSize: existingResult.sampleSize + 1
          }
        })

        // 重新计算统计指标
        await this.calculateTestStatistics(testId)
      } else {
        // 创建新结果
        await prisma.abTestResult.create({
          data: {
            testId,
            variantId,
            metricId,
            value,
            sampleSize: 1
          }
        })

        // 重新计算统计指标
        await this.calculateTestStatistics(testId)
      }

      return true
    } catch (error) {
      console.error('记录测试指标失败:', error)
      return false
    }
  }

  /**
   * 计算测试统计指标
   */
  private async calculateTestStatistics(testId: string): Promise<void> {
    const test = await prisma.abTest.findUnique({
      where: { id: testId },
      include: {
        variants: true,
        metrics: true,
        results: true
      }
    })

    if (!test || !test.results) return

    // 对每个指标，计算各变体之间的统计差异
    for (const metric of test.metrics) {
      const metricResults = test.results.filter((r: any) => r.metricId === metric.id)
      
      if (metricResults.length < 2) continue // 需要至少两个变体才能进行比较

      // 找到基准变体（通常是第一个变体）
      const baselineResult = metricResults.find((r: any) => r.variantId === test.variants[0].id)
      if (!baselineResult) continue

      // 计算其他变体相对于基准的变化
      for (const result of metricResults) {
        if (result.variantId === test.variants[0].id) continue

        // 计算绝对变化
        const change = result.value - baselineResult.value
        
        // 计算百分比变化
        const changePercentage = baselineResult.value !== 0
          ? (change / baselineResult.value) * 100
          : 0

        // 计算置信度（简化版，实际应该使用更复杂的统计方法）
        const standardError = Math.sqrt(
          (result.value * (1 - result.value)) / result.sampleSize +
          (baselineResult.value * (1 - baselineResult.value)) / baselineResult.sampleSize
        )
        
        const zScore = Math.abs(change) / (standardError || 1)
        const confidence = Math.min(0.99, Math.max(0.5, zScore / 3))

        // 判断显著性（简化版，实际应该使用假设检验）
        const significance = confidence > 0.95 && Math.abs(changePercentage) > 5

        // 更新结果
        await prisma.abTestResult.update({
          where: { id: result.id },
          data: {
            change,
            changePercentage,
            confidence,
            significance
          }
        })
      }
    }
  }

  /**
   * 获取测试结果
   */
  async getTestResults(testId: string): Promise<ABTestResult[]> {
    const results = await prisma.abTestResult.findMany({
      where: { testId }
    })

    return results as ABTestResult[]
  }

  /**
   * 获取测试的详细报告
   */
  async getTestReport(testId: string): Promise<ABTestReport | null> {
    const test = await prisma.abTest.findUnique({
      where: { id: testId },
      include: {
        variants: true,
        metrics: true,
        results: true,
        userAssignments: {
          distinct: ['userId']
        }
      }
    })

    if (!test) return null

    const results = test.results as ABTestResult[]
    const recommendations: string[] = []
    let winner: { variantId: string; confidence: number } | undefined
    const keyFindings: string[] = []

    // 分析每个指标的结果
    for (const metric of test.metrics) {
      const metricResults = results.filter(r => r.metricId === metric.id)
      
      if (metricResults.length < 2) {
        recommendations.push(`指标 ${metric.name} 数据不足，无法进行比较`)
        continue
      }

      // 找到表现最好的变体
      const bestResult = metricResults.reduce((best, current) =>
        current.value > best.value ? current : best
      )

      // 检查是否有显著差异
      if (bestResult.significance) {
        const bestVariant = test.variants.find((v: any) => v.id === bestResult.variantId)
        if (bestVariant) {
          const finding = `对于指标 ${metric.name}，变体 "${bestVariant.name}" 表现显著更好，` +
            `提升了 ${bestResult.changePercentage.toFixed(2)}%`
          recommendations.push(finding)
          keyFindings.push(finding)

          // 如果这是第一个有显著结果的指标，将其设置为胜者
          if (!winner) {
            winner = {
              variantId: bestResult.variantId,
              confidence: bestResult.confidence
            }
          }
        }
      } else {
        recommendations.push(
          `对于指标 ${metric.name}，各变体之间没有显著差异`
        )
      }
    }

    // 如果没有找到胜者，添加一般性建议
    if (!winner) {
      recommendations.push(
        '建议继续运行测试以收集更多数据，或考虑调整测试设计'
      )
    }

    // 计算测试持续时间
    const startDate = test.startDate || test.createdAt
    const endDate = test.endDate || new Date()
    const testDuration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

    return {
      test: {
        ...test,
        targetAudience: test.targetAudience as any,
        variants: test.variants,
        metrics: test.metrics,
        results: results
      } as ABTest,
      results,
      winner,
      recommendations,
      summary: {
        totalUsers: test.userAssignments.length,
        testDuration,
        keyFindings
      }
    } as ABTestReport
  }

  /**
   * 应用测试变体配置
   */
  async applyTestVariant(userId: string, testId: string): Promise<Record<string, unknown> | null> {
    const variantId = await this.getUserTestVariant(userId, testId)
    if (!variantId) return null

    const test = await prisma.abTest.findUnique({
      where: { id: testId },
      include: {
        variants: true
      }
    })

    if (!test) return null

    const variant = test.variants.find((v: any) => v.id === variantId)
    if (!variant) return null

    return variant.config as Record<string, unknown>
  }

  /**
   * 创建游戏化相关的预设测试
   */
  async createGamificationPresets(): Promise<void> {
    // 预设测试1：积分奖励数量
    await this.createABTest({
      name: '积分奖励数量测试',
      description: '测试不同积分奖励数量对用户参与度的影响',
      targetAudience: {
        userSegments: ['new_users', 'active_users'],
        percentage: 100
      },
      variants: [
        {
          name: '低积分奖励',
          description: '每次完成学习任务获得5积分',
          config: { pointsPerReview: 5, pointsPerMemory: 3 },
          trafficPercentage: 33.3,
          isControl: true
        },
        {
          name: '中积分奖励',
          description: '每次完成学习任务获得10积分',
          config: { pointsPerReview: 10, pointsPerMemory: 5 },
          trafficPercentage: 33.3,
          isControl: false
        },
        {
          name: '高积分奖励',
          description: '每次完成学习任务获得15积分',
          config: { pointsPerReview: 15, pointsPerMemory: 7 },
          trafficPercentage: 33.4,
          isControl: false
        }
      ],
      metrics: [
        {
          name: '用户参与度',
          description: '测量用户在平台上的参与程度',
          type: 'ENGAGEMENT',
          formula: 'loginFrequency * sessionDuration',
          unit: '参与度指数',
          isActive: true
        },
        {
          name: '用户保留率',
          description: '测量用户在一段时间后的保留情况',
          type: 'RETENTION',
          formula: 'day7Retention',
          unit: '保留率',
          isActive: true
        }
      ]
    })

    // 预设测试2：成就解锁阈值
    await this.createABTest({
      name: '成就解锁阈值测试',
      description: '测试不同成就解锁阈值对用户动机的影响',
      targetAudience: {
        userSegments: ['new_users'],
        percentage: 100
      },
      variants: [
        {
          name: '简单成就',
          description: '降低成就解锁阈值',
          config: { achievementMultiplier: 0.7 },
          trafficPercentage: 50,
          isControl: false
        },
        {
          name: '困难成就',
          description: '提高成就解锁阈值',
          config: { achievementMultiplier: 1.3 },
          trafficPercentage: 50,
          isControl: true
        }
      ],
      metrics: [
        {
          name: '任务完成率',
          description: '测量用户完成任务的比率',
          type: 'CONVERSION',
          formula: 'completedTasks / totalTasks',
          unit: '完成率',
          isActive: true
        },
        {
          name: '成就解锁率',
          description: '测量用户解锁成就的比率',
          type: 'CONVERSION',
          formula: 'unlockedAchievements / totalAchievements',
          unit: '解锁率',
          isActive: true
        }
      ]
    })

    // 预设测试3：排行榜展示方式
    await this.createABTest({
      name: '排行榜展示方式测试',
      description: '测试不同排行榜展示方式对用户竞争行为的影响',
      targetAudience: {
        userSegments: ['active_users'],
        percentage: 100
      },
      variants: [
        {
          name: '全局排行榜',
          description: '显示所有用户的排名',
          config: { leaderboardType: 'global', showCount: 100 },
          trafficPercentage: 50,
          isControl: true
        },
        {
          name: '社交排行榜',
          description: '只显示好友和相似用户的排名',
          config: { leaderboardType: 'social', showCount: 20 },
          trafficPercentage: 50,
          isControl: false
        }
      ],
      metrics: [
        {
          name: '排行榜查看次数',
          description: '测量用户查看排行榜的次数',
          type: 'ENGAGEMENT',
          formula: 'leaderboardViewCount',
          unit: '查看次数',
          isActive: true
        },
        {
          name: '竞争性行为',
          description: '测量用户的竞争性行为',
          type: 'ENGAGEMENT',
          formula: 'challengeCompletions + achievementUnlocks',
          unit: '竞争行为指数',
          isActive: true
        }
      ]
    })
  }

  /**
   * 获取测试统计数据
   */
  async getTestStats(params: ABTestStatsParams): Promise<Record<string, any>> {
    const { testId, startDate, endDate, segment, metricIds } = params

    // 构建查询条件
    const whereClause: Record<string, any> = {
      testId
    }

    if (startDate || endDate) {
      whereClause.createdAt = {}
      if (startDate) whereClause.createdAt.gte = startDate
      if (endDate) whereClause.createdAt.lte = endDate
    }

    if (metricIds && metricIds.length > 0) {
      whereClause.metricId = {
        in: metricIds
      }
    }

    // 获取测试结果
    const results = await prisma.abTestResult.findMany({
      where: whereClause,
      include: {
        variant: true,
        metric: true
      }
    })

    // 按指标分组
    const statsByMetric = results.reduce((acc: Record<string, any>, result: any) => {
      if (!acc[result.metricId]) {
        acc[result.metricId] = {
          metric: result.metric,
          variants: {}
        }
      }

      if (!acc[result.metricId].variants[result.variantId]) {
        acc[result.metricId].variants[result.variantId] = {
          variant: result.variant,
          results: []
        }
      }

      acc[result.metricId].variants[result.variantId].results.push(result)
      return acc
    }, {})

    // 计算统计数据
    for (const metricId in statsByMetric) {
      for (const variantId in statsByMetric[metricId].variants) {
        const variantData = statsByMetric[metricId].variants[variantId]
        const results = variantData.results

        if (results.length > 0) {
          // 计算平均值
          const avgValue = results.reduce((sum: number, r: any) => sum + r.value, 0) / results.length
          
          // 计算标准差
          const variance = results.reduce((sum: number, r: any) => sum + Math.pow(r.value - avgValue, 2), 0) / results.length
          const stdDev = Math.sqrt(variance)

          // 计算置信区间（95%）
          const marginOfError = 1.96 * (stdDev / Math.sqrt(results.length))

          variantData.stats = {
            avgValue,
            stdDev,
            marginOfError,
            sampleSize: results.length,
            min: Math.min(...results.map((r: any) => r.value)),
            max: Math.max(...results.map((r: any) => r.value))
          }
        }
      }
    }

    return statsByMetric
  }
}

// 导出单例实例
export const abTestingService = new ABTestingService()