'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Award, Coins, Sparkles, Target, TrendingUp, Beaker, BarChart3 } from 'lucide-react'
import { GamificationProfileWithDetails } from '@/types'
import { UserAchievement, PointTransaction, Achievement } from '@prisma/client'
import { useGamificationData } from '@/hooks/useGamificationData'
import { GamificationABTestingService } from '@/services/gamificationABTesting.service'

// 定义带有成就详情的用户成就类型
type UserAchievementWithDetails = UserAchievement & {
  achievement: Achievement
}

// A/B测试变体信息类型
interface ABTestVariantInfo {
  id: string
  name: string
  isActive: boolean
  feature: string
  description?: string
}

interface GamificationProfileWithABTestingProps {
  userId: string
  profile?: GamificationProfileWithDetails | null
  onRefresh?: () => Promise<void>
  showABTestingInfo?: boolean
}

export function GamificationProfileWithABTesting({ 
  userId, 
  profile: externalProfile, 
  onRefresh,
  showABTestingInfo = true 
}: GamificationProfileWithABTestingProps) {
  const [profile, setProfile] = useState<GamificationProfileWithDetails | null>(externalProfile || null)
  const [loading, setLoading] = useState(!externalProfile)
  const [showMoreAchievements, setShowMoreAchievements] = useState(false)
  const [userAchievements, setUserAchievements] = useState<UserAchievementWithDetails[]>([])
  const [pointsHistory, setPointsHistory] = useState<PointTransaction[]>([])
  const [achievementStats, setAchievementStats] = useState<{
    total: number
    unlocked: number
    inProgress: number
    byCategory: Record<string, { total: number; unlocked: number }>
  }>({ total: 0, unlocked: 0, inProgress: 0, byCategory: {} })
  const [abTestVariants, setAbTestVariants] = useState<ABTestVariantInfo[]>([])
  const [showABTestingDetails, setShowABTestingDetails] = useState(false)
  
  const {
    getUserAchievements,
    getPointsHistory,
    getUserAchievementStats
  } = useGamificationData(userId)

  const abTestingService = new GamificationABTestingService()

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

  // 初始化时获取额外数据
  useEffect(() => {
    if (userId && profile) {
      fetchAdditionalData()
      if (showABTestingInfo) {
        fetchABTestVariants()
      }
    }
  }, [userId, profile, showABTestingInfo])

  // 获取额外数据
  const fetchAdditionalData = async () => {
    try {
      const [achievementsData, pointsData, statsData] = await Promise.all([
        getUserAchievements(),
        getPointsHistory(),
        getUserAchievementStats()
      ])
      
      // 将API返回的数据转换为包含成就详情的格式
      const achievementsWithDetails = achievementsData.map((achievement: UserAchievement & { achievement?: Achievement }) => ({
        ...achievement,
        achievement: achievement.achievement || {} as Achievement
      }))
      setUserAchievements(achievementsWithDetails)
      setPointsHistory(pointsData)
      setAchievementStats(statsData)
    } catch (error) {
      console.error('获取额外数据失败:', error)
    }
  }

  // 获取A/B测试变体信息
  const fetchABTestVariants = async () => {
    try {
      // 使用简化实现，从模拟数据中获取变体信息
      const mockVariants: ABTestVariantInfo[] = [
        {
          id: 'variant-1',
          name: '成就通知增强',
          isActive: true,
          feature: 'achievement-notifications',
          description: '使用更生动的动画和音效展示成就通知'
        },
        {
          id: 'variant-2',
          name: '积分系统优化',
          isActive: true,
          feature: 'points-system',
          description: '调整积分获取规则和奖励机制'
        }
      ]
      setAbTestVariants(mockVariants)
    } catch (error) {
      console.error('获取A/B测试变体信息失败:', error)
    }
  }

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
        // 刷新额外数据
        await fetchAdditionalData()
        if (showABTestingInfo) {
          await fetchABTestVariants()
        }
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

  // 使用从API获取的成就数据，如果没有则使用profile中的成就
  const achievementsData = userAchievements.length > 0 ? userAchievements : (profile?.achievements || [])
  // 要显示的成就数量
  const achievementsToShow = showMoreAchievements ? achievementsData : achievementsData.slice(0, 6)

  return (
    <div className="space-y-3 md:space-y-4">
      {/* 刷新按钮 */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-gray-800">游戏化资料</h2>
          {showABTestingInfo && abTestVariants.length > 0 && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              <Beaker className="h-3 w-3 mr-1" />
              A/B测试中
            </span>
          )}
        </div>
        <button
          onClick={handleRefresh}
          className="text-xs text-purple-600 hover:text-purple-800 transition-colors flex items-center gap-1"
        >
          <Sparkles className="h-3 w-3" />
          刷新
        </button>
      </div>

      {/* A/B测试信息 */}
      {showABTestingInfo && abTestVariants.length > 0 && (
        <Card className="border-blue-200 bg-blue-50/30">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-blue-800 flex items-center gap-1">
                <Beaker className="h-4 w-4" />
                A/B测试变体
              </h3>
              <button
                onClick={() => setShowABTestingDetails(!showABTestingDetails)}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                {showABTestingDetails ? '收起' : '详情'}
              </button>
            </div>
            
            {!showABTestingDetails ? (
              <div className="space-y-1">
                {abTestVariants.slice(0, 2).map((variant) => (
                  <div key={variant.id} className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${variant.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    <span className="text-xs text-gray-700">{variant.name}</span>
                  </div>
                ))}
                {abTestVariants.length > 2 && (
                  <div className="text-xs text-blue-600">
                    +{abTestVariants.length - 2} 个更多变体
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {abTestVariants.map((variant) => (
                  <div key={variant.id} className="flex items-start gap-2 p-2 bg-white/50 rounded-lg">
                    <div className={`mt-1 w-2 h-2 rounded-full ${variant.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-medium text-gray-900">{variant.name}</h4>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${variant.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {variant.isActive ? '进行中' : '已结束'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{variant.description || `${variant.feature}功能变体`}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <BarChart3 className="h-3 w-3 text-gray-500" />
                        <span className="text-xs text-gray-500">功能: {variant.feature}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

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
        {pointsHistory.length > 0 ? (
          <div className="space-y-1 md:space-y-2 max-h-40 md:max-h-48 overflow-y-auto">
            {pointsHistory.slice(0, 5).map((transaction: PointTransaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-1.5 md:p-2 bg-gray-50 rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-900 truncate">{transaction.description}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(transaction.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`font-bold text-xs px-2 py-1 rounded-full ${
                  transaction.amount > 0
                    ? "text-green-600 bg-green-50"
                    : "text-red-600 bg-red-50"
                }`}>
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