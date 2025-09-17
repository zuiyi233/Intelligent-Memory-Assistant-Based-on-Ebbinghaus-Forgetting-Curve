'use client'

import React, { useEffect, useState } from 'react'
import { GamificationProfile } from '@/components/gamification/GamificationProfile'
import { DailyChallenges } from '@/components/gamification/DailyChallenges'
import { EnhancedDailyChallenges } from '@/components/gamification/EnhancedDailyChallenges'
import { Leaderboard } from '@/components/gamification/Leaderboard'
import { EnhancedLeaderboard } from '@/components/gamification/EnhancedLeaderboard'
import { AchievementSystem } from '@/components/gamification/AchievementSystem'
import { AchievementNotificationManager } from '@/components/gamification/AchievementNotification'
import { EnhancedGamificationNotifications, initEnhancedGamificationNotifications } from '@/components/gamification/EnhancedGamificationNotifications'
import { RewardAnimationManager } from '@/components/gamification/RewardAnimations'
import { GamificationErrorBoundary } from '@/components/gamification/GamificationErrorBoundary'
import { LearningStyleGamificationAnalysis } from '@/components/gamification/LearningStyleGamificationAnalysis'
import { Navigation } from '@/components/layout/Navigation'
import { InteractiveTutorial } from '@/components/gamification/InteractiveTutorial'
import { TutorialService } from '@/services/tutorial.service'
import { TutorialStats } from '@/types'
import {
  GamificationOverviewSkeleton,
  GamificationStatsSkeleton,
  GamificationProfileSkeleton,
  GamificationChallengesSkeleton,
  GamificationLeaderboardSkeleton
} from '@/components/gamification/GamificationSkeleton'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
  Trophy,
  Target,
  TrendingUp,
  User,
  Info,
  Star,
  Zap,
  Coins,
  Award,
  Calendar,
  Sparkles,
  Gift,
  Brain,
  ArrowRight,
  BookOpen,
  GraduationCap
} from 'lucide-react'
import { useGamificationData } from '@/hooks/useGamificationData'
import { GamificationProfileWithDetails } from '@/types'
import { UserAchievement, UserDailyChallenge } from '@prisma/client'
import { initAchievementNotifications } from '@/components/gamification/AchievementNotification'

// 游戏化统计卡片组件
const GamificationStats = React.memo(function GamificationStats({ profile }: { profile: GamificationProfileWithDetails | null }) {
  if (!profile) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="apple-card">
            <CardContent className="p-4">
              <div className="flex justify-center items-center h-16">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const unlockedAchievements = profile?.achievements?.filter((a: UserAchievement) => a.progress >= 100).length || 0
  const totalAchievements = profile?.achievements?.length || 0
  const completedChallenges = profile?.dailyChallenges?.filter((c: UserDailyChallenge) => c.completed).length || 0
  const totalChallenges = profile?.dailyChallenges?.length || 0

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      <Card className="apple-card apple-card-hover">
        <CardContent className="p-3 md:p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg relative overflow-hidden">
              <Award className="h-5 w-5 text-purple-600 relative z-10" />
              <div className="absolute inset-0 bg-purple-200 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div>
              <p className="text-xs text-gray-500">成就</p>
              <p className="font-bold text-gray-900 counter-animate">
                {unlockedAchievements}/{totalAchievements}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="apple-card apple-card-hover">
        <CardContent className="p-3 md:p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg relative overflow-hidden">
              <Target className="h-5 w-5 text-green-600 relative z-10" />
              <div className="absolute inset-0 bg-green-200 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div>
              <p className="text-xs text-gray-500">挑战</p>
              <p className="font-bold text-gray-900 counter-animate">
                {completedChallenges}/{totalChallenges}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="apple-card apple-card-hover">
        <CardContent className="p-3 md:p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg relative overflow-hidden">
              <TrendingUp className="h-5 w-5 text-blue-600 relative z-10" />
              <div className="absolute inset-0 bg-blue-200 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div>
              <p className="text-xs text-gray-500">排名</p>
              <p className="font-bold text-gray-900 counter-animate">
                #{Math.floor(Math.random() * 100) + 1}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="apple-card apple-card-hover">
        <CardContent className="p-3 md:p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg relative overflow-hidden">
              <Calendar className="h-5 w-5 text-orange-600 relative z-10" />
              <div className="absolute inset-0 bg-orange-200 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div>
              <p className="text-xs text-gray-500">活跃天数</p>
              <p className="font-bold text-gray-900 counter-animate">
                {Math.floor(Math.random() * 30) + 1}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
})

