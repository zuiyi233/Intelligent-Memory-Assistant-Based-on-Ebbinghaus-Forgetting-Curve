import { isPrismaInitialized } from '@/lib/db'

// 检查是否在服务端环境
const isServerSide = typeof window === 'undefined'
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
import { gamificationEventHandler } from './gamificationEventHandler.service'
import { gamificationABTestingInterceptorService } from './gamificationABTestingInterceptor.service'

// 导入子服务
import { profileService } from './gamification/ProfileService'
import { pointsService } from './gamification/PointsService'
import { achievementService } from './gamification/AchievementService'
import { dailyChallengeService } from './gamification/DailyChallengeService'
import { leaderboardService } from './gamification/LeaderboardService'
import { rewardService } from './gamification/RewardService'

import {
  RewardItem,
  UserReward,
  RewardCategory,
  RewardType,
  RewardStatus,
  RewardStoreQueryParams,
  RewardClaimRequest,
  RewardClaimResponse
} from '@/types'

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
    // 委托给 ProfileService
    return await profileService.getOrCreateProfile(userId)
  }

  /**
   * 添加积分并创建交易记录
   */
  async addPoints(userId: string, amount: number, type: PointTransactionType, description: string): Promise<GamificationProfile> {
    // 检查是否在服务端环境且 Prisma 已初始化
    if (!isServerSide || !isPrismaInitialized()) {
      console.error('GamificationService.addPoints 只能在服务端运行')
      throw new Error('此方法只能在服务端运行')
    }

    try {
      // 动态导入 Prisma，避免在客户端打包
      const { prisma } = await import('@/lib/db')

      // 使用A/B测试拦截器调整积分参数
      const interceptedParams = await gamificationABTestingInterceptorService.interceptAddPoints(
        userId,
        amount,
        type,
        description
      )
      
      const profile = await this.getOrCreateProfile(userId)
      
      // 验证积分数量
      if (interceptedParams.amount === 0) {
        throw new Error('积分数量不能为0')
      }
      
      // 如果是扣除积分，检查用户是否有足够积分
      if (interceptedParams.amount < 0 && profile.points < Math.abs(interceptedParams.amount)) {
        throw new Error('积分不足')
      }
      
      // 创建积分交易记录
      await prisma.pointTransaction.create({
        data: {
          userId,
          amount: interceptedParams.amount,
          type: interceptedParams.type,
          description: interceptedParams.description
        }
      })

      // 创建积分记录
      await prisma.point.create({
        data: {
          userId,
          amount: Math.abs(interceptedParams.amount),
          type: interceptedParams.amount > 0 ? PointType.EARNED : PointType.SPENT,
          source: interceptedParams.description
        }
      })

      // 更新用户积分
      const newPoints = profile.points + interceptedParams.amount
      const updatedProfile = await prisma.gamificationProfile.update({
        where: { userId },
        data: {
          points: newPoints,
          lastActiveAt: new Date()
        }
      })

      // 检查积分相关的成就
      if (interceptedParams.amount > 0 && newPoints >= 1000) {
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
    // 委托给 PointsService
    return await pointsService.getPointsHistory(userId, limit)
  }

  /**
   * 添加经验值
   */
  async addExperience(userId: string, amount: number): Promise<GamificationProfile> {
    // 使用A/B测试拦截器调整经验值
    const adjustedAmount = await gamificationABTestingInterceptorService.interceptAddExperience(userId, amount)
    // 委托给 ProfileService
    return await profileService.updateUserExperience(userId, adjustedAmount)
  }

  /**
   * 更新用户经验值
   */
  async updateUserExperience(userId: string, amount: number): Promise<GamificationProfile> {
    // 委托给 ProfileService
    return await profileService.updateUserExperience(userId, amount)
  }

  /**
   * 计算用户等级
   */
  async calculateLevel(experience: number, userId?: string): Promise<number> {
    // 委托给 ProfileService
    return await profileService.calculateLevel(experience, userId)
  }

  /**
   * 计算升级所需经验值
   */
  calculateExperienceForLevel(level: number): number {
    // 委托给 ProfileService
    return profileService.calculateExperienceForLevel(level)
  }

  /**
   * 检查并处理升级
   */
  private async checkLevelUp(userId: string): Promise<void> {
    const profile = await this.getOrCreateProfile(userId)
    
    // 使用新的等级计算公式
    const newLevel = await this.calculateLevel(profile.experience, userId)
    
    if (newLevel > profile.level) {
      await this.handleLevelUp(userId, profile.level, newLevel)
    }
  }

  /**
   * 处理用户升级
   */
  async handleLevelUp(userId: string, oldLevel: number, newLevel: number): Promise<void> {
    // 委托给 ProfileService
    return await profileService.handleLevelUp(userId, oldLevel, newLevel)
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
    // 委托给 ProfileService
    return await profileService.updateStreakDays(userId)
  }

  /**
   * 检查连续学习成就
   */
  async checkStreakAchievements(userId: string, streak: number): Promise<UserAchievement[]> {
    // 委托给 AchievementService
    return await achievementService.checkStreakAchievements(userId, streak)
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
    // 委托给 ProfileService
    return await profileService.getUserStreakStats(userId)
  }

  /**
   * 获取所有成就
   */
  async getAllAchievements(): Promise<Achievement[]> {
    // 委托给 AchievementService
    return await achievementService.getAllAchievements()
  }

  /**
   * 检查并解锁成就
   */
  async checkAchievements(userId: string, trigger: string, data: AchievementCheckData): Promise<UserAchievement[]> {
    // 委托给 AchievementService
    return await achievementService.checkAchievements(userId, trigger, data)
  }

  /**
   * 解锁成就
   */
  async unlockAchievement(userId: string, achievementCode: string): Promise<UserAchievement | null> {
    // 委托给 AchievementService
    return await achievementService.unlockAchievement(userId, achievementCode)
  }

  /**
   * 根据成就类型解锁成就
   */
  async unlockAchievementByType(userId: string, type: AchievementType, condition: string): Promise<UserAchievement | null> {
    // 委托给 AchievementService
    return await achievementService.unlockAchievementByType(userId, type, condition)
  }

  /**
   * 更新成就进度
   */
  async updateAchievementProgress(userId: string, achievementId: string, progress: number): Promise<UserAchievement | null> {
    // 委托给 AchievementService
    return await achievementService.updateAchievementProgress(userId, achievementId, progress)
  }

  /**
   * 获取用户所有成就
   */
  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    // 委托给 AchievementService
    return await achievementService.getUserAchievements(userId)
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
    // 委托给 AchievementService
    return await achievementService.getUserAchievementStats(userId)
  }

  /**
   * 获取每日挑战
   */
  async getDailyChallenges(): Promise<DailyChallenge[]> {
    // 委托给 DailyChallengeService
    return await dailyChallengeService.getDailyChallenges()
  }

  /**
   * 获取用户的每日挑战进度
   */
  async getUserDailyChallenges(userId: string): Promise<(UserDailyChallenge & { challenge: DailyChallenge })[]> {
    // 委托给 DailyChallengeService
    return await dailyChallengeService.getUserDailyChallenges(userId)
  }

  /**
   * 更新挑战进度
   */
  async updateChallengeProgress(userId: string, challengeId: string, progress: number): Promise<UserDailyChallenge> {
    // 委托给 DailyChallengeService
    return await dailyChallengeService.updateChallengeProgress(userId, challengeId, progress)
  }

  /**
   * 检查挑战相关的成就
   */
  async checkChallengeAchievements(userId: string, challengeType: ChallengeType): Promise<void> {
    // 委托给 AchievementService
    return await achievementService.checkChallengeAchievements(userId, challengeType)
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
    // 委托给 DailyChallengeService
    return await dailyChallengeService.getUserChallengeStats(userId)
  }

  /**
   * 领取挑战奖励
   */
  async claimChallengeReward(userId: string, challengeId: string): Promise<UserDailyChallenge> {
    // 委托给 DailyChallengeService
    return await dailyChallengeService.claimChallengeReward(userId, challengeId)
  }

  /**
   * 获取排行榜
   */
  async getLeaderboard(type: LeaderboardType, period: LeaderboardPeriod, limit: number = 10, userId?: string): Promise<LeaderboardEntry[]> {
    // 委托给 LeaderboardService
    return await leaderboardService.getLeaderboard(type, period, limit, userId)
  }

  /**
   * 处理用户复习完成事件
   */
  async handleReviewCompleted(userId: string, reviewData: { isCompleted: boolean; accuracy?: number; timeSpent?: number }): Promise<void> {
    // 动态导入事件处理器
    const { reviewEventHandler } = await import('./gamification/eventHandlers/ReviewEventHandler')
    
    // 将 reviewData 转换为 ReviewCompletedData 格式
    const eventData = {
      isCompleted: reviewData.isCompleted,
      responseTime: reviewData.timeSpent,
      difficulty: reviewData.accuracy ?
        (reviewData.accuracy > 0.8 ? 'easy' : reviewData.accuracy > 0.5 ? 'medium' : 'hard') as 'easy' | 'medium' | 'hard' : undefined
    }
    
    // 委托给 ReviewEventHandler
    await reviewEventHandler.handleReviewCompleted(userId, eventData)
    
    // 在主服务中处理游戏化逻辑
    // 使用A/B测试拦截器处理复习完成事件
    await gamificationABTestingInterceptorService.interceptReviewCompletion(userId, reviewData)
    
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
    // 动态导入 Prisma，避免在客户端打包
    const { prisma } = await import('@/lib/db')
    
    const userReviews = await prisma.review.count({
      where: { userId }
    })
    
    await this.checkAchievements(userId, 'REVIEW', { reviewCount: userReviews })
  }

  /**
   * 处理用户创建记忆内容事件
   */
  async handleMemoryCreated(userId: string, memoryData?: { difficulty: number; category: string }): Promise<void> {
    // 动态导入事件处理器
    const { memoryEventHandler } = await import('./gamification/eventHandlers/MemoryEventHandler')
    
    // 将 memoryData 转换为 MemoryCreatedData 格式
    if (memoryData) {
      // 将数字难度转换为枚举字符串
      let difficulty: 'easy' | 'medium' | 'hard' = 'medium'
      if (memoryData.difficulty < 0.3) {
        difficulty = 'easy'
      } else if (memoryData.difficulty > 0.7) {
        difficulty = 'hard'
      }
      
      const eventData = {
        difficulty,
        category: memoryData.category
      }
      
      // 委托给 MemoryEventHandler
      await memoryEventHandler.handleMemoryCreated(userId, eventData)
    } else {
      // 如果没有提供 memoryData，使用默认值调用事件处理器
      const defaultEventData = {
        difficulty: 'medium' as const,
        category: 'general'
      }
      await memoryEventHandler.handleMemoryCreated(userId, defaultEventData)
    }
    
    // 在主服务中处理游戏化逻辑
    // 使用A/B测试拦截器处理记忆内容创建事件
    if (memoryData) {
      await gamificationABTestingInterceptorService.interceptMemoryCreation(userId, memoryData)
    }
    
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
    // 委托给 AchievementService
    return await achievementService.initializeDefaultAchievements()
  }

  /**
   * 创建每日挑战
   */
  async createDailyChallenges(date?: Date, userId?: string): Promise<DailyChallenge[]> {
    // 检查 Prisma 客户端是否已正确初始化
    // 动态导入 Prisma，避免在客户端打包
    const { prisma } = await import('@/lib/db')
    
    if (!isPrismaInitialized() || !prisma.dailyChallenge) {
      throw new Error('数据库连接未正确初始化，无法创建每日挑战')
    }

    const targetDate = date || new Date()
    targetDate.setHours(0, 0, 0, 0)
    
    // 检查是否已经为该日期创建了挑战
    let existingChallenges: DailyChallenge[] = []
    try {
      existingChallenges = await prisma.dailyChallenge.findMany({
        where: {
          date: targetDate
        }
      })
    } catch (error) {
      console.error('查询现有挑战失败:', error)
      throw new Error(`查询现有挑战失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
    
    if (existingChallenges.length > 0) {
      return existingChallenges
    }
    
    // 挑战模板接口
    interface ChallengeTemplate {
      title: string
      description: string
      type: ChallengeType
      baseTarget: number
      basePoints: number
      condition?: string
    }
    
    // 基础挑战模板
    const baseChallengeTemplates: ChallengeTemplate[] = [
      {
        title: '每日复习',
        description: '完成10次复习',
        type: ChallengeType.REVIEW_COUNT,
        baseTarget: 10,
        basePoints: 50
      },
      {
        title: '记忆创造者',
        description: '创建3个新记忆',
        type: ChallengeType.MEMORY_CREATED,
        baseTarget: 3,
        basePoints: 30
      },
      {
        title: '类别专家',
        description: '复习5个特定类别的记忆',
        type: ChallengeType.CATEGORY_FOCUS,
        baseTarget: 5,
        basePoints: 40
      },
      {
        title: '完美复习',
        description: '连续5次复习获得满分',
        type: ChallengeType.REVIEW_ACCURACY,
        baseTarget: 5,
        basePoints: 60
      }
    ]
    
    // 高级挑战模板（根据日期动态选择）
    const advancedChallengeTemplates: ChallengeTemplate[] = [
      {
        title: '速度之王',
        description: '在30分钟内完成5次复习',
        type: ChallengeType.REVIEW_COUNT,
        baseTarget: 5,
        basePoints: 80,
        condition: 'time_limit'
      },
      {
        title: '连续学习专家',
        description: '连续7天完成每日挑战',
        type: ChallengeType.STREAK_DAYS,
        baseTarget: 7,
        basePoints: 100,
        condition: 'consecutive_days'
      },
      {
        title: '全能学习者',
        description: '完成3个不同类别的复习',
        type: ChallengeType.CATEGORY_FOCUS,
        baseTarget: 3,
        basePoints: 70,
        condition: 'variety'
      },
      {
        title: '周末冲刺',
        description: '在一天内完成15次复习',
        type: ChallengeType.REVIEW_COUNT,
        baseTarget: 15,
        basePoints: 90,
        condition: 'weekend_only'
      },
      {
        title: '完美一周',
        description: '一周内完成所有每日挑战',
        type: ChallengeType.REVIEW_COUNT,
        baseTarget: 7,
        basePoints: 150,
        condition: 'weekly_completion'
      }
    ]
    
    // 根据用户等级和历史表现调整难度
    let difficultyMultiplier = 1.0
    if (userId) {
      const profile = await this.getOrCreateProfile(userId)
      
      // 根据用户等级调整难度
      if (profile.level >= 10) difficultyMultiplier = 1.5
      else if (profile.level >= 5) difficultyMultiplier = 1.2
      else if (profile.level >= 3) difficultyMultiplier = 1.1
      
      // 根据历史挑战完成率调整难度
      const userChallengeStats = await this.getUserChallengeStats(userId)
      const completionRate = userChallengeStats.total > 0
        ? userChallengeStats.completed / userChallengeStats.total
        : 0.5
        
      if (completionRate > 0.8) difficultyMultiplier *= 1.2
      else if (completionRate < 0.3) difficultyMultiplier *= 0.8
    }
    
    // 根据星期几选择挑战组合
    const dayOfWeek = targetDate.getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    const selectedTemplates: ChallengeTemplate[] = [...baseChallengeTemplates]
    
    // 周末添加特殊挑战
    if (isWeekend) {
      const weekendChallenge = advancedChallengeTemplates.find(t => t.condition === 'weekend_only')
      if (weekendChallenge) selectedTemplates.push(weekendChallenge)
    }
    
    // 随机选择一个高级挑战
    const otherAdvancedChallenges = advancedChallengeTemplates.filter(
      t => t.condition !== 'weekend_only'
    )
    if (otherAdvancedChallenges.length > 0) {
      const randomIndex = Math.floor(Math.random() * otherAdvancedChallenges.length)
      selectedTemplates.push(otherAdvancedChallenges[randomIndex])
    }
    
    // 应用难度调整并创建挑战
    const createdChallenges: DailyChallenge[] = []
    
    for (const template of selectedTemplates) {
      // 使用A/B测试拦截器调整挑战参数
      // 只有当 userId 存在时才调用拦截器
      let interceptedParams = { target: template.baseTarget, points: template.basePoints }
      if (userId) {
        try {
          interceptedParams = await gamificationABTestingInterceptorService.interceptChallengeCreation(
            userId,
            template.baseTarget,
            template.basePoints,
            template.type
          )
        } catch (error) {
          console.error('调用A/B测试拦截器失败，使用默认参数:', error)
        }
      }
      
      const adjustedTarget = Math.max(1, Math.floor(interceptedParams.target * difficultyMultiplier))
      const adjustedPoints = Math.floor(interceptedParams.points * difficultyMultiplier)
      
      const challenge = await prisma.dailyChallenge.create({
        data: {
          title: template.title,
          description: template.description.replace(
            template.baseTarget.toString(),
            adjustedTarget.toString()
          ),
          type: template.type,
          target: adjustedTarget,
          points: adjustedPoints,
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
    // 检查 Prisma 客户端是否已正确初始化
    // 动态导入 Prisma，避免在客户端打包
    const { prisma } = await import('@/lib/db')
    
    if (!isPrismaInitialized() || !prisma.userDailyChallenge) {
      throw new Error('数据库连接未正确初始化，无法分配每日挑战')
    }

    const targetDate = date || new Date()
    targetDate.setHours(0, 0, 0, 0)
    
    // 获取或创建当日的挑战
    const dailyChallenges = await this.createDailyChallenges(targetDate)
    
    // 为用户分配挑战
    const assignedChallenges: UserDailyChallenge[] = []
    
    for (const challenge of dailyChallenges) {
      try {
        // 使用事务确保操作的原子性
        const userChallenge = await prisma.$transaction(async (tx) => {
          // 检查用户是否已经有这个挑战
          const existing = await tx.userDailyChallenge.findUnique({
            where: {
              userId_challengeId: {
                userId,
                challengeId: challenge.id
              }
            }
          })
          
          if (existing) {
            // 如果已存在，直接返回现有记录
            return existing
          }
          
          // 如果不存在，创建新记录
          return await tx.userDailyChallenge.create({
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
        })
        
        assignedChallenges.push(userChallenge)
      } catch (error) {
        // 检查是否是唯一约束违反错误
        if (error instanceof Error && error.message.includes('Unique constraint failed')) {
          console.warn(`用户 ${userId} 的挑战 ${challenge.id} 已存在，尝试获取现有记录`)
          
          // 如果是唯一约束违反，说明记录已被其他请求创建，尝试获取现有记录
          try {
            const existing = await prisma.userDailyChallenge.findUnique({
              where: {
                userId_challengeId: {
                  userId,
                  challengeId: challenge.id
                }
              },
              include: {
                challenge: true
              }
            })
            
            if (existing) {
              assignedChallenges.push(existing)
            } else {
              console.error(`无法找到用户 ${userId} 的挑战 ${challenge.id} 的现有记录`)
            }
          } catch (fetchError) {
            console.error('获取现有用户挑战失败:', fetchError)
          }
        } else {
          console.error('分配用户挑战失败:', error)
          throw new Error(`分配用户挑战失败: ${error instanceof Error ? error.message : '未知错误'}`)
        }
      }
    }
    
    return assignedChallenges
  }

  /**
   * 初始化默认每日挑战
   */
  async initializeDefaultDailyChallenges(): Promise<void> {
    // 委托给 DailyChallengeService
    return await dailyChallengeService.initializeDefaultDailyChallenges()
  }

  /**
   * 获取当日可用的挑战
   */
  async getAvailableDailyChallenges(date?: Date): Promise<DailyChallenge[]> {
    // 委托给 DailyChallengeService
    return await dailyChallengeService.getAvailableDailyChallenges(date)
  }

  /**
   * 重置过期挑战
   */
  async resetExpiredChallenges(): Promise<void> {
    // 委托给 DailyChallengeService
    return await dailyChallengeService.resetExpiredChallenges()
  }

  /**
   * 自动为所有用户分配每日挑战
   */
  async autoAssignDailyChallengesToAllUsers(): Promise<{ success: number; failed: number }> {
    // 委托给 DailyChallengeService
    return await dailyChallengeService.autoAssignDailyChallengesToAllUsers()
  }

  /**
   * 检查用户挑战进度是否满足条件
   */
  async checkChallengeProgressCondition(userId: string, condition: string, challengeId: string): Promise<boolean> {
    // 委托给 DailyChallengeService
    return await dailyChallengeService.checkChallengeProgressCondition(userId, condition, challengeId)
  }

  /**
   * 获取用户挑战完成率统计
   */
  async getUserChallengeCompletionRate(userId: string, days: number = 30): Promise<{
    totalChallenges: number
    completedChallenges: number
    completionRate: number
    dailyStats: Array<{ date: string; total: number; completed: number }>
  }> {
    // 委托给 DailyChallengeService
    return await dailyChallengeService.getUserChallengeCompletionRate(userId, days)
  }

  /**
   * 获取挑战排行榜
   */
  async getChallengeLeaderboard(type: 'completion' | 'points' | 'streak', period: 'daily' | 'weekly' | 'monthly' | 'all_time', limit: number = 10): Promise<Array<{
    userId: string
    username: string
    avatar?: string | null
    value: number
    rank: number
  }>> {
    // 委托给 DailyChallengeService
    return await dailyChallengeService.getChallengeLeaderboard(type, period, limit)
  }
  /**
   * 获取奖励物品列表
   */
  async getRewardItems(params: RewardStoreQueryParams = {}): Promise<{
    items: RewardItem[]
    total: number
    page: number
    limit: number
    totalPages: number
  }> {
    // 委托给 RewardService
    return await rewardService.getRewardItems(params)
  }

  /**
   * 获取奖励物品详情
   */
  async getRewardItemById(id: string): Promise<RewardItem | null> {
    // 委托给 RewardService
    return await rewardService.getRewardItemById(id)
  }

  /**
   * 创建奖励物品
   */
  async createRewardItem(data: {
    name: string
    description: string
    icon?: string
    category: RewardCategory
    type: RewardType
    price: number
    stock?: number
    expiresAt?: Date
    metadata?: Record<string, unknown>
  }): Promise<RewardItem> {
    // 委托给 RewardService
    return await rewardService.createRewardItem(data)
  }

  /**
   * 更新奖励物品
   */
  async updateRewardItem(
    id: string,
    data: {
      name?: string
      description?: string
      icon?: string
      category?: RewardCategory
      type?: RewardType
      price?: number
      stock?: number
      isActive?: boolean
      expiresAt?: Date
      metadata?: Record<string, unknown>
    }
  ): Promise<RewardItem> {
    // 委托给 RewardService
    return await rewardService.updateRewardItem(id, data)
  }

  /**
   * 删除奖励物品
   */
  async deleteRewardItem(id: string): Promise<void> {
    // 委托给 RewardService
    return await rewardService.deleteRewardItem(id)
  }

  /**
   * 兑换奖励
   */
  async claimReward(userId: string, request: RewardClaimRequest): Promise<RewardClaimResponse> {
    // 委托给 RewardService
    return await rewardService.claimReward(userId, request)
  }

  /**
   * 处理奖励发放逻辑
   */
  private async processRewardFulfillment(userId: string, rewardItemId: string, userRewardId: string): Promise<void> {
    // 委托给 RewardService
    return await rewardService.processRewardFulfillment(userId, rewardItemId, userRewardId)
  }

  /**
   * 获取用户的奖励列表
   */
  async getUserRewards(userId: string, status?: RewardStatus): Promise<UserReward[]> {
    // 委托给 RewardService
    return await rewardService.getUserRewards(userId, status)
  }

  /**
   * 获取奖励商店统计信息
   */
  async getRewardStoreStats(): Promise<{
    totalItems: number
    activeItems: number
    totalRewardsClaimed: number
    mostPopularRewards: Array<{
      itemId: string
      name: string
      claimCount: number
    }>
  }> {
    // 委托给 RewardService
    return await rewardService.getRewardStoreStats()
  }

  /**
   * 初始化默认奖励物品
   */
  async initializeDefaultRewards(): Promise<void> {
    // 委托给 RewardService
    return await rewardService.initializeDefaultRewards()
  }
}

// 导出单例实例
export const gamificationService = new GamificationService()