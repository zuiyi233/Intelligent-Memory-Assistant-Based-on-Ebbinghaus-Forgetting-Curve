'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import { Trophy, Star, Zap, Calendar, Award, Coins, Sparkles } from 'lucide-react'
import { GamificationProfileWithDetails } from '@/types'
import { UserAchievement, PointTransaction, Achievement } from '@prisma/client'
import { cn } from '@/lib/utils'

interface GamificationProfileProps {
  userId: string
  profile?: GamificationProfileWithDetails | null
  onRefresh?: () => Promise<void>
}

export function GamificationProfile({ userId, profile: externalProfile, onRefresh }: GamificationProfileProps) {
  const [profile, setProfile] = useState<GamificationProfileWithDetails | null>(externalProfile || null)
  const [loading, setLoading] = useState(!externalProfile)
  const [showMoreAchievements, setShowMoreAchievements] = useState(false)

  useEffect(() => {
    // 如果有外部传入的profile，不需要重新获取
    if (externalProfile) {
      setProfile(externalProfile)
      setLoading(false)
      return
    }

    const fetchProfile = async () => {
      try {
        const response = await fetch(`/api/gamification/profile?userId=${encodeURIComponent(userId)}`)
        if (!response.ok) {
          throw new Error('获取游戏化资料失败')
        }
        const profileData = await response.json()
        setProfile(profileData)
      } catch (error) {
        console.error('获取游戏化资料失败:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [userId, externalProfile])

  // 刷新函数
  const handleRefresh = async () => {
    if (onRefresh) {
      await onRefresh()
    } else {
      setLoading(true)
      try {
        const response = await fetch(`/api/gamification/profile?userId=${encodeURIComponent(userId)}`)
        if (!response.ok) {
          throw new Error('刷新游戏化资料失败')
        }
        const profileData = await response.json()
        setProfile(profileData)
      } catch (error) {
        console.error('刷新游戏化资料失败:', error)
      } finally {
        setLoading(false)
      }
    }
  }

  if (loading) {
    return (
      <Card className="w-full overflow-hidden backdrop-blur-sm bg-white/80 border border-white/20 shadow-lg">
        <CardContent className="p-6">
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!profile) {
    return (
      <Card className="w-full overflow-hidden backdrop-blur-sm bg-white/80 border border-white/20 shadow-lg">
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-gray-500">无法加载游戏化资料</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // 计算升级进度
  const currentLevelExp = (profile.level - 1) * 100
  const nextLevelExp = profile.level * 100
  const progress = ((profile.experience - currentLevelExp) / (nextLevelExp - currentLevelExp)) * 100

  // 要显示的成就数量
  const achievementsToShow = showMoreAchievements ? profile.achievements : profile.achievements.slice(0, 6)

  return (
    <div className="space-y-3 md:space-y-4">
      {/* 刷新按钮 */}
      <div className="flex justify-end">
        <button
          onClick={handleRefresh}
          className="text-xs text-purple-600 hover:text-purple-800 transition-colors flex items-center gap-1"
        >
          <Sparkles className="h-3 w-3" />
          刷新
        </button>
      </div>

      {/* 成就展示 - 优化为紧凑布局 */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2 md:mb-3 flex items-center gap-1">
          <Award className="h-4 w-4 text-purple-500" />
          最近成就
        </h3>
        {profile.achievements.length > 0 ? (
          <div className="space-y-2 md:space-y-3">
            {achievementsToShow.slice(0, 3).map((userAchievement: UserAchievement & { achievement: Achievement }) => (
              <div
                key={userAchievement.id}
                className="group bg-white border border-gray-200 rounded-lg p-2 md:p-3 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start gap-2">
                  <div className="p-1.5 bg-purple-100 rounded-lg">
                    <Award className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-gray-900 truncate">{userAchievement.achievement.name}</h4>
                    <p className="text-xs text-gray-600 mt-1 truncate">{userAchievement.achievement.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">
                        {new Date(userAchievement.unlockedAt).toLocaleDateString()}
                      </span>
                      <span className="text-xs font-medium text-yellow-600">
                        +{userAchievement.achievement.points}积分
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {profile.achievements.length > 3 && (
              <div className="text-center">
                <button
                  onClick={() => setShowMoreAchievements(!showMoreAchievements)}
                  className="text-xs text-purple-600 hover:text-purple-800 transition-colors"
                >
                  {showMoreAchievements ? '收起' : `查看全部 (${profile.achievements.length})`}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-4">
            <Award className="h-8 w-8 mx-auto text-gray-300 mb-2" />
            <p className="text-sm text-gray-500">暂无成就</p>
          </div>
        )}
      </div>

      {/* 最近积分记录 - 优化为紧凑布局 */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2 md:mb-3 flex items-center gap-1">
          <Coins className="h-4 w-4 text-yellow-500" />
          积分记录
        </h3>
        {profile.pointTransactions.length > 0 ? (
          <div className="space-y-1 md:space-y-2 max-h-40 md:max-h-48 overflow-y-auto">
            {profile.pointTransactions.slice(0, 5).map((transaction: PointTransaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-1.5 md:p-2 bg-gray-50 rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-900 truncate">{transaction.description}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(transaction.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={cn(
                  "font-bold text-xs px-2 py-1 rounded-full",
                  transaction.amount > 0
                    ? "text-green-600 bg-green-50"
                    : "text-red-600 bg-red-50"
                )}>
                  {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <Coins className="h-8 w-8 mx-auto text-gray-300 mb-2" />
            <p className="text-sm text-gray-500">暂无积分记录</p>
          </div>
        )}
      </div>
    </div>
  )
}