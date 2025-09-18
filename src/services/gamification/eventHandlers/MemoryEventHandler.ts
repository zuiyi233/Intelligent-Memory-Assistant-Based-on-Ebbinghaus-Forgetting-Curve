import { isPrismaInitialized } from '@/lib/db'

// 检查是否在服务端环境
const isServerSide = typeof window === 'undefined'

// 定义记忆创建事件数据
export interface MemoryCreatedData {
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

/**
 * 记忆创建事件处理器
 */
export class MemoryEventHandler {
  /**
   * 处理记忆创建事件
   */
  public async handleMemoryCreated(userId: string, data: MemoryCreatedData): Promise<void> {
    // 检查是否在服务端环境且 Prisma 已初始化
    if (!isServerSide || !isPrismaInitialized()) {
      console.error('MemoryEventHandler.handleMemoryCreated 只能在服务端运行')
      throw new Error('此方法只能在服务端运行')
    }

    try {
      // 动态导入 Prisma，避免在客户端打包
      const { prisma } = await import('@/lib/db')

      // 记录记忆创建事件到日志（如果需要持久化，可以考虑创建专门的日志表）
      console.log(`用户 ${userId} 创建记忆: ${JSON.stringify(data)}`)

      // 处理记忆创建逻辑
      // 注意：这里需要调用 gamificationService，但我们将在主服务中处理这个依赖关系
      // 这里只记录事件，实际的处理逻辑在主服务中完成
    } catch (error: unknown) {
      console.error('处理记忆创建事件失败:', error)
      throw error
    }
  }

  /**
   * 获取用户记忆创建统计
   */
  public async getMemoryCreationStats(userId: string, days: number = 30): Promise<{
    totalMemories: number
    memoriesByCategory: Record<string, number>
    memoriesByDifficulty: Record<string, number>
    averageMemoriesPerDay: number
  }> {
    // 检查是否在服务端环境且 Prisma 已初始化
    if (!isServerSide || !isPrismaInitialized()) {
      console.error('MemoryEventHandler.getMemoryCreationStats 只能在服务端运行')
      throw new Error('此方法只能在服务端运行')
    }

    try {
      // 动态导入 Prisma，避免在客户端打包
      const { prisma } = await import('@/lib/db')

      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)
      
      // 获取记忆内容
      const memories = await prisma.memoryContent.findMany({
        where: {
          userId,
          createdAt: {
            gte: startDate
          }
        }
      })

      const totalMemories = memories.length
      
      // 按类别统计
      const memoriesByCategory: Record<string, number> = {}
      memories.forEach(memory => {
        if (memory.category) {
          memoriesByCategory[memory.category] = (memoriesByCategory[memory.category] || 0) + 1
        }
      })
      
      // 按难度统计
      const memoriesByDifficulty: Record<string, number> = {
        easy: 0,
        medium: 0,
        hard: 0
      }
      memories.forEach(memory => {
        if (memory.difficulty) {
          memoriesByDifficulty[memory.difficulty]++
        }
      })
      
      // 计算平均每天创建的记忆数
      const averageMemoriesPerDay = totalMemories / days
      
      return {
        totalMemories,
        memoriesByCategory,
        memoriesByDifficulty,
        averageMemoriesPerDay
      }
    } catch (error: unknown) {
      console.error('获取用户记忆创建统计失败:', error)
      throw error
    }
  }

  /**
   * 获取用户记忆创建趋势
   */
  public async getMemoryCreationTrends(userId: string, days: number = 30): Promise<Array<{
    date: string
    totalMemories: number
    byCategory: Record<string, number>
  }>> {
    // 检查是否在服务端环境且 Prisma 已初始化
    if (!isServerSide || !isPrismaInitialized()) {
      console.error('MemoryEventHandler.getMemoryCreationTrends 只能在服务端运行')
      throw new Error('此方法只能在服务端运行')
    }

    try {
      // 动态导入 Prisma，避免在客户端打包
      const { prisma } = await import('@/lib/db')

      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)
      
      // 获取记忆内容
      const memories = await prisma.memoryContent.findMany({
        where: {
          userId,
          createdAt: {
            gte: startDate
          }
        },
        orderBy: {
          createdAt: 'asc'
        }
      })

      // 按日期分组
      const memoriesByDate = new Map<string, Array<{ category: string; difficulty: string }>>()
      
      memories.forEach(memory => {
        const date = memory.createdAt.toISOString().split('T')[0]
        
        if (!memoriesByDate.has(date)) {
          memoriesByDate.set(date, [])
        }
        
        memoriesByDate.get(date)!.push({
          category: memory.category || 'unknown',
          difficulty: String(memory.difficulty || 'medium')
        })
      })
      
      // 生成趋势数据
      const trends: Array<{
        date: string
        totalMemories: number
        byCategory: Record<string, number>
      }> = []
      
      for (let i = 0; i < days; i++) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        
        const dayMemories = memoriesByDate.get(dateStr) || []
        const totalMemories = dayMemories.length
        
        // 按类别统计
        const byCategory: Record<string, number> = {}
        dayMemories.forEach(memory => {
          byCategory[memory.category] = (byCategory[memory.category] || 0) + 1
        })
        
        trends.unshift({
          date: dateStr,
          totalMemories,
          byCategory
        })
      }
      
      return trends
    } catch (error: unknown) {
      console.error('获取用户记忆创建趋势失败:', error)
      throw error
    }
  }
}

// 导出单例实例
export const memoryEventHandler = new MemoryEventHandler()