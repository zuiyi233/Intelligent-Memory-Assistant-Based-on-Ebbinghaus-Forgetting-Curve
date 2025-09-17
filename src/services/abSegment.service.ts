import { prisma } from '@/lib/db'
import type {
  ABSegment,
  ABSegmentCreateForm,
  ABSegmentUpdateForm,
  ABSegmentUser
} from '@/types'

// A/B测试用户细分服务
export class ABSegmentService {
  /**
   * 创建新的用户细分
   */
  async createSegment(segmentData: ABSegmentCreateForm, createdBy: string): Promise<ABSegment> {
    const segment = await prisma.aBSegment.create({
      data: {
        name: segmentData.name,
        description: segmentData.description,
        criteria: segmentData.criteria as any,
        isActive: true,
        createdBy
      }
    })

    return {
      ...segment,
      criteria: segmentData.criteria
    } as ABSegment
  }

  /**
   * 获取所有用户细分
   */
  async getAllSegments(): Promise<ABSegment[]> {
    const segments = await prisma.aBSegment.findMany({
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            name: true
          }
        },
        _count: {
          select: {
            segmentUsers: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    return segments.map(segment => ({
      ...segment,
      criteria: segment.criteria as any
    })) as ABSegment[]
  }

  /**
   * 获取特定用户细分
   */
  async getSegment(segmentId: string): Promise<ABSegment | null> {
    const segment = await prisma.aBSegment.findUnique({
      where: { id: segmentId },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            name: true
          }
        },
        _count: {
          select: {
            segmentUsers: true
          }
        }
      }
    })

    if (!segment) return null

