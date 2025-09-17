'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Target,
  CheckCircle,
  Clock,
  Gift,
  Zap,
  Award,
  Star,
  TrendingUp,
  Calendar,
  Sparkles,
  Star as Confetti,
  X
} from 'lucide-react'
import { DailyChallenge, UserDailyChallenge, ChallengeType } from '@prisma/client'
import { cn } from '@/lib/utils'
import { CircularProgress } from './AchievementSystem'

// 挑战类型配置
const CHALLENGE_TYPES: Record<ChallengeType, { label: string; icon: React.ReactNode; color: string; bgColor: string; glowColor: string }> = {
  REVIEW_COUNT: {
    label: '复习次数',
    icon: <Target className="h-4 w-4" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50/80 border-blue-200/50',
    glowColor: 'rgba(59, 130, 246, 0.5)'
  },
  REVIEW_ACCURACY: {
    label: '复习准确率',
    icon: <CheckCircle className="h-4 w-4" />,
    color: 'text-green-600',
    bgColor: 'bg-green-50/80 border-green-200/50',
    glowColor: 'rgba(34, 197, 94, 0.5)'
  },
  MEMORY_CREATED: {
    label: '创建记忆',
    icon: <Gift className="h-4 w-4" />,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50/80 border-purple-200/50',
    glowColor: 'rgba(168, 85, 247, 0.5)'
  },
  STREAK_DAYS: {
    label: '连续学习',
    icon: <Zap className="h-4 w-4" />,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50/80 border-yellow-200/50',
    glowColor: 'rgba(245, 158, 11, 0.5)'
  },
  CATEGORY_FOCUS: {
    label: '类别专注',
    icon: <Target className="h-4 w-4" />,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50/80 border-indigo-200/50',
    glowColor: 'rgba(99, 102, 241, 0.5)'
  }
}

// 挑战进度条组件
interface ChallengeProgressBarProps {
  progress: number
  target: number
  isCompleted: boolean
  className?: string
}

