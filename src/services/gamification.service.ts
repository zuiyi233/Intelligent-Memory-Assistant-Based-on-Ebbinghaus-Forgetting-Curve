import { prisma } from '@/lib/db'
import {
  GamificationProfile,
  Achievement,
  UserAchievement,
  PointTransaction,
  DailyChallenge,
  UserDailyChallenge,
  Leaderboard,
  LeaderboardEntry,
  PointTransactionType,
  ChallengeType,
  LeaderboardType,
  LeaderboardPeriod,
  PointType,
  AchievementType
} from '@prisma/client'

// 定义成就检查数据类型
type AchievementCheckData = {
  reviewCount?: number;
  streak?: number;
  level?: number;
  points?: number;
};

// 定义复习记录类型
interface ReviewRecord {
  reviewTime: Date;
}

// 定义用户信息类型
interface UserInfo {
  id: string;
  username: string;
  name?: string | null;
  avatar?: string | null;
}

// 定义排行榜条目类型
interface LeaderboardProfile {
  id: string;
  userId: string;
  level: number;
  points: number;
  streak: number;
  user: UserInfo;
  score?: number;
}

// 定义排行榜查询结果类型
interface LeaderboardQueryResult {
  id: string;
  userId: string;
  level: number;
  points: number;
  streak: number;
  username: string;
  name: string | null;
  avatar: string | null;
  score?: number;
}

// 定义完整的排行榜条目类型，包含所需的 user 和 profile 属性
interface CompleteLeaderboardEntry extends LeaderboardEntry {
  user: {
    id: string;
    username: string;
    name: string | null;
    avatar: string | null;
  };
  profile: {
    id: string;
    userId: string;
    level: number;
    points: number;
    experience: number;
    streak: number;
    lastActiveAt: Date;
  };
}

/**
 * 游戏化服务类
 */
export class GamificationService {
  /**
   * 获取或创建用户的游戏化资料
   */
  async getOrCreateProfile(userId: string): Promise<GamificationProfile> {
    let profile = await prisma.gamificationProfile.findUnique({
      where: { userId },
      include: {
        user: true,
        achievements: {
          include: {
            achievement: true
          }
        },
        pointTransactions: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        dailyChallenges: {
          include: {
            challenge: true
          }
        }
      }
    })

    if (!profile) {
      // 首先检查用户是否存在，如果不存在则创建
      let user = await prisma.user.findUnique({
        where: { id: userId }
      })
      
      if (!user) {
        // 创建一个基本用户记录
        user = await prisma.user.create({
          data: {
            id: userId,
            email: `${userId}@example.com`,
            username: `user_${userId.substring(0, 8)}`,
            password: 'temp_password', // 实际应用中应该使用加密的密码
            isActive: true
          }
        })
      }
      
      profile = await prisma.gamificationProfile.create({
        data: {
          userId,
          level: 1,
          points: 0,
          experience: 0,
          streak: 0,
          lastActiveAt: new Date()
        },
        include: {
          user: true,
          achievements: {
            include: {
              achievement: true
            }
          },
          pointTransactions: {
            orderBy: { createdAt: 'desc' },
            take: 10
          },
          dailyChallenges: {
            include: {
              challenge: true
            }
          }
        }
      })
    }

    return profile
  }

  /**
   * 添加积分并创建交易记录
   */
  async addPoints(userId: string, amount: number, type: PointTransactionType, description: string): Promise<GamificationProfile> {
    try {
      const profile = await this.getOrCreateProfile(userId)
      
      // 验证积分数量
      if (amount === 0) {
        throw new Error('积分数量不能为0')
      }
      
      // 如果是扣除积分，检查用户是否有足够积分
      if (amount < 0 && profile.points < Math.abs(amount)) {
        throw new Error('积分不足')
      }
      
      // 创建积分交易记录
      await prisma.pointTransaction.create({
        data: {
          userId,
          amount,
          type,
          description
        }
      })

      // 创建积分记录
      await prisma.point.create({
        data: {
          userId,
          amount: Math.abs(amount),
          type: amount > 0 ? PointType.EARNED : PointType.SPENT,
          source: description
        }
      })

      // 更新用户积分
      const newPoints = profile.points + amount
      const updatedProfile = await prisma.gamificationProfile.update({
        where: { userId },
        data: {
          points: newPoints,
          lastActiveAt: new Date()
        }
      })

      // 检查积分相关的成就
      if (amount > 0 && newPoints >= 1000) {
        await this.checkAchievements(userId, 'POINTS', { points: newPoints })
      }

      // 检查是否升级
      await this.checkLevelUp(userId)

      return updatedProfile
    } catch (error: unknown) {
      console.error('添加积分失败:', error)
      throw error
    }
  }

