import { isPrismaInitialized } from '@/lib/db'

// 检查是否在服务端环境
const isServerSide = typeof window === 'undefined'
import {
  Achievement,
  UserAchievement,
  AchievementType,
  ChallengeType,
  PointTransactionType
} from '@prisma/client'

// 定义成就检查数据类型
type AchievementCheckData = {
  reviewCount?: number;
  streak?: number;
  level?: number;
  points?: number;
};

/**
 * 成就系统服务类
 */
export class AchievementService {
  /**
   * 获取所有成就
   */
  async getAllAchievements(): Promise<Achievement[]> {
    // 检查是否在服务端环境且 Prisma 已初始化
    if (!isServerSide || !isPrismaInitialized()) {
      console.error('AchievementService.getAllAchievements 只能在服务端运行')
      throw new Error('此方法只能在服务端运行')
    }

    try {
      // 动态导入 Prisma，避免在客户端打包
      const { prisma } = await import('@/lib/db')

      return await prisma.achievement.findMany({
        where: { isActive: true },
        orderBy: { category: 'asc' }
      })
    } catch (error: unknown) {
      console.error('获取所有成就失败:', error)
      throw error
    }
  }

  /**
   * 检查并解锁成就
   */
  async checkAchievements(userId: string, trigger: string, data: AchievementCheckData): Promise<UserAchievement[]> {
    const unlockedAchievements: UserAchievement[] = []
    
    // 根据触发器类型检查不同的成就
    switch (trigger) {
      case 'REVIEW':
        // 检查复习相关的成就
        if (data.reviewCount && data.reviewCount >= 10) {
          const achievement = await this.unlockAchievement(userId, 'FIRST_REVIEWS')
          if (achievement) unlockedAchievements.push(achievement)
        }
        if (data.reviewCount && data.reviewCount >= 100) {
          const achievement = await this.unlockAchievement(userId, 'REVIEW_MASTER')
          if (achievement) unlockedAchievements.push(achievement)
        }
        break
        
      case 'STREAK':
        // 检查连续学习相关的成就
        if (data.streak && data.streak >= 7) {
          const achievement = await this.unlockAchievement(userId, 'WEEKLY_WARRIOR')
          if (achievement) unlockedAchievements.push(achievement)
        }
        if (data.streak && data.streak >= 30) {
          const achievement = await this.unlockAchievement(userId, 'MONTHLY_CHAMPION')
          if (achievement) unlockedAchievements.push(achievement)
        }
        break
        
      case 'LEVEL_UP':
        // 检查等级相关的成就
        if (data.level && data.level >= 5) {
          const achievement = await this.unlockAchievement(userId, 'LEVEL_FIVE')
          if (achievement) unlockedAchievements.push(achievement)
        }
        if (data.level && data.level >= 10) {
          const achievement = await this.unlockAchievement(userId, 'LEVEL_TEN')
          if (achievement) unlockedAchievements.push(achievement)
        }
        break
        
      case 'POINTS':
        // 检查积分相关的成就
        if (data.points && data.points >= 1000) {
          const achievement = await this.unlockAchievement(userId, 'POINTS_MASTER')
          if (achievement) unlockedAchievements.push(achievement)
        }
        break
    }
    
    return unlockedAchievements
  }

  /**
   * 解锁成就
   */
  async unlockAchievement(userId: string, achievementCode: string): Promise<UserAchievement | null> {
    // 检查是否在服务端环境且 Prisma 已初始化
    if (!isServerSide || !isPrismaInitialized()) {
      console.error('AchievementService.unlockAchievement 只能在服务端运行')
      throw new Error('此方法只能在服务端运行')
    }

    try {
      // 动态导入 Prisma，避免在客户端打包
      const { prisma } = await import('@/lib/db')

      // 根据成就代码查找对应的成就
      const achievement = await prisma.achievement.findFirst({
        where: {
          OR: [
            { name: { contains: achievementCode } },
            { condition: { contains: achievementCode } }
          ],
          isActive: true
        }
      })
      
      if (!achievement) return null
      
      // 检查是否已经解锁
      const existing = await prisma.userAchievement.findUnique({
        where: {
          userId_achievementId: {
            userId,
            achievementId: achievement.id
          }
        }
      })
      
      if (existing) return null
      
      // 创建用户成就记录
      const userAchievement = await prisma.userAchievement.create({
        data: {
          userId,
          achievementId: achievement.id,
          progress: 100,
          unlockedAt: new Date()
        },
        include: {
          achievement: true
        }
      })
      
      // 添加成就奖励积分
      if (achievement.points > 0) {
        // 注意：这里需要调用 PointsService，但我们将在主服务中处理这个依赖关系
        console.log(`用户 ${userId} 解锁成就 ${achievement.name}，获得 ${achievement.points} 积分`)
      }
      
      // 触发成就解锁事件
      // 注意：这里需要调用事件处理器，但我们将在主服务中处理这个依赖关系
      console.log(`用户 ${userId} 成就解锁事件：${achievement.name}`)
      
      return userAchievement
    } catch (error: unknown) {
      console.error('解锁成就失败:', error)
      throw error
    }
  }

