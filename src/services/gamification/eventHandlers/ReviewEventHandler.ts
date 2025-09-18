import { isPrismaInitialized } from '@/lib/db'

// 检查是否在服务端环境
const isServerSide = typeof window === 'undefined'

// 定义复习完成事件数据
export interface ReviewCompletedData {
  isCompleted: boolean;
  responseTime?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  reviewCount?: number;
}

/**
 * 复习完成事件处理器
 */
export class ReviewEventHandler {
  /**
   * 处理复习完成事件
   */
  public async handleReviewCompleted(userId: string, data: ReviewCompletedData): Promise<void> {
    // 检查是否在服务端环境且 Prisma 已初始化
    if (!isServerSide || !isPrismaInitialized()) {
      console.error('ReviewEventHandler.handleReviewCompleted 只能在服务端运行')
      throw new Error('此方法只能在服务端运行')
    }

    try {
      // 动态导入 Prisma，避免在客户端打包
      const { prisma } = await import('@/lib/db')

      // 记录复习完成事件到日志（如果需要持久化，可以考虑创建专门的日志表）
      console.log(`用户 ${userId} 完成复习: ${JSON.stringify(data)}`)

      // 处理复习完成逻辑
      // 注意：这里需要调用 gamificationService，但我们将在主服务中处理这个依赖关系
      // 这里只记录事件，实际的处理逻辑在主服务中完成
    } catch (error: unknown) {
      console.error('处理复习完成事件失败:', error)
      throw error
    }
  }

  /**
   * 获取用户复习完成统计
   */
  public async getReviewCompletionStats(userId: string, days: number = 30): Promise<{
    totalReviews: number
    completedReviews: number
    completionRate: number
    averageReviewScore: number
    completionDistribution: Record<string, number>
  }> {
    // 检查是否在服务端环境且 Prisma 已初始化
    if (!isServerSide || !isPrismaInitialized()) {
      console.error('ReviewEventHandler.getReviewCompletionStats 只能在服务端运行')
      throw new Error('此方法只能在服务端运行')
    }

    try {
      // 动态导入 Prisma，避免在客户端打包
      const { prisma } = await import('@/lib/db')

      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)
      
      // 获取复习记录
      const reviews = await prisma.review.findMany({
        where: {
          userId,
          reviewTime: {
            gte: startDate
          }
        }
      })

      const totalReviews = reviews.length
      const completedReviews = reviews.filter(review => review.isCompleted).length
      
      const completionRate = totalReviews > 0 ? completedReviews / totalReviews : 0
      
      // 计算平均复习分数（替代响应时间）
      const reviewScores = reviews
        .map(review => review.reviewScore)
        .filter((score): score is number => score !== undefined && score !== null)
      
      const averageReviewScore = reviewScores.length > 0
        ? reviewScores.reduce((sum: number, score: number) => sum + score, 0) / reviewScores.length
        : 0
      
      // 计算完成率分布（替代难度分布）
      const completionDistribution: Record<string, number> = {
        completed: 0,
        notCompleted: 0
      }
      
      reviews.forEach(review => {
        if (review.isCompleted) {
          completionDistribution.completed++
        } else {
          completionDistribution.notCompleted++
        }
      })
      
      return {
        totalReviews,
        completedReviews,
        completionRate,
        averageReviewScore,
        completionDistribution
      }
    } catch (error: unknown) {
      console.error('获取用户复习完成统计失败:', error)
      throw error
    }
  }

  /**
   * 获取用户复习趋势
   */
  public async getReviewTrends(userId: string, days: number = 30): Promise<Array<{
    date: string
    totalReviews: number
    completedReviews: number
    completionRate: number
  }>> {
    // 检查是否在服务端环境且 Prisma 已初始化
    if (!isServerSide || !isPrismaInitialized()) {
      console.error('ReviewEventHandler.getReviewTrends 只能在服务端运行')
      throw new Error('此方法只能在服务端运行')
    }

    try {
      // 动态导入 Prisma，避免在客户端打包
      const { prisma } = await import('@/lib/db')

      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)
      
      // 获取复习完成事件
      const reviews = await prisma.review.findMany({
        where: {
          userId,
          reviewTime: {
            gte: startDate
          }
        },
        orderBy: {
          reviewTime: 'asc'
        }
      })

      // 按日期分组
      const reviewsByDate = new Map<string, Array<{ isCompleted: boolean }>>()
      
      reviews.forEach(review => {
        const date = review.reviewTime.toISOString().split('T')[0]
        
        if (!reviewsByDate.has(date)) {
          reviewsByDate.set(date, [])
        }
        
        reviewsByDate.get(date)!.push({
          isCompleted: review.isCompleted
        })
      })
      
      // 生成趋势数据
      const trends: Array<{
        date: string
        totalReviews: number
        completedReviews: number
        completionRate: number
      }> = []
      
      for (let i = 0; i < days; i++) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        
        const reviews = reviewsByDate.get(dateStr) || []
        const totalReviews = reviews.length
        const completedReviews = reviews.filter((e: { isCompleted: boolean }) => e.isCompleted).length
        const completionRate = totalReviews > 0 ? completedReviews / totalReviews : 0
        
        trends.unshift({
          date: dateStr,
          totalReviews,
          completedReviews,
          completionRate
        })
      }
      
      return trends
    } catch (error: unknown) {
      console.error('获取用户复习趋势失败:', error)
      throw error
    }
  }
}

// 导出单例实例
export const reviewEventHandler = new ReviewEventHandler()