import { isPrismaInitialized } from '@/lib/db'

// 检查是否在服务端环境
const isServerSide = typeof window === 'undefined'

// 临时定义类型，直到Prisma客户端更新
export enum LearningStyleType {
  VISUAL      = 'VISUAL',
  AUDITORY    = 'AUDITORY',
  KINESTHETIC = 'KINESTHETIC',
  READING     = 'READING',
  MIXED       = 'MIXED'
}

enum UserBehaviorEventType {
  REVIEW_COMPLETED     = 'REVIEW_COMPLETED',
  MEMORY_CREATED       = 'MEMORY_CREATED',
  CATEGORY_FOCUS       = 'CATEGORY_FOCUS',
  TIME_SPENT           = 'TIME_SPENT',
  ACCURACY_HIGH        = 'ACCURACY_HIGH',
  ACCURACY_LOW         = 'ACCURACY_LOW',
  STREAK_MAINTAINED    = 'STREAK_MAINTAINED',
  CHALLENGE_COMPLETED = 'CHALLENGE_COMPLETED',
  ACHIEVEMENT_UNLOCKED = 'ACHIEVEMENT_UNLOCKED',
  LEVEL_UP            = 'LEVEL_UP',
  POINTS_EARNED       = 'POINTS_EARNED',
  UI_INTERACTION      = 'UI_INTERACTION',
  THEME_CHANGED       = 'THEME_CHANGED',
  CUSTOMIZATION       = 'CUSTOMIZATION'
}

enum LearningContentType {
  TEXT                = 'TEXT',
  IMAGE               = 'IMAGE',
  AUDIO               = 'AUDIO',
  VIDEO               = 'VIDEO',
  INTERACTIVE         = 'INTERACTIVE',
  QUIZ                = 'QUIZ'
}

// 临时定义UserLearningStyle类型
interface UserLearningStyle {
  id: string
  userId: string
  primaryStyle: LearningStyleType
  secondaryStyle?: LearningStyleType
  visualScore: number
  auditoryScore: number
  kinestheticScore: number
  readingScore: number
  lastAnalyzedAt: Date
  dataPoints: number
}

// 学习风格分析配置
interface LearningStyleConfig {
  minDataPoints: number
  recencyWeight: number // 最近行为权重
  accuracyWeight: number // 准确率权重
  timeWeight: number // 时间权重
  successWeight: number // 成功率权重
}

// 分析结果接口
interface LearningStyleAnalysis {
  primaryStyle: LearningStyleType
  secondaryStyle?: LearningStyleType
  scores: {
    visual: number
    auditory: number
    kinesthetic: number
    reading: number
  }
  confidence: number // 置信度 0-1
  recommendations: string[]
}

// 行为事件接口
interface BehaviorEvent {
  eventType: UserBehaviorEventType
  contentType?: LearningContentType
  categoryId?: string
  timeSpent?: number
  accuracy?: number
  difficulty?: number
  success?: boolean
  timestamp: Date
  metadata?: Record<string, unknown>
}

/**
 * 学习风格分析服务
 */
export class LearningStyleService {
  private config: LearningStyleConfig = {
    minDataPoints: 10,
    recencyWeight: 0.3,
    accuracyWeight: 0.25,
    timeWeight: 0.25,
    successWeight: 0.2
  }

  /**
   * 记录用户行为事件
   */
  async recordBehaviorEvent(
    userId: string,
    eventType: UserBehaviorEventType,
    data: {
      contentType?: LearningContentType
      categoryId?: string
      timeSpent?: number
      accuracy?: number
      difficulty?: number
      success?: boolean
      metadata?: Record<string, unknown>
    } = {}
  ): Promise<void> {
    // 检查是否在服务端环境且 Prisma 已初始化
    if (!isServerSide || !isPrismaInitialized()) {
      console.error('LearningStyleService.recordBehaviorEvent 只能在服务端运行')
      throw new Error('此方法只能在服务端运行')
    }

    try {
      // 动态导入 Prisma，避免在客户端打包
      const { prisma } = await import('@/lib/db')

      await prisma.userBehaviorEvent.create({
        data: {
          userId,
          eventType,
          contentType: data.contentType,
          categoryId: data.categoryId,
          timeSpent: data.timeSpent || 0,
          accuracy: data.accuracy || 0,
          difficulty: data.difficulty || 1,
          success: data.success || false,
          metadata: JSON.parse(JSON.stringify(data.metadata || {})),
          timestamp: new Date()
        }
      })
    } catch (error) {
      console.error('记录用户行为事件失败:', error)
      throw error
    }
  }

