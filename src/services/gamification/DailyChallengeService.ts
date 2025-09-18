import { isPrismaInitialized } from '@/lib/db'

// 检查是否在服务端环境
const isServerSide = typeof window === 'undefined'
import {
  DailyChallenge,
  UserDailyChallenge,
  ChallengeType,
  PointTransactionType
} from '@prisma/client'

/**
 * 每日挑战服务类
 */
export class DailyChallengeService {
  /**
   * 获取每日挑战
   */
  async getDailyChallenges(): Promise<DailyChallenge[]> {
    // 检查是否在服务端环境且 Prisma 已初始化
    if (!isServerSide || !isPrismaInitialized()) {
      console.error('DailyChallengeService.getDailyChallenges 只能在服务端运行')
      throw new Error('此方法只能在服务端运行')
    }

    try {
      // 动态导入 Prisma，避免在客户端打包
      const { prisma } = await import('@/lib/db')

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
    } catch (error: unknown) {
      console.error('获取每日挑战失败:', error)
      throw error
    }
  }

  /**
   * 获取用户的每日挑战进度
   */
  async getUserDailyChallenges(userId: string): Promise<(UserDailyChallenge & { challenge: DailyChallenge })[]> {
    // 检查是否在服务端环境且 Prisma 已初始化
    if (!isServerSide || !isPrismaInitialized()) {
      console.error('DailyChallengeService.getUserDailyChallenges 只能在服务端运行')
      throw new Error('此方法只能在服务端运行')
    }

    try {
      // 动态导入 Prisma，避免在客户端打包
      const { prisma } = await import('@/lib/db')

      return await prisma.userDailyChallenge.findMany({
        where: { userId },
        include: {
          challenge: true
        }
      }) as (UserDailyChallenge & { challenge: DailyChallenge })[]
    } catch (error: unknown) {
      console.error('获取用户的每日挑战进度失败:', error)
      throw error
    }
  }

  /**
   * 更新挑战进度
   */
  async updateChallengeProgress(userId: string, challengeId: string, progress: number): Promise<UserDailyChallenge> {
    // 检查是否在服务端环境且 Prisma 已初始化
    if (!isServerSide || !isPrismaInitialized()) {
      console.error('DailyChallengeService.updateChallengeProgress 只能在服务端运行')
      throw new Error('此方法只能在服务端运行')
    }

    try {
      // 动态导入 Prisma，避免在客户端打包
      const { prisma } = await import('@/lib/db')

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
          // 注意：这里需要调用 PointsService，但我们将在主服务中处理这个依赖关系
          console.log(`用户 ${userId} 完成挑战 ${newUserChallenge.challenge.title}，获得 ${newUserChallenge.challenge.points} 积分`)
          
          // 触发挑战完成事件
          // 注意：这里需要调用事件处理器，但我们将在主服务中处理这个依赖关系
          console.log(`用户 ${userId} 挑战完成事件：${newUserChallenge.challenge.title}`)
          
          // 检查挑战相关的成就
          // 注意：这里需要调用 AchievementService，但我们将在主服务中处理这个依赖关系
          console.log(`检查用户 ${userId} 的挑战相关成就`)
        }
        
        return newUserChallenge
      }
      
      // 注意：这里可以添加A/B测试拦截器调用，但我们将在主服务中处理这个依赖关系
      
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
        // 注意：这里需要调用 PointsService，但我们将在主服务中处理这个依赖关系
        console.log(`用户 ${userId} 完成挑战 ${updatedChallenge.challenge.title}，获得 ${updatedChallenge.challenge.points} 积分`)
        
        // 触发挑战完成事件
        // 注意：这里需要调用事件处理器，但我们将在主服务中处理这个依赖关系
        console.log(`用户 ${userId} 挑战完成事件：${updatedChallenge.challenge.title}`)
        
