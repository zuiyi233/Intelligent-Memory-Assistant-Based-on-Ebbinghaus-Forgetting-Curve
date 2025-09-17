import { prisma } from '@/lib/db'
import { LearningStyleService, LearningStyleType } from './learningStyle.service'

// 定义成就类型
interface Achievement {
  id: string
  name: string
  description: string
  difficulty?: number
  category?: string
  type?: string
}

// 个性化成就推荐服务
export class PersonalizedAchievementService {
  private learningStyleService: LearningStyleService

  constructor() {
    this.learningStyleService = new LearningStyleService()
  }

  /**
   * 获取用户个性化成就推荐
   */
  async getPersonalizedAchievements(userId: string) {
    try {
      // 获取用户学习风格分析
      const learningStyleAnalysis = await this.learningStyleService.analyzeLearningStyle(userId)
      
      // 获取用户已解锁的成就
      const unlockedAchievements = await prisma.userAchievement.findMany({
        where: { userId },
        select: { achievementId: true }
      })
      
      const unlockedAchievementIds = unlockedAchievements.map(ua => ua.achievementId)
      
      // 获取所有可用的成就
      const allAchievements = await prisma.achievement.findMany({
        where: {
          id: {
            notIn: unlockedAchievementIds
          }
        }
      })
      
      // 根据学习风格对成就进行评分和排序
      const scoredAchievements = allAchievements.map(achievement => {
        let score = 0
        
        // 基于学习风格的评分
        score += this.getLearningStyleScore(achievement, learningStyleAnalysis.primaryStyle)
        
        // 基于成就难度和用户当前水平的评分
        score += this.getDifficultyScore(achievement, userId)
        
        // 基于成就类别的评分
        score += this.getCategoryScore(achievement, userId)
        
        return {
          ...achievement,
          recommendationScore: score,
          reasons: this.getRecommendationReasons(achievement, learningStyleAnalysis.primaryStyle)
        }
      })
      
      // 按推荐分数降序排序
      const sortedAchievements = scoredAchievements.sort((a, b) => b.recommendationScore - a.recommendationScore)
      
      // 返回前10个推荐成就
      return sortedAchievements.slice(0, 10)
    } catch (error) {
      console.error('获取个性化成就推荐失败:', error)
      throw error
    }
  }

  /**
   * 基于学习风格计算成就评分
   */
  private getLearningStyleScore(achievement: Achievement, primaryStyle: LearningStyleType): number {
    const styleMapping = {
      VISUAL: ['视觉', '图表', '图像', '展示', '观察', '看'],
      AUDITORY: ['听觉', '音频', '讨论', '演讲', '听', '说'],
      KINESTHETIC: ['实践', '动手', '操作', '体验', '做', '动'],
      READING: ['阅读', '文本', '写作', '文档', '读', '写'],
      MIXED: ['综合', '多样', '全面', '混合', '多种']
    }
    
    const keywords = styleMapping[primaryStyle] || []
    const achievementText = `${achievement.name} ${achievement.description}`.toLowerCase()
    
    let score = 0
    keywords.forEach(keyword => {
      if (achievementText.includes(keyword.toLowerCase())) {
        score += 30
      }
    })
    
    return score
  }

  /**
   * 基于成就难度和用户当前水平计算评分
   */
  private async getDifficultyScore(achievement: Achievement, userId: string): Promise<number> {
    // 获取用户当前等级和积分
    const userProfile = await prisma.gamificationProfile.findUnique({
      where: { userId }
    })
    
    if (!userProfile) return 0
    
    // 根据用户等级调整难度评分
    const userLevel = userProfile.level
    const achievementDifficulty = achievement.difficulty || 1
    
    // 理想难度范围：用户等级 ± 1
    const idealMin = Math.max(1, userLevel - 1)
    const idealMax = userLevel + 1
    
    if (achievementDifficulty >= idealMin && achievementDifficulty <= idealMax) {
      return 25
    } else if (achievementDifficulty < idealMin) {
      return 10 // 太简单
    } else {
      return 5 // 太难
    }
  }

  /**
   * 基于成就类别计算评分
   */
  private async getCategoryScore(achievement: Achievement, userId: string): Promise<number> {
    // 获取用户在该类别的成就数量
    const categoryAchievements = await prisma.userAchievement.count({
      where: {
        userId,
        achievement: {
          category: achievement.category
        }
      }
    })
    
    // 如果用户在该类别有较多成就，给予额外分数
    if (categoryAchievements >= 3) {
      return 20
    } else if (categoryAchievements >= 1) {
      return 10
    }
    
    return 0
  }

  /**
   * 获取推荐原因
   */
  private getRecommendationReasons(
    achievement: Achievement,
    primaryStyle: LearningStyleType
  ): string[] {
    const reasons = []
    
    // 基于学习风格的原因
    const styleReasons = {
      VISUAL: '这个成就能帮助你发展视觉学习能力',
      AUDITORY: '这个成就能提升你的听觉学习技能',
      KINESTHETIC: '这个成就能增强你的实践操作能力',
      READING: '这个成就能加强你的阅读理解能力',
      MIXED: '这个成就能帮助你全面发展多种学习技能'
    }
    
    reasons.push(styleReasons[primaryStyle])
    
    // 基于成就类型的原因
    if (achievement.type === 'PERSONAL') {
      reasons.push('这是一个个性化成就，适合你的学习风格')
    } else if (achievement.type === 'SOCIAL') {
      reasons.push('社交类成就可以帮助你与他人交流学习经验')
    }
    
    return reasons
  }

  /**
   * 获取用户成就统计数据
   */
  async getUserAchievementStats(userId: string) {
    try {
      // 获取用户成就总数
      const totalAchievements = await prisma.achievement.count()
      
      // 获取用户已解锁成就数
      const unlockedAchievements = await prisma.userAchievement.count({
        where: { userId }
      })
      
      // 获取各类别成就统计
      const categoryStats = await prisma.achievement.groupBy({
        by: ['category'],
        _count: {
          id: true
        }
      })
      
      // 获取用户各类别已解锁成就数
      const userCategoryStats = await prisma.userAchievement.groupBy({
        by: ['achievementId'],
        where: { userId },
        _count: {
          id: true
        }
      })
      
      return {
        total: totalAchievements,
        unlocked: unlockedAchievements,
        inProgress: totalAchievements - unlockedAchievements,
        byCategory: categoryStats.reduce((acc, stat) => {
          acc[stat.category] = {
            total: stat._count.id,
            unlocked: userCategoryStats.filter(u => 
              u.achievementId === stat.category
            ).reduce((sum, u) => sum + u._count.id, 0)
          }
          return acc
        }, {} as Record<string, { total: number; unlocked: number }>)
      }
    } catch (error) {
      console.error('获取用户成就统计失败:', error)
      throw error
    }
  }
}