import { isPrismaInitialized } from '@/lib/db'

// 检查是否在服务端环境
const isServerSide = typeof window === 'undefined'

// 定义成就解锁事件数据
export interface AchievementUnlockedData {
  achievementId: string;
  achievementName: string;
  points: number;
}

/**
 * 成就解锁事件处理器
 */
export class AchievementEventHandler {
  /**
   * 处理成就解锁事件
   */
  public async handleAchievementUnlocked(userId: string, data: AchievementUnlockedData): Promise<void> {
    // 检查是否在服务端环境且 Prisma 已初始化
    if (!isServerSide || !isPrismaInitialized()) {
      console.error('AchievementEventHandler.handleAchievementUnlocked 只能在服务端运行')
      throw new Error('此方法只能在服务端运行')
    }

    try {
      // 动态导入 Prisma，避免在客户端打包
      const { prisma } = await import('@/lib/db')

      // 记录成就解锁事件到日志（如果需要持久化，可以考虑创建专门的日志表）
      console.log(`用户 ${userId} 解锁成就: ${JSON.stringify(data)}`)

      // 处理成就解锁逻辑
      // 注意：这里需要调用 gamificationService，但我们将在主服务中处理这个依赖关系
      // 这里只记录事件，实际的处理逻辑在主服务中完成
    } catch (error: unknown) {
      console.error('处理成就解锁事件失败:', error)
      throw error
    }
  }

  /**
   * 获取用户成就解锁统计
   */
  public async getAchievementUnlockStats(userId: string, days: number = 30): Promise<{
    totalAchievements: number
    achievementsByCategory: Record<string, number>
    totalPoints: number
    averageAchievementsPerDay: number
  }> {
    // 检查是否在服务端环境且 Prisma 已初始化
    if (!isServerSide || !isPrismaInitialized()) {
      console.error('AchievementEventHandler.getAchievementUnlockStats 只能在服务端运行')
      throw new Error('此方法只能在服务端运行')
    }

    try {
      // 动态导入 Prisma，避免在客户端打包
      const { prisma } = await import('@/lib/db')

      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)
      
      // 获取用户成就
      const userAchievements = await prisma.userAchievement.findMany({
        where: {
          userId,
          unlockedAt: {
            gte: startDate
          }
        },
        include: {
          achievement: true
        }
      })

      const totalAchievements = userAchievements.length
      
      // 按类别统计
      const achievementsByCategory: Record<string, number> = {}
      userAchievements.forEach(userAchievement => {
        if (userAchievement.achievement.category) {
          achievementsByCategory[userAchievement.achievement.category] = 
            (achievementsByCategory[userAchievement.achievement.category] || 0) + 1
        }
      })
      
      // 计算总积分
      const totalPoints = userAchievements.reduce(
        (sum, userAchievement) => sum + (userAchievement.achievement.points || 0), 
        0
      )
      
      // 计算平均每天解锁的成就数
      const averageAchievementsPerDay = totalAchievements / days
      
      return {
        totalAchievements,
        achievementsByCategory,
        totalPoints,
        averageAchievementsPerDay
      }
    } catch (error: unknown) {
      console.error('获取用户成就解锁统计失败:', error)
      throw error
    }
  }

  /**
   * 获取用户成就解锁趋势
   */
  public async getAchievementUnlockTrends(userId: string, days: number = 30): Promise<Array<{
    date: string
    totalAchievements: number
    totalPoints: number
    byCategory: Record<string, number>
  }>> {
    // 检查是否在服务端环境且 Prisma 已初始化
    if (!isServerSide || !isPrismaInitialized()) {
      console.error('AchievementEventHandler.getAchievementUnlockTrends 只能在服务端运行')
      throw new Error('此方法只能在服务端运行')
    }

    try {
      // 动态导入 Prisma，避免在客户端打包
      const { prisma } = await import('@/lib/db')

      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)
      
      // 获取用户成就
      const userAchievements = await prisma.userAchievement.findMany({
        where: {
          userId,
          unlockedAt: {
            gte: startDate
          }
        },
        include: {
          achievement: true
        },
        orderBy: {
          unlockedAt: 'asc'
        }
      })

      // 按日期分组
      const achievementsByDate = new Map<string, Array<{ category: string; points: number }>>()
      
      userAchievements.forEach(userAchievement => {
        if (userAchievement.unlockedAt) {
          const date = userAchievement.unlockedAt.toISOString().split('T')[0]
          
          if (!achievementsByDate.has(date)) {
            achievementsByDate.set(date, [])
          }
          
          achievementsByDate.get(date)!.push({
            category: userAchievement.achievement.category || 'unknown',
            points: userAchievement.achievement.points || 0
          })
        }
      })
      
      // 生成趋势数据
      const trends: Array<{
        date: string
        totalAchievements: number
        totalPoints: number
        byCategory: Record<string, number>
      }> = []
      
      for (let i = 0; i < days; i++) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        
        const dayAchievements = achievementsByDate.get(dateStr) || []
        const totalAchievements = dayAchievements.length
        
        // 计算总积分
        const totalPoints = dayAchievements.reduce(
          (sum, achievement) => sum + achievement.points, 
          0
        )
        
        // 按类别统计
        const byCategory: Record<string, number> = {}
        dayAchievements.forEach(achievement => {
          byCategory[achievement.category] = (byCategory[achievement.category] || 0) + 1
        })
        
        trends.unshift({
          date: dateStr,
          totalAchievements,
          totalPoints,
          byCategory
        })
      }
      
      return trends
    } catch (error: unknown) {
      console.error('获取用户成就解锁趋势失败:', error)
      throw error
    }
  }

  /**
   * 获取用户最近解锁的成就
   */
  public async getRecentAchievements(userId: string, limit: number = 10): Promise<Array<{
    id: string
    achievementId: string
    achievementName: string
    category: string
    points: number
    unlockedAt: Date
  }>> {
    // 检查是否在服务端环境且 Prisma 已初始化
    if (!isServerSide || !isPrismaInitialized()) {
      console.error('AchievementEventHandler.getRecentAchievements 只能在服务端运行')
      throw new Error('此方法只能在服务端运行')
    }

    try {
      // 动态导入 Prisma，避免在客户端打包
      const { prisma } = await import('@/lib/db')

      const userAchievements = await prisma.userAchievement.findMany({
        where: {
          userId,
          progress: 100 // 只获取已解锁的成就
        },
        include: {
          achievement: true
        },
        orderBy: {
          unlockedAt: 'desc'
        },
        take: limit
      })

      return userAchievements.map(userAchievement => ({
        id: userAchievement.id,
        achievementId: userAchievement.achievementId,
        achievementName: userAchievement.achievement.name,
        category: userAchievement.achievement.category || 'unknown',
        points: userAchievement.achievement.points || 0,
        unlockedAt: userAchievement.unlockedAt!
      }))
    } catch (error: unknown) {
      console.error('获取用户最近解锁的成就失败:', error)
      throw error
    }
  }
}

// 导出单例实例
export const achievementEventHandler = new AchievementEventHandler()