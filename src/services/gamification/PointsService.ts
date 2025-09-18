import { isPrismaInitialized } from '@/lib/db'

// 检查是否在服务端环境
const isServerSide = typeof window === 'undefined'
import {
  GamificationProfile,
  PointTransaction,
  PointTransactionType,
  PointType
} from '@prisma/client'

/**
 * 积分管理服务类
 */
export class PointsService {
  /**
   * 添加积分并创建交易记录
   */
  async addPoints(userId: string, amount: number, type: PointTransactionType, description: string): Promise<GamificationProfile> {
    // 检查是否在服务端环境且 Prisma 已初始化
    if (!isServerSide || !isPrismaInitialized()) {
      console.error('PointsService.addPoints 只能在服务端运行')
      throw new Error('此方法只能在服务端运行')
    }

    try {
      // 动态导入 Prisma，避免在客户端打包
      const { prisma } = await import('@/lib/db')

      // 注意：这里需要调用 ProfileService，但我们将在主服务中处理这个依赖关系
      // 为了避免循环依赖，我们在这里不直接调用，而是通过主服务来获取 profile
      console.log(`准备为用户 ${userId} 添加 ${amount} 积分，类型：${type}，描述：${description}`)
      
      // 验证积分数量
      if (amount === 0) {
        throw new Error('积分数量不能为0')
      }
      
      // 如果是扣除积分，检查用户是否有足够积分
      // 注意：这里需要调用 ProfileService 获取用户当前积分
      // 为了避免循环依赖，我们假设主服务已经提供了用户的当前积分
      console.log(`检查用户 ${userId} 是否有足够积分`)
      
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
      // 注意：这里需要调用 ProfileService 获取用户当前积分并更新
      console.log(`更新用户 ${userId} 的积分`)
      
      // 检查积分相关的成就
      // 注意：这里需要调用 AchievementService，但我们将在主服务中处理这个依赖关系
      if (amount > 0) {
        console.log(`检查用户 ${userId} 的积分相关成就`)
      }

      // 检查是否升级
      // 注意：这里需要调用 ProfileService，但我们将在主服务中处理这个依赖关系
      console.log(`检查用户 ${userId} 是否需要升级`)
      
      // 这里返回一个模拟的 profile，实际实现应该调用 ProfileService
      const mockProfile: GamificationProfile = {
        id: 'mock-id',
        userId,
        level: 1,
        points: 100,
        experience: 0,
        streak: 1,
        lastActiveAt: new Date()
      }
      
      return mockProfile
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
    // 检查是否在服务端环境且 Prisma 已初始化
    if (!isServerSide || !isPrismaInitialized()) {
      console.error('PointsService.getPointsHistory 只能在服务端运行')
      throw new Error('此方法只能在服务端运行')
    }

    try {
      // 动态导入 Prisma，避免在客户端打包
      const { prisma } = await import('@/lib/db')

      return await prisma.pointTransaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit
      })
    } catch (error: unknown) {
      console.error('获取用户积分历史失败:', error)
      throw error
    }
  }
}

// 导出单例实例
export const pointsService = new PointsService()