import { isPrismaInitialized } from '@/lib/db'
import { Prisma } from '@prisma/client'

// 检查是否在服务端环境
const isServerSide = typeof window === 'undefined'
import {
  RewardItem as PrismaRewardItem,
  UserReward as PrismaUserReward,
  RewardCategory as PrismaRewardCategory,
  RewardType as PrismaRewardType,
  PointTransactionType,
  RewardStatus as PrismaRewardStatus
} from '@prisma/client'
import {
  RewardStoreQueryParams,
  RewardClaimRequest,
  RewardClaimResponse,
  RewardStatus,
  RewardCategory,
  RewardType,
  UserReward,
  RewardItem
} from '@/types'

/**
 * 奖励系统服务类
 */
export class RewardService {
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
    // 检查是否在服务端环境且 Prisma 已初始化
    if (!isServerSide || !isPrismaInitialized()) {
      console.error('RewardService.getRewardItems 只能在服务端运行')
      throw new Error('此方法只能在服务端运行')
    }

    try {
      // 动态导入 Prisma，避免在客户端打包
      const { prisma } = await import('@/lib/db')

      const {
        category,
        type,
        isActive = true,
        minPrice,
        maxPrice,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        page = 1,
        limit = 20
      } = params

      const skip = (page - 1) * limit

      // 构建查询条件
      const where: {
        isActive: boolean
        category?: RewardCategory
        type?: RewardType
        price?: {
          gte?: number
          lte?: number
        }
        OR?: Array<{
          name?: { contains: string; mode: 'insensitive' }
          description?: { contains: string; mode: 'insensitive' }
        }>
      } = {
        isActive
      }

      if (category) {
        where.category = category
      }

      if (type) {
        where.type = type
      }

      if (minPrice !== undefined || maxPrice !== undefined) {
        where.price = {}
        if (minPrice !== undefined) {
          where.price.gte = minPrice
        }
        if (maxPrice !== undefined) {
          where.price.lte = maxPrice
        }
      }

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      }

      // 构建排序条件
      const orderBy: Record<string, 'asc' | 'desc'> = {}
      orderBy[sortBy] = sortOrder

      // 获取奖励物品列表
      const [items, total] = await Promise.all([
        prisma.rewardItem.findMany({
          where,
          orderBy,
          skip,
          take: limit
        }),
        prisma.rewardItem.count({ where })
      ])

      const totalPages = Math.ceil(total / limit)