        // 检查挑战相关的成就
        // 注意：这里需要调用 AchievementService，但我们将在主服务中处理这个依赖关系
        console.log(`检查用户 ${userId} 的挑战相关成就`)
      }
      
      return updatedChallenge
    } catch (error: unknown) {
      console.error('更新挑战进度失败:', error)
      throw error
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
    // 检查是否在服务端环境且 Prisma 已初始化
    if (!isServerSide || !isPrismaInitialized()) {
      console.error('DailyChallengeService.getUserChallengeStats 只能在服务端运行')
      throw new Error('此方法只能在服务端运行')
    }

    try {
      // 动态导入 Prisma，避免在客户端打包
      const { prisma } = await import('@/lib/db')

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
    } catch (error: unknown) {
      console.error('获取用户挑战完成统计失败:', error)
      throw error
    }
  }

  /**
   * 领取挑战奖励
   */
  async claimChallengeReward(userId: string, challengeId: string): Promise<UserDailyChallenge> {
    // 检查是否在服务端环境且 Prisma 已初始化
    if (!isServerSide || !isPrismaInitialized()) {
      console.error('DailyChallengeService.claimChallengeReward 只能在服务端运行')
      throw new Error('此方法只能在服务端运行')
    }

    try {
      // 动态导入 Prisma，避免在客户端打包
      const { prisma } = await import('@/lib/db')

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
    } catch (error: unknown) {
      console.error('领取挑战奖励失败:', error)
      throw error
    }
  }

  /**
   * 创建每日挑战
   */
  async createDailyChallenges(date?: Date, userId?: string): Promise<DailyChallenge[]> {
    // 检查是否在服务端环境且 Prisma 已初始化
    if (!isServerSide || !isPrismaInitialized()) {
      console.error('DailyChallengeService.createDailyChallenges 只能在服务端运行')
      throw new Error('此方法只能在服务端运行')
    }

    try {
      // 动态导入 Prisma，避免在客户端打包
      const { prisma } = await import('@/lib/db')

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
        // 注意：这里需要调用 ProfileService，但我们将在主服务中处理这个依赖关系
        console.log(`获取用户 ${userId} 的资料以调整挑战难度`)
        
        // 这里使用一个模拟的用户等级
        const userLevel = 1
        
        // 根据用户等级调整难度
        if (userLevel >= 10) difficultyMultiplier = 1.5
        else if (userLevel >= 5) difficultyMultiplier = 1.2
        else if (userLevel >= 3) difficultyMultiplier = 1.1
        
        // 根据历史挑战完成率调整难度
        // 注意：这里需要调用 getUserChallengeStats 方法，但我们将在主服务中处理这个依赖关系
        console.log(`获取用户 ${userId} 的历史挑战完成率`)
        
        // 这里使用一个模拟的完成率
        const completionRate = 0.5
        
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
        // 注意：这里可以添加A/B测试拦截器调用，但我们将在主服务中处理这个依赖关系
        
        const adjustedTarget = Math.max(1, Math.floor(template.baseTarget * difficultyMultiplier))
        const adjustedPoints = Math.floor(template.basePoints * difficultyMultiplier)
        
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
    } catch (error: unknown) {
      console.error('创建每日挑战失败:', error)
      throw error
    }
  }

  /**
   * 为用户分配每日挑战
   */
  async assignDailyChallengesToUser(userId: string, date?: Date): Promise<UserDailyChallenge[]> {
    // 检查是否在服务端环境且 Prisma 已初始化
    if (!isServerSide || !isPrismaInitialized()) {
      console.error('DailyChallengeService.assignDailyChallengesToUser 只能在服务端运行')
      throw new Error('此方法只能在服务端运行')
    }

    try {
      // 动态导入 Prisma，避免在客户端打包
      const { prisma } = await import('@/lib/db')

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
                challengeId,
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
    } catch (error: unknown) {
      console.error('为用户分配每日挑战失败:', error)
      throw error
    }
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
    // 检查是否在服务端环境且 Prisma 已初始化
    if (!isServerSide || !isPrismaInitialized()) {
      console.error('DailyChallengeService.getAvailableDailyChallenges 只能在服务端运行')
      throw new Error('此方法只能在服务端运行')
    }

    try {
      // 动态导入 Prisma，避免在客户端打包
      const { prisma } = await import('@/lib/db')

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
    } catch (error: unknown) {
      console.error('获取当日可用的挑战失败:', error)
      throw error
    }
  }

  /**
   * 重置过期挑战
   */
  async resetExpiredChallenges(): Promise<void> {
    // 检查是否在服务端环境且 Prisma 已初始化
    if (!isServerSide || !isPrismaInitialized()) {
      console.error('DailyChallengeService.resetExpiredChallenges 只能在服务端运行')
      throw new Error('此方法只能在服务端运行')
    }

    try {
      // 动态导入 Prisma，避免在客户端打包
      const { prisma } = await import('@/lib/db')

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
    } catch (error: unknown) {
      console.error('重置过期挑战失败:', error)
      throw error
    }
  }

  /**
   * 自动为所有用户分配每日挑战
   */
  async autoAssignDailyChallengesToAllUsers(): Promise<{ success: number; failed: number }> {
    // 检查是否在服务端环境且 Prisma 已初始化
    if (!isServerSide || !isPrismaInitialized()) {
      console.error('DailyChallengeService.autoAssignDailyChallengesToAllUsers 只能在服务端运行')
      throw new Error('此方法只能在服务端运行')
    }

    try {
      // 动态导入 Prisma，避免在客户端打包
      const { prisma } = await import('@/lib/db')

      // 获取所有活跃用户
      const users = await prisma.user.findMany({
        where: { isActive: true }
      })

      let successCount = 0
      let failedCount = 0

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      for (const user of users) {
        try {
          // 检查用户今天是否已经有挑战
          const existingChallenges = await prisma.userDailyChallenge.findMany({
            where: {
              userId: user.id,
              challenge: {
                date: today
              }
            }
          })

          // 如果今天还没有挑战，则为用户分配
          if (existingChallenges.length === 0) {
            await this.assignDailyChallengesToUser(user.id, today)
            successCount++
          } else {
            // 用户今天已经有挑战，也视为成功
            successCount++
          }
        } catch (error) {
          console.error(`为用户 ${user.id} 分配每日挑战失败:`, error)
          failedCount++
        }
      }

      return { success: successCount, failed: failedCount }
    } catch (error: unknown) {
      console.error('自动分配每日挑战失败:', error)
      throw error
    }
  }

  /**
   * 检查用户挑战进度是否满足条件
   */
  async checkChallengeProgressCondition(userId: string, condition: string, challengeId: string): Promise<boolean> {
    // 检查是否在服务端环境且 Prisma 已初始化
    if (!isServerSide || !isPrismaInitialized()) {
      console.error('DailyChallengeService.checkChallengeProgressCondition 只能在服务端运行')
      throw new Error('此方法只能在服务端运行')
    }

    try {
      // 动态导入 Prisma，避免在客户端打包
      const { prisma } = await import('@/lib/db')

      switch (condition) {
        case 'time_limit': {
          // 检查用户是否在30分钟内完成5次复习
          const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000)
          const recentReviews = await prisma.review.count({
            where: {
              userId,
              reviewTime: {
                gte: thirtyMinutesAgo
              }
            }
          })
          return recentReviews >= 5
        }
        
        case 'consecutive_days': {
          // 检查用户是否连续7天完成每日挑战
          const sevenDaysAgo = new Date()
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
          sevenDaysAgo.setHours(0, 0, 0, 0)
          
          const dailyCompletions = await prisma.userDailyChallenge.findMany({
            where: {
              userId,
              completed: true,
              challenge: {
                date: {
                  gte: sevenDaysAgo
                }
              }
            },
            include: {
              challenge: true
            }
          })
          
          // 按日期分组并检查是否有连续7天的完成记录
          const completionByDate = new Map<string, boolean>()
          
          dailyCompletions.forEach(completion => {
            const dateStr = completion.challenge.date.toISOString().split('T')[0]
            completionByDate.set(dateStr, true)
          })
          
          // 检查最近7天是否每天都有完成的挑战
          for (let i = 0; i < 7; i++) {
            const checkDate = new Date()
            checkDate.setDate(checkDate.getDate() - i)
            const dateStr = checkDate.toISOString().split('T')[0]
            
            if (!completionByDate.has(dateStr)) {
              return false
            }
          }
          
          return true
        }
        
        case 'variety': {
          // 检查用户是否完成3个不同类别的复习
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          
          // 通过 memoryContentId 关联查询记忆内容
          const reviews = await prisma.review.findMany({
            where: {
              userId,
              reviewTime: {
                gte: today
              }
            },
            include: {
              memoryContent: {
                select: {
                  category: true
                }
              }
            }
          })
          
          const categories = new Set<string>()
          reviews.forEach(review => {
            if (review.memoryContent?.category) {
              categories.add(review.memoryContent.category)
            }
          })
          
          return categories.size >= 3
        }
        
        case 'weekend_only': {
          // 检查是否是周末
          const today = new Date()
          const dayOfWeek = today.getDay()
          return dayOfWeek === 0 || dayOfWeek === 6
        }
        
        case 'weekly_completion': {
          // 检查用户是否在一周内完成所有每日挑战
          const oneWeekAgo = new Date()
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
          oneWeekAgo.setHours(0, 0, 0, 0)
          
          // 获取一周内所有的每日挑战
          const dailyChallenges = await prisma.dailyChallenge.findMany({
            where: {
              date: {
                gte: oneWeekAgo
              },
              isActive: true
            }
          })
          
          // 获取用户完成的挑战
          const userChallenges = await prisma.userDailyChallenge.findMany({
            where: {
              userId,
              completed: true,
              challengeId: {
                in: dailyChallenges.map(c => c.id)
              }
            }
          })
          
          // 检查是否每天都有完成的挑战
          const completionByDate = new Map<string, boolean>()
          
          userChallenges.forEach(userChallenge => {
            const challenge = dailyChallenges.find(c => c.id === userChallenge.challengeId)
            if (challenge) {
              const dateStr = challenge.date.toISOString().split('T')[0]
              completionByDate.set(dateStr, true)
            }
          })
          
          // 检查最近7天是否每天都有完成的挑战
          for (let i = 0; i < 7; i++) {
            const checkDate = new Date()
            checkDate.setDate(checkDate.getDate() - i)
            const dateStr = checkDate.toISOString().split('T')[0]
            
            if (!completionByDate.has(dateStr)) {
              return false
            }
          }
          
          return true
        }
        
        default:
          return false
      }
    } catch (error: unknown) {
      console.error('检查挑战进度条件失败:', error)
      return false
    }
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
    // 检查是否在服务端环境且 Prisma 已初始化
    if (!isServerSide || !isPrismaInitialized()) {
      console.error('DailyChallengeService.getUserChallengeCompletionRate 只能在服务端运行')
      throw new Error('此方法只能在服务端运行')
    }

    try {
      // 动态导入 Prisma，避免在客户端打包
      const { prisma } = await import('@/lib/db')

      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)
      startDate.setHours(0, 0, 0, 0)
      
      // 获取指定时间范围内的所有挑战
      const dailyChallenges = await prisma.dailyChallenge.findMany({
        where: {
          date: {
            gte: startDate
          },
          isActive: true
        }
      })
      
      // 获取用户的挑战记录
      const userChallenges = await prisma.userDailyChallenge.findMany({
        where: {
          userId,
          challengeId: {
            in: dailyChallenges.map(c => c.id)
          }
        },
        include: {
          challenge: true
        }
      })
      
      // 按日期统计
      const statsByDate = new Map<string, { total: number; completed: number }>()
      
      // 初始化日期统计
      for (let i = 0; i < days; i++) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        statsByDate.set(dateStr, { total: 0, completed: 0 })
      }
      
      // 统计每日挑战总数
      dailyChallenges.forEach(challenge => {
        const dateStr = challenge.date.toISOString().split('T')[0]
        if (statsByDate.has(dateStr)) {
          const stats = statsByDate.get(dateStr)!
          stats.total++
        }
      })
      
      // 统计用户完成的挑战
      userChallenges.forEach(userChallenge => {
        const dateStr = userChallenge.challenge.date.toISOString().split('T')[0]
        if (statsByDate.has(dateStr)) {
          const stats = statsByDate.get(dateStr)!
          if (userChallenge.completed) {
            stats.completed++
          }
        }
      })
      
      // 计算总体统计
      let totalChallenges = 0
      let completedChallenges = 0
      
      statsByDate.forEach(stats => {
        totalChallenges += stats.total
        completedChallenges += stats.completed
      })
      
      const completionRate = totalChallenges > 0 ? completedChallenges / totalChallenges : 0
      
      // 转换为数组格式
      const dailyStats = Array.from(statsByDate.entries()).map(([date, stats]) => ({
        date,
        total: stats.total,
        completed: stats.completed
      }))
      
      return {
        totalChallenges,
        completedChallenges,
        completionRate,
        dailyStats
      }
    } catch (error: unknown) {
      console.error('获取用户挑战完成率统计失败:', error)
      throw error
    }
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
    // 检查是否在服务端环境且 Prisma 已初始化
    if (!isServerSide || !isPrismaInitialized()) {
      console.error('DailyChallengeService.getChallengeLeaderboard 只能在服务端运行')
      throw new Error('此方法只能在服务端运行')
    }

    try {
      // 动态导入 Prisma，避免在客户端打包
      const { prisma } = await import('@/lib/db')

      let periodStart: Date
      
      switch (period) {
        case 'daily':
          periodStart = new Date()
          periodStart.setHours(0, 0, 0, 0)
          break
        case 'weekly':
          periodStart = new Date()
          periodStart.setDate(periodStart.getDate() - 7)
          break
        case 'monthly':
          periodStart = new Date()
          periodStart.setMonth(periodStart.getMonth() - 1)
          break
        case 'all_time':
        default:
          periodStart = new Date(0) // 从最早时间开始
          break
      }
      
      let results: Array<{
        userId: string
        username: string
        avatar?: string | null
        value: number
      }> = []
      
      switch (type) {
        case 'completion': {
          // 获取挑战完成率最高的用户
          const completionData = await prisma.$queryRaw`
            SELECT
              u.id as userId,
              u.username,
              u.avatar,
              COUNT(uc.id) as totalChallenges,
              SUM(CASE WHEN uc.completed = true THEN 1 ELSE 0 END) as completedChallenges
            FROM users u
            LEFT JOIN user_daily_challenges uc ON u.id = uc.userId
            LEFT JOIN daily_challenges dc ON uc.challengeId = dc.id
            WHERE u.isActive = true
            AND (dc.date >= ${periodStart} OR dc.date IS NULL)
            GROUP BY u.id, u.username, u.avatar
            HAVING COUNT(uc.id) > 0
            ORDER BY completedChallenges DESC, totalChallenges ASC
            LIMIT ${limit}
          ` as Array<{
            userId: string
            username: string
            avatar?: string | null
            totalChallenges: number
            completedChallenges: number
          }>
          
          results = completionData.map(data => ({
            userId: data.userId,
            username: data.username,
            avatar: data.avatar,
            value: Math.round((data.completedChallenges / data.totalChallenges) * 100)
          }))
          break
        }
        
        case 'points': {
          // 获取挑战积分最高的用户
          const pointsData = await prisma.$queryRaw`
            SELECT
              u.id as userId,
              u.username,
              u.avatar,
              COALESCE(SUM(dc.points), 0) as totalPoints
            FROM users u
            LEFT JOIN user_daily_challenges uc ON u.id = uc.userId
            LEFT JOIN daily_challenges dc ON uc.challengeId = dc.id
            WHERE u.isActive = true
            AND uc.completed = true
            AND (dc.date >= ${periodStart} OR dc.date IS NULL)
            GROUP BY u.id, u.username, u.avatar
            ORDER BY totalPoints DESC
            LIMIT ${limit}
          ` as Array<{
            userId: string
            username: string
            avatar?: string | null
            totalPoints: number
          }>
          
          results = pointsData.map(data => ({
            userId: data.userId,
            username: data.username,
            avatar: data.avatar,
            value: data.totalPoints
          }))
          break
        }
        
        case 'streak': {
          // 获取连续完成挑战天数最多的用户
          const streakData = await prisma.$queryRaw`
            SELECT
              u.id as userId,
              u.username,
              u.avatar,
              gp.streak
            FROM users u
            JOIN gamification_profiles gp ON u.id = gp.userId
            WHERE u.isActive = true
            ORDER BY gp.streak DESC
            LIMIT ${limit}
          ` as Array<{
            userId: string
            username: string
            avatar?: string | null
            streak: number
          }>
          
          results = streakData.map(data => ({
            userId: data.userId,
            username: data.username,
            avatar: data.avatar,
            value: data.streak
          }))
          break
        }
      }
      
      // 添加排名
      return results.map((result, index) => ({
        ...result,
        rank: index + 1
      }))
    } catch (error: unknown) {
      console.error('获取挑战排行榜失败:', error)
      throw error
    }
  }
}

// 导出单例实例
export const dailyChallengeService = new DailyChallengeService()