function ChallengeProgressBar({ progress, target, isCompleted, className }: ChallengeProgressBarProps) {
  const percentage = Math.min(100, (progress / target) * 100)
  
  return (
    <div className={cn("space-y-2", className)}>
      <div className="w-full bg-gray-200/30 backdrop-blur-sm rounded-full h-2.5 shadow-inner overflow-hidden relative">
        {/* 背景动画 */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-300/20 to-transparent animate-[shimmer_2s_infinite]"></div>
        
        <div
          className={cn(
            "h-2.5 rounded-full transition-all duration-700 relative overflow-hidden",
            "shadow-lg",
            isCompleted
              ? "bg-gradient-to-r from-green-500 to-emerald-500 shadow-green-500/20"
              : "bg-gradient-to-r from-blue-500 to-indigo-500 shadow-blue-500/20"
          )}
          style={{ width: `${percentage}%` }}
        >
          {/* 光泽效果 */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_1.5s_infinite]"></div>
          
          {/* 流动光点效果 */}
          <div
            className="absolute top-0 h-full w-4 bg-white/40 rounded-full"
            style={{
              left: `${percentage - 5}%`,
              animation: 'flow 2s linear infinite',
              opacity: percentage > 5 && percentage < 95 ? 1 : 0
            }}
          ></div>
          
          {isCompleted && (
            <>
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 animate-pulse opacity-30"></div>
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.3)_0%,transparent_70%)] animate-pulse"></div>
              {/* 完成庆祝效果 */}
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-ping opacity-75"></div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full"></div>
            </>
          )}
        </div>
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span className={cn(
          "font-medium transition-colors",
          isCompleted ? "text-green-600" : "text-gray-500"
        )}>
          {progress}/{target}
        </span>
        <span className={cn(
          "font-semibold transition-colors",
          isCompleted ? "text-green-600" : "text-gray-500"
        )}>
          {Math.round(percentage)}%
        </span>
      </div>
      
      {/* 自定义动画样式 */}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes flow {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
      `}</style>
    </div>
  )
}

// 挑战卡片组件
interface ChallengeCardProps {
  challenge: DailyChallenge
  userChallenge: UserDailyChallenge
  onUpdateProgress: (challengeId: string, progress: number) => Promise<void>
  onClaimReward: (challengeId: string) => Promise<void>
  onReward?: (reward: {
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
  }) => void
  showAnimation?: boolean
}

function ChallengeCard({ challenge, userChallenge, onUpdateProgress, onClaimReward, onReward, showAnimation = false }: ChallengeCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isClaiming, setIsClaiming] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  
  const progress = userChallenge.progress || 0
  const isCompleted = userChallenge.completed || progress >= challenge.target
  const canClaim = isCompleted && !userChallenge.claimed
  
  const challengeTypeConfig = CHALLENGE_TYPES[challenge.type]
  
  // 处理领取奖励
  const handleClaimReward = async () => {
    setIsClaiming(true)
    try {
      await onClaimReward(challenge.id)
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 3000)
      
      // 触发奖励动画
      onReward?.({
        id: `reward-${challenge.id}-${Date.now()}`,
        type: 'POINTS',
        title: '挑战完成',
        description: `恭喜你完成了挑战: ${challenge.title}`,
        amount: challenge.points,
        color: '#F59E0B', // 黄色
        rarity: 'COMMON', // 挑战完成奖励默认为普通稀有度
        soundEnabled: true,
        hapticEnabled: true
      })
    } catch (error) {
      console.error('领取奖励失败:', error)
    } finally {
      setIsClaiming(false)
    }
  }
  
  // 处理进度更新（模拟）
  const handleUpdateProgress = async () => {
    if (!isCompleted) {
      const newProgress = Math.min(challenge.target, progress + 1)
      await onUpdateProgress(challenge.id, newProgress)
    }
  }
  
  return (
    <div
      className={cn(
        "relative transition-all duration-300 transform group",
        "hover:z-10",
        isHovered && "scale-[1.02] shadow-2xl",
        showAnimation && "animate-in slide-in-from-bottom-5 duration-500"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 彩纸效果 */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none z-10">
          {/* 主要彩纸 */}
          <div className="absolute top-2 left-1/4 animate-bounce">
            <Confetti className="h-4 w-4 text-yellow-500" />
            <div className="absolute inset-0 bg-yellow-400 rounded-full animate-ping opacity-30"></div>
          </div>
          <div className="absolute top-4 right-1/4 animate-bounce" style={{ animationDelay: '0.2s' }}>
            <Confetti className="h-3 w-3 text-blue-500" />
            <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-30" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <div className="absolute top-1 left-1/2 animate-bounce" style={{ animationDelay: '0.4s' }}>
            <Confetti className="h-5 w-5 text-red-500" />
            <div className="absolute inset-0 bg-red-400 rounded-full animate-ping opacity-30" style={{ animationDelay: '0.4s' }}></div>
          </div>
          <div className="absolute bottom-2 right-1/3 animate-bounce" style={{ animationDelay: '0.6s' }}>
            <Confetti className="h-4 w-4 text-green-500" />
            <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-30" style={{ animationDelay: '0.6s' }}></div>
          </div>
          
          {/* 额外的闪烁星星 */}
          <div className="absolute top-1/3 left-1/3 animate-pulse" style={{ animationDelay: '0.8s' }}>
            <Star className="h-2 w-2 text-purple-500" />
          </div>
          <div className="absolute top-2/3 right-1/4 animate-pulse" style={{ animationDelay: '1s' }}>
            <Star className="h-2 w-2 text-pink-500" />
          </div>
          <div className="absolute bottom-1/4 left-1/5 animate-pulse" style={{ animationDelay: '1.2s' }}>
            <Star className="h-2 w-2 text-indigo-500" />
          </div>
        </div>
      )}
      
      {/* 发光边框效果 */}
      <div
        className="absolute inset-0 rounded-xl transition-all duration-300 opacity-0 group-hover:opacity-100"
        style={{
          background: `linear-gradient(45deg, ${challengeTypeConfig.glowColor}, transparent, ${challengeTypeConfig.glowColor})`,
          filter: 'blur(8px)',
          zIndex: -1
        }}
      />
      
      {/* 卡片主体 */}
      <Card
        className={cn(
          "relative overflow-hidden border-2 transition-all duration-300 backdrop-blur-sm",
          "bg-white/80 hover:bg-white/90",
          canClaim && "border-yellow-300/50 shadow-lg",
          isCompleted && "border-green-300/50 shadow-md",
          isHovered && "border-blue-300/50 shadow-md"
        )}
      >
        {/* 光泽效果 */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-full -left-full w-full h-full bg-gradient-to-br from-transparent via-white/20 to-transparent transform rotate-45 group-hover:translate-x-full group-hover:translate-y-full transition-all duration-1000"></div>
        </div>
        
        <CardContent className="p-3 sm:p-4 relative z-10">
          {/* 头部 */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 gap-2">
            <div className="flex items-center gap-2">
              <div className={cn(
                "p-2 rounded-lg border-2 transition-all duration-300 backdrop-blur-sm relative",
                challengeTypeConfig.bgColor,
                "group-hover:scale-110 group-hover:shadow-lg"
              )}>
                <div className={cn(challengeTypeConfig.color, "transition-transform duration-300 group-hover:scale-125")}>
                  {challengeTypeConfig.icon}
                </div>
                {/* 图标背景动画 */}
                <div className="absolute inset-0 rounded-lg bg-white/20 scale-0 group-hover:scale-100 transition-transform duration-300"></div>
              </div>
              <div>
                <h3 className="font-semibold text-sm text-gray-900 group-hover:text-blue-600 transition-colors">{challenge.title}</h3>
                <div className="flex items-center gap-1 mt-1">
                  <span className={cn(
                    "text-xs px-1.5 py-0.5 rounded border backdrop-blur-sm transition-all duration-200",
                    challengeTypeConfig.bgColor,
                    challengeTypeConfig.color,
                    "group-hover:scale-105"
                  )}>
                    {challengeTypeConfig.label}
                  </span>
                  <span className={cn(
                    "text-xs font-medium bg-gradient-to-r from-yellow-500 to-amber-500 bg-clip-text text-transparent",
                    "group-hover:from-yellow-400 group-hover:to-amber-400 transition-all duration-200"
                  )}>
                    +{challenge.points}积分
                  </span>
                </div>
              </div>
            </div>
            
            {/* 状态指示器 */}
            <div className="flex flex-col items-end gap-1">
              {canClaim && (
                <div className="flex items-center gap-1 text-xs text-yellow-600 bg-yellow-50/80 backdrop-blur-sm px-2 py-1 rounded-full animate-pulse border border-yellow-200/50 shadow-sm group">
                  <Gift className="h-3 w-3 animate-bounce group-hover:animate-spin" />
                  <span className="font-medium transition-all group-hover:scale-110">可领取</span>
                  {/* 微光效果 */}
                  <div className="absolute inset-0 rounded-full bg-yellow-400/20 animate-pulse"></div>
                </div>
              )}
              
              {isCompleted && userChallenge.claimed && (
                <div className="flex items-center gap-1 text-green-600 text-xs px-2 py-1 bg-green-50/80 backdrop-blur-sm rounded-full border border-green-200/50 shadow-sm group">
                  <CheckCircle className="h-3 w-3 group-hover:animate-pulse" />
                  <span className="font-medium transition-all group-hover:scale-105">已完成</span>
                  {/* 微光效果 */}
                  <div className="absolute inset-0 rounded-full bg-green-400/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
              )}
              
              {!isCompleted && progress > 0 && (
                <div className="flex items-center gap-1 text-blue-600 text-xs px-2 py-1 bg-blue-50/80 backdrop-blur-sm rounded-full border border-blue-200/50 shadow-sm group">
                  <TrendingUp className="h-3 w-3 animate-pulse group-hover:animate-bounce" />
                  <span className="font-medium transition-all group-hover:scale-105">进行中</span>
                  {/* 微光效果 */}
                  <div className="absolute inset-0 rounded-full bg-blue-400/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
              )}
            </div>
          </div>
          
          {/* 描述 */}
          <p className="text-xs text-gray-600 mb-4">{challenge.description}</p>
          
          {/* 进度条 */}
          <ChallengeProgressBar
            progress={progress}
            target={challenge.target}
            isCompleted={isCompleted}
          />
          
          {/* 底部操作 */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4 gap-3">
            <div className="flex items-center gap-1 text-xs text-gray-500 group">
              <Clock className="h-3 w-3 animate-pulse group-hover:animate-spin" />
              <span className="transition-colors group-hover:text-red-500">23:59截止</span>
              {/* 时间临近警告效果 */}
              <div className="absolute -right-1 -top-1 w-2 h-2 bg-red-500 rounded-full animate-ping opacity-0 group-hover:opacity-100"></div>
            </div>
            
            <div className="flex gap-2 sm:justify-end">
              {!isCompleted && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUpdateProgress}
                  className={cn(
                    "text-xs h-7 relative overflow-hidden",
                    "transition-all duration-200 transform hover:scale-105",
                    "hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600",
                    "active:scale-95 active:bg-blue-100"
                  )}
                >
                  {/* 光泽效果 */}
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-full -left-full w-full h-full bg-gradient-to-br from-transparent via-white/20 to-transparent transform rotate-45 group-hover:translate-x-full group-hover:translate-y-full transition-all duration-500"></div>
                  </div>
                  
                  {/* 按钮内容 */}
                  <div className="relative flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    模拟进度+1
                  </div>
                </Button>
              )}
              
              {canClaim && (
                <Button
                  onClick={handleClaimReward}
                  disabled={isClaiming}
                  className={cn(
                    "text-xs h-7 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white",
                    "shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200",
                    "relative overflow-hidden group",
                    "active:scale-95",
                    isClaiming && "opacity-70"
                  )}
                >
                  {/* 光泽效果 */}
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-full -left-full w-full h-full bg-gradient-to-br from-transparent via-white/30 to-transparent transform rotate-45 group-hover:translate-x-full group-hover:translate-y-full transition-all duration-1000"></div>
                  </div>
                  
                  {/* 发光效果 */}
                  <div className="absolute inset-0 rounded-md bg-yellow-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
                  
                  {isClaiming ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                      领取中
                    </>
                  ) : (
                    <>
                      <Gift className="h-3 w-3 mr-1 animate-bounce" />
                      领取奖励
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* 悬停效果 */}
      <div className={cn(
        "absolute -top-1 -right-1 transition-opacity duration-300",
        isHovered ? "opacity-100" : "opacity-0"
      )}>
        <div className="relative">
          <Sparkles className="h-5 w-5 text-blue-500 animate-pulse" />
          <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-30"></div>
        </div>
      </div>
    </div>
  )
}

// 增强版每日挑战主组件
interface EnhancedDailyChallengesProps {
  userId: string
  challenges?: DailyChallenge[]
  userChallenges?: UserDailyChallenge[]
  onUpdateChallengeProgress?: (challengeId: string, progress: number) => Promise<void>
  onClaimChallengeReward?: (challengeId: string) => Promise<void>
  onReward?: (reward: {
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
  }) => void
  onRefresh?: () => Promise<void>
  className?: string
}

export function EnhancedDailyChallenges({
  userId,
  challenges: externalChallenges,
  userChallenges: externalUserChallenges,
  onUpdateChallengeProgress,
  onClaimChallengeReward,
  onReward,
  onRefresh,
  className
}: EnhancedDailyChallengesProps) {
  const [dailyChallenges, setDailyChallenges] = useState<DailyChallenge[]>(externalChallenges || [])
  const [userChallenges, setUserChallenges] = useState<UserDailyChallenge[]>(externalUserChallenges || [])
  const [loading, setLoading] = useState(!externalChallenges)
  const [showAnimations, setShowAnimations] = useState(false)

  // 获取每日挑战数据
  const fetchChallenges = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/gamification/challenges?userId=${userId}`)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || '获取每日挑战失败')
      }
      const challenges = await response.json()
      
      // 验证挑战数据格式
      if (!Array.isArray(challenges)) {
        throw new Error('获取每日挑战失败: 返回数据格式不正确')
      }
      
      // 如果没有挑战，自动创建
      if (challenges.length === 0) {
        await autoCreateChallenges()
        return
      }
      
      setDailyChallenges(challenges)
      setUserChallenges(challenges.map((c: DailyChallenge & { userChallenges?: UserDailyChallenge[] }) => c.userChallenges?.[0] || {
        id: `temp-${c.id}-${Date.now()}`,
        userId,
        challengeId: c.id,
        progress: 0,
        completed: false,
        completedAt: null,
        claimed: false
      }))
      
      // 触发动画
      setShowAnimations(true)
      setTimeout(() => setShowAnimations(false), 1000)
    } catch (error) {
      console.error('获取每日挑战失败:', error)
      // 显示错误提示给用户
      const errorMessage = error instanceof Error ? error.message : '获取每日挑战失败，请稍后重试'
      
      // 可以在这里添加一个toast通知或者状态来显示错误
      // 例如：toast.error(errorMessage)
      
      // 尝试自动创建挑战作为备选方案
      try {
        await autoCreateChallenges()
      } catch (autoCreateError) {
        console.error('自动创建挑战也失败:', autoCreateError)
      }
    } finally {
      setLoading(false)
    }
  }

  // 自动创建挑战
  const autoCreateChallenges = async () => {
    try {
      // 检查 userId 是否存在
      if (!userId) {
        console.error('用户ID不存在，无法自动创建挑战')
        return
      }

      const response = await fetch(`/api/gamification/challenges/auto-create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || '自动创建挑战失败')
      }

      const data = await response.json()
      
      if (data.success && data.challenges) {
        // 验证挑战数据格式
        if (!Array.isArray(data.challenges)) {
          throw new Error('自动创建挑战失败: 返回的挑战数据格式不正确')
        }
        
        setDailyChallenges(data.challenges)
        setUserChallenges(data.challenges.map((c: DailyChallenge & { userChallenges?: UserDailyChallenge[] }) => c.userChallenges?.[0] || {
          id: `temp-${c.id}-${Date.now()}`,
          userId,
          challengeId: c.id,
          progress: 0,
          completed: false,
          completedAt: null,
          claimed: false
        }))
        
        // 触发动画
        setShowAnimations(true)
        setTimeout(() => setShowAnimations(false), 1000)
      } else {
        throw new Error(data.message || '自动创建挑战失败: 返回数据格式不正确')
      }
    } catch (error) {
      console.error('自动创建挑战失败:', error)
      // 显示错误提示给用户
      const errorMessage = error instanceof Error ? error.message : '自动创建挑战失败，请稍后重试'
      
      // 可以在这里添加一个toast通知或者状态来显示错误
      // 例如：toast.error(errorMessage)
      
      // 尝试重新获取挑战数据，以防已经有挑战存在
      try {
        const fallbackResponse = await fetch(`/api/gamification/challenges?userId=${userId}`)
        if (fallbackResponse.ok) {
          const fallbackChallenges = await fallbackResponse.json()
          if (fallbackChallenges && Array.isArray(fallbackChallenges) && fallbackChallenges.length > 0) {
            setDailyChallenges(fallbackChallenges)
            setUserChallenges(fallbackChallenges.map((c: DailyChallenge & { userChallenges?: UserDailyChallenge[] }) => c.userChallenges?.[0] || {
              id: `temp-${c.id}-${Date.now()}`,
              userId,
              challengeId: c.id,
              progress: 0,
              completed: false,
              completedAt: null,
              claimed: false
            }))
          }
        }
      } catch (fallbackError) {
        console.error('获取备选挑战数据失败:', fallbackError)
      }
    }
  }

  // 初始化数据
  useEffect(() => {
    if (!externalChallenges) {
      fetchChallenges()
    }
  }, [])

  // 如果有外部传入的挑战数据，直接使用
  useEffect(() => {
    if (externalChallenges) {
      setDailyChallenges(externalChallenges)
      setUserChallenges(externalUserChallenges || [])
      setLoading(false)
    }
  }, [externalChallenges, externalUserChallenges])

  // 刷新数据
  const handleRefresh = async () => {
    if (onRefresh) {
      await onRefresh()
    } else {
      await fetchChallenges()
    }
  }

  // 处理挑战进度更新
  const handleUpdateProgress = async (challengeId: string, progress: number) => {
    try {
      if (onUpdateChallengeProgress) {
        await onUpdateChallengeProgress(challengeId, progress)
      } else {
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
        
        // 更新本地状态
        const updatedChallenges = await fetch(`/api/gamification/challenges?userId=${userId}`)
        if (updatedChallenges.ok) {
          const challengesData = await updatedChallenges.json()
          setUserChallenges(challengesData.map((c: DailyChallenge & { userChallenges?: UserDailyChallenge[] }) => c.userChallenges?.[0] || {
            id: `temp-${c.id}-${Date.now()}`,
            userId,
            challengeId: c.id,
            progress: 0,
            completed: false,
            completedAt: null,
            claimed: false
          }))
        }
      }
    } catch (error) {
      console.error('更新挑战进度失败:', error)
    }
  }

  // 处理奖励领取
  const handleClaimReward = async (challengeId: string) => {
    try {
      if (onClaimChallengeReward) {
        await onClaimChallengeReward(challengeId)
      } else {
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
          throw new Error('领取奖励失败')
        }
        
        // 更新本地状态
        const updatedChallenges = await fetch(`/api/gamification/challenges?userId=${userId}`)
        if (updatedChallenges.ok) {
          const challengesData = await updatedChallenges.json()
          setUserChallenges(challengesData.map((c: DailyChallenge & { userChallenges?: UserDailyChallenge[] }) => c.userChallenges?.[0] || {
            id: `temp-${c.id}-${Date.now()}`,
            userId,
            challengeId: c.id,
            progress: 0,
            completed: false,
            completedAt: null,
            claimed: false
          }))
        }
      }
    } catch (error) {
      console.error('领取奖励失败:', error)
    }
  }

  // 获取用户挑战进度
  const getUserChallenge = (challengeId: string) => {
    const existingChallenge = userChallenges.find(uc => uc.challengeId === challengeId)
    if (existingChallenge) {
      return existingChallenge
    }
    
    // 如果没有找到现有挑战，查找对应的每日挑战并创建临时用户挑战
    const dailyChallenge = dailyChallenges.find(dc => dc.id === challengeId)
    if (dailyChallenge) {
      return {
        id: `temp-${dailyChallenge.id}-${Date.now()}`,
        userId,
        challengeId: dailyChallenge.id,
        progress: 0,
        completed: false,
        completedAt: null,
        claimed: false
      } as UserDailyChallenge
    }
    
    // 如果连对应的每日挑战都找不到，返回一个默认的临时挑战
    return {
      id: `temp-${challengeId}-${Date.now()}`,
      userId,
      challengeId,
      progress: 0,
      completed: false,
      completedAt: null,
      claimed: false
    } as UserDailyChallenge
  }

  // 统计数据
  const completedChallenges = userChallenges.filter(uc => uc.completed).length
  const totalChallenges = dailyChallenges.length
  const progressPercentage = totalChallenges > 0 ? (completedChallenges / totalChallenges) * 100 : 0
  const claimedRewards = userChallenges.filter(uc => uc.claimed).length

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

  return (
    <div className={cn("space-y-4 max-w-4xl mx-auto", className)}>
      {/* 挑战概览 */}
      <Card className="backdrop-blur-sm bg-white/80 border border-white/20 shadow-lg overflow-hidden relative group">
        {/* 光泽效果 */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-full -left-full w-full h-full bg-gradient-to-br from-transparent via-white/10 to-transparent transform rotate-45 group-hover:translate-x-full group-hover:translate-y-full transition-all duration-1000"></div>
        </div>
        
        <CardContent className="p-4 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-green-50/80 border border-green-200/50 group-hover:scale-110 transition-transform">
                <Target className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors">今日挑战</h3>
                <p className="text-xs text-gray-500">完成挑战获得积分奖励</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className={cn(
                "text-xs relative overflow-hidden transition-all duration-200",
                "hover:bg-green-50 hover:border-green-200 hover:text-green-600",
                "transform hover:scale-105 active:scale-95"
              )}
            >
              {/* 光泽效果 */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-full -left-full w-full h-full bg-gradient-to-br from-transparent via-green-200/20 to-transparent transform rotate-45 group-hover:translate-x-full group-hover:translate-y-full transition-all duration-500"></div>
              </div>
              
              {/* 按钮内容 */}
              <div className="relative flex items-center">
                <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                刷新
              </div>
            </Button>
          </div>
          
          {/* 进度概览 */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <span className="text-sm font-medium text-gray-700">挑战进度</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900">
                  {completedChallenges} / {totalChallenges}
                </span>
                <span className="text-xs font-medium bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2 py-1 rounded-full shadow-sm">
                  {Math.round(progressPercentage)}%
                </span>
              </div>
            </div>
            
            <div className="w-full bg-gray-200/30 backdrop-blur-sm rounded-full h-3 shadow-inner overflow-hidden relative">
              {/* 背景动画 */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-300/20 to-transparent animate-[shimmer_2s_infinite]"></div>
              
              <div
                className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-700 relative overflow-hidden shadow-lg"
                style={{ width: `${progressPercentage}%` }}
              >
                {/* 光泽效果 */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_1.5s_infinite]"></div>
                
                {/* 流动光点效果 */}
                <div
                  className="absolute top-0 h-full w-4 bg-white/40 rounded-full"
                  style={{
                    left: `${progressPercentage - 5}%`,
                    animation: 'flow 2s linear infinite',
                    opacity: progressPercentage > 5 && progressPercentage < 95 ? 1 : 0
                  }}
                ></div>
                
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 animate-pulse opacity-30"></div>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.3)_0%,transparent_70%)]"></div>
                
                {/* 完成庆祝效果 */}
                {progressPercentage >= 100 && (
                  <>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-ping opacity-75"></div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full"></div>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Gift className="h-3 w-3 text-green-500" />
                已领取奖励: {claimedRewards}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-yellow-500" />
                待领取: {completedChallenges - claimedRewards}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* 挑战列表 */}
      {dailyChallenges.length > 0 ? (
        <div className="space-y-4">
          {dailyChallenges.map((challenge, index) => {
            const userChallenge = getUserChallenge(challenge.id)
            
            return (
              <div
                key={challenge.id}
                className={cn(
                  "transform transition-all duration-500",
                  showAnimations && "animate-in slide-in-from-bottom-10",
                  "hover:z-10"
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <ChallengeCard
                  challenge={challenge}
                  userChallenge={userChallenge}
                  onUpdateProgress={handleUpdateProgress}
                  onClaimReward={handleClaimReward}
                  onReward={onReward}
                  showAnimation={showAnimations}
                />
                
                {/* 连接线效果 */}
                {index < dailyChallenges.length - 1 && (
                  <div className="absolute left-1/2 bottom-0 w-0.5 h-4 bg-gradient-to-b from-gray-300 to-transparent transform -translate-x-1/2"></div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <Card className="backdrop-blur-sm bg-white/80 border border-white/20 shadow-lg overflow-hidden group">
          {/* 光泽效果 */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-full -left-full w-full h-full bg-gradient-to-br from-transparent via-white/10 to-transparent transform rotate-45 group-hover:translate-x-full group-hover:translate-y-full transition-all duration-1000"></div>
          </div>
          
          <CardContent className="p-8 text-center relative z-10">
            <div className="relative inline-block mb-4">
              <Target className="h-12 w-12 mx-auto text-gray-300 group-hover:text-gray-400 transition-colors" />
              <div className="absolute inset-0 rounded-full bg-gray-200/20 scale-0 group-hover:scale-100 transition-transform duration-500"></div>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">今日没有挑战</h3>
            <p className="text-sm text-gray-600 mb-4">明天再来查看新挑战</p>
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              className={cn(
                "relative overflow-hidden transition-all duration-200",
                "transform hover:scale-105 active:scale-95",
                "hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600"
              )}
            >
              {/* 光泽效果 */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-full -left-full w-full h-full bg-gradient-to-br from-transparent via-blue-200/20 to-transparent transform rotate-45 group-hover:translate-x-full group-hover:translate-y-full transition-all duration-500"></div>
              </div>
              
              {/* 按钮内容 */}
              <div className="relative flex items-center">
                <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                刷新数据
              </div>
            </Button>
          </CardContent>
        </Card>
      )}
      
      {/* 底部说明 */}
      <Card className="backdrop-blur-sm bg-green-50/80 border border-green-200/50 shadow-sm overflow-hidden group">
        {/* 光泽效果 */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-full -left-full w-full h-full bg-gradient-to-br from-transparent via-white/20 to-transparent transform rotate-45 group-hover:translate-x-full group-hover:translate-y-full transition-all duration-1000"></div>
        </div>
        
        <CardContent className="p-4 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-start gap-3">
            <div className="p-1.5 rounded-lg bg-green-100/50 border border-green-200/50 group-hover:scale-110 transition-transform">
              <Target className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h4 className="font-medium text-green-900 mb-1 group-hover:text-green-700 transition-colors">挑战说明</h4>
              <p className="text-sm text-green-700 leading-relaxed">
                每日挑战每天刷新，完成挑战可获得积分奖励。挑战进度会根据您的学习活动自动更新，
                也可以手动模拟进度更新。完成挑战后记得领取奖励，奖励会在每日结束时失效。
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* 全局动画样式 */}
      <style jsx global>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes flow {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
      `}</style>
    </div>
  )
}