  /**
   * 获取用户行为历史
   */
  async getUserBehaviorHistory(userId: string, limit: number = 100): Promise<BehaviorEvent[]> {
    // 检查是否在服务端环境且 Prisma 已初始化
    if (!isServerSide || !isPrismaInitialized()) {
      console.error('LearningStyleService.getUserBehaviorHistory 只能在服务端运行')
      throw new Error('此方法只能在服务端运行')
    }

    try {
      // 动态导入 Prisma，避免在客户端打包
      const { prisma } = await import('@/lib/db')

      const events = await prisma.userBehaviorEvent.findMany({
        where: { userId },
        orderBy: { timestamp: 'desc' },
        take: limit
      })

      return events.map(event => ({
        eventType: event.eventType as UserBehaviorEventType,
        contentType: event.contentType as LearningContentType || undefined,
        categoryId: event.categoryId || undefined,
        timeSpent: event.timeSpent || undefined,
        accuracy: event.accuracy || undefined,
        difficulty: event.difficulty || undefined,
        success: event.success || undefined,
        timestamp: event.timestamp,
        metadata: event.metadata as Record<string, unknown> || undefined
      }))
    } catch (error) {
      console.error('获取用户行为历史失败:', error)
      return []
    }
  }

  /**
   * 分析用户学习风格
   */
  async analyzeLearningStyle(userId: string): Promise<LearningStyleAnalysis> {
    try {
      // 获取用户行为历史
      const behaviorEvents = await this.getUserBehaviorHistory(userId, 200)
      
      // 如果数据点不足，返回默认分析
      if (behaviorEvents.length < this.config.minDataPoints) {
        return {
          primaryStyle: LearningStyleType.MIXED,
          scores: {
            visual: 25,
            auditory: 25,
            kinesthetic: 25,
            reading: 25
          },
          confidence: 0,
          recommendations: [
            '请完成更多学习活动以获得准确的学习风格分析',
            '尝试不同类型的学习内容，包括文本、图像、音频和交互式内容'
          ]
        }
      }

      // 计算各学习风格分数
      const scores = this.calculateLearningStyleScores(behaviorEvents)
      
      // 确定主要和次要学习风格
      const sortedScores = Object.entries(scores)
        .sort(([,a], [,b]) => b - a) as [keyof typeof scores, number][]
      
      const primaryStyle = this.mapScoreToStyle(sortedScores[0][0])
      const secondaryStyle = sortedScores[1][1] > sortedScores[0][1] * 0.8 
        ? this.mapScoreToStyle(sortedScores[1][0])
        : undefined

      // 计算置信度
      const confidence = this.calculateConfidence(scores, behaviorEvents.length)

      // 生成建议
      const recommendations = this.generateRecommendations(scores, primaryStyle)

      // 保存分析结果
      await this.saveAnalysisResult(userId, {
        primaryStyle,
        secondaryStyle,
        visualScore: Math.round(scores.visual),
        auditoryScore: Math.round(scores.auditory),
        kinestheticScore: Math.round(scores.kinesthetic),
        readingScore: Math.round(scores.reading),
        dataPoints: behaviorEvents.length
      })

      return {
        primaryStyle,
        secondaryStyle,
        scores,
        confidence,
        recommendations
      }
    } catch (error) {
      console.error('分析学习风格失败:', error)
      throw error
    }
  }

