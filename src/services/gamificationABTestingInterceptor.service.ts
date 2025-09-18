import { gamificationABTestingConfigService } from './gamificationABTestingConfig.service'
import { gamificationService } from './gamification.service'
import { GamificationEvent } from '@/types'
import { PointTransactionType, ChallengeType, AchievementType } from '@prisma/client'

// 导入子拦截器
import { pointsInterceptor } from './gamification/interceptors/PointsInterceptor'
import { experienceInterceptor } from './gamification/interceptors/ExperienceInterceptor'
import { levelInterceptor } from './gamification/interceptors/LevelInterceptor'
import { streakInterceptor } from './gamification/interceptors/StreakInterceptor'
import { achievementInterceptor } from './gamification/interceptors/AchievementInterceptor'
import { challengeInterceptor } from './gamification/interceptors/ChallengeInterceptor'
import { leaderboardInterceptor } from './gamification/interceptors/LeaderboardInterceptor'
import { reviewInterceptor } from './gamification/interceptors/ReviewInterceptor'
import { memoryInterceptor } from './gamification/interceptors/MemoryInterceptor'

/**
 * 游戏化行为拦截器
 * 负责拦截游戏化系统的调用，并根据A/B测试配置动态调整游戏化行为
 */
export class GamificationABTestingInterceptorService {
  /**
   * 拦截添加积分操作
   */
  async interceptAddPoints(
    userId: string,
    originalAmount: number,
    type: PointTransactionType,
    description: string
  ): Promise<{ amount: number; type: PointTransactionType; description: string }> {
    // 委托给 PointsInterceptor
    return await pointsInterceptor.interceptAddPoints(userId, originalAmount, type, description)
  }

  /**
   * 拦截添加经验值操作
   */
  async interceptAddExperience(
    userId: string,
    originalAmount: number
  ): Promise<number> {
    // 委托给 ExperienceInterceptor
    return await experienceInterceptor.interceptAddExperience(userId, originalAmount)
  }

  /**
   * 拦截等级计算操作
   */
  async interceptLevelCalculation(
    userId: string,
    experience: number
  ): Promise<number> {
    // 委托给 LevelInterceptor
    return await levelInterceptor.interceptLevelCalculation(userId, experience)
  }

  /**
   * 拦截连续学习更新操作
   */
  async interceptStreakUpdate(
    userId: string,
    originalStreak: number
  ): Promise<number> {
    // 委托给 StreakInterceptor
    return await streakInterceptor.interceptStreakUpdate(userId, originalStreak)
  }

  /**
   * 拦截成就解锁操作
   */
  async interceptAchievementUnlock(
    userId: string,
    achievementId: string,
    originalProgress: number
  ): Promise<{ progress: number; shouldUnlock: boolean }> {
    // 委托给 AchievementInterceptor
    return await achievementInterceptor.interceptAchievementUnlock(userId, achievementId, originalProgress)
  }

  /**
   * 拦截挑战进度更新操作
   */
  async interceptChallengeProgressUpdate(
    userId: string,
    challengeId: string,
    originalProgress: number,
    challengeType: ChallengeType
  ): Promise<{ progress: number; shouldComplete: boolean }> {
    // 委托给 ChallengeInterceptor
    return await challengeInterceptor.interceptChallengeProgressUpdate(userId, challengeId, originalProgress, challengeType)
  }

  /**
   * 拦截挑战创建操作
   */
  async interceptChallengeCreation(
    userId: string,
    originalTarget: number,
    originalPoints: number,
    challengeType: ChallengeType
  ): Promise<{ target: number; points: number }> {
    // 委托给 ChallengeInterceptor
    return await challengeInterceptor.interceptChallengeCreation(userId, originalTarget, originalPoints, challengeType)
  }

  /**
   * 拦截排行榜显示操作
   */
  async interceptLeaderboardDisplay(
    userId: string,
    originalLeaderboardType: string,
    originalLimit: number
  ): Promise<{ leaderboardType: string; limit: number; filters: Record<string, unknown> }> {
    // 委托给 LeaderboardInterceptor
    return await leaderboardInterceptor.interceptLeaderboardDisplay(userId, originalLeaderboardType, originalLimit)
  }

  /**
   * 拦截复习完成操作
   */
  async interceptReviewCompletion(
    userId: string,
    reviewData: { isCompleted: boolean; accuracy?: number; timeSpent?: number }
  ): Promise<void> {
    // 委托给 ReviewInterceptor
    return await reviewInterceptor.interceptReviewCompletion(userId, reviewData)
  }

  /**
   * 拦截记忆内容创建操作
   */
  async interceptMemoryCreation(
    userId: string,
    memoryData: { difficulty: number; category: string }
  ): Promise<void> {
    // 委托给 MemoryInterceptor，转换参数格式
    const adaptedMemoryData = {
      content: '',  // MemoryInterceptor 需要 content 字段
      difficulty: memoryData.difficulty,
      tags: [memoryData.category]  // 将 category 转换为 tags
    }
    return await memoryInterceptor.interceptMemoryCreation(userId, adaptedMemoryData)
  }
}

// 导出单例实例
export const gamificationABTestingInterceptorService = new GamificationABTestingInterceptorService()