import { isPrismaInitialized } from '@/lib/db'

// 检查是否在服务端环境
const isServerSide = typeof window === 'undefined'
import {
  GamificationProfile,
  PointTransactionType
} from '@prisma/client'

// 定义复习记录类型
interface ReviewRecord {
  reviewTime: Date;
}

/**
 * 用户游戏化资料服务类
 */
export class ProfileService {
  /**
   * 获取或创建用户的游戏化资料
   */
  async getOrCreateProfile(userId: string): Promise<GamificationProfile> {
    // 检查是否在服务端环境且 Prisma 已初始化
    if (!isServerSide || !isPrismaInitialized()) {
      console.error('ProfileService.getOrCreateProfile 只能在服务端运行')
      throw new Error('此方法只能在服务端运行')
    }

    try {
      // 动态导入 Prisma，避免在客户端打包
      const { prisma } = await import('@/lib/db')

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
    } catch (error: unknown) {
      console.error('获取或创建用户游戏化资料失败:', error)
      throw error
    }
  }

  /**
   * 更新用户经验值
   */
  async updateUserExperience(userId: string, amount: number): Promise<GamificationProfile> {
    // 检查是否在服务端环境且 Prisma 已初始化
    if (!isServerSide || !isPrismaInitialized()) {
      console.error('ProfileService.updateUserExperience 只能在服务端运行')
      throw new Error('此方法只能在服务端运行')
    }

    try {
      // 动态导入 Prisma，避免在客户端打包
      const { prisma } = await import('@/lib/db')

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
  async calculateLevel(experience: number, userId?: string): Promise<number> {
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
    
    // 如果提供了用户ID，这里可以添加A/B测试拦截器调用
    // 但是为了保持服务的单一职责，我们将这个逻辑移到主服务中
    
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
    const newLevel = await this.calculateLevel(profile.experience, userId)
    
    if (newLevel > profile.level) {
      await this.handleLevelUp(userId, profile.level, newLevel)
    }
  }

  /**
   * 处理用户升级
   */
  async handleLevelUp(userId: string, oldLevel: number, newLevel: number): Promise<void> {
    // 检查是否在服务端环境且 Prisma 已初始化
    if (!isServerSide || !isPrismaInitialized()) {
      console.error('ProfileService.handleLevelUp 只能在服务端运行')
      throw new Error('此方法只能在服务端运行')
    }

    try {
      // 动态导入 Prisma，避免在客户端打包
      const { prisma } = await import('@/lib/db')

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
      // 注意：这里需要调用 PointsService，但我们将在主服务中处理这个依赖关系
      // 为了避免循环依赖，我们在这里不直接调用，而是通过主服务来协调
      console.log(`用户 ${userId} 从 ${oldLevel} 级升到 ${newLevel} 级，获得 ${bonusPoints} 奖励积分`)
    }
    
    // 触发等级提升事件
    // 注意：这里需要调用事件处理器，但我们将在主服务中处理这个依赖关系
    console.log(`用户 ${userId} 等级提升事件，从 ${oldLevel} 级升到 ${newLevel} 级`)
  } catch (error: unknown) {
      console.error('处理用户升级失败:', error)
      throw error
    }
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
    // 检查是否在服务端环境且 Prisma 已初始化
    if (!isServerSide || !isPrismaInitialized()) {
      console.error('ProfileService.updateStreakDays 只能在服务端运行')
      throw new Error('此方法只能在服务端运行')
    }

    try {
      // 动态导入 Prisma，避免在客户端打包
      const { prisma } = await import('@/lib/db')

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
      
      // 注意：这里可以添加A/B测试拦截器调用，但我们将在主服务中处理这个依赖关系
      
      const updatedProfile = await prisma.gamificationProfile.update({
        where: { userId },
        data: {
          streak: newStreak,
          lastActiveAt: now
        }
      })
      
      // 连续学习奖励
      if (newStreak > profile.streak && newStreak % 7 === 0) {
        // 注意：这里需要调用 PointsService，但我们将在主服务中处理这个依赖关系
        console.log(`用户 ${userId} 连续学习 ${newStreak} 天，获得 ${newStreak * 10} 奖励积分`)
      }
      
      // 检查连续学习相关的成就
      // 注意：这里需要调用 AchievementService，但我们将在主服务中处理这个依赖关系
      console.log(`用户 ${userId} 连续学习天数更新为 ${newStreak}，需要检查相关成就`)
      
      return updatedProfile
    } catch (error: unknown) {
      console.error('更新连续学习天数失败:', error)
      throw error
    }
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
    const { prisma } = await import('@/lib/db')
    
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
}

// 导出单例实例
export const profileService = new ProfileService()