  /**
   * 根据成就类型解锁成就
   */
  async unlockAchievementByType(userId: string, type: AchievementType, condition: string): Promise<UserAchievement | null> {
    // 检查是否在服务端环境且 Prisma 已初始化
    if (!isServerSide || !isPrismaInitialized()) {
      console.error('AchievementService.unlockAchievementByType 只能在服务端运行')
      throw new Error('此方法只能在服务端运行')
    }

    try {
      // 动态导入 Prisma，避免在客户端打包
      const { prisma } = await import('@/lib/db')

      const achievement = await prisma.achievement.findFirst({
        where: {
          type,
          condition,
          isActive: true
        }
      })
      
      if (!achievement) return null
      
      return await this.unlockAchievement(userId, achievement.name)
    } catch (error: unknown) {
      console.error('根据成就类型解锁成就失败:', error)
      throw error
    }
  }

  /**
   * 更新成就进度
   */
  async updateAchievementProgress(userId: string, achievementId: string, progress: number): Promise<UserAchievement | null> {
    // 检查是否在服务端环境且 Prisma 已初始化
    if (!isServerSide || !isPrismaInitialized()) {
      console.error('AchievementService.updateAchievementProgress 只能在服务端运行')
      throw new Error('此方法只能在服务端运行')
    }

    try {
      // 动态导入 Prisma，避免在客户端打包
      const { prisma } = await import('@/lib/db')

      // 检查成就是否存在
      const achievement = await prisma.achievement.findUnique({
        where: { id: achievementId }
      })
      
      if (!achievement) return null
      
      // 注意：这里可以添加A/B测试拦截器调用，但我们将在主服务中处理这个依赖关系
      
      // 查找或创建用户成就记录
      let userAchievement = await prisma.userAchievement.findUnique({
        where: {
          userId_achievementId: {
            userId,
            achievementId
          }
        },
        include: {
          achievement: true
        }
      })
      
      if (!userAchievement) {
        userAchievement = await prisma.userAchievement.create({
          data: {
            userId,
            achievementId,
            progress: Math.min(100, Math.max(0, progress))
          },
          include: {
            achievement: true
          }
        })
      } else {
        const newProgress = Math.min(100, Math.max(0, progress))
        const wasCompleted = userAchievement.progress >= 100
        const isCompleted = newProgress >= 100
        
        userAchievement = await prisma.userAchievement.update({
          where: {
            userId_achievementId: {
              userId,
              achievementId
            }
          },
          data: {
            progress: newProgress,
            ...(isCompleted && !wasCompleted ? { unlockedAt: new Date() } : {})
          },
          include: {
            achievement: true
          }
        })
        
        // 如果刚刚完成成就，添加奖励
        if (isCompleted && !wasCompleted) {
          // 注意：这里需要调用 PointsService，但我们将在主服务中处理这个依赖关系
          console.log(`用户 ${userId} 完成成就 ${achievement.name}，获得 ${achievement.points} 积分`)
        }
      }
      
      return userAchievement
    } catch (error: unknown) {
      console.error('更新成就进度失败:', error)
      throw error
    }
  }

  /**
   * 获取用户所有成就
   */
  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    // 检查是否在服务端环境且 Prisma 已初始化
    if (!isServerSide || !isPrismaInitialized()) {
      console.error('AchievementService.getUserAchievements 只能在服务端运行')
      throw new Error('此方法只能在服务端运行')
    }