  /**
   * 计算学习风格分数
   */
  private calculateLearningStyleScores(events: BehaviorEvent[]): {
    visual: number;
    auditory: number;
    kinesthetic: number;
    reading: number;
  } {
    const scores = {
      visual: 0,
      auditory: 0,
      kinesthetic: 0,
      reading: 0
    }

    // 计算时间衰减因子
    const now = new Date()
    const maxAge = Math.max(...events.map(e => now.getTime() - e.timestamp.getTime()))
    
    events.forEach(event => {
      const age = now.getTime() - event.timestamp.getTime()
      const recencyFactor = 1 - (age / maxAge) * this.config.recencyWeight
      
      // 根据事件类型和内容类型计算分数
      const styleScores: Partial<typeof scores> = {}
      
      switch (event.contentType) {
        case LearningContentType.TEXT:
          styleScores.reading = 1
          styleScores.visual = 0.3
          break
        case LearningContentType.IMAGE:
          styleScores.visual = 1
          styleScores.reading = 0.2
          break
        case LearningContentType.AUDIO:
          styleScores.auditory = 1
          break
        case LearningContentType.VIDEO:
          styleScores.visual = 0.7
          styleScores.auditory = 0.7
          break
        case LearningContentType.INTERACTIVE:
          styleScores.kinesthetic = 1
          styleScores.visual = 0.5
          break
        case LearningContentType.QUIZ:
          styleScores.reading = 0.6
          styleScores.kinesthetic = 0.4
          break
      }

      // 根据事件类型调整分数
      if (event.eventType === UserBehaviorEventType.REVIEW_COMPLETED) {
        if (event.success) {
          // 成功完成复习加强当前风格分数
          Object.keys(styleScores).forEach(key => {
            if (styleScores[key as keyof typeof styleScores]) {
              scores[key as keyof typeof scores] += styleScores[key as keyof typeof styleScores]! * recencyFactor
            }
          })
        }
      }

      // 考虑准确率和时间因素
      if (event.accuracy !== undefined) {
        const accuracyFactor = event.accuracy * this.config.accuracyWeight
        Object.keys(styleScores).forEach(key => {
          if (styleScores[key as keyof typeof styleScores]) {
            scores[key as keyof typeof scores] += styleScores[key as keyof typeof styleScores]! * accuracyFactor * recencyFactor
          }
        })
      }

      if (event.timeSpent !== undefined) {
        const timeFactor = Math.min(event.timeSpent / 300, 1) * this.config.timeWeight // 5分钟为基准
        Object.keys(styleScores).forEach(key => {
          if (styleScores[key as keyof typeof styleScores]) {
            scores[key as keyof typeof scores] += styleScores[key as keyof typeof styleScores]! * timeFactor * recencyFactor
          }
        })
      }
    })

    // 归一化分数
    const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0)
    if (totalScore > 0) {
      Object.keys(scores).forEach(key => {
        scores[key as keyof typeof scores] = (scores[key as keyof typeof scores] / totalScore) * 100
      })
    }