  /**
   * 扣除积分
   */
  async deductPoints(userId: string, amount: number, type: PointTransactionType, description: string): Promise<GamificationProfile> {
    return await this.addPoints(userId, -amount, type, description)
  }

  /**
   * 获取用户积分历史
   */
  async getPointsHistory(userId: string, limit: number = 20): Promise<PointTransaction[]> {
    return await prisma.pointTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit
    })
  }

  /**
   * 添加经验值
   */
  async addExperience(userId: string, amount: number): Promise<GamificationProfile> {
    return await this.updateUserExperience(userId, amount)
  }

  /**
   * 更新用户经验值
   */
  async updateUserExperience(userId: string, amount: number): Promise<GamificationProfile> {
    try {
      const profile = await this.getOrCreateProfile(userId)
      
      const updatedProfile = await prisma.gamificationProfile.update({
        where: { userId },
        data: {
          experience: profile.experience + amount,
          lastActiveAt: new Date()
        }
      })

      // 检查是否升级
      await this.checkLevelUp(userId)

      return updatedProfile
    } catch (error: unknown) {
      console.error('更新用户经验失败:', error)
      throw error
    }
  }

  /**
   * 计算用户等级
   */
  calculateLevel(experience: number): number {
    // 使用指数增长公式计算等级
    // 每级所需经验值 = 基础值 * (等级^系数)
    const baseExp = 100
    const exponent = 1.5
    
    // 通过二分查找确定等级
    let low = 1
    let high = 100
    let level = 1
    
    while (low <= high) {
      const mid = Math.floor((low + high) / 2)
      const requiredExp = baseExp * Math.pow(mid, exponent)
      
      if (experience >= requiredExp) {
        level = mid
        low = mid + 1
      } else {
        high = mid - 1
      }
    }
    
    return level
  }

  /**
   * 计算升级所需经验值
   */
  calculateExperienceForLevel(level: number): number {
    const baseExp = 100
    const exponent = 1.5
    return Math.floor(baseExp * Math.pow(level, exponent))
  }

  /**
   * 检查并处理升级
   */
  private async checkLevelUp(userId: string): Promise<void> {
    const profile = await this.getOrCreateProfile(userId)
    
    // 使用新的等级计算公式
    const newLevel = this.calculateLevel(profile.experience)
    
    if (newLevel > profile.level) {
      await this.handleLevelUp(userId, profile.level, newLevel)
    }
  }

  /**
   * 处理用户升级
   */
  async handleLevelUp(userId: string, oldLevel: number, newLevel: number): Promise<void> {
    // 升级奖励
    const bonusPoints = (newLevel - oldLevel) * 50
    
    await prisma.gamificationProfile.update({
      where: { userId },
      data: {
        level: newLevel
      }
    })
    
    // 添加升级奖励积分
    if (bonusPoints > 0) {
      await this.addPoints(userId, bonusPoints, PointTransactionType.LEVEL_UP, `升级奖励: 从${oldLevel}级升到${newLevel}级`)
    }
    
    // 检查升级相关的成就
    await this.checkAchievements(userId, 'LEVEL_UP', { level: newLevel })
  }

  /**
   * 更新连续学习天数
   */
  async updateStreak(userId: string): Promise<GamificationProfile> {
    return await this.updateStreakDays(userId)
  }

  /**
   * 更新连续学习天数
   */
  async updateStreakDays(userId: string): Promise<GamificationProfile> {
    try {
      const profile = await this.getOrCreateProfile(userId)
      const now = new Date()
      const lastActive = new Date(profile.lastActiveAt)
      
      // 检查是否是连续学习（上次学习在24小时内）
      const hoursDiff = (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60)
      
      let newStreak = profile.streak
      
      if (hoursDiff > 24 && hoursDiff < 48) {
        // 超过24小时但小于48小时，连续天数+1
        newStreak = profile.streak + 1
      } else if (hoursDiff >= 48) {
        // 超过48小时，重置连续天数
        newStreak = 1
      }
      
      const updatedProfile = await prisma.gamificationProfile.update({
        where: { userId },
        data: {
          streak: newStreak,
          lastActiveAt: now
        }
      })
      
      // 连续学习奖励
      if (newStreak > profile.streak && newStreak % 7 === 0) {
        await this.addPoints(userId, newStreak * 10, PointTransactionType.STREAK_BONUS, `连续学习${newStreak}天奖励`)
      }
      
      // 检查连续学习相关的成就
      await this.checkStreakAchievements(userId, newStreak)
      
      return updatedProfile
    } catch (error: unknown) {
      console.error('更新连续学习天数失败:', error)
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
   * 获取用户连续学习统计
   */
  async getUserStreakStats(userId: string): Promise<{
    currentStreak: number
    longestStreak: number
    totalActiveDays: number
    lastActiveAt: Date
  }> {
    const profile = await this.getOrCreateProfile(userId)
    
    // 计算最长连续学习天数
    const userReviews = await prisma.review.findMany({
      where: { userId },
      orderBy: { reviewTime: 'asc' },
      select: { reviewTime: true }
    })
    
    let longestStreak = 0
    let currentStreak = 0
    let lastDate: Date | null = null
    const totalActiveDays = new Set<string>()
    
    userReviews.forEach((review: ReviewRecord) => {
      const reviewDate = new Date(review.reviewTime)
      const dateStr = reviewDate.toISOString().split('T')[0]
      totalActiveDays.add(dateStr)
      
      if (!lastDate) {
        currentStreak = 1
      } else {
        const daysDiff = Math.floor((reviewDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
        if (daysDiff === 1) {
          currentStreak++
        } else {
          longestStreak = Math.max(longestStreak, currentStreak)
          currentStreak = 1
        }
      }
      
      lastDate = reviewDate
    })
    
    longestStreak = Math.max(longestStreak, currentStreak)
    
    return {
      currentStreak: profile.streak,
      longestStreak,
      totalActiveDays: totalActiveDays.size,
      lastActiveAt: profile.lastActiveAt
    }
  }

  /**
   * 获取所有成就
   */
  async getAllAchievements(): Promise<Achievement[]> {
    return await prisma.achievement.findMany({
      where: { isActive: true },
      orderBy: { category: 'asc' }
    })
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
  private async unlockAchievement(userId: string, achievementCode: string): Promise<UserAchievement | null> {
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
      await this.addPoints(userId, achievement.points, PointTransactionType.ACHIEVEMENT_UNLOCKED, `解锁成就: ${achievement.name}`)
    }
    
    return userAchievement
  }

  /**
   * 根据成就类型解锁成就
   */
  async unlockAchievementByType(userId: string, type: AchievementType, condition: string): Promise<UserAchievement | null> {
    const achievement = await prisma.achievement.findFirst({
      where: {
        type,
        condition,
        isActive: true
      }
    })
    
    if (!achievement) return null
    
    return await this.unlockAchievement(userId, achievement.name)
  }

  /**
   * 更新成就进度
   */
  async updateAchievementProgress(userId: string, achievementId: string, progress: number): Promise<UserAchievement | null> {
    // 检查成就是否存在
    const achievement = await prisma.achievement.findUnique({
      where: { id: achievementId }
    })
    
    if (!achievement) return null
    
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
        await this.addPoints(userId, achievement.points, PointTransactionType.ACHIEVEMENT_UNLOCKED, `解锁成就: ${achievement.name}`)
      }
    }
    
    return userAchievement
  }

  /**
   * 获取用户所有成就
   */
  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    return await prisma.userAchievement.findMany({
      where: { userId },
      include: {
        achievement: true
      },
      orderBy: { unlockedAt: 'desc' }
    })
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
  }

  /**
   * 获取每日挑战
   */
  async getDailyChallenges(): Promise<DailyChallenge[]> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    return await prisma.dailyChallenge.findMany({
      where: {
        isActive: true,
        date: {
          gte: today
        }
      }
    })
  }

  /**
   * 获取用户的每日挑战进度
   */
  async getUserDailyChallenges(userId: string): Promise<(UserDailyChallenge & { challenge: DailyChallenge })[]> {
    return await prisma.userDailyChallenge.findMany({
      where: { userId },
      include: {
        challenge: true
      }
    }) as (UserDailyChallenge & { challenge: DailyChallenge })[]
  }

  /**
   * 更新挑战进度
   */
  async updateChallengeProgress(userId: string, challengeId: string, progress: number): Promise<UserDailyChallenge> {
    try {
      const userChallenge = await prisma.userDailyChallenge.findUnique({
        where: {
          userId_challengeId: {
            userId,
            challengeId
          }
        },
        include: {
          challenge: true
        }
      })
      
      if (!userChallenge) {
        // 创建新的用户挑战记录
        const newUserChallenge = await prisma.userDailyChallenge.create({
          data: {
            userId,
            challengeId,
            progress,
            completed: progress >= 100,
            completedAt: progress >= 100 ? new Date() : null
          },
          include: {
            challenge: true
          }
        })
        
        // 如果新挑战已经完成，添加积分奖励
        if (progress >= 100) {
          await this.addPoints(userId, newUserChallenge.challenge.points, PointTransactionType.CHALLENGE_COMPLETED, `完成挑战: ${newUserChallenge.challenge.title}`)
          
          // 检查挑战相关的成就
          await this.checkChallengeAchievements(userId, newUserChallenge.challenge.type)
        }
        
        return newUserChallenge
      }
      
      // 更新现有挑战记录
      const wasCompleted = userChallenge.completed
      const isCompleted = progress >= 100
      const justCompleted = isCompleted && !wasCompleted
      
      const updatedChallenge = await prisma.userDailyChallenge.update({
        where: {
          userId_challengeId: {
            userId,
            challengeId
          }
        },
        data: {
          progress,
          completed: isCompleted,
          ...(justCompleted ? { completedAt: new Date() } : {})
        },
        include: {
          challenge: true
        }
      })
      
      // 如果挑战刚刚完成，添加积分奖励
      if (justCompleted) {
        await this.addPoints(userId, updatedChallenge.challenge.points, PointTransactionType.CHALLENGE_COMPLETED, `完成挑战: ${updatedChallenge.challenge.title}`)
        
        // 检查挑战相关的成就
        await this.checkChallengeAchievements(userId, updatedChallenge.challenge.type)
      }
      
      return updatedChallenge
    } catch (error: unknown) {
      console.error('更新挑战进度失败:', error)
      throw error
    }
  }

  /**
   * 检查挑战相关的成就
   */
  async checkChallengeAchievements(userId: string, challengeType: ChallengeType): Promise<void> {
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
  }

  /**
   * 批量更新挑战进度
   */
  async batchUpdateChallengeProgress(userId: string, challengeUpdates: { challengeId: string; progress: number }[]): Promise<UserDailyChallenge[]> {
    const updatedChallenges: UserDailyChallenge[] = []
    
    for (const update of challengeUpdates) {
      const updatedChallenge = await this.updateChallengeProgress(userId, update.challengeId, update.progress)
      updatedChallenges.push(updatedChallenge)
    }
    
    return updatedChallenges
  }

  /**
   * 获取用户挑战完成统计
   */
  async getUserChallengeStats(userId: string): Promise<{
    total: number
    completed: number
    claimed: number
    byType: Record<ChallengeType, { total: number; completed: number }>
  }> {
    const userChallenges = await prisma.userDailyChallenge.findMany({
      where: { userId },
      include: {
        challenge: true
      }
    })
    
    const stats = {
      total: userChallenges.length,
      completed: userChallenges.filter((uc: UserDailyChallenge) => uc.completed).length,
      claimed: userChallenges.filter((uc: UserDailyChallenge) => uc.claimed).length,
      byType: {} as Record<ChallengeType, { total: number; completed: number }>
    }
    
    // 初始化各类型统计
    Object.values(ChallengeType).forEach(type => {
      stats.byType[type] = { total: 0, completed: 0 }
    })
    
    // 按类型统计
    userChallenges.forEach((userChallenge: UserDailyChallenge & { challenge: DailyChallenge }) => {
      const type = userChallenge.challenge.type
      if (stats.byType[type as ChallengeType]) {
        stats.byType[type as ChallengeType].total++
        if (userChallenge.completed) {
          stats.byType[type as ChallengeType].completed++
        }
      }
    })
    
    return stats
  }

  /**
   * 领取挑战奖励
   */
  async claimChallengeReward(userId: string, challengeId: string): Promise<UserDailyChallenge> {
    const userChallenge = await prisma.userDailyChallenge.findUnique({
      where: {
        userId_challengeId: {
          userId,
          challengeId
        }
      },
      include: {
        challenge: true
      }
    })
    
    if (!userChallenge || !userChallenge.completed || userChallenge.claimed) {
      throw new Error('无法领取奖励')
    }
    
    return await prisma.userDailyChallenge.update({
      where: {
        userId_challengeId: {
          userId,
          challengeId
        }
      },
      data: {
        claimed: true
      },
      include: {
        challenge: true
      }
    })
  }

  /**
   * 获取排行榜
   */
  async getLeaderboard(type: LeaderboardType, period: LeaderboardPeriod, limit: number = 10): Promise<LeaderboardEntry[]> {
    // 根据类型和周期获取排行榜数据
    const now = new Date()
    let periodStart: Date
    const periodEnd: Date = new Date(now)
    
    switch (period) {
      case LeaderboardPeriod.DAILY:
        periodStart = new Date(now)
        periodStart.setHours(0, 0, 0, 0)
        break
      case LeaderboardPeriod.WEEKLY:
        periodStart = new Date(now)
        periodStart.setDate(now.getDate() - 7)
        break
      case LeaderboardPeriod.MONTHLY:
        periodStart = new Date(now)
        periodStart.setMonth(now.getMonth() - 1)
        break
      case LeaderboardPeriod.ALL_TIME:
      default:
        periodStart = new Date(0) // 从最早时间开始
        break
    }
    
    // 构建查询条件
    let orderBy: Record<string, 'asc' | 'desc' | Record<string, 'asc' | 'desc'>> = {}
    switch (type) {
      case LeaderboardType.POINTS:
        orderBy = { profile: { points: 'desc' } }
        break
      case LeaderboardType.LEVEL:
        orderBy = { profile: { level: 'desc' } }
        break
      case LeaderboardType.STREAK:
        orderBy = { profile: { streak: 'desc' } }
        break
      case LeaderboardType.REVIEW_COUNT:
        // 需要计算复习次数
        orderBy = { score: 'desc' }
        break
      case LeaderboardType.ACCURACY:
        // 需要计算准确率
        orderBy = { score: 'desc' }
        break
      default:
        orderBy = { profile: { points: 'desc' } }
    }
    
    // 查找或创建排行榜
    let leaderboard = await prisma.leaderboard.findFirst({
      where: {
        type,
        period,
        isActive: true
      }
    })
    
    if (!leaderboard) {
      leaderboard = await prisma.leaderboard.create({
        data: {
          name: `${type}排行榜`,
          type,
          period,
          isActive: true
        }
      })
    }
    
    // 获取排行榜条目
    let entries = await prisma.leaderboardEntry.findMany({
      where: {
        leaderboardId: leaderboard.id,
        periodStart: { gte: periodStart },
        periodEnd: { lte: periodEnd }
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            avatar: true
          }
        },
        profile: true
      },
      orderBy,
      take: limit
    })
    
    // 如果没有条目或条目过期，生成新的排行榜
    if (entries.length === 0) {
      const completeEntries = await this.generateLeaderboardEntries(leaderboard.id, type, period, periodStart, periodEnd, limit)
      
      // 将 CompleteLeaderboardEntry 转换为 LeaderboardEntry
      entries = completeEntries.map(entry => ({
        id: entry.id,
        leaderboardId: entry.leaderboardId,
        userId: entry.userId,
        rank: entry.rank,
        score: entry.score,
        periodStart: entry.periodStart,
        periodEnd: entry.periodEnd,
        createdAt: entry.createdAt,
        user: entry.user,
        profile: entry.profile
      }))
    }
    
    return entries
  }

  /**
   * 生成排行榜条目
   */
  private async generateLeaderboardEntries(
    leaderboardId: string,
    type: LeaderboardType,
    period: LeaderboardPeriod,
    periodStart: Date,
    periodEnd: Date,
    limit: number
  ): Promise<CompleteLeaderboardEntry[]> {
    // 根据类型生成不同的排行榜数据
    let profiles: LeaderboardProfile[]
    
    switch (type) {
      case LeaderboardType.POINTS:
        profiles = await prisma.gamificationProfile.findMany({
          orderBy: { points: 'desc' },
          take: limit,
          include: {
            user: {
              select: {
                id: true,
                username: true,
                name: true,
                avatar: true
              }
            }
          }
        })
        break
      case LeaderboardType.LEVEL:
        profiles = await prisma.gamificationProfile.findMany({
          orderBy: { level: 'desc' },
          take: limit,
          include: {
            user: {
              select: {
                id: true,
                username: true,
                name: true,
                avatar: true
              }
            }
          }
        })
        break
      case LeaderboardType.STREAK:
        profiles = await prisma.gamificationProfile.findMany({
          orderBy: { streak: 'desc' },
          take: limit,
          include: {
            user: {
              select: {
                id: true,
                username: true,
                name: true,
                avatar: true
              }
            }
          }
        })
        break
      case LeaderboardType.REVIEW_COUNT:
        // 计算每个用户在指定时间段的复习次数
        const reviewCountProfiles = await prisma.$queryRaw`
          SELECT
            gp.id, gp.userId, gp.level, gp.points, gp.streak,
            u.username, u.name, u.avatar,
            COUNT(r.id) as score
          FROM gamification_profiles gp
          JOIN users u ON gp.userId = u.id
          LEFT JOIN reviews r ON gp.userId = r.userId
            AND r.reviewTime >= ${periodStart}
            AND r.reviewTime <= ${periodEnd}
          GROUP BY gp.id, gp.userId, gp.level, gp.points, gp.streak, u.username, u.name, u.avatar
          ORDER BY score DESC
          LIMIT ${limit}
        ` as LeaderboardQueryResult[]
        
        // 将查询结果转换为 LeaderboardProfile 格式
        profiles = reviewCountProfiles.map(p => ({
          id: p.id,
          userId: p.userId,
          level: p.level,
          points: p.points,
          streak: p.streak,
          user: {
            id: p.userId,
            username: p.username,
            name: p.name,
            avatar: p.avatar
          },
          score: p.score
        }))
        break
      case LeaderboardType.ACCURACY:
        // 计算每个用户在指定时间段的复习准确率
        const accuracyProfiles = await prisma.$queryRaw`
          SELECT
            gp.id, gp.userId, gp.level, gp.points, gp.streak,
            u.username, u.name, u.avatar,
            AVG(r.reviewScore) as score
          FROM gamification_profiles gp
          JOIN users u ON gp.userId = u.id
          LEFT JOIN reviews r ON gp.userId = r.userId
            AND r.reviewTime >= ${periodStart}
            AND r.reviewTime <= ${periodEnd}
            AND r.reviewScore IS NOT NULL
          GROUP BY gp.id, gp.userId, gp.level, gp.points, gp.streak, u.username, u.name, u.avatar
          ORDER BY score DESC
          LIMIT ${limit}
        ` as LeaderboardQueryResult[]
        
        // 将查询结果转换为 LeaderboardProfile 格式
        profiles = accuracyProfiles.map(p => ({
          id: p.id,
          userId: p.userId,
          level: p.level,
          points: p.points,
          streak: p.streak,
          user: {
            id: p.userId,
            username: p.username,
            name: p.name,
            avatar: p.avatar
          },
          score: p.score
        }))
        break
      default:
        profiles = await prisma.gamificationProfile.findMany({
          orderBy: { points: 'desc' },
          take: limit,
          include: {
            user: {
              select: {
                id: true,
                username: true,
                name: true,
                avatar: true
              }
            }
          }
        })
    }
    
    // 创建排行榜条目
    const entries: CompleteLeaderboardEntry[] = []
    
    for (let i = 0; i < profiles.length; i++) {
      const profile = profiles[i]
      
      // 检查是否已存在相同的 userId 和 leaderboardId 的条目
      // 注意：数据库的唯一性约束只基于 leaderboardId 和 userId，不包括时间范围
      const existingEntry = await prisma.leaderboardEntry.findFirst({
        where: {
          leaderboardId,
          userId: profile.userId
        }
      });

      console.log(`[DEBUG] 检查排行榜条目: leaderboardId=${leaderboardId}, userId=${profile.userId}, found=${!!existingEntry}`);
      
      let entry: CompleteLeaderboardEntry
       
      if (existingEntry) {
        // 如果条目已存在，则更新现有条目
        const updatedEntry = await prisma.leaderboardEntry.update({
          where: {
            id: existingEntry.id
          },
          data: {
            rank: i + 1,
            score: Math.round(profile.score || profile.points || profile.level || profile.streak || 0),
            periodStart,
            periodEnd
          }
        });
        
        // 构建完整的排行榜条目，包含所需的 user 和 profile 属性
        entry = {
          ...updatedEntry,
          user: {
            id: profile.userId,
            username: profile.user.username,
            name: profile.user.name ?? null,
            avatar: profile.user.avatar ?? null
          },
          profile: {
            id: profile.id,
            userId: profile.userId,
            level: profile.level,
            points: profile.points,
            experience: 0,
            streak: profile.streak,
            lastActiveAt: new Date()
          }
        };
      } else {
        // 如果条目不存在，则创建新条目
        console.log(`[DEBUG] 创建新排行榜条目: leaderboardId=${leaderboardId}, userId=${profile.userId}, rank=${i + 1}`);

        try {
          const createdEntry = await prisma.leaderboardEntry.create({
            data: {
              leaderboardId,
              userId: profile.userId,
              rank: i + 1,
              score: Math.round(profile.score || profile.points || profile.level || profile.streak || 0),
              periodStart,
              periodEnd
            }
          });
          
          // 构建完整的排行榜条目，包含所需的 user 和 profile 属性
          entry = {
            ...createdEntry,
            user: {
              id: profile.userId,
              username: profile.user.username,
              name: profile.user.name ?? null,
              avatar: profile.user.avatar ?? null
            },
            profile: {
              id: profile.id,
              userId: profile.userId,
              level: profile.level,
              points: profile.points,
              experience: 0,
              streak: profile.streak,
              lastActiveAt: new Date()
            }
          };
          
          console.log(`[DEBUG] 新排行榜条目创建成功: id=${entry.id}, userId=${entry.userId}`);
        } catch (error: unknown) {
          console.error(`[DEBUG] 创建排行榜条目失败: userId=${profile.userId}, error=${error instanceof Error ? error.message : String(error)}`);
          throw error;
        }
      }
      
      entries.push(entry)
    }
    
    return entries
  }

  /**
   * 处理用户复习完成事件
   */
  async handleReviewCompleted(userId: string, reviewData: { isCompleted: boolean }): Promise<void> {
    // 添加复习积分奖励
    const points = reviewData.isCompleted ? 10 : 5 // 完成复习得10分，未完成得5分
    await this.addPoints(userId, points, PointTransactionType.REVIEW_COMPLETED, '完成复习')
    
    // 添加经验值
    const experience = reviewData.isCompleted ? 20 : 10
    await this.addExperience(userId, experience)
    
    // 更新连续学习天数
    await this.updateStreak(userId)
    
    // 更新复习挑战进度
    const challenges = await this.getUserDailyChallenges(userId)
    for (const challenge of challenges) {
      if (challenge.challenge.type === ChallengeType.REVIEW_COUNT) {
        await this.updateChallengeProgress(userId, challenge.challengeId, challenge.progress + 1)
      }
    }
    
    // 检查成就
    const userReviews = await prisma.review.count({
      where: { userId }
    })
    
    await this.checkAchievements(userId, 'REVIEW', { reviewCount: userReviews })
  }

  /**
   * 处理用户创建记忆内容事件
   */
  async handleMemoryCreated(userId: string): Promise<void> {
    // 添加创建记忆内容积分奖励
    await this.addPoints(userId, 5, PointTransactionType.MANUAL_ADJUST, '创建记忆内容')
    
    // 更新创建记忆挑战进度
    const challenges = await this.getUserDailyChallenges(userId)
    for (const challenge of challenges) {
      if (challenge.challenge.type === ChallengeType.MEMORY_CREATED) {
        await this.updateChallengeProgress(userId, challenge.challengeId, challenge.progress + 1)
      }
    }
  }

  /**
   * 初始化默认成就
   */
  async initializeDefaultAchievements(): Promise<void> {
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
  }

  /**
   * 创建每日挑战
   */
  async createDailyChallenges(date?: Date): Promise<DailyChallenge[]> {
    const targetDate = date || new Date()
    targetDate.setHours(0, 0, 0, 0)
    
    // 检查是否已经为该日期创建了挑战
    const existingChallenges = await prisma.dailyChallenge.findMany({
      where: {
        date: targetDate
      }
    })
    
    if (existingChallenges.length > 0) {
      return existingChallenges
    }
    
    // 默认挑战模板
    const challengeTemplates = [
      {
        title: '每日复习',
        description: '完成10次复习',
        type: ChallengeType.REVIEW_COUNT,
        target: 10,
        points: 50
      },
      {
        title: '记忆创造者',
        description: '创建3个新记忆',
        type: ChallengeType.MEMORY_CREATED,
        target: 3,
        points: 30
      },
      {
        title: '类别专家',
        description: '复习5个特定类别的记忆',
        type: ChallengeType.CATEGORY_FOCUS,
        target: 5,
        points: 40
      },
      {
        title: '完美复习',
        description: '连续5次复习获得满分',
        type: ChallengeType.REVIEW_ACCURACY,
        target: 5,
        points: 60
      }
    ]
    
    // 创建挑战
    const createdChallenges: DailyChallenge[] = []
    
    for (const template of challengeTemplates) {
      const challenge = await prisma.dailyChallenge.create({
        data: {
          ...template,
          date: targetDate,
          isActive: true
        }
      })
      
      createdChallenges.push(challenge)
    }
    
    return createdChallenges
  }

  /**
   * 为用户分配每日挑战
   */
  async assignDailyChallengesToUser(userId: string, date?: Date): Promise<UserDailyChallenge[]> {
    const targetDate = date || new Date()
    targetDate.setHours(0, 0, 0, 0)
    
    // 获取或创建当日的挑战
    const dailyChallenges = await this.createDailyChallenges(targetDate)
    
    // 为用户分配挑战
    const assignedChallenges: UserDailyChallenge[] = []
    
    for (const challenge of dailyChallenges) {
      // 检查用户是否已经有这个挑战
      const existing = await prisma.userDailyChallenge.findUnique({
        where: {
          userId_challengeId: {
            userId,
            challengeId: challenge.id
          }
        }
      })
      
      if (!existing) {
        const userChallenge = await prisma.userDailyChallenge.create({
          data: {
            userId,
            challengeId: challenge.id,
            progress: 0,
            completed: false,
            claimed: false
          },
          include: {
            challenge: true
          }
        })
        
        assignedChallenges.push(userChallenge)
      }
    }
    
    return assignedChallenges
  }

  /**
   * 初始化默认每日挑战
   */
  async initializeDefaultDailyChallenges(): Promise<void> {
    await this.createDailyChallenges()
  }

  /**
   * 获取当日可用的挑战
   */
  async getAvailableDailyChallenges(date?: Date): Promise<DailyChallenge[]> {
    const targetDate = date || new Date()
    targetDate.setHours(0, 0, 0, 0)
    
    const nextDay = new Date(targetDate)
    nextDay.setDate(nextDay.getDate() + 1)
    
    return await prisma.dailyChallenge.findMany({
      where: {
        date: {
          gte: targetDate,
          lt: nextDay
        },
        isActive: true
      },
      orderBy: { points: 'desc' }
    })
  }

  /**
   * 重置过期挑战
   */
  async resetExpiredChallenges(): Promise<void> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // 找出所有过期的挑战（昨天及以前的）
    const expiredDate = new Date(today)
    expiredDate.setDate(expiredDate.getDate() - 1)
    
    // 将过期挑战标记为非活跃
    await prisma.dailyChallenge.updateMany({
      where: {
        date: {
          lt: today
        },
        isActive: true
      },
      data: {
        isActive: false
      }
    })
  }
}

// 导出单例实例
export const gamificationService = new GamificationService()