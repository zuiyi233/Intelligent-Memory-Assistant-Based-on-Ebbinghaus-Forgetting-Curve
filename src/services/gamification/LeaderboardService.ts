import { isPrismaInitialized } from '@/lib/db'

// 检查是否在服务端环境
const isServerSide = typeof window === 'undefined'
import {
  Leaderboard,
  LeaderboardEntry,
  LeaderboardType,
  LeaderboardPeriod
} from '@prisma/client'

// 定义用户信息类型
interface UserInfo {
  id: string;
  username: string;
  name?: string | null;
  avatar?: string | null;
}

// 定义排行榜条目类型
interface LeaderboardProfile {
  id: string;
  userId: string;
  level: number;
  points: number;
  streak: number;
  user: UserInfo;
  score?: number;
}

// 定义排行榜查询结果类型
interface LeaderboardQueryResult {
  id: string;
  userId: string;
  level: number;
  points: number;
  streak: number;
  username: string;
  name: string | null;
  avatar: string | null;
  score?: number;
}

// 定义完整的排行榜条目类型，包含所需的 user 和 profile 属性
interface CompleteLeaderboardEntry extends LeaderboardEntry {
  user: {
    id: string;
    username: string;
    name: string | null;
    avatar: string | null;
  };
  profile: {
    id: string;
    userId: string;
    level: number;
    points: number;
    experience: number;
    streak: number;
    lastActiveAt: Date;
  };
}

/**
 * 排行榜服务类
 */
export class LeaderboardService {
  /**
   * 获取排行榜
   */
  async getLeaderboard(type: LeaderboardType, period: LeaderboardPeriod, limit: number = 10, userId?: string): Promise<LeaderboardEntry[]> {
    // 检查是否在服务端环境且 Prisma 已初始化
    if (!isServerSide || !isPrismaInitialized()) {
      console.error('LeaderboardService.getLeaderboard 只能在服务端运行')
      throw new Error('此方法只能在服务端运行')
    }

    try {
      // 动态导入 Prisma，避免在客户端打包
      const { prisma } = await import('@/lib/db')

      // 根据类型和周期获取排行榜数据
      const now = new Date()
      let periodStart: Date
      const periodEnd: Date = new Date(now)
      
      switch (period) {
        case LeaderboardPeriod.DAILY:
          periodStart = new Date(now)
          periodStart.setHours(0, 0, 0, 0)
          break
        case LeaderboardPeriod.WEEKLY:
          periodStart = new Date(now)
          periodStart.setDate(now.getDate() - 7)
          break
        case LeaderboardPeriod.MONTHLY:
          periodStart = new Date(now)
          periodStart.setMonth(now.getMonth() - 1)
          break
        case LeaderboardPeriod.ALL_TIME:
        default:
          periodStart = new Date(0) // 从最早时间开始
          break
      }
      
      // 注意：这里可以添加A/B测试拦截器调用，但我们将在主服务中处理这个依赖关系
      const adjustedType = type
      const adjustedLimit = limit
      const leaderboardFilters: Record<string, unknown> = {}
      
      // 构建查询条件
      let orderBy: Record<string, 'asc' | 'desc' | Record<string, 'asc' | 'desc'>> = {}
      switch (type) {
        case LeaderboardType.POINTS:
          orderBy = { profile: { points: 'desc' } }
          break
        case LeaderboardType.LEVEL:
          orderBy = { profile: { level: 'desc' } }
          break
        case LeaderboardType.STREAK:
          orderBy = { profile: { streak: 'desc' } }
          break
        case LeaderboardType.REVIEW_COUNT:
          // 需要计算复习次数
          orderBy = { score: 'desc' }
          break
        case LeaderboardType.ACCURACY:
          // 需要计算准确率
          orderBy = { score: 'desc' }
          break
        default:
          orderBy = { profile: { points: 'desc' } }
      }
      
      // 查找或创建排行榜
      let leaderboard = await prisma.leaderboard.findFirst({
        where: {
          type,
          period,
          isActive: true
        }
      })
      
      if (!leaderboard) {
        leaderboard = await prisma.leaderboard.create({
          data: {
            name: `${type}排行榜`,
            type,
            period,
            isActive: true
          }
        })
      }
      
      // 获取排行榜条目
      let entries = await prisma.leaderboardEntry.findMany({
        where: {
          leaderboardId: leaderboard.id,
          periodStart: { gte: periodStart },
          periodEnd: { lte: periodEnd }
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              name: true,
              avatar: true
            }
          },
          profile: true
        },
        orderBy,
        take: limit
      })
      