    return scores
  }

  /**
   * 将分数映射到学习风格
   */
  private mapScoreToStyle(scoreKey: string): LearningStyleType {
    switch (scoreKey) {
      case 'visual': return LearningStyleType.VISUAL
      case 'auditory': return LearningStyleType.AUDITORY
      case 'kinesthetic': return LearningStyleType.KINESTHETIC
      case 'reading': return LearningStyleType.READING
      default: return LearningStyleType.MIXED
    }
  }

  /**
   * 计算分析置信度
   */
  private calculateConfidence(scores: {
    visual: number;
    auditory: number;
    kinesthetic: number;
    reading: number;
  }, dataPoints: number): number {
    // 计算分数分布的方差
    const mean = Object.values(scores).reduce((sum, score) => sum + score, 0) / 4
    const variance = Object.values(scores).reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / 4
    
    // 分数分布越不均匀，置信度越高
    const distributionConfidence = Math.min(variance / 500, 1) // 标准化到0-1
    
    // 数据点越多，置信度越高
    const dataConfidence = Math.min(dataPoints / 50, 1) // 50个数据点为满分
    
    return (distributionConfidence * 0.6 + dataConfidence * 0.4)
  }

  /**
   * 生成个性化建议
   */
  private generateRecommendations(scores: {
    visual: number;
    auditory: number;
    kinesthetic: number;
    reading: number;
  }, primaryStyle: LearningStyleType): string[] {
    const recommendations: string[] = []
    
    // 基于主要学习风格的建议
    switch (primaryStyle) {
      case LearningStyleType.VISUAL:
        recommendations.push(
          '你倾向于视觉学习，建议多使用图表、图像和颜色编码来记忆信息',
          '尝试使用思维导图来组织和连接概念',
          '观看相关的视频教程可能会提高你的学习效率'
        )
        break
      case LearningStyleType.AUDITORY:
        recommendations.push(
          '你倾向于听觉学习，建议多参与讨论和听取解释',
          '尝试将信息录制成音频，在通勤或休息时反复听取',
          '朗读重要内容可能会帮助你更好地记忆'
        )
        break
      case LearningStyleType.KINESTHETIC:
        recommendations.push(
          '你倾向于动觉学习，建议通过实践和体验来学习',
          '尝试使用角色扮演或实际操作来加深理解',
          '在学习过程中加入身体动作可能会提高记忆效果'
        )
        break
      case LearningStyleType.READING:
        recommendations.push(
          '你倾向于阅读学习，建议多阅读相关文本材料',
          '尝试制作详细的笔记和摘要来强化记忆',
          '使用文字游戏和记忆技巧可能会提高学习效率'
        )
        break
      default:
        recommendations.push(
          '你是混合型学习者，可以尝试多种学习方式',
          '建议根据不同类型的内容选择最适合的学习方法',
          '定期尝试新的学习技巧以发现最有效的方式'
        )
    }

    // 基于分数分布的建议
    const secondaryStyle = Object.entries(scores)
      .sort(([,a], [,b]) => b - a)[1][0] as keyof typeof scores
    
    if (scores[secondaryStyle] > 30) {
      recommendations.push(`你的${this.getStyleName(secondaryStyle)}学习能力也很强，可以结合使用`)
    }

    // 通用建议
    recommendations.push(
      '定期复习是巩固记忆的关键，无论使用哪种学习方法',
      '尝试将新知识与已知知识联系起来，建立知识网络'
    )

    return recommendations
  }

  /**
   * 获取学习风格名称
   */
  private getStyleName(styleKey: 'visual' | 'auditory' | 'kinesthetic' | 'reading'): string {
    switch (styleKey) {
      case 'visual': return '视觉'
      case 'auditory': return '听觉'
      case 'kinesthetic': return '动觉'
      case 'reading': return '阅读'
      default: return '混合'
    }
  }

  /**
   * 保存分析结果
   */
  private async saveAnalysisResult(
    userId: string,
    data: {
      primaryStyle: LearningStyleType
      secondaryStyle?: LearningStyleType
      visualScore: number
      auditoryScore: number
      kinestheticScore: number
      readingScore: number
      dataPoints: number
    }
  ): Promise<void> {
    // 检查是否在服务端环境且 Prisma 已初始化
    if (!isServerSide || !isPrismaInitialized()) {
      console.error('LearningStyleService.saveAnalysisResult 只能在服务端运行')
      throw new Error('此方法只能在服务端运行')
    }

    try {
      // 动态导入 Prisma，避免在客户端打包
      const { prisma } = await import('@/lib/db')

      // 查找或创建学习风格记录
      let learningStyle = await prisma.userLearningStyle.findUnique({
        where: { userId }
      })

      if (learningStyle) {
        // 更新现有记录
        await prisma.userLearningStyle.update({
          where: { userId },
          data: {
            primaryStyle: data.primaryStyle,
            secondaryStyle: data.secondaryStyle,
            visualScore: data.visualScore,
            auditoryScore: data.auditoryScore,
            kinestheticScore: data.kinestheticScore,
            readingScore: data.readingScore,
            lastAnalyzedAt: new Date(),
            dataPoints: data.dataPoints
          }
        })
      } else {
        // 创建新记录
        learningStyle = await prisma.userLearningStyle.create({
          data: {
            userId,
            primaryStyle: data.primaryStyle,
            secondaryStyle: data.secondaryStyle,
            visualScore: data.visualScore,
            auditoryScore: data.auditoryScore,
            kinestheticScore: data.kinestheticScore,
            readingScore: data.readingScore,
            lastAnalyzedAt: new Date(),
            dataPoints: data.dataPoints
          }
        })
      }
    } catch (error) {
      console.error('保存学习风格分析结果失败:', error)
      throw error
    }
  }

  /**
   * 获取用户学习风格
   */
  async getUserLearningStyle(userId: string): Promise<UserLearningStyle | null> {
    // 检查是否在服务端环境且 Prisma 已初始化
    if (!isServerSide || !isPrismaInitialized()) {
      console.error('LearningStyleService.getUserLearningStyle 只能在服务端运行')
      throw new Error('此方法只能在服务端运行')
    }

    try {
      // 动态导入 Prisma，避免在客户端打包
      const { prisma } = await import('@/lib/db')

      const result = await prisma.userLearningStyle.findUnique({
        where: { userId }
      })

      if (!result) {
        return null
      }

      // 转换枚举类型
      return {
        ...result,
        primaryStyle: result.primaryStyle as LearningStyleType,
        secondaryStyle: result.secondaryStyle as LearningStyleType || undefined
      }
    } catch (error) {
      console.error('获取用户学习风格失败:', error)
      return null
    }
  }

  /**
   * 获取个性化游戏化配置
   */
  async getPersonalizedGamificationConfig(userId: string): Promise<{
    preferredContentTypes: LearningContentType[]
    preferredChallengeTypes: string[]
    visualPreference: number // 0-1
    interactionLevel: number // 0-1
    feedbackStyle: 'visual' | 'textual' | 'mixed'
  }> {
    // 检查是否在服务端环境且 Prisma 已初始化
    if (!isServerSide || !isPrismaInitialized()) {
      console.error('LearningStyleService.getPersonalizedGamificationConfig 只能在服务端运行')
      throw new Error('此方法只能在服务端运行')
    }

    try {
      const learningStyle = await this.getUserLearningStyle(userId)
      
      if (!learningStyle) {
        // 返回默认配置
        return {
          preferredContentTypes: [LearningContentType.TEXT, LearningContentType.IMAGE],
          preferredChallengeTypes: ['REVIEW_COUNT', 'MEMORY_CREATED'],
          visualPreference: 0.5,
          interactionLevel: 0.5,
          feedbackStyle: 'mixed'
        }
      }

      // 基于学习风格生成个性化配置
      const config = {
        preferredContentTypes: [] as LearningContentType[],
        preferredChallengeTypes: [] as string[],
        visualPreference: 0,
        interactionLevel: 0,
        feedbackStyle: 'mixed' as 'visual' | 'textual' | 'mixed'
      }

      // 根据学习风格设置内容类型偏好
      const maxScore = Math.max(
        learningStyle.visualScore,
        learningStyle.auditoryScore,
        learningStyle.kinestheticScore,
        learningStyle.readingScore
      )

      if (learningStyle.visualScore >= maxScore * 0.8) {
        config.preferredContentTypes.push(LearningContentType.IMAGE, LearningContentType.VIDEO)
        config.visualPreference = 0.8
        config.feedbackStyle = 'visual'
      }
      if (learningStyle.auditoryScore >= maxScore * 0.8) {
        config.preferredContentTypes.push(LearningContentType.AUDIO, LearningContentType.VIDEO)
      }
      if (learningStyle.kinestheticScore >= maxScore * 0.8) {
        config.preferredContentTypes.push(LearningContentType.INTERACTIVE, LearningContentType.QUIZ)
        config.interactionLevel = 0.8
      }
      if (learningStyle.readingScore >= maxScore * 0.8) {
        config.preferredContentTypes.push(LearningContentType.TEXT, LearningContentType.QUIZ)
        config.feedbackStyle = config.feedbackStyle === 'visual' ? 'mixed' : 'textual'
      }

      // 设置挑战类型偏好
      if (learningStyle.kinestheticScore > learningStyle.readingScore) {
        config.preferredChallengeTypes.push('CATEGORY_FOCUS', 'REVIEW_ACCURACY')
      } else {
        config.preferredChallengeTypes.push('REVIEW_COUNT', 'MEMORY_CREATED')
      }

      // 如果没有特定偏好，使用默认值
      if (config.preferredContentTypes.length === 0) {
        config.preferredContentTypes = [LearningContentType.TEXT, LearningContentType.IMAGE]
        config.visualPreference = 0.5
        config.interactionLevel = 0.5
        config.feedbackStyle = 'mixed'
      }

      return config
    } catch (error) {
      console.error('获取个性化游戏化配置失败:', error)
      throw error
    }
  }
}

// 导出单例实例
export const learningStyleService = new LearningStyleService()