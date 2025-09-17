import { prisma, isPrismaInitialized } from '@/lib/db'
import {
  PersonalizedConfig,
  PersonalizedConfigForm,
  PersonalizedConfigRecommendation,
  PersonalizedConfigResponse,
  PersonalizedConfigRecommendationResponse,
  DifficultyConfig,
  NotificationConfig,
  ThemeConfig,
  UserPreferences,
  LearningStyleAdaptationConfig,
  DifficultyLevel,
  NotificationType,
  NotificationMethod,
  ThemeStyle,
  LearningStyleAdaptationStrategy
} from '@/types'
import {
  LearningStyleType,
  LearningContentType,
  ChallengeType as PrismaChallengeType
} from '@prisma/client'

// 重新导出 ChallengeType 以避免命名冲突
type ChallengeType = PrismaChallengeType
// 导入 ChallengeType 枚举值
const ChallengeTypeEnum = PrismaChallengeType

/**
 * 个性化配置服务类
 */
export class PersonalizedConfigService {
  /**
   * 获取用户的个性化配置
   */
  async getUserPersonalizedConfig(userId: string): Promise<PersonalizedConfig | null> {
    try {
      if (!isPrismaInitialized() || !prisma.personalizedConfig) {
        throw new Error('数据库连接未正确初始化，无法获取个性化配置')
      }

      const config = await prisma.personalizedConfig.findUnique({
        where: { userId },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              name: true,
              email: true
            }
          }
        }
      })

      if (!config) {
        return null
      }

      // 解析 JSON 字段
      return {
        id: config.id,
        userId: config.userId,
        difficulty: config.difficulty as DifficultyConfig,
        notifications: config.notifications as NotificationConfig,
        theme: config.theme as ThemeConfig,
        preferences: config.preferences as UserPreferences,
        learningStyleAdaptation: config.learningStyleAdaptation as LearningStyleAdaptationConfig,
        lastUpdatedAt: config.lastUpdatedAt,
        createdAt: config.createdAt
      }
    } catch (error) {
      console.error('获取用户个性化配置失败:', error)
      throw error
    }
  }

  /**
   * 创建或更新用户的个性化配置
   */
  async saveUserPersonalizedConfig(
    userId: string,
    configData: PersonalizedConfigForm
  ): Promise<PersonalizedConfig> {
    try {
      if (!isPrismaInitialized() || !prisma.personalizedConfig) {
        throw new Error('数据库连接未正确初始化，无法保存个性化配置')
      }

      // 检查是否已存在配置
      const existingConfig = await prisma.personalizedConfig.findUnique({
        where: { userId }
      })

      let config

      if (existingConfig) {
        // 更新现有配置
        config = await prisma.personalizedConfig.update({
          where: { userId },
          data: {
            difficulty: configData.difficulty || {},
            notifications: configData.notifications || {},
            theme: configData.theme || {},
            preferences: configData.preferences || {},
            learningStyleAdaptation: configData.learningStyleAdaptation || {}
          }
        })
      } else {
        // 创建新配置
        config = await prisma.personalizedConfig.create({
          data: {
            userId,
            difficulty: configData.difficulty || {},
            notifications: configData.notifications || {},
            theme: configData.theme || {},
            preferences: configData.preferences || {},
            learningStyleAdaptation: configData.learningStyleAdaptation || {}
          }
        })
      }

      return {
        id: config.id,
        userId: config.userId,
        difficulty: config.difficulty as DifficultyConfig,
        notifications: config.notifications as NotificationConfig,
        theme: config.theme as ThemeConfig,
        preferences: config.preferences as UserPreferences,
        learningStyleAdaptation: config.learningStyleAdaptation as LearningStyleAdaptationConfig,
        lastUpdatedAt: config.lastUpdatedAt,
        createdAt: config.createdAt
      }
    } catch (error) {
      console.error('保存用户个性化配置失败:', error)
      throw error
    }
  }

  /**
   * 根据学习风格生成个性化配置推荐
   */
  async generatePersonalizedConfigRecommendation(
    userId: string,
    learningStyle: LearningStyleType
  ): Promise<PersonalizedConfigRecommendation> {
    try {
      // 获取用户的学习风格分析结果
      const learningStyleResult = await prisma.userLearningStyle.findUnique({
        where: { userId }
      })

      if (!learningStyleResult) {
        throw new Error('未找到用户的学习风格分析结果')
      }

      // 基于学习风格生成推荐配置
      const difficultyRecommendation = this.generateDifficultyRecommendation(learningStyle)
      const notificationRecommendation = this.generateNotificationRecommendation(learningStyle)
      const themeRecommendation = this.generateThemeRecommendation(learningStyle)
      const preferencesRecommendation = this.generatePreferencesRecommendation(learningStyle)
      const adaptationRecommendation = this.generateAdaptationRecommendation(learningStyle, learningStyleResult)

      const recommendation: PersonalizedConfigRecommendation = {
        id: `rec_${userId}_${Date.now()}`,
        userId,
        learningStyle,
        recommendations: {
          difficulty: difficultyRecommendation,
          notifications: notificationRecommendation,
          theme: themeRecommendation,
          preferences: preferencesRecommendation,
          learningStyleAdaptation: adaptationRecommendation
        },
        confidence: this.calculateRecommendationConfidence(learningStyleResult),
        reasoning: this.generateRecommendationReasoning(learningStyle),
        createdAt: new Date()
      }

      return recommendation
    } catch (error) {
      console.error('生成个性化配置推荐失败:', error)
      throw error
    }
  }

  /**
   * 生成难度推荐
   */
  private generateDifficultyRecommendation(learningStyle: LearningStyleType): DifficultyConfig {
    const baseDifficulty = this.getBaseDifficultyByLearningStyle(learningStyle)
    
    return {
      level: DifficultyLevel.ADAPTIVE,
      adaptiveMode: true,
      autoAdjust: true,
      baseDifficulty,
      contentDifficultyAdjustment: this.getContentDifficultyAdjustment(learningStyle),
      challengeProgression: {
        easy: 0.3,
        medium: 0.5,
        hard: 0.2
      }
    }
  }

  /**
   * 生成通知推荐
   */
  private generateNotificationRecommendation(learningStyle: LearningStyleType): NotificationConfig {
    return {
      enabled: true,
      methods: this.getPreferredNotificationMethods(learningStyle),
      types: this.getPreferredNotificationTypes(learningStyle),
      frequency: {
        reminders: 'daily',
        achievements: 'immediate',
        challenges: 'daily',
        reports: 'weekly'
      },
      quietHours: {
        enabled: true,
        start: '22:00',
        end: '08:00'
      },
      learningStylePreferences: this.getLearningStyleNotificationPreferences(learningStyle)
    }
  }

  /**
   * 生成主题推荐
   */
  private generateThemeRecommendation(learningStyle: LearningStyleType): ThemeConfig {
    return {
      style: this.getPreferredThemeStyle(learningStyle),
      primaryColor: this.getPrimaryColorByLearningStyle(learningStyle),
      secondaryColor: this.getSecondaryColorByLearningStyle(learningStyle),
      accentColor: this.getAccentColorByLearningStyle(learningStyle),
      backgroundColor: '#ffffff',
      textColor: '#333333',
      fontSize: this.getFontSizeByLearningStyle(learningStyle),
      fontFamily: this.getFontFamilyByLearningStyle(learningStyle),
      borderRadius: 'medium',
      animations: {
        enabled: this.shouldEnableAnimations(learningStyle),
        duration: 300,
        easing: 'ease-in-out'
      }
    }
  }

  /**
   * 生成用户偏好推荐
   */
  private generatePreferencesRecommendation(learningStyle: LearningStyleType): UserPreferences {
    return {
      language: 'zh-CN',
      timezone: 'Asia/Shanghai',
      dateFormat: 'YYYY-MM-DD',
      timeFormat: '24h',
      firstDayOfWeek: 1,
      accessibility: {
        highContrast: false,
        reducedMotion: !this.shouldEnableAnimations(learningStyle),
        screenReader: false,
        fontSize: this.getFontSizeByLearningStyle(learningStyle)
      },
      privacy: {
        shareProgress: true,
        shareAchievements: true,
        analyticsEnabled: true,
        personalizedAds: false
      }
    }
  }

  /**
   * 生成学习风格适配推荐
   */
  private generateAdaptationRecommendation(
    learningStyle: LearningStyleType,
    learningStyleResult: any
  ): LearningStyleAdaptationConfig {
    return {
      strategy: this.getAdaptationStrategy(learningStyle),
      primaryStyle: learningStyle,
      secondaryStyle: this.getSecondaryLearningStyle(learningStyleResult),
      adaptationSettings: this.getAdaptationSettings(learningStyleResult),
      contentPreferences: this.getContentPreferences(learningStyle),
      performanceTracking: {
        enabled: true,
        adaptationFrequency: 'weekly',
        feedbackSensitivity: 0.7
      }
    }
  }

  /**
   * 根据学习风格获取基础难度
   */
  private getBaseDifficultyByLearningStyle(learningStyle: LearningStyleType): number {
    switch (learningStyle) {
      case LearningStyleType.VISUAL:
        return 3
      case LearningStyleType.AUDITORY:
        return 2
      case LearningStyleType.KINESTHETIC:
        return 4
      case LearningStyleType.READING:
        return 2
      case LearningStyleType.MIXED:
        return 3
      default:
        return 3
    }
  }

  /**
   * 根据学习风格获取内容难度调整
   */
  private getContentDifficultyAdjustment(learningStyle: LearningStyleType) {
    switch (learningStyle) {
      case LearningStyleType.VISUAL:
        return {
          text: 3,
          image: 2,
          audio: 4,
          video: 2,
          interactive: 3,
          quiz: 3
        }
      case LearningStyleType.AUDITORY:
        return {
          text: 4,
          image: 4,
          audio: 2,
          video: 2,
          interactive: 3,
          quiz: 3
        }
      case LearningStyleType.KINESTHETIC:
        return {
          text: 4,
          image: 3,
          audio: 4,
          video: 3,
          interactive: 2,
          quiz: 2
        }
      case LearningStyleType.READING:
        return {
          text: 2,
          image: 3,
          audio: 4,
          video: 4,
          interactive: 3,
          quiz: 2
        }
      case LearningStyleType.MIXED:
        return {
          text: 3,
          image: 3,
          audio: 3,
          video: 3,
          interactive: 3,
          quiz: 3
        }
      default:
        return {
          text: 3,
          image: 3,
          audio: 3,
          video: 3,
          interactive: 3,
          quiz: 3
        }
    }
  }

  /**
   * 根据学习风格获取首选通知方式
   */
  private getPreferredNotificationMethods(learningStyle: LearningStyleType): NotificationMethod[] {
    switch (learningStyle) {
      case LearningStyleType.VISUAL:
        return [NotificationMethod.IN_APP, NotificationMethod.EMAIL]
      case LearningStyleType.AUDITORY:
        return [NotificationMethod.IN_APP, NotificationMethod.PUSH]
      case LearningStyleType.KINESTHETIC:
        return [NotificationMethod.IN_APP, NotificationMethod.PUSH]
      case LearningStyleType.READING:
        return [NotificationMethod.EMAIL, NotificationMethod.IN_APP]
      case LearningStyleType.MIXED:
        return [NotificationMethod.IN_APP, NotificationMethod.EMAIL, NotificationMethod.PUSH]
      default:
        return [NotificationMethod.IN_APP]
    }
  }

  /**
   * 根据学习风格获取首选通知类型
   */
  private getPreferredNotificationTypes(learningStyle: LearningStyleType): NotificationType[] {
    const baseTypes = [
      NotificationType.REMINDER,
      NotificationType.ACHIEVEMENT,
      NotificationType.CHALLENGE,
      NotificationType.STREAK,
      NotificationType.LEVEL_UP,
      NotificationType.POINTS_EARNED
    ]

    switch (learningStyle) {
      case LearningStyleType.READING:
        return [...baseTypes, NotificationType.DAILY_SUMMARY, NotificationType.WEEKLY_REPORT]
      case LearningStyleType.VISUAL:
        return [...baseTypes, NotificationType.ACHIEVEMENT, NotificationType.LEVEL_UP]
      default:
        return baseTypes
    }
  }

  /**
   * 根据学习风格获取学习风格通知偏好
   */
  private getLearningStyleNotificationPreferences(learningStyle: LearningStyleType) {
    return {
      visual: learningStyle === LearningStyleType.VISUAL,
      auditory: learningStyle === LearningStyleType.AUDITORY,
      kinesthetic: learningStyle === LearningStyleType.KINESTHETIC,
      reading: learningStyle === LearningStyleType.READING
    }
  }

  /**
   * 根据学习风格获取首选主题风格
   */
  private getPreferredThemeStyle(learningStyle: LearningStyleType): ThemeStyle {
    switch (learningStyle) {
      case LearningStyleType.VISUAL:
        return ThemeStyle.LIGHT
      case LearningStyleType.AUDITORY:
        return ThemeStyle.AUTO
      case LearningStyleType.KINESTHETIC:
        return ThemeStyle.DARK
      case LearningStyleType.READING:
        return ThemeStyle.LIGHT
      case LearningStyleType.MIXED:
        return ThemeStyle.AUTO
      default:
        return ThemeStyle.AUTO
    }
  }

  /**
   * 根据学习风格获取主色调
   */
  private getPrimaryColorByLearningStyle(learningStyle: LearningStyleType): string {
    switch (learningStyle) {
      case LearningStyleType.VISUAL:
        return '#3B82F6' // 蓝色
      case LearningStyleType.AUDITORY:
        return '#10B981' // 绿色
      case LearningStyleType.KINESTHETIC:
        return '#F59E0B' // 橙色
      case LearningStyleType.READING:
        return '#8B5CF6' // 紫色
      case LearningStyleType.MIXED:
        return '#6366F1' // 靛蓝色
      default:
        return '#3B82F6'
    }
  }

  /**
   * 根据学习风格获取次要色调
   */
  private getSecondaryColorByLearningStyle(learningStyle: LearningStyleType): string {
    switch (learningStyle) {
      case LearningStyleType.VISUAL:
        return '#60A5FA'
      case LearningStyleType.AUDITORY:
        return '#34D399'
      case LearningStyleType.KINESTHETIC:
        return '#FBBF24'
      case LearningStyleType.READING:
        return '#A78BFA'
      case LearningStyleType.MIXED:
        return '#818CF8'
      default:
        return '#60A5FA'
    }
  }

  /**
   * 根据学习风格获取强调色
   */
  private getAccentColorByLearningStyle(learningStyle: LearningStyleType): string {
    switch (learningStyle) {
      case LearningStyleType.VISUAL:
        return '#EF4444'
      case LearningStyleType.AUDITORY:
        return '#F59E0B'
      case LearningStyleType.KINESTHETIC:
        return '#EF4444'
      case LearningStyleType.READING:
        return '#10B981'
      case LearningStyleType.MIXED:
        return '#F59E0B'
      default:
        return '#EF4444'
    }
  }

  /**
   * 根据学习风格获取字体大小
   */
  private getFontSizeByLearningStyle(learningStyle: LearningStyleType): 'small' | 'medium' | 'large' | 'extra-large' {
    switch (learningStyle) {
      case LearningStyleType.READING:
        return 'large'
      case LearningStyleType.VISUAL:
        return 'medium'
      case LearningStyleType.AUDITORY:
        return 'medium'
      case LearningStyleType.KINESTHETIC:
        return 'large'
      case LearningStyleType.MIXED:
        return 'medium'
      default:
        return 'medium'
    }
  }

  /**
   * 根据学习风格获取字体家族
   */
  private getFontFamilyByLearningStyle(learningStyle: LearningStyleType): string {
    switch (learningStyle) {
      case LearningStyleType.READING:
        return 'serif'
      case LearningStyleType.VISUAL:
        return 'sans-serif'
      case LearningStyleType.AUDITORY:
        return 'sans-serif'
      case LearningStyleType.KINESTHETIC:
        return 'sans-serif'
      case LearningStyleType.MIXED:
        return 'sans-serif'
      default:
        return 'sans-serif'
    }
  }

  /**
   * 根据学习风格决定是否启用动画
   */
  private shouldEnableAnimations(learningStyle: LearningStyleType): boolean {
    switch (learningStyle) {
      case LearningStyleType.VISUAL:
        return true
      case LearningStyleType.KINESTHETIC:
        return true
      case LearningStyleType.AUDITORY:
        return false
      case LearningStyleType.READING:
        return false
      case LearningStyleType.MIXED:
        return true
      default:
        return true
    }
  }

  /**
   * 根据学习风格获取适配策略
   */
  private getAdaptationStrategy(learningStyle: LearningStyleType): LearningStyleAdaptationStrategy {
    switch (learningStyle) {
      case LearningStyleType.VISUAL:
        return LearningStyleAdaptationStrategy.VISUAL_FOCUS
      case LearningStyleType.AUDITORY:
        return LearningStyleAdaptationStrategy.AUDITORY_FOCUS
      case LearningStyleType.KINESTHETIC:
        return LearningStyleAdaptationStrategy.KINESTHETIC_FOCUS
      case LearningStyleType.READING:
        return LearningStyleAdaptationStrategy.READING_FOCUS
      case LearningStyleType.MIXED:
        return LearningStyleAdaptationStrategy.BALANCED
      default:
        return LearningStyleAdaptationStrategy.BALANCED
    }
  }

  /**
   * 获取次要学习风格
   */
  private getSecondaryLearningStyle(learningStyleResult: any): LearningStyleType | undefined {
    const scores = {
      [LearningStyleType.VISUAL]: learningStyleResult.visualScore,
      [LearningStyleType.AUDITORY]: learningStyleResult.auditoryScore,
      [LearningStyleType.KINESTHETIC]: learningStyleResult.kinestheticScore,
      [LearningStyleType.READING]: learningStyleResult.readingScore
    }

    // 找出分数第二高的学习风格
    const sortedStyles = Object.entries(scores)
      .sort(([, a], [, b]) => b - a)
      .map(([style]) => style as LearningStyleType)

    return sortedStyles.length > 1 ? sortedStyles[1] : undefined
  }

  /**
   * 获取适配设置
   */
  private getAdaptationSettings(learningStyleResult: any) {
    const total = learningStyleResult.visualScore + 
                  learningStyleResult.auditoryScore + 
                  learningStyleResult.kinestheticScore + 
                  learningStyleResult.readingScore

    return {
      visualWeight: learningStyleResult.visualScore / total,
      auditoryWeight: learningStyleResult.auditoryScore / total,
      kinestheticWeight: learningStyleResult.kinestheticScore / total,
      readingWeight: learningStyleResult.readingScore / total
    }
  }

  /**
   * 获取内容偏好
   */
  private getContentPreferences(learningStyle: LearningStyleType) {
    return {
      preferredContentTypes: this.getPreferredContentTypes(learningStyle),
      preferredChallengeTypes: this.getPreferredChallengeTypes(learningStyle),
      preferredInteractionModes: this.getPreferredInteractionModes(learningStyle)
    }
  }

  /**
   * 根据学习风格获取首选内容类型
   */
  private getPreferredContentTypes(learningStyle: LearningStyleType): LearningContentType[] {
    switch (learningStyle) {
      case LearningStyleType.VISUAL:
        return [LearningContentType.IMAGE, LearningContentType.VIDEO, LearningContentType.INTERACTIVE]
      case LearningStyleType.AUDITORY:
        return [LearningContentType.AUDIO, LearningContentType.VIDEO, LearningContentType.QUIZ]
      case LearningStyleType.KINESTHETIC:
        return [LearningContentType.INTERACTIVE, LearningContentType.QUIZ, LearningContentType.VIDEO]
      case LearningStyleType.READING:
        return [LearningContentType.TEXT, LearningContentType.QUIZ, LearningContentType.IMAGE]
      case LearningStyleType.MIXED:
        return Object.values(LearningContentType)
      default:
        return Object.values(LearningContentType)
    }
  }

  /**
   * 根据学习风格获取首选挑战类型
   */
  private getPreferredChallengeTypes(learningStyle: LearningStyleType): ChallengeType[] {
    const baseTypes = [
      ChallengeTypeEnum.REVIEW_COUNT,
      ChallengeTypeEnum.MEMORY_CREATED,
      ChallengeTypeEnum.CATEGORY_FOCUS
    ]

    switch (learningStyle) {
      case LearningStyleType.VISUAL:
        return [...baseTypes, ChallengeTypeEnum.REVIEW_ACCURACY]
      case LearningStyleType.AUDITORY:
        return [...baseTypes, ChallengeTypeEnum.REVIEW_COUNT]
      case LearningStyleType.KINESTHETIC:
        return [...baseTypes, ChallengeTypeEnum.STREAK_DAYS]
      case LearningStyleType.READING:
        return [...baseTypes, ChallengeTypeEnum.REVIEW_ACCURACY]
      case LearningStyleType.MIXED:
        return Object.values(ChallengeTypeEnum)
      default:
        return baseTypes
    }
  }

  /**
   * 根据学习风格获取首选交互模式
   */
  private getPreferredInteractionModes(learningStyle: LearningStyleType): string[] {
    switch (learningStyle) {
      case LearningStyleType.VISUAL:
        return ['visual', 'drag-drop', 'click']
      case LearningStyleType.AUDITORY:
        return ['audio', 'voice', 'click']
      case LearningStyleType.KINESTHETIC:
        return ['touch', 'gesture', 'interactive']
      case LearningStyleType.READING:
        return ['text', 'scroll', 'click']
      case LearningStyleType.MIXED:
        return ['visual', 'audio', 'touch', 'text']
      default:
        return ['click', 'touch']
    }
  }

  /**
   * 计算推荐置信度
   */
  private calculateRecommendationConfidence(learningStyleResult: any): number {
    const maxScore = 100
    const primaryScore = Math.max(
      learningStyleResult.visualScore,
      learningStyleResult.auditoryScore,
      learningStyleResult.kinestheticScore,
      learningStyleResult.readingScore
    )

    // 基于主要学习风格的分数和数据点数量计算置信度
    const scoreConfidence = primaryScore / maxScore
    const dataPointConfidence = Math.min(learningStyleResult.dataPoints / 50, 1) // 50个数据点为满置信度
    
    return (scoreConfidence * 0.7 + dataPointConfidence * 0.3)
  }

  /**
   * 生成推荐理由
   */
  private generateRecommendationReasoning(learningStyle: LearningStyleType): string[] {
    const reasoning: string[] = []

    switch (learningStyle) {
      case LearningStyleType.VISUAL:
        reasoning.push(
          '您的学习风格偏向视觉型，推荐更多图像和视频内容',
          '浅色主题和蓝色调有助于提高视觉学习效果',
          '适度的动画可以增强视觉反馈和学习体验'
        )
        break
      case LearningStyleType.AUDITORY:
        reasoning.push(
          '您的学习风格偏向听觉型，推荐音频内容和语音反馈',
          '绿色主题有助于营造轻松的学习环境',
          '减少动画干扰，专注于音频内容'
        )
        break
      case LearningStyleType.KINESTHETIC:
        reasoning.push(
          '您的学习风格偏向动觉型，推荐交互式和实践性内容',
          '深色主题和暖色调有助于提高专注度',
          '丰富的交互动画可以增强学习体验'
        )
        break
      case LearningStyleType.READING:
        reasoning.push(
          '您的学习风格偏向阅读型，推荐文本内容和详细说明',
          '浅色主题和紫色调有助于长时间阅读',
          '简洁的界面设计可以减少阅读干扰'
        )
        break
      case LearningStyleType.MIXED:
        reasoning.push(
          '您的学习风格是混合型，推荐多样化的学习内容',
          '自适应主题可以满足不同学习场景的需求',
          '平衡的配置可以适应各种学习方式'
        )
        break
    }

    reasoning.push('基于您的学习行为数据进行分析和优化')
    reasoning.push('配置会根据您的学习进度和反馈持续调整')

    return reasoning
  }
}

// 导出单例实例
export const personalizedConfigService = new PersonalizedConfigService()