      // 转换 Prisma 返回的 RewardItem 类型为自定义类型
      const convertedItems = items.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        icon: item.icon || undefined, // 将 null 转换为 undefined
        category: item.category as RewardCategory, // 转换枚举类型
        type: item.type as RewardType, // 转换枚举类型
        price: item.price,
        stock: item.stock,
        isActive: item.isActive,
        expiresAt: item.expiresAt || undefined, // 将 null 转换为 undefined
        metadata: item.metadata as Record<string, unknown> | undefined,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      }))
      
      return {
        items: convertedItems,
        total,
        page,
        limit,
        totalPages
      }
    } catch (error: unknown) {
      console.error('获取奖励物品列表失败:', error)
      throw error
    }
  }

  /**
   * 获取奖励物品详情
   */
  async getRewardItemById(id: string): Promise<RewardItem | null> {
    // 检查是否在服务端环境且 Prisma 已初始化
    if (!isServerSide || !isPrismaInitialized()) {
      console.error('RewardService.getRewardItemById 只能在服务端运行')
      throw new Error('此方法只能在服务端运行')
    }

    try {
      // 动态导入 Prisma，避免在客户端打包
      const { prisma } = await import('@/lib/db')

      const rewardItem = await prisma.rewardItem.findUnique({
        where: { id },
        include: {
          userRewards: {
            take: 5,
            orderBy: { createdAt: 'desc' }
          }
        }
      })
      
      if (!rewardItem) {
        return null
      }
      
      // 转换 Prisma 返回的 RewardItem 类型为自定义类型
      return {
        id: rewardItem.id,
        name: rewardItem.name,
        description: rewardItem.description,
        icon: rewardItem.icon || undefined, // 将 null 转换为 undefined
        category: rewardItem.category as RewardCategory, // 转换枚举类型
        type: rewardItem.type as RewardType, // 转换枚举类型
        price: rewardItem.price,
        stock: rewardItem.stock,
        isActive: rewardItem.isActive,
        expiresAt: rewardItem.expiresAt || undefined, // 将 null 转换为 undefined
        metadata: rewardItem.metadata as Record<string, unknown> | undefined,
        createdAt: rewardItem.createdAt,
        updatedAt: rewardItem.updatedAt
      }
    } catch (error: unknown) {
      console.error('获取奖励物品详情失败:', error)
      throw error
    }
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
    // 检查是否在服务端环境且 Prisma 已初始化
    if (!isServerSide || !isPrismaInitialized()) {
      console.error('RewardService.createRewardItem 只能在服务端运行')
      throw new Error('此方法只能在服务端运行')
    }

    try {
      // 动态导入 Prisma，避免在客户端打包
      const { prisma } = await import('@/lib/db')

      const rewardItem = await prisma.rewardItem.create({
        data: {
          name: data.name,
          description: data.description,
          icon: data.icon,
          category: data.category,
          type: data.type,
          price: data.price,
          stock: data.stock || 0,
          expiresAt: data.expiresAt,
          metadata: data.metadata as Prisma.InputJsonValue
        }
      })
      
      // 转换 Prisma 返回的 RewardItem 类型为自定义类型
      return {
        id: rewardItem.id,
        name: rewardItem.name,
        description: rewardItem.description,
        icon: rewardItem.icon || undefined, // 将 null 转换为 undefined
        category: rewardItem.category as RewardCategory, // 转换枚举类型
        type: rewardItem.type as RewardType, // 转换枚举类型
        price: rewardItem.price,
        stock: rewardItem.stock,
        isActive: rewardItem.isActive,
        expiresAt: rewardItem.expiresAt || undefined, // 将 null 转换为 undefined
        metadata: rewardItem.metadata as Record<string, unknown> | undefined,
        createdAt: rewardItem.createdAt,
        updatedAt: rewardItem.updatedAt
      }
    } catch (error: unknown) {
      console.error('创建奖励物品失败:', error)
      throw error
    }
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
    // 检查是否在服务端环境且 Prisma 已初始化
    if (!isServerSide || !isPrismaInitialized()) {
      console.error('RewardService.updateRewardItem 只能在服务端运行')
      throw new Error('此方法只能在服务端运行')
    }

    try {
      // 动态导入 Prisma，避免在客户端打包
      const { prisma } = await import('@/lib/db')

      const rewardItem = await prisma.rewardItem.update({
        where: { id },
        data: {
          ...data,
          metadata: data.metadata as Prisma.InputJsonValue
        }
      })
      
      // 转换 Prisma 返回的 RewardItem 类型为自定义类型
      return {
        id: rewardItem.id,
        name: rewardItem.name,
        description: rewardItem.description,
        icon: rewardItem.icon || undefined, // 将 null 转换为 undefined
        category: rewardItem.category as RewardCategory, // 转换枚举类型
        type: rewardItem.type as RewardType, // 转换枚举类型
        price: rewardItem.price,
        stock: rewardItem.stock,
        isActive: rewardItem.isActive,
        expiresAt: rewardItem.expiresAt || undefined, // 将 null 转换为 undefined
        metadata: rewardItem.metadata as Record<string, unknown> | undefined,
        createdAt: rewardItem.createdAt,
        updatedAt: rewardItem.updatedAt
      }
    } catch (error: unknown) {
      console.error('更新奖励物品失败:', error)
      throw error
    }
  }

  /**
   * 删除奖励物品
   */
  async deleteRewardItem(id: string): Promise<void> {
    // 检查是否在服务端环境且 Prisma 已初始化
    if (!isServerSide || !isPrismaInitialized()) {
      console.error('RewardService.deleteRewardItem 只能在服务端运行')
      throw new Error('此方法只能在服务端运行')
    }

    try {
      // 动态导入 Prisma，避免在客户端打包
      const { prisma } = await import('@/lib/db')

      await prisma.rewardItem.delete({
        where: { id }
      })
    } catch (error: unknown) {
      console.error('删除奖励物品失败:', error)
      throw error
    }
  }

  /**
   * 兑换奖励
   */
  async claimReward(userId: string, request: RewardClaimRequest): Promise<RewardClaimResponse> {
    // 检查是否在服务端环境且 Prisma 已初始化
    if (!isServerSide || !isPrismaInitialized()) {
      console.error('RewardService.claimReward 只能在服务端运行')
      throw new Error('此方法只能在服务端运行')
    }

    try {
      // 动态导入 Prisma，避免在客户端打包
      const { prisma } = await import('@/lib/db')

      const { rewardItemId, quantity = 1 } = request

      // 获取奖励物品信息
      const rewardItem = await prisma.rewardItem.findUnique({
        where: { id: rewardItemId }
      })

      if (!rewardItem) {
        return {
          success: false,
          error: '奖励物品不存在'
        }
      }

      if (!rewardItem.isActive) {
        return {
          success: false,
          error: '奖励物品已下架'
        }
      }

      // 检查是否过期
      if (rewardItem.expiresAt && new Date() > rewardItem.expiresAt) {
        return {
          success: false,
          error: '奖励物品已过期'
        }
      }

      // 检查库存
      if (rewardItem.stock > 0 && rewardItem.stock < quantity) {
        return {
          success: false,
          error: '库存不足'
        }
      }

      // 获取用户信息
      // 注意：这里需要调用 ProfileService，但我们将在主服务中处理这个依赖关系
      console.log(`获取用户 ${userId} 的信息以检查积分`)
      
      // 这里使用一个模拟的用户积分
      const userPoints = 1000

      // 检查积分是否足够
      const totalCost = rewardItem.price * quantity
      if (userPoints < totalCost) {
        return {
          success: false,
          error: '积分不足'
        }
      }

      // 检查是否已经兑换过（对于一次性奖励）
      if (rewardItem.type === RewardType.ONE_TIME) {
        const existingReward = await prisma.userReward.findFirst({
          where: {
            userId,
            rewardItemId,
            status: {
              not: RewardStatus.CANCELLED
            }
          }
        })

        if (existingReward) {
          return {
            success: false,
            error: '该奖励只能兑换一次'
          }
        }
      }

      // 扣除积分
      // 注意：这里需要调用 PointsService，但我们将在主服务中处理这个依赖关系
      console.log(`扣除用户 ${userId} 的 ${totalCost} 积分`)

      // 更新库存
      if (rewardItem.stock > 0) {
        await prisma.rewardItem.update({
          where: { id: rewardItemId },
          data: {
            stock: rewardItem.stock - quantity
          }
        })
      }

      // 创建用户奖励记录
      const userReward = await prisma.userReward.create({
        data: {
          userId,
          rewardItemId,
          status: RewardStatus.PENDING,
          expiresAt: rewardItem.expiresAt,
          metadata: {
            quantity,
            totalCost
          }
        }
      })

      // 处理奖励发放逻辑
      await this.processRewardFulfillment(userId, rewardItemId, userReward.id)

      // 转换 Prisma 的 UserReward 为我们的 UserReward 类型
      const convertedUserReward: UserReward = {
        id: userReward.id,
        userId: userReward.userId,
        rewardItemId: userReward.rewardItemId,
        status: RewardStatus[userReward.status as keyof typeof RewardStatus],
        claimedAt: userReward.claimedAt || undefined,
        expiresAt: userReward.expiresAt || undefined,
        metadata: userReward.metadata as Record<string, unknown>,
        createdAt: userReward.createdAt
      }

      return {
        success: true,
        userReward: convertedUserReward,
        message: '奖励兑换成功'
      }
    } catch (error: unknown) {
      console.error('兑换奖励失败:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : '兑换奖励失败'
      }
    }
  }

  /**
   * 处理奖励发放逻辑
   */
  async processRewardFulfillment(userId: string, rewardItemId: string, userRewardId: string): Promise<void> {
    // 检查是否在服务端环境且 Prisma 已初始化
    if (!isServerSide || !isPrismaInitialized()) {
      console.error('RewardService.processRewardFulfillment 只能在服务端运行')
      throw new Error('此方法只能在服务端运行')
    }

    try {
      // 动态导入 Prisma，避免在客户端打包
      const { prisma } = await import('@/lib/db')

      const rewardItem = await prisma.rewardItem.findUnique({
        where: { id: rewardItemId }
      })

      if (!rewardItem) return

      // 根据奖励类型处理不同的发放逻辑
      switch (rewardItem.category) {
        case RewardCategory.VIRTUAL_GOODS:
          // 虚拟商品直接标记为已完成
          await prisma.userReward.update({
            where: { id: userRewardId },
            data: {
              status: RewardStatus.COMPLETED,
              claimedAt: new Date()
            }
          })
          break

        case RewardCategory.EXPERIENCE:
          // 经验值加成
          const experienceBonus = typeof rewardItem.metadata === 'object' && rewardItem.metadata && 'experienceBonus' in rewardItem.metadata
            ? (rewardItem.metadata as Record<string, unknown>).experienceBonus as number || 100
            : 100
          // 注意：这里需要调用 ProfileService，但我们将在主服务中处理这个依赖关系
          console.log(`用户 ${userId} 获得 ${experienceBonus} 经验值`)
          
          await prisma.userReward.update({
            where: { id: userRewardId },
            data: {
              status: RewardStatus.COMPLETED,
              claimedAt: new Date()
            }
          })
          break

        case RewardCategory.BADGE:
          // 徽章奖励，触发成就系统
          // 注意：这里需要调用 AchievementService，但我们将在主服务中处理这个依赖关系
          console.log(`用户 ${userId} 获得徽章奖励：${rewardItem.name}`)
          
          await prisma.userReward.update({
            where: { id: userRewardId },
            data: {
              status: RewardStatus.COMPLETED,
              claimedAt: new Date()
            }
          })
          break

        case RewardCategory.PREMIUM_FEATURE:
          // 高级功能，可能需要额外的处理逻辑
          await prisma.userReward.update({
            where: { id: userRewardId },
            data: {
              status: RewardStatus.COMPLETED,
              claimedAt: new Date(),
              metadata: {
                ...(typeof rewardItem.metadata === 'object' ? rewardItem.metadata : {}),
                activated: true
              }
            }
          })
          break

        default:
          // 其他类型的奖励标记为待处理
          await prisma.userReward.update({
            where: { id: userRewardId },
            data: {
              status: RewardStatus.PENDING
            }
          })
          break
      }
    } catch (error: unknown) {
      console.error('处理奖励发放失败:', error)
      throw error
    }
  }

  /**
   * 获取用户的奖励列表
   */
  async getUserRewards(userId: string, status?: RewardStatus): Promise<UserReward[]> {
    // 检查是否在服务端环境且 Prisma 已初始化
    if (!isServerSide || !isPrismaInitialized()) {
      console.error('RewardService.getUserRewards 只能在服务端运行')
      throw new Error('此方法只能在服务端运行')
    }

    try {
      // 动态导入 Prisma，避免在客户端打包
      const { prisma } = await import('@/lib/db')

      const where: {
        userId: string
        status?: RewardStatus
      } = { userId }
      
      if (status) {
        where.status = status
      }

      const prismaUserRewards = await prisma.userReward.findMany({
        where,
        include: {
          user: true,
          rewardItem: true
        },
        orderBy: { createdAt: 'desc' }
      })

      // 转换 Prisma 的 UserReward 为我们的 UserReward 类型
      return prismaUserRewards.map(prUserReward => ({
        id: prUserReward.id,
        userId: prUserReward.userId,
        rewardItemId: prUserReward.rewardItemId,
        status: RewardStatus[prUserReward.status as keyof typeof RewardStatus],
        claimedAt: prUserReward.claimedAt || undefined,
        expiresAt: prUserReward.expiresAt || undefined,
        metadata: prUserReward.metadata as Record<string, unknown>,
        createdAt: prUserReward.createdAt,
        user: prUserReward.user,
        rewardItem: {
          ...prUserReward.rewardItem,
          category: RewardCategory[prUserReward.rewardItem.category as keyof typeof RewardCategory],
          type: RewardType[prUserReward.rewardItem.type as keyof typeof RewardType],
          icon: prUserReward.rewardItem.icon || undefined,
          expiresAt: prUserReward.rewardItem.expiresAt || undefined,
          metadata: prUserReward.rewardItem.metadata as Record<string, unknown> || undefined
        }
      }))
    } catch (error: unknown) {
      console.error('获取用户奖励列表失败:', error)
      throw error
    }
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
    // 检查是否在服务端环境且 Prisma 已初始化
    if (!isServerSide || !isPrismaInitialized()) {
      console.error('RewardService.getRewardStoreStats 只能在服务端运行')
      throw new Error('此方法只能在服务端运行')
    }

    try {
      // 动态导入 Prisma，避免在客户端打包
      const { prisma } = await import('@/lib/db')

      const [totalItems, activeItems, totalRewardsClaimed, mostPopularRewards] = await Promise.all([
        prisma.rewardItem.count(),
        prisma.rewardItem.count({ where: { isActive: true } }),
        prisma.userReward.count({ where: { status: RewardStatus.COMPLETED } }),
        
        // 获取最受欢迎的奖励
        prisma.userReward.groupBy({
          by: ['rewardItemId'],
          where: { status: RewardStatus.COMPLETED },
          _count: { rewardItemId: true },
          orderBy: { _count: { rewardItemId: 'desc' } },
          take: 10
        }).then(async (groups) => {
          const rewardIds = groups.map(g => g.rewardItemId)
          const rewardItems = await prisma.rewardItem.findMany({
            where: { id: { in: rewardIds } },
            select: { id: true, name: true }
          })
          
          return groups.map(group => {
            const rewardItem = rewardItems.find(r => r.id === group.rewardItemId)
            return {
              itemId: group.rewardItemId,
              name: rewardItem?.name || '未知奖励',
              claimCount: group._count.rewardItemId
            }
          })
        })
      ])

      return {
        totalItems,
        activeItems,
        totalRewardsClaimed,
        mostPopularRewards
      }
    } catch (error: unknown) {
      console.error('获取奖励商店统计信息失败:', error)
      throw error
    }
  }

  /**
   * 初始化默认奖励物品
   */
  async initializeDefaultRewards(): Promise<void> {
    // 检查是否在服务端环境且 Prisma 已初始化
    if (!isServerSide || !isPrismaInitialized()) {
      console.error('RewardService.initializeDefaultRewards 只能在服务端运行')
      throw new Error('此方法只能在服务端运行')
    }

    try {
      // 动态导入 Prisma，避免在客户端打包
      const { prisma } = await import('@/lib/db')

      const defaultRewards = [
        {
          name: '经验值加成卡',
          description: '获得100点额外经验值',
          icon: '/icons/experience.png',
          category: RewardCategory.EXPERIENCE,
          type: RewardType.ONE_TIME,
          price: 50,
          stock: 100,
          metadata: { experienceBonus: 100 }
        },
        {
          name: '学习达人徽章',
          description: '展示你的学习成就',
          icon: '/icons/badge-learning.png',
          category: RewardCategory.BADGE,
          type: RewardType.PERMANENT,
          price: 100,
          stock: 0,
          metadata: { badgeType: 'learning' }
        },
        {
          name: '连续学习加成',
          description: '连续学习天数额外加成',
          icon: '/icons/streak-bonus.png',
          category: RewardCategory.PREMIUM_FEATURE,
          type: RewardType.RECURRING,
          price: 200,
          stock: 50,
          metadata: { streakMultiplier: 1.5, duration: 7 }
        },
        {
          name: '主题自定义包',
          description: '解锁所有主题自定义选项',
          icon: '/icons/theme-custom.png',
          category: RewardCategory.CUSTOMIZATION,
          type: RewardType.PERMANENT,
          price: 300,
          stock: 0,
          metadata: { features: ['themes', 'colors', 'fonts'] }
        },
        {
          name: '高级分析功能',
          description: '解锁高级学习分析功能',
          icon: '/icons/analytics.png',
          category: RewardCategory.PREMIUM_FEATURE,
          type: RewardType.PERMANENT,
          price: 500,
          stock: 0,
          metadata: { features: ['advanced-analytics', 'export-reports'] }
        }
      ]

      for (const rewardData of defaultRewards) {
        const existing = await prisma.rewardItem.findFirst({
          where: { name: rewardData.name }
        })

        if (!existing) {
          await prisma.rewardItem.create({
            data: rewardData
          })
        }
      }
    } catch (error: unknown) {
      console.error('初始化默认奖励物品失败:', error)
      throw error
    }
  }
}

// 导出单例实例
export const rewardService = new RewardService()