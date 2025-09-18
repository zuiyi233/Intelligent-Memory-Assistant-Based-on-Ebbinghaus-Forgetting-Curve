import { isPrismaInitialized } from '@/lib/db'

// 检查是否在服务端环境
const isServerSide = typeof window === 'undefined'

// 定义等级提升事件数据
export interface LevelUpData {
  oldLevel: number;
  newLevel: number;
  bonusPoints: number;
}

/**
 * 等级提升事件处理器
 */
export class LevelUpEventHandler {
  /**
   * 处理等级提升事件
   */
  public async handleLevelUp(userId: string, data: LevelUpData): Promise<void> {
    // 检查是否在服务端环境且 Prisma 已初始化
    if (!isServerSide || !isPrismaInitialized()) {
      console.error('LevelUpEventHandler.handleLevelUp 只能在服务端运行')
      throw new Error('此方法只能在服务端运行')
    }

    try {
      // 动态导入 Prisma，避免在客户端打包
      const { prisma } = await import('@/lib/db')

      // 记录等级提升事件到日志（如果需要持久化，可以考虑创建专门的日志表）
      console.log(`用户 ${userId} 等级提升: ${JSON.stringify(data)}`)

      // 处理等级提升逻辑
      // 注意：这里需要调用 gamificationService，但我们将在主服务中处理这个依赖关系
      // 这里只记录事件，实际的处理逻辑在主服务中完成
    } catch (error: unknown) {
      console.error('处理等级提升事件失败:', error)
      throw error
    }
  }

