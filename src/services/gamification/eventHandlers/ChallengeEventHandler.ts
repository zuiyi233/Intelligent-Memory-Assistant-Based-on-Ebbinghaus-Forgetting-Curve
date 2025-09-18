import { isPrismaInitialized } from '@/lib/db'
import { ChallengeType, UserDailyChallenge, DailyChallenge } from '@prisma/client'

// 检查是否在服务端环境
const isServerSide = typeof window === 'undefined'

// 定义带有挑战关联的用户每日挑战类型
type UserDailyChallengeWithChallenge = UserDailyChallenge & {
  challenge: DailyChallenge
}

// 定义挑战完成事件数据
export interface ChallengeCompletedData {
  challengeId: string;
  challengeTitle: string;
  points: number;
  challengeType?: ChallengeType;
}

/**
 * 挑战完成事件处理器
 */
export class ChallengeEventHandler {
  /**
   * 处理挑战完成事件
   */
  public async handleChallengeCompleted(userId: string, data: ChallengeCompletedData): Promise<void> {
    // 检查是否在服务端环境且 Prisma 已初始化
    if (!isServerSide || !isPrismaInitialized()) {
      console.error('ChallengeEventHandler.handleChallengeCompleted 只能在服务端运行')
      throw new Error('此方法只能在服务端运行')
    }

    try {
      // 动态导入 Prisma，避免在客户端打包
      const { prisma } = await import('@/lib/db')

      // 记录挑战完成事件到日志（如果需要持久化，可以考虑创建专门的日志表）
      console.log(`用户 ${userId} 完成挑战: ${JSON.stringify(data)}`)

      // 处理挑战完成逻辑
      // 注意：这里需要调用 gamificationService，但我们将在主服务中处理这个依赖关系
      // 这里只记录事件，实际的处理逻辑在主服务中完成
    } catch (error: unknown) {
      console.error('处理挑战完成事件失败:', error)
      throw error
    }
  }