    return {
      ...segment,
      criteria: segment.criteria as any
    } as ABSegment
  }

  /**
   * 更新用户细分
   */
  async updateSegment(segmentId: string, updates: ABSegmentUpdateForm): Promise<ABSegment | null> {
    const existingSegment = await prisma.aBSegment.findUnique({
      where: { id: segmentId }
    })

    if (!existingSegment) return null

    const updatedSegment = await prisma.aBSegment.update({
      where: { id: segmentId },
      data: {
        ...(updates.name && { name: updates.name }),
        ...(updates.description && { description: updates.description }),
        ...(updates.criteria !== undefined && { criteria: updates.criteria as any }),
        ...(updates.isActive !== undefined && { isActive: updates.isActive })
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true,
            name: true
          }
        },
        _count: {
          select: {
            segmentUsers: true
          }
        }
      }
    })

    return {
      ...updatedSegment,
      criteria: updates.criteria !== undefined 
        ? updates.criteria 
        : existingSegment.criteria as any
    } as ABSegment
  }

  /**
   * 删除用户细分
   */
  async deleteSegment(segmentId: string): Promise<boolean> {
    try {
      // 首先删除细分中的所有用户
      await prisma.aBSegmentUser.deleteMany({
        where: { segmentId }
      })

      // 然后删除细分
      await prisma.aBSegment.delete({
        where: { id: segmentId }
      })
      return true
    } catch (error) {
      console.error('删除用户细分失败:', error)
      return false
    }
  }

  /**
   * 向细分添加用户
   */
  async addUserToSegment(segmentId: string, userId: string): Promise<ABSegmentUser | null> {
    try {
      // 检查用户是否已经在细分中
      const existingAssignment = await prisma.aBSegmentUser.findUnique({
        where: {
          segmentId_userId: {
            segmentId,
            userId
          }
        }
      })

      if (existingAssignment) {
        return existingAssignment as ABSegmentUser
      }

      // 添加用户到细分
      const segmentUser = await prisma.aBSegmentUser.create({
        data: {
          segmentId,
          userId
        }
      })

      return segmentUser as ABSegmentUser
    } catch (error) {
      console.error('向细分添加用户失败:', error)
      return null
    }
  }

  /**
   * 从细分中移除用户
   */
  async removeUserFromSegment(segmentId: string, userId: string): Promise<boolean> {
    try {
      await prisma.aBSegmentUser.delete({
        where: {
          segmentId_userId: {
            segmentId,
            userId
          }
        }
      })
      return true
    } catch (error) {
      console.error('从细分中移除用户失败:', error)
      return false
    }
  }

  /**
   * 批量向细分添加用户
   */
  async batchAddUsersToSegment(segmentId: string, userIds: string[]): Promise<{
    successful: string[]
    failed: { userId: string; error: string }[]
  }> {
    const successful: string[] = []
    const failed: { userId: string; error: string }[] = []

    for (const userId of userIds) {
      try {
        const result = await this.addUserToSegment(segmentId, userId)
        if (result) {
          successful.push(userId)
        } else {
          failed.push({ userId, error: '添加失败' })
        }
      } catch (error) {
        failed.push({ 
          userId, 
          error: error instanceof Error ? error.message : '未知错误' 
        })
      }
    }

    return { successful, failed }
  }

  /**
   * 获取细分中的所有用户
   */
  async getSegmentUsers(segmentId: string, page = 1, limit = 20): Promise<{
    users: ABSegmentUser[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }> {
    const skip = (page - 1) * limit

    const [users, total] = await Promise.all([
      prisma.aBSegmentUser.findMany({
        where: { segmentId },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              name: true,
              email: true,
              isPremium: true,
              createdAt: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: {
          addedAt: 'desc'
        }
      }),
      prisma.aBSegmentUser.count({
        where: { segmentId }
      })
    ])

    return {
      users: users as ABSegmentUser[],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  }

  /**
   * 检查用户是否在细分中
   */
  async isUserInSegment(segmentId: string, userId: string): Promise<boolean> {
    const segmentUser = await prisma.aBSegmentUser.findUnique({
      where: {
        segmentId_userId: {
          segmentId,
          userId
        }
      }
    })

    return !!segmentUser
  }

  /**
   * 获取用户所属的所有细分
   */
  async getUserSegments(userId: string): Promise<ABSegment[]> {
    const segmentUsers = await prisma.aBSegmentUser.findMany({
      where: { userId },
      include: {
        segment: {
          include: {
            creator: {
              select: {
                id: true,
                username: true,
                name: true
              }
            }
          }
        }
      }
    })

    return segmentUsers.map(su => ({
      ...su.segment,
      criteria: su.segment.criteria as any
    })) as ABSegment[]
  }

  /**
   * 根据条件自动匹配用户到细分
   */
  async autoAssignUsersToSegments(): Promise<void> {
    // 获取所有活跃的细分
    const segments = await prisma.aBSegment.findMany({
      where: { isActive: true }
    })

    for (const segment of segments) {
      const criteria = segment.criteria as any
      
      // 构建查询条件
      const whereClause: any = {}
      
      if (criteria.isPremium !== undefined) {
        whereClause.isPremium = criteria.isPremium
      }
      
      if (criteria.minLevel !== undefined || criteria.maxLevel !== undefined) {
        whereClause.gamificationProfile = {}
        if (criteria.minLevel !== undefined) {
          whereClause.gamificationProfile.level = { gte: criteria.minLevel }
        }
        if (criteria.maxLevel !== undefined) {
          whereClause.gamificationProfile.level = { 
            ...whereClause.gamificationProfile.level,
            lte: criteria.maxLevel 
          }
        }
      }
      
      if (criteria.minPoints !== undefined || criteria.maxPoints !== undefined) {
        whereClause.gamificationProfile = whereClause.gamificationProfile || {}
        if (criteria.minPoints !== undefined) {
          whereClause.gamificationProfile.points = { gte: criteria.minPoints }
        }
        if (criteria.maxPoints !== undefined) {
          whereClause.gamificationProfile.points = { 
            ...whereClause.gamificationProfile.points,
            lte: criteria.maxPoints 
          }
        }
      }
      
      if (criteria.minStreak !== undefined) {
        whereClause.gamificationProfile = whereClause.gamificationProfile || {}
        whereClause.gamificationProfile.streak = { gte: criteria.minStreak }
      }
      
      if (criteria.accountAgeDays !== undefined) {
        const cutoffDate = new Date()
        cutoffDate.setDate(cutoffDate.getDate() - criteria.accountAgeDays)
        whereClause.createdAt = { lte: cutoffDate }
      }

      // 获取符合条件的用户
      const matchingUsers = await prisma.user.findMany({
        where: whereClause,
        select: { id: true }
      })

      // 为每个用户添加到细分（如果尚未添加）
      for (const user of matchingUsers) {
        await this.addUserToSegment(segment.id, user.id)
      }
    }
  }

  /**
   * 创建预设细分
   */
  async createPresetSegments(): Promise<void> {
    // 预设细分1：新用户
    await this.createSegment({
      name: '新用户',
      description: '注册时间少于30天的用户',
      criteria: {
        accountAgeDays: 30
      }
    }, 'system')

    // 预设细分2：活跃用户
    await this.createSegment({
      name: '活跃用户',
      description: '最近7天内有活动的用户',
      criteria: {
        minStreak: 1
      }
    }, 'system')

    // 预设细分3：高级用户
    await this.createSegment({
      name: '高级用户',
      description: '等级大于10且积分大于1000的用户',
      criteria: {
        minLevel: 10,
        minPoints: 1000
      }
    }, 'system')

    // 预设细分4：付费用户
    await this.createSegment({
      name: '付费用户',
      description: '所有付费用户',
      criteria: {
        isPremium: true
      }
    }, 'system')
  }
}

// 导出单例实例
export const abSegmentService = new ABSegmentService()