    try {
      // 动态导入 Prisma，避免在客户端打包
      const { prisma } = await import('@/lib/db')

      return await prisma.userAchievement.findMany({
        where: { userId },
        include: {
          achievement: true
        },
        orderBy: { unlockedAt: 'desc' }
      })
    } catch (error: unknown) {
      console.error('获取用户所有成就失败:', error)
      throw error
    }
  }

  /**
   * 获取用户成就统计
   */
  async getUserAchievementStats(userId: string): Promise<{
    total: number
    unlocked: number
    inProgress: number
    byCategory: Record<string, { total: number; unlocked: number }>
  }> {
    // 检查是否在服务端环境且 Prisma 已初始化
    if (!isServerSide || !isPrismaInitialized()) {
      console.error('AchievementService.getUserAchievementStats 只能在服务端运行')
      throw new Error('此方法只能在服务端运行')
    }

    try {
      // 动态导入 Prisma，避免在客户端打包
      const { prisma } = await import('@/lib/db')

      const allAchievements = await prisma.achievement.findMany({
        where: { isActive: true }
      })
      
      const userAchievements = await prisma.userAchievement.findMany({
        where: { userId },
        include: {
          achievement: true
        }
      })
      
      const stats = {
        total: allAchievements.length,
        unlocked: userAchievements.filter((ua: UserAchievement) => ua.progress >= 100).length,
        inProgress: userAchievements.filter((ua: UserAchievement) => ua.progress > 0 && ua.progress < 100).length,
        byCategory: {} as Record<string, { total: number; unlocked: number }>
      }
      
      // 按类别统计
      allAchievements.forEach((achievement: Achievement) => {
        if (!stats.byCategory[achievement.category]) {
          stats.byCategory[achievement.category] = { total: 0, unlocked: 0 }
        }
        stats.byCategory[achievement.category].total++
      })
      
      userAchievements.forEach((userAchievement: UserAchievement & { achievement: Achievement }) => {
        if (userAchievement.progress >= 100) {
          const category = userAchievement.achievement.category
          if (stats.byCategory[category]) {
            stats.byCategory[category].unlocked++
          }
        }
      })
      
      return stats
    } catch (error: unknown) {
      console.error('获取用户成就统计失败:', error)
      throw error
    }
  }

  /**
   * 检查连续学习成就
   */
  async checkStreakAchievements(userId: string, streak: number): Promise<UserAchievement[]> {
    const unlockedAchievements: UserAchievement[] = []
    
    // 检查连续学习相关的成就
    if (streak >= 3) {
      const achievement = await this.unlockAchievement(userId, 'THREE_DAY_STREAK')
      if (achievement) unlockedAchievements.push(achievement)
    }
    
    if (streak >= 7) {
      const achievement = await this.unlockAchievement(userId, 'WEEKLY_WARRIOR')
      if (achievement) unlockedAchievements.push(achievement)
    }
    
    if (streak >= 14) {
      const achievement = await this.unlockAchievement(userId, 'TWO_WEEK_STREAK')
      if (achievement) unlockedAchievements.push(achievement)
    }
    
    if (streak >= 30) {
      const achievement = await this.unlockAchievement(userId, 'MONTHLY_CHAMPION')
      if (achievement) unlockedAchievements.push(achievement)
    }
    
    if (streak >= 60) {
      const achievement = await this.unlockAchievement(userId, 'TWO_MONTH_STREAK')
      if (achievement) unlockedAchievements.push(achievement)
    }
    
    if (streak >= 90) {
      const achievement = await this.unlockAchievement(userId, 'QUARTER_MASTER')
      if (achievement) unlockedAchievements.push(achievement)
    }
    
    if (streak >= 180) {
      const achievement = await this.unlockAchievement(userId, 'HALF_YEAR_HERO')
      if (achievement) unlockedAchievements.push(achievement)
    }
    
    if (streak >= 365) {
      const achievement = await this.unlockAchievement(userId, 'YEARLY_LEGEND')
      if (achievement) unlockedAchievements.push(achievement)
    }
    
    return unlockedAchievements
  }

  /**
   * 检查挑战相关的成就
   */
  async checkChallengeAchievements(userId: string, challengeType: ChallengeType): Promise<void> {
    // 检查是否在服务端环境且 Prisma 已初始化
    if (!isServerSide || !isPrismaInitialized()) {
      console.error('AchievementService.checkChallengeAchievements 只能在服务端运行')
      throw new Error('此方法只能在服务端运行')
    }

    try {
      // 动态导入 Prisma，避免在客户端打包
      const { prisma } = await import('@/lib/db')

      // 获取用户已完成的挑战数量
      const completedChallenges = await prisma.userDailyChallenge.count({
        where: {
          userId,
          completed: true,
          challenge: {
            type: challengeType
          }
        }
      })
      
      // 根据挑战类型检查不同的成就
      switch (challengeType) {
        case ChallengeType.REVIEW_COUNT:
          if (completedChallenges >= 1) {
            await this.unlockAchievement(userId, 'FIRST_REVIEW_CHALLENGE')
          }
          if (completedChallenges >= 10) {
            await this.unlockAchievement(userId, 'REVIEW_CHALLENGE_MASTER')
          }
          break
          
        case ChallengeType.MEMORY_CREATED:
          if (completedChallenges >= 1) {
            await this.unlockAchievement(userId, 'FIRST_MEMORY_CHALLENGE')
          }
          if (completedChallenges >= 10) {
            await this.unlockAchievement(userId, 'MEMORY_CHALLENGE_MASTER')
          }
          break
          
        case ChallengeType.CATEGORY_FOCUS:
          if (completedChallenges >= 1) {
            await this.unlockAchievement(userId, 'FIRST_CATEGORY_CHALLENGE')
          }
          if (completedChallenges >= 10) {
            await this.unlockAchievement(userId, 'CATEGORY_CHALLENGE_MASTER')
          }
          break
          
        case ChallengeType.REVIEW_ACCURACY:
          if (completedChallenges >= 1) {
            await this.unlockAchievement(userId, 'FIRST_ACCURACY_CHALLENGE')
          }
          if (completedChallenges >= 10) {
            await this.unlockAchievement(userId, 'ACCURACY_CHALLENGE_MASTER')
          }
          break
      }
      
      // 检查总挑战完成数成就
      const totalCompletedChallenges = await prisma.userDailyChallenge.count({
        where: {
          userId,
          completed: true
        }
      })
      
      if (totalCompletedChallenges >= 1) {
        await this.unlockAchievement(userId, 'FIRST_CHALLENGE')
      }
      if (totalCompletedChallenges >= 10) {
        await this.unlockAchievement(userId, 'CHALLENGE_EXPERT')
      }
      if (totalCompletedChallenges >= 50) {
        await this.unlockAchievement(userId, 'CHALLENGE_MASTER')
      }
    } catch (error: unknown) {
      console.error('检查挑战相关的成就失败:', error)
      throw error
    }
  }

  /**
   * 初始化默认成就
   */
  async initializeDefaultAchievements(): Promise<void> {
    // 检查是否在服务端环境且 Prisma 已初始化
    if (!isServerSide || !isPrismaInitialized()) {
      console.error('AchievementService.initializeDefaultAchievements 只能在服务端运行')
      throw new Error('此方法只能在服务端运行')
    }

    try {
      // 动态导入 Prisma，避免在客户端打包
      const { prisma } = await import('@/lib/db')

      const defaultAchievements = [
        { name: '初学者', description: '完成第一次复习', category: '复习', points: 50, condition: '完成第一次复习', type: AchievementType.MILESTONE },
        { name: '复习达人', description: '完成100次复习', category: '复习', points: 200, condition: '完成100次复习', type: AchievementType.MILESTONE },
        { name: '复习大师', description: '完成1000次复习', category: '复习', points: 500, condition: '完成1000次复习', type: AchievementType.MILESTONE },
        { name: '连续一周', description: '连续学习7天', category: '连续学习', points: 100, condition: '连续学习7天', type: AchievementType.MILESTONE },
        { name: '连续一月', description: '连续学习30天', category: '连续学习', points: 300, condition: '连续学习30天', type: AchievementType.MILESTONE },
        { name: '等级5', description: '达到5级', category: '等级', points: 150, condition: '达到5级', type: AchievementType.MILESTONE },
        { name: '等级10', description: '达到10级', category: '等级', points: 300, condition: '达到10级', type: AchievementType.MILESTONE },
        { name: '积分达人', description: '累积1000积分', category: '积分', points: 200, condition: '累积1000积分', type: AchievementType.MILESTONE },
        { name: '挑战者', description: '完成第一个每日挑战', category: '挑战', points: 100, condition: '完成第一个每日挑战', type: AchievementType.MILESTONE },
        { name: '挑战大师', description: '完成50个每日挑战', category: '挑战', points: 400, condition: '完成50个每日挑战', type: AchievementType.MILESTONE }
      ]
      
      for (const achievementData of defaultAchievements) {
        const existing = await prisma.achievement.findFirst({
          where: { name: achievementData.name }
        })
        
        if (!existing) {
          await prisma.achievement.create({
            data: achievementData
          })
        }
      }
    } catch (error: unknown) {
      console.error('初始化默认成就失败:', error)
      throw error
    }
  }
}

// 导出单例实例
export const achievementService = new AchievementService()