  /**
   * 获取用户挑战完成统计
   */
  public async getChallengeCompletionStats(userId: string, days: number = 30): Promise<{
    totalChallenges: number
    completedChallenges: number
    completionRate: number
    totalPoints: number
    byType: Record<string, { total: number; completed: number; points: number }>
  }> {
    // 检查是否在服务端环境且 Prisma 已初始化
    if (!isServerSide || !isPrismaInitialized()) {
      console.error('ChallengeEventHandler.getChallengeCompletionStats 只能在服务端运行')
      throw new Error('此方法只能在服务端运行')
    }

    try {
      // 动态导入 Prisma，避免在客户端打包
      const { prisma } = await import('@/lib/db')

      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)
      
      // 获取用户的挑战记录
      const userChallenges = await prisma.userDailyChallenge.findMany({
        where: {
          userId,
          challenge: {
            date: {
              gte: startDate
            }
          }
        },
        include: {
          challenge: true
        }
      })

      const totalChallenges = userChallenges.length
      const completedChallenges = userChallenges.filter(uc => uc.completed).length
      const completionRate = totalChallenges > 0 ? completedChallenges / totalChallenges : 0
      
      // 计算总积分
      const totalPoints = userChallenges
        .filter(uc => uc.completed)
        .reduce((sum, uc) => sum + ((uc as UserDailyChallengeWithChallenge).challenge?.points || 0), 0)
      
      // 按类型统计
      const byType: Record<string, { total: number; completed: number; points: number }> = {}
      
      userChallenges.forEach(userChallenge => {
        const type = (userChallenge as UserDailyChallengeWithChallenge).challenge?.type || 'unknown'
        
        if (!byType[type]) {
          byType[type] = { total: 0, completed: 0, points: 0 }
        }
        
        byType[type].total++
        
        if (userChallenge.completed) {
          byType[type].completed++
          byType[type].points += (userChallenge as UserDailyChallengeWithChallenge).challenge?.points || 0
        }
      })
      
      return {
        totalChallenges,
        completedChallenges,
        completionRate,
        totalPoints,
        byType
      }
    } catch (error: unknown) {
      console.error('获取用户挑战完成统计失败:', error)
      throw error
    }
  }

  /**
   * 获取用户挑战完成趋势
   */
  public async getChallengeCompletionTrends(userId: string, days: number = 30): Promise<Array<{
    date: string
    totalChallenges: number
    completedChallenges: number
    completionRate: number
    points: number
    byType: Record<string, { completed: number; points: number }>
  }>> {
    // 检查是否在服务端环境且 Prisma 已初始化
    if (!isServerSide || !isPrismaInitialized()) {
      console.error('ChallengeEventHandler.getChallengeCompletionTrends 只能在服务端运行')
      throw new Error('此方法只能在服务端运行')
    }

    try {
      // 动态导入 Prisma，避免在客户端打包
      const { prisma } = await import('@/lib/db')

      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)
      
      // 获取用户的挑战记录
      const userChallenges = await prisma.userDailyChallenge.findMany({
        where: {
          userId,
          challenge: {
            date: {
              gte: startDate
            }
          }
        },
        include: {
          challenge: true
        },
        orderBy: {
          challenge: {
            date: 'asc'
          }
        }
      })

      // 按日期分组
      const challengesByDate = new Map<string, Array<{ completed: boolean; type: string; points: number }>>()
      
      userChallenges.forEach(userChallenge => {
        if (userChallenge.challenge && userChallenge.challenge.date) {
          const date = userChallenge.challenge.date.toISOString().split('T')[0]
          
          if (!challengesByDate.has(date)) {
            challengesByDate.set(date, [])
          }
          
          challengesByDate.get(date)!.push({
            completed: userChallenge.completed,
            type: (userChallenge as UserDailyChallengeWithChallenge).challenge?.type || 'unknown',
            points: (userChallenge as UserDailyChallengeWithChallenge).challenge?.points || 0
          })
        }
      })
      
      // 生成趋势数据
      const trends: Array<{
        date: string
        totalChallenges: number
        completedChallenges: number
        completionRate: number
        points: number
        byType: Record<string, { completed: number; points: number }>
      }> = []
      
      for (let i = 0; i < days; i++) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        
        const dayChallenges = challengesByDate.get(dateStr) || []
        const totalChallenges = dayChallenges.length
        const completedChallenges = dayChallenges.filter(c => c.completed).length
        const completionRate = totalChallenges > 0 ? completedChallenges / totalChallenges : 0
        
        // 计算总积分
        const points = dayChallenges
          .filter(c => c.completed)
          .reduce((sum, c) => sum + c.points, 0)
        
        // 按类型统计
        const byType: Record<string, { completed: number; points: number }> = {}
        dayChallenges.forEach(challenge => {
          if (!byType[challenge.type]) {
            byType[challenge.type] = { completed: 0, points: 0 }
          }
          
          if (challenge.completed) {
            byType[challenge.type].completed++
            byType[challenge.type].points += challenge.points
          }
        })
        
        trends.unshift({
          date: dateStr,
          totalChallenges,
          completedChallenges,
          completionRate,
          points,
          byType
        })
      }
      
      return trends
    } catch (error: unknown) {
      console.error('获取用户挑战完成趋势失败:', error)
      throw error
    }
  }

  /**
   * 获取挑战完成排行榜
   */
  public async getChallengeCompletionLeaderboard(period: 'daily' | 'weekly' | 'monthly' | 'all_time', type: 'completion' | 'points' | 'streak', limit: number = 10): Promise<Array<{
    userId: string
    username: string
    avatar?: string | null
    value: number
    rank: number
  }>> {
    // 检查是否在服务端环境且 Prisma 已初始化
    if (!isServerSide || !isPrismaInitialized()) {
      console.error('ChallengeEventHandler.getChallengeCompletionLeaderboard 只能在服务端运行')
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
            WHERE u.isActive = true
            AND (uc.createdAt >= ${periodStart} OR uc.createdAt IS NULL)
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
            AND (uc.createdAt >= ${periodStart} OR uc.createdAt IS NULL)
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
      console.error('获取挑战完成排行榜失败:', error)
      throw error
    }
  }

  /**
   * 获取用户最近完成的挑战
   */
  public async getRecentCompletedChallenges(userId: string, limit: number = 10): Promise<Array<{
    id: string
    challengeId: string
    challengeTitle: string
    challengeType: string
    points: number
    completedAt: Date
  }>> {
    // 检查是否在服务端环境且 Prisma 已初始化
    if (!isServerSide || !isPrismaInitialized()) {
      console.error('ChallengeEventHandler.getRecentCompletedChallenges 只能在服务端运行')
      throw new Error('此方法只能在服务端运行')
    }

    try {
      // 动态导入 Prisma，避免在客户端打包
      const { prisma } = await import('@/lib/db')

      const userChallenges = await prisma.userDailyChallenge.findMany({
        where: {
          userId,
          completed: true
        },
        include: {
          challenge: true
        },
        orderBy: {
          completedAt: 'desc'
        },
        take: limit
      })

      return userChallenges.map(userChallenge => ({
        id: userChallenge.id,
        challengeId: userChallenge.challengeId,
        challengeTitle: userChallenge.challenge.title,
        challengeType: userChallenge.challenge.type || 'unknown',
        points: userChallenge.challenge.points || 0,
        completedAt: userChallenge.completedAt || new Date()
      }))
    } catch (error: unknown) {
      console.error('获取用户最近完成的挑战失败:', error)
      throw error
    }
  }
}

// 导出单例实例
export const challengeEventHandler = new ChallengeEventHandler()