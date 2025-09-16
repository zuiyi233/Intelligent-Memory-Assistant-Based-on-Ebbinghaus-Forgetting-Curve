'use client'

import { useState, useEffect } from 'react'
import { GamificationProfileWithDetails } from '@/types'

export interface GamificationData {
  profile: GamificationProfileWithDetails | null
  loading: boolean
  error: string | null
  refreshProfile: () => Promise<void>
  updateChallengeProgress: (challengeId: string, progress: number) => Promise<void>
  claimChallengeReward: (challengeId: string) => Promise<void>
}

export function useGamificationData(userId: string): GamificationData {
  const [profile, setProfile] = useState<GamificationProfileWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 获取用户资料
  const fetchProfile = async () => {
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
  }

  // 更新挑战进度
  const handleUpdateChallengeProgress = async (challengeId: string, progress: number) => {
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

      // 更新后只刷新关键数据，而不是整个资料
      if (profile) {
        // 更新经验值和积分
        const updatedProfile = { ...profile }
        updatedProfile.experience += 10 // 假设每次更新获得10点经验值
        updatedProfile.points += 5 // 假设每次更新获得5点积分
        
        // 检查是否升级
        const currentLevelExp = (updatedProfile.level - 1) * 100
        const nextLevelExp = updatedProfile.level * 100
        if (updatedProfile.experience >= nextLevelExp) {
          updatedProfile.level += 1
        }
        
        setProfile(updatedProfile)
      }
    } catch (err) {
      console.error('更新挑战进度失败:', err)
      setError('更新挑战进度失败')
    }
  }

  // 领取挑战奖励
  const handleClaimChallengeReward = async (challengeId: string) => {
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

      const userChallenge = await response.json()
      
      // 更新后只刷新关键数据，而不是整个资料
      if (profile && userChallenge) {
        const updatedProfile = { ...profile }
        // 从挑战中获取奖励积分
        updatedProfile.points += userChallenge.challenge.points || 0
        
        // 假设每个挑战完成获得20点经验值
        updatedProfile.experience += 20
        
        // 检查是否升级
        const currentLevelExp = (updatedProfile.level - 1) * 100
        const nextLevelExp = updatedProfile.level * 100
        if (updatedProfile.experience >= nextLevelExp) {
          updatedProfile.level += 1
        }
        
        setProfile(updatedProfile)
      }
    } catch (err) {
      console.error('领取挑战奖励失败:', err)
      setError('领取挑战奖励失败')
    }
  }

  // 初始化时获取数据
  useEffect(() => {
    if (userId) {
      fetchProfile()
    }
  }, [userId])

  return {
    profile,
    loading,
    error,
    refreshProfile: fetchProfile,
    updateChallengeProgress: handleUpdateChallengeProgress,
    claimChallengeReward: handleClaimChallengeReward
  }
}