// 游戏化数据概览组件
const GamificationOverview = React.memo(function GamificationOverview({ profile }: { profile: GamificationProfileWithDetails | null }) {
  if (!profile) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="apple-card overflow-hidden">
            <CardContent className="p-6">
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // 计算升级进度
  const currentLevelExp = (profile.level - 1) * 100
  const nextLevelExp = profile.level * 100
  const progress = ((profile.experience - currentLevelExp) / (nextLevelExp - currentLevelExp)) * 100

  // 计算成就数量
  const achievementCount = profile.achievements ? profile.achievements.length : 0

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {/* 等级进度卡片 */}
      <Card className="apple-card apple-card-hover group overflow-hidden">
        <CardContent className="p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-xl shadow-inner relative overflow-hidden">
              <Star className="h-6 w-6 text-blue-600 relative z-10" />
              <div className="absolute inset-0 bg-gradient-to-br from-blue-200 to-indigo-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">当前等级</p>
              <p className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 counter-animate">
                Lv.{profile.level}
              </p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full shadow-md transition-all duration-700 relative overflow-hidden"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 animate-pulse opacity-30"></div>
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">升级进度</span>
              <span className="font-medium text-gray-900">
                {profile.experience - currentLevelExp} / {nextLevelExp - currentLevelExp} EXP
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 积分卡片 */}
      <Card className="apple-card apple-card-hover group overflow-hidden">
        <CardContent className="p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-yellow-100 to-amber-200 rounded-xl shadow-inner relative overflow-hidden">
              <Coins className="h-6 w-6 text-yellow-600 relative z-10" />
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-200 to-amber-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">可用积分</p>
              <p className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-600 to-amber-600 counter-animate">
                {profile.points}
              </p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-yellow-500 animate-pulse" />
              <span className="text-sm text-gray-600">可用于兑换奖励</span>
            </div>
            <Link href="/gamification/rewards">
              <Button
                className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white h-8 text-xs btn-animate"
              >
                <Gift className="h-3 w-3 mr-1" />
                查看奖励商店
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* 连续学习卡片 */}
      <Card className="apple-card apple-card-hover group overflow-hidden">
        <CardContent className="p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-green-100 to-emerald-200 rounded-xl shadow-inner relative overflow-hidden">
              <Zap className="h-6 w-6 text-green-600 relative z-10" />
              <div className="absolute inset-0 bg-gradient-to-br from-green-200 to-emerald-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">连续学习</p>
              <p className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-600 counter-animate">
                {profile.streak}天
              </p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-1">
              {profile.streak > 0 && (
                <>
                  <div className="flex -space-x-1">
                    {[...Array(Math.min(profile.streak, 5))].map((_, i) => (
                      <div key={i} className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">继续保持！</span>
                </>
              )}
            </div>
            {profile.streak >= 7 && (
              <div className="flex items-center gap-1 text-sm text-green-600 bg-green-50 px-2 py-1 rounded-full badge-pulse">
                <Award className="h-3 w-3" />
                <span>连续一周奖励</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
)


export default function GamificationPage() {
  // 临时使用固定用户ID，实际应该从会话中获取
  const userId = "temp-user-id"
  
  // 使用自定义钩子获取游戏化数据
  const {
    profile,
    loading,
    refreshProfile,
    updateChallengeProgress,
    claimChallengeReward
  } = useGamificationData(userId)
  
  // 奖励动画状态
  const [rewards, setRewards] = useState<Array<{
    id: string
    type: 'POINTS' | 'BADGE' | 'TROPHY' | 'LEVEL_UP' | 'STREAK_BONUS' | 'SPECIAL_GIFT' | 'ACHIEVEMENT_UNLOCK'
    title: string
    description: string
    amount?: number
    color?: string
    icon?: React.ReactNode
    animation?: string
    rarity?: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'
    soundEnabled?: boolean
    hapticEnabled?: boolean
  }>>([])
  
  // 新手引导状态
  const [showTutorial, setShowTutorial] = useState(false)
  // 教程统计状态
  const [tutorialStats, setTutorialStats] = useState<TutorialStats | null>(null)

  // 初始化通知系统和教程统计
  useEffect(() => {
    initAchievementNotifications()
    initEnhancedGamificationNotifications()
    
    // 加载教程统计信息
    const loadTutorialStats = async () => {
      try {
        const response = await fetch('/api/gamification/tutorial-stats')
        if (response.ok) {
          const stats = await response.json()
          setTutorialStats(stats)
        } else {
          console.error('获取教程统计失败:', response.statusText)
        }
      } catch (error) {
        console.error('加载教程统计信息失败:', error)
      }
    }
    
    loadTutorialStats()
  }, [userId])
  
  // 处理奖励完成
  const handleRewardComplete = (rewardId: string) => {
    setRewards(prev => prev.filter(r => r.id !== rewardId))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navigation />
      <AchievementNotificationManager />
      <EnhancedGamificationNotifications />
      <RewardAnimationManager rewards={rewards} onRewardComplete={handleRewardComplete} />
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* 页面标题 */}
        <div className="mb-6 md:mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 md:mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              游戏化中心
            </span>
          </h1>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto px-4">
            通过成就、积分和排行榜，让您的学习之旅更加有趣和有动力
          </p>
        </div>

        {/* 游戏化数据概览 */}
        <div className="mb-6 md:mb-8">
          <GamificationErrorBoundary>
            {loading ? <GamificationOverviewSkeleton /> : <GamificationOverview profile={profile} />}
          </GamificationErrorBoundary>
        </div>

        {/* 游戏化统计 */}
        <div className="mb-6 md:mb-8">
          <GamificationErrorBoundary>
            {loading ? <GamificationStatsSkeleton /> : <GamificationStats profile={profile} />}
          </GamificationErrorBoundary>
        </div>

        {/* 主要功能区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* 左侧：个人资料和学习风格分析 */}
          <div className="lg:col-span-1 space-y-4 md:space-y-6">
            {/* 个人资料区域 */}
            <Card className="apple-card">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                  <User className="h-5 w-5 text-blue-500" />
                  个人资料
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <GamificationErrorBoundary>
                  {loading ? (
                    <GamificationProfileSkeleton />
                  ) : (
                    <GamificationProfile userId={userId} profile={profile} onRefresh={refreshProfile} />
                  )}
                </GamificationErrorBoundary>
              </CardContent>
            </Card>

            {/* 学习风格分析与游戏化建议区域 */}
            <Card className="apple-card">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2 text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                    <Brain className="h-5 w-5 text-indigo-500" />
                    学习风格分析
                  </CardTitle>
                  <Link href="/gamification/learning-style">
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      查看详情
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <GamificationErrorBoundary>
                  <div className="h-80 overflow-auto">
                    <LearningStyleGamificationAnalysis userId={userId} />
                  </div>
                </GamificationErrorBoundary>
              </CardContent>
            </Card>
          </div>

          {/* 右侧：每日挑战和排行榜 */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            {/* 每日挑战区域 */}
            <Card className="apple-card">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-600">
                  <Target className="h-5 w-5 text-green-500" />
                  每日挑战
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <GamificationErrorBoundary>
                  {loading ? (
                    <GamificationChallengesSkeleton />
                  ) : (
                    <EnhancedDailyChallenges
                      userId={userId}
                      onUpdateChallengeProgress={updateChallengeProgress}
                      onClaimChallengeReward={claimChallengeReward}
                      onReward={(reward) => {
                        setRewards(prev => [...prev, reward])
                      }}
                    />
                  )}
                </GamificationErrorBoundary>
              </CardContent>
            </Card>

            {/* 排行榜区域 */}
            <Card className="apple-card">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-600 to-amber-600">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  排行榜
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <GamificationErrorBoundary>
                  {loading ? (
                    <GamificationLeaderboardSkeleton />
                  ) : (
                    <EnhancedLeaderboard userId={userId} />
                  )}
                </GamificationErrorBoundary>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 数据效果分析区域 */}
        <div className="mt-6 md:mt-8">
          <Card className="apple-card">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2 text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-600 to-blue-600">
                  <TrendingUp className="h-5 w-5 text-cyan-500" />
                  数据效果分析
                </CardTitle>
                <Link href="/gamification/data-analysis">
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    查看详情
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">85%</p>
                  <p className="text-sm text-gray-600">用户参与度</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">72%</p>
                  <p className="text-sm text-gray-600">30日留存率</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">68%</p>
                  <p className="text-sm text-gray-600">功能转化率</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-4 text-center">
                通过数据可视化分析游戏化功能的效果，包括用户参与度、留存率和转化率等关键指标
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 成就系统区域 */}
        <div className="mt-6 md:mt-8">
          <Card className="apple-card">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2 text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                  <Trophy className="h-5 w-5 text-purple-500" />
                  成就系统
                </CardTitle>
                <Link href="/gamification/badges">
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    查看徽章墙
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <GamificationErrorBoundary>
                <AchievementSystem
                  userId={userId}
                  achievements={profile?.achievements?.map(ua => ({
                    ...ua.achievement,
                    userAchievement: ua
                  })) || []}
                  onRefresh={refreshProfile}
                />
              </GamificationErrorBoundary>
            </CardContent>
          </Card>
        </div>

        {/* 新手引导区域 */}
        <div className="mt-6 md:mt-8">
          <Card className="apple-card">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2 text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-600 to-blue-600">
                  <GraduationCap className="h-5 w-5 text-cyan-500" />
                  新手引导
                </CardTitle>
                <Link href="/tutorials">
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    查看全部教程
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {/* 教程统计信息 */}
              {tutorialStats && (
                <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-xl font-bold text-blue-600">
                      {tutorialStats.completedTutorials}
                    </p>
                    <p className="text-xs text-gray-600">已完成教程</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-xl font-bold text-green-600">
                      {tutorialStats.inProgressTutorials}
                    </p>
                    <p className="text-xs text-gray-600">进行中教程</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <p className="text-xl font-bold text-purple-600">
                      {tutorialStats.totalPoints}
                    </p>
                    <p className="text-xs text-gray-600">教程积分</p>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <p className="text-xl font-bold text-yellow-600">
                      {tutorialStats.totalTutorials}
                    </p>
                    <p className="text-xs text-gray-600">总教程数</p>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                    </div>
                    <h4 className="font-bold text-blue-900">游戏化系统入门</h4>
                  </div>
                  <p className="text-sm text-blue-700 mb-4">
                    了解游戏化系统的基本概念和功能，包括积分、等级、成就等核心元素。
                  </p>
                  <Button
                    onClick={() => setShowTutorial(true)}
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white"
                  >
                    开始学习
                  </Button>
                </div>
                
                <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <GraduationCap className="h-5 w-5 text-purple-600" />
                    </div>
                    <h4 className="font-bold text-purple-900">进阶教程</h4>
                  </div>
                  <p className="text-sm text-purple-700 mb-4">
                    深入了解成就系统、奖励商店和排行榜等高级功能，成为游戏化达人。
                  </p>
                  <Link href="/tutorials">
                    <Button
                      variant="outline"
                      className="w-full border-purple-200 text-purple-700 hover:bg-purple-50"
                    >
                      查看教程
                    </Button>
                  </Link>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-4 text-center">
                完成教程可获得积分奖励，快速掌握游戏化系统的各项功能
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 底部说明 */}
        <Card className="apple-card mt-6 md:mt-8">
          <CardContent className="p-4 md:p-6">
            <div className="text-center">
              <h3 className="font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
                <Info className="h-5 w-5 text-blue-500" />
                游戏化系统说明
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 text-sm text-gray-600 mt-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="font-medium text-blue-700 mb-1">等级系统</p>
                  <p>通过完成学习任务获取经验值，提升等级解锁更多功能</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="font-medium text-green-700 mb-1">积分奖励</p>
                  <p>完成挑战和成就可获得积分，用于兑换各种奖励</p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <p className="font-medium text-yellow-700 mb-1">排行榜竞争</p>
                  <p>与其他用户比较学习成果，展示您的学习实力</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 新手引导弹窗 */}
      {showTutorial && (
        <InteractiveTutorial
          userId={userId}
          tutorial={{
            id: "gamification-basics",
            name: "游戏化系统入门",
            description: "了解游戏化系统的基本概念和功能",
            category: "BASICS",
            audience: "NEW_USER",
            difficulty: "BEGINNER",
            estimatedTime: 10,
            steps: [
              {
                id: "step1",
                title: "欢迎来到游戏化系统",
                content: "游戏化系统通过积分、等级、成就等元素，让您的学习过程更加有趣和富有挑战性。",
                type: "INFO",
                position: "center",
                order: 0,
                isRequired: true,
                points: 10,
                actions: []
              },
              {
                id: "step2",
                title: "了解积分系统",
                content: "积分是游戏化系统的核心货币。您可以通过完成各种任务和挑战来获得积分，积分可以用来兑换奖励和特权。",
                type: "INFO",
                position: "center",
                order: 1,
                isRequired: true,
                points: 10,
                actions: []
              },
              {
                id: "step3",
                title: "掌握等级和经验值",
                content: "通过积累经验值，您可以提升等级。每个等级都会解锁新的功能和奖励，让您有持续学习的动力。",
                type: "INFO",
                position: "center",
                order: 2,
                isRequired: true,
                points: 10,
                actions: []
              }
            ],
            isActive: true,
            points: 30,
            tags: ["基础", "入门", "游戏化"],
            createdAt: new Date(),
            updatedAt: new Date()
          }}
          isOpen={showTutorial}
          onClose={() => setShowTutorial(false)}
          onComplete={async () => {
            setShowTutorial(false)
            // 完成教程后刷新用户资料
            refreshProfile()
            
            // 更新教程统计信息
            try {
              const response = await fetch('/api/gamification/tutorial-stats')
              if (response.ok) {
                const stats = await response.json()
                setTutorialStats(stats)
              } else {
                console.error('更新教程统计失败:', response.statusText)
              }
            } catch (error) {
              console.error('更新教程统计信息失败:', error)
            }
          }}
          onSkip={() => setShowTutorial(false)}
          onReward={(reward) => {
            setRewards(prev => [...prev, reward])
          }}
        />
      )}
    </div>
  )
}