      // 如果没有条目或条目过期，生成新的排行榜
      if (entries.length === 0) {
        const completeEntries = await this.generateLeaderboardEntries(leaderboard.id, type, period, periodStart, periodEnd, limit)
        
        // 将 CompleteLeaderboardEntry 转换为 LeaderboardEntry
        entries = completeEntries.map(entry => ({
          id: entry.id,
          leaderboardId: entry.leaderboardId,
          userId: entry.userId,
          rank: entry.rank,
          score: entry.score,
          periodStart: entry.periodStart,
          periodEnd: entry.periodEnd,
          createdAt: entry.createdAt,
          user: entry.user,
          profile: entry.profile
        }))
      }
      
      return entries
    } catch (error: unknown) {
      console.error('获取排行榜失败:', error)
      throw error
    }
  }

  /**
   * 生成排行榜条目
   */
  private async generateLeaderboardEntries(
    leaderboardId: string,
    type: LeaderboardType,
    period: LeaderboardPeriod,
    periodStart: Date,
    periodEnd: Date,
    limit: number
  ): Promise<CompleteLeaderboardEntry[]> {
    // 检查是否在服务端环境且 Prisma 已初始化
    if (!isServerSide || !isPrismaInitialized()) {
      console.error('LeaderboardService.generateLeaderboardEntries 只能在服务端运行')
      throw new Error('此方法只能在服务端运行')
    }

    try {
      // 动态导入 Prisma，避免在客户端打包
      const { prisma } = await import('@/lib/db')

      // 根据类型生成不同的排行榜数据
      let profiles: LeaderboardProfile[]
      
      switch (type) {
        case LeaderboardType.POINTS:
          profiles = await prisma.gamificationProfile.findMany({
            orderBy: { points: 'desc' },
            take: limit,
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  name: true,
                  avatar: true
                }
              }
            }
          })
          break
        case LeaderboardType.LEVEL:
          profiles = await prisma.gamificationProfile.findMany({
            orderBy: { level: 'desc' },
            take: limit,
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  name: true,
                  avatar: true
                }
              }
            }
          })
          break
        case LeaderboardType.STREAK:
          profiles = await prisma.gamificationProfile.findMany({
            orderBy: { streak: 'desc' },
            take: limit,
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  name: true,
                  avatar: true
                }
              }
            }
          })
          break
        case LeaderboardType.REVIEW_COUNT:
          // 计算每个用户在指定时间段的复习次数
          const reviewCountProfiles = await prisma.$queryRaw`
            SELECT
              gp.id, gp.userId, gp.level, gp.points, gp.streak,
              u.username, u.name, u.avatar,
              COUNT(r.id) as score
            FROM gamification_profiles gp
            JOIN users u ON gp.userId = u.id
            LEFT JOIN reviews r ON gp.userId = r.userId
              AND r.reviewTime >= ${periodStart}
              AND r.reviewTime <= ${periodEnd}
            GROUP BY gp.id, gp.userId, gp.level, gp.points, gp.streak, u.username, u.name, u.avatar
            ORDER BY score DESC
            LIMIT ${limit}
          ` as LeaderboardQueryResult[]
          
          // 将查询结果转换为 LeaderboardProfile 格式
          profiles = reviewCountProfiles.map(p => ({
            id: p.id,
            userId: p.userId,
            level: p.level,
            points: p.points,
            streak: p.streak,
            user: {
              id: p.userId,
              username: p.username,
              name: p.name,
              avatar: p.avatar
            },
            score: p.score
          }))
          break
        case LeaderboardType.ACCURACY:
          // 计算每个用户在指定时间段的复习准确率
          const accuracyProfiles = await prisma.$queryRaw`
            SELECT
              gp.id, gp.userId, gp.level, gp.points, gp.streak,
              u.username, u.name, u.avatar,
              AVG(r.reviewScore) as score
            FROM gamification_profiles gp
            JOIN users u ON gp.userId = u.id
            LEFT JOIN reviews r ON gp.userId = r.userId
              AND r.reviewTime >= ${periodStart}
              AND r.reviewTime <= ${periodEnd}
              AND r.reviewScore IS NOT NULL
            GROUP BY gp.id, gp.userId, gp.level, gp.points, gp.streak, u.username, u.name, u.avatar
            ORDER BY score DESC
            LIMIT ${limit}
          ` as LeaderboardQueryResult[]
          
          // 将查询结果转换为 LeaderboardProfile 格式
          profiles = accuracyProfiles.map(p => ({
            id: p.id,
            userId: p.userId,
            level: p.level,
            points: p.points,
            streak: p.streak,
            user: {
              id: p.userId,
              username: p.username,
              name: p.name,
              avatar: p.avatar
            },
            score: p.score
          }))
          break
        default:
          profiles = await prisma.gamificationProfile.findMany({
            orderBy: { points: 'desc' },
            take: limit,
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  name: true,
                  avatar: true
                }
              }
            }
          })
      }
      
      // 创建排行榜条目
      const entries: CompleteLeaderboardEntry[] = []
      
      for (let i = 0; i < profiles.length; i++) {
        const profile = profiles[i]
        
        // 检查是否已存在相同的 userId 和 leaderboardId 的条目
        // 注意：数据库的唯一性约束只基于 leaderboardId 和 userId，不包括时间范围
        const existingEntry = await prisma.leaderboardEntry.findFirst({
          where: {
            leaderboardId,
            userId: profile.userId
          }
        });

        console.log(`[DEBUG] 检查排行榜条目: leaderboardId=${leaderboardId}, userId=${profile.userId}, found=${!!existingEntry}`);
        
        let entry: CompleteLeaderboardEntry
         
        if (existingEntry) {
          // 如果条目已存在，则更新现有条目
          const updatedEntry = await prisma.leaderboardEntry.update({
            where: {
              id: existingEntry.id
            },
            data: {
              rank: i + 1,
              score: Math.round(profile.score || profile.points || profile.level || profile.streak || 0),
              periodStart,
              periodEnd
            }
          });
          
          // 构建完整的排行榜条目，包含所需的 user 和 profile 属性
          entry = {
            ...updatedEntry,
            user: {
              id: profile.userId,
              username: profile.user.username,
              name: profile.user.name ?? null,
              avatar: profile.user.avatar ?? null
            },
            profile: {
              id: profile.id,
              userId: profile.userId,
              level: profile.level,
              points: profile.points,
              experience: 0,
              streak: profile.streak,
              lastActiveAt: new Date()
            }
          };
        } else {
          // 如果条目不存在，则创建新条目
          console.log(`[DEBUG] 创建新排行榜条目: leaderboardId=${leaderboardId}, userId=${profile.userId}, rank=${i + 1}`);

          try {
            const createdEntry = await prisma.leaderboardEntry.create({
              data: {
                leaderboardId,
                userId: profile.userId,
                rank: i + 1,
                score: Math.round(profile.score || profile.points || profile.level || profile.streak || 0),
                periodStart,
                periodEnd
              }
            });
            
            // 构建完整的排行榜条目，包含所需的 user 和 profile 属性
            entry = {
              ...createdEntry,
              user: {
                id: profile.userId,
                username: profile.user.username,
                name: profile.user.name ?? null,
                avatar: profile.user.avatar ?? null
              },
              profile: {
                id: profile.id,
                userId: profile.userId,
                level: profile.level,
                points: profile.points,
                experience: 0,
                streak: profile.streak,
                lastActiveAt: new Date()
              }
            };
            
            console.log(`[DEBUG] 新排行榜条目创建成功: id=${entry.id}, userId=${entry.userId}`);
          } catch (error: unknown) {
            console.error(`[DEBUG] 创建排行榜条目失败: userId=${profile.userId}, error=${error instanceof Error ? error.message : String(error)}`);
            throw error;
          }
        }
        
        entries.push(entry)
      }
      
      return entries
    } catch (error: unknown) {
      console.error('生成排行榜条目失败:', error)
      throw error
    }
  }
}

// 导出单例实例
export const leaderboardService = new LeaderboardService()