  /**
   * 获取用户等级提升统计
   */
  public async getLevelUpStats(userId: string, days: number = 30): Promise<{
    totalLevelUps: number
    levelsGained: number
    totalBonusPoints: number
    averageLevelUpsPerDay: number
    currentLevel: number
  }> {
    // 检查是否在服务端环境且 Prisma 已初始化
    if (!isServerSide || !isPrismaInitialized()) {
      console.error('LevelUpEventHandler.getLevelUpStats 只能在服务端运行')
      throw new Error('此方法只能在服务端运行')
    }

    try {
      // 动态导入 Prisma，避免在客户端打包
      const { prisma } = await import('@/lib/db')

      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)
      
      // 获取用户等级提升历史
      const userLevelHistory = await prisma.gamificationProfile.findMany({
        where: {
          userId,
          lastActiveAt: {
            gte: startDate
          }
        },
        orderBy: {
          lastActiveAt: 'asc'
        }
      })
      
      // 计算等级提升次数
      let totalLevelUps = 0
      let levelsGained = 0
      let totalBonusPoints = 0
      let oldLevel = 0
      
      userLevelHistory.forEach(profile => {
        if (profile.level > oldLevel) {
          totalLevelUps++
          levelsGained += profile.level - oldLevel
          totalBonusPoints += (profile.level - oldLevel) * 50 // 每级50奖励积分
          oldLevel = profile.level
        }
      })
      
      // 获取当前等级
      const currentProfile = await prisma.gamificationProfile.findUnique({
        where: { userId }
      })
      
      const currentLevel = currentProfile?.level || 1
      
      // 计算平均每天等级提升次数
      const averageLevelUpsPerDay = totalLevelUps / days
      
      return {
        totalLevelUps,
        levelsGained,
        totalBonusPoints,
        averageLevelUpsPerDay,
        currentLevel
      }
    } catch (error: unknown) {
      console.error('获取用户等级提升统计失败:', error)
      throw error
    }
  }

  /**
   * 获取用户等级提升趋势
   */
  public async getLevelUpTrends(userId: string, days: number = 30): Promise<Array<{
    date: string
    level: number
    experience: number
    levelUp: boolean
    bonusPoints: number
  }>> {
    // 检查是否在服务端环境且 Prisma 已初始化
    if (!isServerSide || !isPrismaInitialized()) {
      console.error('LevelUpEventHandler.getLevelUpTrends 只能在服务端运行')
      throw new Error('此方法只能在服务端运行')
    }

    try {
      // 动态导入 Prisma，避免在客户端打包
      const { prisma } = await import('@/lib/db')

      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)
      
      // 获取用户等级提升历史
      const userLevelHistory = await prisma.gamificationProfile.findMany({
        where: {
          userId,
          lastActiveAt: {
            gte: startDate
          }
        },
        orderBy: {
          lastActiveAt: 'asc'
        }
      })
      
      // 按日期分组
      const levelHistoryByDate = new Map<string, { level: number; experience: number }>()
      
      userLevelHistory.forEach(profile => {
        if (profile.lastActiveAt) {
          const date = profile.lastActiveAt.toISOString().split('T')[0]
          
          levelHistoryByDate.set(date, {
            level: profile.level,
            experience: profile.experience
          })
        }
      })
      
      // 生成趋势数据
      const trends: Array<{
        date: string
        level: number
        experience: number
        levelUp: boolean
        bonusPoints: number
      }> = []
      
      let previousLevel = 0
      
      for (let i = 0; i < days; i++) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        
        const dayData = levelHistoryByDate.get(dateStr) || {
          level: previousLevel || 1,
          experience: 0
        }
        
        const levelUp = previousLevel > 0 && dayData.level > previousLevel
        const bonusPoints = levelUp ? (dayData.level - previousLevel) * 50 : 0
        
        trends.unshift({
          date: dateStr,
          level: dayData.level,
          experience: dayData.experience,
          levelUp,
          bonusPoints
        })
        
        previousLevel = dayData.level
      }
      
      return trends
    } catch (error: unknown) {
      console.error('获取用户等级提升趋势失败:', error)
      throw error
    }
  }

  /**
   * 获取等级提升排行榜
   */
  public async getLevelUpLeaderboard(period: 'daily' | 'weekly' | 'monthly' | 'all_time', limit: number = 10): Promise<Array<{
    userId: string
    username: string
    avatar?: string | null
    level: number
    levelsGained: number
    rank: number
  }>> {
    // 检查是否在服务端环境且 Prisma 已初始化
    if (!isServerSide || !isPrismaInitialized()) {
      console.error('LevelUpEventHandler.getLevelUpLeaderboard 只能在服务端运行')
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
      
      // 获取等级提升排行榜数据
      const leaderboardData = await prisma.$queryRaw`
        SELECT
          u.id as userId,
          u.username,
          u.avatar,
          gp.level,
          COALESCE(GREATEST(gp.level - COALESCE(ogp.level, 1), 0), 0) as levelsGained
        FROM users u
        JOIN gamification_profiles gp ON u.id = gp.userId
        LEFT JOIN gamification_profiles ogp ON u.id = ogp.userId AND ogp.updatedAt < ${periodStart}
        WHERE u.isActive = true
        ORDER BY levelsGained DESC, gp.level DESC
        LIMIT ${limit}
      ` as Array<{
        userId: string
        username: string
        avatar?: string | null
        level: number
        levelsGained: number
      }>
      
      // 添加排名
      return leaderboardData.map((data, index) => ({
        ...data,
        rank: index + 1
      }))
    } catch (error: unknown) {
      console.error('获取等级提升排行榜失败:', error)
      throw error
    }
  }

  /**
   * 获取用户等级提升历史
   */
  public async getLevelUpHistory(userId: string, limit: number = 20): Promise<Array<{
    id: string
    oldLevel: number
    newLevel: number
    bonusPoints: number
    timestamp: Date
  }>> {
    // 检查是否在服务端环境且 Prisma 已初始化
    if (!isServerSide || !isPrismaInitialized()) {
      console.error('LevelUpEventHandler.getLevelUpHistory 只能在服务端运行')
      throw new Error('此方法只能在服务端运行')
    }

    try {
      // 动态导入 Prisma，避免在客户端打包
      const { prisma } = await import('@/lib/db')

      // 获取用户的积分交易记录，筛选出等级提升相关的交易
      const levelUpTransactions = await prisma.pointTransaction.findMany({
        where: {
          userId,
          type: 'LEVEL_UP'
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: limit
      })
      
      // 转换为等级提升历史记录
      const levelUpHistory: Array<{
        id: string
        oldLevel: number
        newLevel: number
        bonusPoints: number
        timestamp: Date
      }> = []
      
      for (const transaction of levelUpTransactions) {
        // 从交易描述中提取等级信息
        const description = transaction.description || ''
        const levelMatch = description.match(/升级奖励: 从(\d+)级升到(\d+)级/)
        
        if (levelMatch && levelMatch.length >= 3) {
          const oldLevel = parseInt(levelMatch[1])
          const newLevel = parseInt(levelMatch[2])
          const bonusPoints = transaction.amount || 0
          
          levelUpHistory.push({
            id: transaction.id,
            oldLevel,
            newLevel,
            bonusPoints,
            timestamp: transaction.createdAt
          })
        }
      }
      
      return levelUpHistory
    } catch (error: unknown) {
      console.error('获取用户等级提升历史失败:', error)
      throw error
    }
  }
}

// 导出单例实例
export const levelUpEventHandler = new LevelUpEventHandler()