'use client'

import { useState, useEffect, useCallback } from 'react'
import { GamificationProfileWithDetails } from '@/types'
import { UserAchievement, PointTransaction, Achievement } from '@prisma/client'

export interface GamificationData {
  profile: GamificationProfileWithDetails | null
  loading: boolean
  error: string | null
  refreshProfile: () => Promise<void>
  updateChallengeProgress: (challengeId: string, progress: number) => Promise<void>
  claimChallengeReward: (challengeId: string) => Promise<void>
  getUserAchievements: () => Promise<UserAchievement[]>
  getAllAchievements: () => Promise<Achievement[]>
  getUserChallengeStats: () => Promise<{
    total: number
    completed: number
    claimed: number
    byType: Record<string, { total: number; completed: number }>
  }>
  getUserStreakStats: () => Promise<{
    currentStreak: number
    longestStreak: number
    totalActiveDays: number
    lastActiveAt: Date
  }>
  getPointsHistory: (limit?: number) => Promise<PointTransaction[]>
  getUserAchievementStats: () => Promise<{
    total: number
    unlocked: number
    inProgress: number
    byCategory: Record<string, { total: number; unlocked: number }>
  }>
}

export function useGamificationData(userId: string): GamificationData {
  const [profile, setProfile] = useState<GamificationProfileWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 获取用户资料
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/gamification/profile?userId=${userId}`)
      if (!response.ok) {
        throw new Error('获取游戏化资料失败')
      }
      const profileData = await response.json()
      setProfile(profileData)
    } catch (err) {
      console.error('获取游戏化资料失败:', err)
      setError('获取游戏化资料失败')
    } finally {
      setLoading(false)
    }
  }, [userId])

  // 更新挑战进度
  const handleUpdateChallengeProgress = useCallback(async (challengeId: string, progress: number) => {
    try {
      const response = await fetch('/api/gamification/challenges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          challengeId,
          progress,
        }),
      })

      if (!response.ok) {
        throw new Error('更新挑战进度失败')
      }

      // 更新后刷新整个资料，确保数据一致性
      await fetchProfile()
    } catch (err) {
      console.error('更新挑战进度失败:', err)
      setError('更新挑战进度失败')
    }
  }, [userId, fetchProfile])

  // 领取挑战奖励
  const handleClaimChallengeReward = useCallback(async (challengeId: string) => {
    try {
      const response = await fetch('/api/gamification/challenges/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          challengeId,
        }),
      })

      if (!response.ok) {
        throw new Error('领取挑战奖励失败')
      }

      // 更新后刷新整个资料，确保数据一致性
      await fetchProfile()
    } catch (err) {
      console.error('领取挑战奖励失败:', err)
      setError('领取挑战奖励失败')
    }
  }, [userId, fetchProfile])

  // 获取用户成就
  const handleGetUserAchievements = useCallback(async () => {
    try {
      const response = await fetch(`/api/gamification/achievements?userId=${userId}`)
      if (!response.ok) {
        throw new Error('获取用户成就失败')
      }
      return await response.json() as Promise<UserAchievement[]>
    } catch (err) {
      console.error('获取用户成就失败:', err)
      setError('获取用户成就失败')
      return []
    }
  }, [userId])

  // 获取所有成就
  const handleGetAllAchievements = useCallback(async () => {
    try {
      const response = await fetch('/api/gamification/achievements/all')
      if (!response.ok) {
        throw new Error('获取成就详情失败')
      }
      return await response.json()
    } catch (err) {
      console.error('获取成就详情失败:', err)
      setError('获取成就详情失败')
      return []
    }
  }, [])

  // 获取用户挑战统计
  const handleGetUserChallengeStats = useCallback(async () => {
    try {
      const response = await fetch(`/api/gamification/challenges/stats?userId=${userId}`)
      if (!response.ok) {
        throw new Error('获取用户挑战统计失败')
      }
      return await response.json()
    } catch (err) {
      console.error('获取用户挑战统计失败:', err)
      setError('获取用户挑战统计失败')
      return {
        total: 0,
        completed: 0,
        claimed: 0,
        byType: {}
      }
    }
  }, [userId])

  // 获取用户连续学习统计
  const handleGetUserStreakStats = useCallback(async () => {
    try {
      const response = await fetch(`/api/gamification/streak?userId=${userId}`)
      if (!response.ok) {
        throw new Error('获取用户连续学习统计失败')
      }
      return await response.json()
    } catch (err) {
      console.error('获取用户连续学习统计失败:', err)
      setError('获取用户连续学习统计失败')
      return {
        currentStreak: 0,
        longestStreak: 0,
        totalActiveDays: 0,
        lastActiveAt: new Date()
      }
    }
  }, [userId])

  // 获取用户积分历史
  const handleGetPointsHistory = useCallback(async (limit = 20) => {
    try {
      const response = await fetch(`/api/gamification/points/history?userId=${userId}&limit=${limit}`)
      if (!response.ok) {
        throw new Error('获取用户积分历史失败')
      }
      return await response.json()
    } catch (err) {
      console.error('获取用户积分历史失败:', err)
      setError('获取用户积分历史失败')
      return []
    }
  }, [userId])

  // 获取用户成就统计
  const handleGetUserAchievementStats = useCallback(async () => {
    try {
      const response = await fetch(`/api/gamification/achievements/stats?userId=${userId}`)
      if (!response.ok) {
        throw new Error('获取成就统计失败')
      }
      return await response.json()
    } catch (err) {
      console.error('获取成就统计失败:', err)
      setError('获取成就统计失败')
      return {
        total: 0,
        unlocked: 0,
        inProgress: 0,
        byCategory: {}
      }
    }
  }, [userId])

  // 初始化时获取数据
  useEffect(() => {
    if (userId) {
      fetchProfile()
    }
  }, [userId, fetchProfile])

  return {
    profile,
    loading,
    error,
    refreshProfile: fetchProfile,
    updateChallengeProgress: handleUpdateChallengeProgress,
    claimChallengeReward: handleClaimChallengeReward,
    getUserAchievements: handleGetUserAchievements,
    getAllAchievements: handleGetAllAchievements,
    getUserChallengeStats: handleGetUserChallengeStats,
    getUserStreakStats: handleGetUserStreakStats,
    getPointsHistory: handleGetPointsHistory,
    getUserAchievementStats: handleGetUserAchievementStats
  }
}