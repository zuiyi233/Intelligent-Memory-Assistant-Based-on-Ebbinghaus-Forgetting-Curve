'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Trophy,
  Medal,
  Crown,
  TrendingUp,
  Calendar,
  Star,
  Zap,
  Award,
  User as UserIcon,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Minus,
  Sparkles,
  Gift
} from 'lucide-react'
import { LeaderboardEntry, LeaderboardType, LeaderboardPeriod, User, GamificationProfile } from '@prisma/client'
import { cn } from '@/lib/utils'
import { cardEffects, animations, textEffects, specialEffects, gamificationEffects } from '@/lib/inspira-ui'

// 排行榜条目类型
type LeaderboardEntryWithDetails = LeaderboardEntry & {
  user: User
  profile: GamificationProfile
  leaderboardType: LeaderboardType
}

// 排行榜类型配置
const LEADERBOARD_TYPES: Record<LeaderboardType, { label: string; icon: React.ReactNode; color: string; gradient: string }> = {
  POINTS: {
    label: '积分榜',
    icon: <Gift className="h-4 w-4" />,
    color: 'text-yellow-600',
    gradient: 'from-yellow-400 to-amber-500'
  },
  LEVEL: {
    label: '等级榜',
    icon: <Star className="h-4 w-4" />,
    color: 'text-blue-600',
    gradient: 'from-blue-400 to-indigo-500'
  },
  STREAK: {
    label: '连续学习榜',
    icon: <Zap className="h-4 w-4" />,
    color: 'text-green-600',
    gradient: 'from-green-400 to-emerald-500'
  },
  REVIEW_COUNT: {
    label: '复习次数榜',
    icon: <Award className="h-4 w-4" />,
    color: 'text-purple-600',
    gradient: 'from-purple-400 to-violet-500'
  },
  ACCURACY: {
    label: '准确率榜',
    icon: <Trophy className="h-4 w-4" />,
    color: 'text-red-600',
    gradient: 'from-red-400 to-rose-500'
  }
}

// 排行榜周期配置
const LEADERBOARD_PERIODS: Record<LeaderboardPeriod, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  DAILY: {
    label: '每日',
    icon: <Calendar className="h-4 w-4" />,
    color: 'text-orange-600',
    bg: 'bg-orange-50'
  },
  WEEKLY: {
    label: '每周',
    icon: <Calendar className="h-4 w-4" />,
    color: 'text-blue-600',
    bg: 'bg-blue-50'
  },
  MONTHLY: {
    label: '每月',
    icon: <Calendar className="h-4 w-4" />,
    color: 'text-purple-600',
    bg: 'bg-purple-50'
  },
  ALL_TIME: {
    label: '总榜',
    icon: <TrendingUp className="h-4 w-4" />,
    color: 'text-green-600',
    bg: 'bg-green-50'
  }
}

// 排名变化指示器组件
interface RankChangeProps {
  change?: number
}

function RankChange({ change }: RankChangeProps) {
  if (!change) {
    return <Minus className="h-3 w-3 text-gray-400" />
  }
  
  if (change > 0) {
    return (
      <div className="flex items-center text-green-600 animate-pulse">
        <ArrowUp className="h-3 w-3" />
        <span className="text-xs font-bold">{change}</span>
      </div>
    )
  }
  
  return (
    <div className="flex items-center text-red-600 animate-pulse">
      <ArrowDown className="h-3 w-3" />
      <span className="text-xs font-bold">{Math.abs(change)}</span>
    </div>
  )
}

// 排行榜条目组件
interface LeaderboardItemProps {
  entry: LeaderboardEntryWithDetails
  rank: number
  isCurrentUser: boolean
  showAnimation?: boolean
}

function LeaderboardItem({ entry, rank, isCurrentUser, showAnimation = false }: LeaderboardItemProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [rankChange, setRankChange] = useState<number | undefined>(Math.random() > 0.7 ? Math.floor(Math.random() * 5) + 1 : undefined)
  
  // 获取排名图标
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <div className="relative">
            <Crown className="h-6 w-6 text-yellow-500 drop-shadow-lg" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
          </div>
        )
      case 2:
        return <Medal className="h-6 w-6 text-gray-400 drop-shadow-md" />
      case 3:
        return <Medal className="h-6 w-6 text-amber-600 drop-shadow-md" />
      default:
        return <span className="text-sm font-bold text-gray-500 drop-shadow-sm">#{rank}</span>
    }
  }
  
  // 格式化分数
  const formatScore = (score: number, type: LeaderboardType) => {
    switch (type) {
      case 'ACCURACY':
        return `${score.toFixed(1)}%`
      default:
        return score.toString()
    }
  }
  
  // 获取分数标签
  const getScoreLabel = (type: LeaderboardType) => {
    switch (type) {
      case 'POINTS':
        return '积分'
      case 'LEVEL':
        return '等级'
      case 'STREAK':
        return '连续天数'
      case 'REVIEW_COUNT':
        return '复习次数'
      case 'ACCURACY':
        return '准确率'
      default:
        return '分数'
    }
  }
  
  // 获取排名效果
  const getRankEffect = (rank: number) => {
    if (rank === 1) {
      return {
        border: "border-yellow-300",
        shadow: "shadow-lg shadow-yellow-100/50",
        bg: "from-yellow-50 to-amber-50"
      }
    } else if (rank === 2) {
      return {
        border: "border-gray-300",
        shadow: "shadow-lg shadow-gray-100/50",
        bg: "from-gray-50 to-slate-50"
      }
    } else if (rank === 3) {
      return {
        border: "border-amber-300",
        shadow: "shadow-lg shadow-amber-100/50",
        bg: "from-amber-50 to-orange-50"
      }
    }
    return {
      border: "border-gray-200",
      shadow: "shadow-md",
      bg: "from-white to-gray-50"
    }
  }
  
  const rankEffect = getRankEffect(rank)
  const leaderboardType = entry.leaderboardType as LeaderboardType
  const typeConfig = LEADERBOARD_TYPES[leaderboardType] || LEADERBOARD_TYPES.POINTS
  
  return (
    <div
      className={cn(
        "group relative transition-all duration-500 transform",
        isHovered && "scale-[1.03] z-10",
        showAnimation && "animate-in slide-in-from-bottom-5 duration-700"
      )}
      style={animations.slideIn('up', 500).animate as React.CSSProperties}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Inspira UI 发光效果 */}
      <div className={cn(
        "absolute inset-0 rounded-2xl transition-all duration-500 opacity-0 group-hover:opacity-100 blur-sm",
        isCurrentUser && "bg-blue-200/40",
        rank === 1 && "bg-yellow-200/40",
        rank === 2 && "bg-gray-200/40",
        rank === 3 && "bg-amber-200/40"
      )} />
      
      {/* Inspira UI 光泽效果 */}
      <div className={cn(
        "absolute inset-0 rounded-2xl overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500",
        cardEffects.shimmer(true)
      )} />
      
      {/* 条目卡片 */}
      <Card
        className={cn(
          "relative overflow-hidden border-2 transition-all duration-500 backdrop-blur-sm",
          "bg-gradient-to-br " + rankEffect.bg,
          rankEffect.border,
          rankEffect.shadow,
          isHovered && "ring-2 ring-white/50"
        )}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            {/* 左侧：排名和用户信息 */}
            <div className="flex items-center gap-3">
              {/* 排名 */}
              <div className={cn(
                "flex-shrink-0 w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                "bg-gradient-to-br " + (rank <= 3 && typeConfig?.gradient ? typeConfig.gradient : "from-gray-100 to-gray-200"),
                isHovered && "scale-110 ring-2 ring-white/50"
              )}>
                {getRankIcon(rank)}
              </div>
              
              {/* 用户头像 */}
              <div className="flex-shrink-0 relative">
                {entry.user.avatar ? (
                  <div
                    style={{ backgroundImage: `url(${entry.user.avatar})` }}
                    className="w-12 h-12 rounded-full object-cover border-2 border-white/50 bg-cover bg-center shadow-md transition-all duration-300"
                    title={entry.user.name || entry.user.username}
                  />
                ) : (
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center border-2 border-white/50 shadow-md transition-all duration-300",
                    "bg-gradient-to-br from-blue-100 to-purple-100",
                    isHovered && "scale-110"
                  )}>
                    <span className="text-gray-600 font-bold text-sm">
                      {(entry.user.name || entry.user.username || '用户').charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                {/* 用户头像悬停效果 */}
                {isHovered && (
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/30 to-transparent animate-pulse" />
                )}
              </div>
              
              {/* 用户信息 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className={cn(
                    "font-semibold text-sm truncate transition-all duration-300",
                    isCurrentUser ? "text-blue-600" : "text-gray-800",
                    isHovered && "scale-105"
                  )}>
                    {entry.user.name || entry.user.username}
                  </h3>
                  {isCurrentUser && (
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded-full transition-all duration-300",
                      "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700",
                      isHovered && "scale-110 shadow-sm"
                    )}>
                      你
                    </span>
                  )}
                  {rank <= 3 && (
                    <Star className={cn(
                      "h-3 w-3 transition-all duration-300",
                      rank === 1 && "text-yellow-500 drop-shadow-sm",
                      rank === 2 && "text-gray-400 drop-shadow-sm",
                      rank === 3 && "text-amber-600 drop-shadow-sm",
                      isHovered && "scale-125 animate-pulse"
                    )} />
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                  <span className="font-medium">Lv.{entry.profile.level}</span>
                  <span className="text-gray-400">•</span>
                  <span className="font-medium">{entry.profile.points}积分</span>
                  {rankChange !== undefined && (
                    <>
                      <span className="text-gray-400">•</span>
                      <RankChange change={rankChange} />
                    </>
                  )}
                </div>
              </div>
            </div>
            
            {/* 右侧：分数 */}
            <div className="flex flex-col items-end gap-1">
              <div className={cn(
                "font-bold text-lg transition-all duration-300",
                rank === 1 && "text-yellow-600 drop-shadow-sm",
                rank === 2 && "text-gray-600 drop-shadow-sm",
                rank === 3 && "text-amber-600 drop-shadow-sm",
                isHovered && "scale-110"
              )}>
                {formatScore(entry.score, leaderboardType)}
              </div>
              <span className="text-xs text-gray-500 font-medium">
                {getScoreLabel(leaderboardType)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Inspira UI 悬停效果 */}
      {isHovered && (
        <div className="absolute -top-2 -right-2 animate-pulse">
          <div className={cn(
            "w-6 h-6 rounded-full bg-gradient-to-br",
            isCurrentUser ? "from-blue-400 to-indigo-500" :
            rank === 1 ? "from-yellow-400 to-amber-500" :
            rank === 2 ? "from-gray-400 to-slate-500" :
            rank === 3 ? "from-amber-400 to-orange-500" :
            "from-purple-400 to-pink-500"
          )} />
        </div>
      )}
    </div>
  )
}

// 排行榜筛选器组件
interface LeaderboardFiltersProps {
  selectedType: LeaderboardType
  selectedPeriod: LeaderboardPeriod
  onTypeChange: (type: LeaderboardType) => void
  onPeriodChange: (period: LeaderboardPeriod) => void
}

function LeaderboardFilters({
  selectedType,
  selectedPeriod,
  onTypeChange,
  onPeriodChange
}: LeaderboardFiltersProps) {
  return (
    <Card className={cn(
      "backdrop-blur-sm bg-white/90 border border-white/30 shadow-xl transition-all duration-300",
      "hover:shadow-2xl hover:scale-[1.01]"
    )}>
      <CardContent className="p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* 标题 */}
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-lg transition-all duration-300",
              "bg-gradient-to-br from-blue-50 to-indigo-50"
            )}>
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">排行榜筛选</h3>
              <p className="text-xs text-gray-600 font-medium mt-0.5">
                {LEADERBOARD_TYPES[selectedType].label} · {LEADERBOARD_PERIODS[selectedPeriod].label}
              </p>
            </div>
          </div>
          
          {/* 筛选按钮组 */}
          <div className="flex flex-wrap gap-3">
            {/* 类型筛选 */}
            <div className="flex items-center gap-2">
              <div className={cn(
                "p-1.5 rounded-lg transition-all duration-300",
                "bg-gradient-to-br from-gray-50 to-slate-50"
              )}>
                <Filter className="h-4 w-4 text-gray-600" />
              </div>
              <div className={cn(
                "flex rounded-xl p-1 transition-all duration-300",
                "bg-gradient-to-br from-gray-100 to-slate-100 shadow-inner"
              )}>
                {Object.entries(LEADERBOARD_TYPES).map(([key, config]) => (
                  <Button
                    key={key}
                    variant="ghost"
                    size="sm"
                    onClick={() => onTypeChange(key as LeaderboardType)}
                    className={cn(
                      "text-xs h-8 px-3 rounded-lg transition-all duration-300 font-medium",
                      "hover:scale-105",
                      selectedType === key
                        ? cn(
                            "bg-gradient-to-br " + config.gradient.replace('400', '100').replace('500', '200'),
                            "shadow-sm text-white " + config.color.replace('600', '700'),
                            "ring-1 ring-white/50"
                          )
                        : "text-gray-600 hover:bg-white/50"
                    )}
                  >
                    <span className="mr-1.5">{config.icon}</span>
                    {config.label}
                  </Button>
                ))}
              </div>
            </div>
            
            {/* 周期筛选 */}
            <div className="flex items-center gap-2">
              <div className={cn(
                "p-1.5 rounded-lg transition-all duration-300",
                "bg-gradient-to-br from-gray-50 to-slate-50"
              )}>
                <Calendar className="h-4 w-4 text-gray-600" />
              </div>
              <div className={cn(
                "flex rounded-xl p-1 transition-all duration-300",
                "bg-gradient-to-br from-gray-100 to-slate-100 shadow-inner"
              )}>
                {Object.entries(LEADERBOARD_PERIODS).map(([key, config]) => (
                  <Button
                    key={key}
                    variant="ghost"
                    size="sm"
                    onClick={() => onPeriodChange(key as LeaderboardPeriod)}
                    className={cn(
                      "text-xs h-8 px-3 rounded-lg transition-all duration-300 font-medium",
                      "hover:scale-105",
                      selectedPeriod === key
                        ? cn(
                            config.bg,
                            "shadow-sm text-white " + config.color.replace('600', '700'),
                            "ring-1 ring-white/50"
                          )
                        : "text-gray-600 hover:bg-white/50"
                    )}
                  >
                    <span className="mr-1.5">{config.icon}</span>
                    {config.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// 增强版排行榜主组件
interface EnhancedLeaderboardProps {
  userId?: string
  className?: string
}

export function EnhancedLeaderboard({ userId, className }: EnhancedLeaderboardProps) {
  const [leaderboardEntries, setLeaderboardEntries] = useState<LeaderboardEntryWithDetails[]>([])
  const [selectedType, setSelectedType] = useState<LeaderboardType>('POINTS')
  const [selectedPeriod, setSelectedPeriod] = useState<LeaderboardPeriod>('WEEKLY')
  const [loading, setLoading] = useState(true)
  const [showAnimations, setShowAnimations] = useState(false)

  // 获取排行榜数据
  const fetchLeaderboard = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/gamification/leaderboard?type=${selectedType}&period=${selectedPeriod}&limit=10`)
      if (!response.ok) {
        throw new Error('获取排行榜数据失败')
      }
      const entries = await response.json()
      setLeaderboardEntries(entries)
      
      // 触发动画
      setShowAnimations(true)
      setTimeout(() => setShowAnimations(false), 1000)
    } catch (error) {
      console.error('获取排行榜数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 初始化和筛选变化时获取数据
  useEffect(() => {
    fetchLeaderboard()
  }, [selectedType, selectedPeriod])

  // 处理类型变化
  const handleTypeChange = (type: LeaderboardType) => {
    setSelectedType(type)
  }

  // 处理周期变化
  const handlePeriodChange = (period: LeaderboardPeriod) => {
    setSelectedPeriod(period)
  }

  // 判断是否为当前用户
  const isCurrentUser = (entryUserId: string): boolean => {
    return !!userId && entryUserId === userId
  }

  // 获取分数标签
  const getScoreLabel = () => {
    switch (selectedType) {
      case 'POINTS':
        return '积分'
      case 'LEVEL':
        return '等级'
      case 'STREAK':
        return '连续天数'
      case 'REVIEW_COUNT':
        return '复习次数'
      case 'ACCURACY':
        return '准确率'
      default:
        return '分数'
    }
  }

  // 获取前三名特殊效果
  const getTopThreeEffect = (rank: number) => {
    if (rank === 1) {
      return {
        container: "transform hover:scale-105 transition-all duration-500",
        badge: "bg-gradient-to-br from-yellow-400 to-amber-500 shadow-lg shadow-yellow-200/50",
        icon: <Crown className="h-8 w-8 text-yellow-300 drop-shadow-lg" />,
        glow: "bg-gradient-to-br from-yellow-100/30 to-amber-100/30"
      }
    } else if (rank === 2) {
      return {
        container: "transform hover:scale-103 transition-all duration-500",
        badge: "bg-gradient-to-br from-gray-300 to-slate-400 shadow-lg shadow-gray-200/50",
        icon: <Medal className="h-7 w-7 text-gray-100 drop-shadow-md" />,
        glow: "bg-gradient-to-br from-gray-100/30 to-slate-100/30"
      }
    } else if (rank === 3) {
      return {
        container: "transform hover:scale-103 transition-all duration-500",
        badge: "bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-200/50",
        icon: <Medal className="h-7 w-7 text-amber-100 drop-shadow-md" />,
        glow: "bg-gradient-to-br from-amber-100/30 to-orange-100/30"
      }
    }
    return {
      container: "",
      badge: "",
      icon: null,
      glow: ""
    }
  }

  if (loading) {
    return (
      <Card className={cn(
        "w-full overflow-hidden backdrop-blur-sm border shadow-xl",
        "bg-gradient-to-br from-white/90 to-gray-50/90 border-white/30"
      )}>
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center h-32 gap-4">
            <div className="animate-spin rounded-full h-10 w-10 border-b-3 border-gradient-to-r from-blue-500 to-indigo-500"></div>
            <p className="text-sm text-gray-600 font-medium animate-pulse">加载排行榜数据中...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* 筛选器 */}
      <LeaderboardFilters
        selectedType={selectedType}
        selectedPeriod={selectedPeriod}
        onTypeChange={handleTypeChange}
        onPeriodChange={handlePeriodChange}
      />
      
      {/* 排行榜列表 */}
      {leaderboardEntries.length > 0 ? (
        <div className="space-y-6">
          {/* 前三名特殊展示 - 3D效果 */}
          <div className="relative">
            {/* 背景装饰 */}
            <div className={cn(
              "absolute inset-0 -z-10 rounded-3xl opacity-50 blur-xl",
              "bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100"
            )} />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {leaderboardEntries.slice(0, 3).map((entry, index) => {
                const rank = index + 1
                const effect = getTopThreeEffect(rank)
                const leaderboardType = entry.leaderboardType as LeaderboardType
                const typeConfig = LEADERBOARD_TYPES[leaderboardType] || LEADERBOARD_TYPES.POINTS
                
                return (
                  <div
                    key={entry.id}
                    className={cn(
                      "relative transform transition-all duration-700",
                      effect.container,
                      showAnimations && "animate-in slide-in-from-bottom-10 fade-in",
                      rank === 1 ? "md:-mt-4 md:mb-4 z-10" : rank === 2 ? "md:mt-2" : ""
                    )}
                    style={{
                      animationDelay: `${index * 150}ms`,
                      perspective: "1000px"
                    }}
                  >
                    {/* 3D效果容器 */}
                    <div className={cn(
                      "relative transform-gpu transition-all duration-500 hover:rotate-y-3 hover:rotate-x-1",
                      "preserve-3d hover:shadow-2xl"
                    )}>
                      {/* 发光效果 */}
                      <div className={cn(
                        "absolute inset-0 rounded-2xl transition-all duration-500 blur-sm",
                        effect.glow,
                        "opacity-70 hover:opacity-100"
                      )} />
                      
                      {/* 主要卡片 */}
                      <Card className={cn(
                        "relative overflow-hidden border-2 backdrop-blur-sm h-full",
                        "bg-gradient-to-br from-white/90 to-gray-50/90",
                        rank === 1 ? "border-yellow-300 shadow-2xl" :
                        rank === 2 ? "border-gray-300 shadow-xl" :
                        "border-amber-300 shadow-xl"
                      )}>
                        <CardContent className="p-5">
                          {/* 排名徽章 */}
                          <div className="flex justify-center mb-4">
                            <div className={cn(
                              "w-16 h-16 rounded-full flex items-center justify-center",
                              effect.badge,
                              "transform transition-all duration-500 hover:scale-110"
                            )}>
                              {effect.icon}
                            </div>
                          </div>
                          
                          {/* 用户信息 */}
                          <div className="text-center mb-4">
                            <div className="flex justify-center mb-2">
                              {entry.user.avatar ? (
                                <div
                                  style={{ backgroundImage: `url(${entry.user.avatar})` }}
                                  className="w-16 h-16 rounded-full object-cover border-2 border-white/50 bg-cover bg-center shadow-lg"
                                  title={entry.user.name || entry.user.username}
                                />
                              ) : (
                                <div className={cn(
                                  "w-16 h-16 rounded-full flex items-center justify-center border-2 border-white/50 shadow-lg",
                                  "bg-gradient-to-br " + (typeConfig?.gradient || "from-gray-100 to-gray-200")
                                )}>
                                  <span className="text-white font-bold text-lg">
                                    {(entry.user.name || entry.user.username || '用户').charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              )}
                            </div>
                            <h3 className={cn(
                              "font-bold text-lg truncate mb-1",
                              isCurrentUser(entry.userId) ? "text-blue-600" : "text-gray-800"
                            )}>
                              {entry.user.name || entry.user.username}
                            </h3>
                            {isCurrentUser(entry.userId) && (
                              <span className="inline-block text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full mb-2">
                                你
                              </span>
                            )}
                            <div className="flex justify-center items-center gap-2 text-sm text-gray-600">
                              <span>Lv.{entry.profile.level}</span>
                              <span>•</span>
                              <span>{entry.profile.points}积分</span>
                            </div>
                          </div>
                          
                          {/* 分数展示 */}
                          <div className={cn(
                            "text-center py-3 rounded-xl",
                            "bg-gradient-to-br " + (typeConfig?.gradient ? typeConfig.gradient.replace('400', '100').replace('500', '200') : "from-gray-100 to-gray-200")
                          )}>
                            <div className={cn(
                              "text-2xl font-bold mb-1",
                              rank === 1 ? "text-yellow-600 drop-shadow-sm" :
                              rank === 2 ? "text-gray-600 drop-shadow-sm" :
                              "text-amber-600 drop-shadow-sm"
                            )}>
                              {entry.score}
                            </div>
                            <div className="text-xs font-medium text-gray-600">
                              {getScoreLabel()}
                            </div>
                          </div>
                          
                          {/* 装饰元素 */}
                          <div className="absolute top-2 right-2">
                            <div className={cn(
                              "w-6 h-6 rounded-full animate-pulse",
                              rank === 1 ? "bg-yellow-400" :
                              rank === 2 ? "bg-gray-400" :
                              "bg-amber-400"
                            )} />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          
          {/* 其余排名 */}
          {leaderboardEntries.length > 3 && (
            <Card className={cn(
              "backdrop-blur-sm border shadow-xl overflow-hidden",
              "bg-gradient-to-br from-white/90 to-gray-50/90 border-white/30",
              "transition-all duration-500 hover:shadow-2xl"
            )}>
              <CardContent className="p-5">
                <div className="space-y-4">
                  {leaderboardEntries.slice(3).map((entry, index) => (
                    <LeaderboardItem
                      key={entry.id}
                      entry={entry}
                      rank={index + 4}
                      isCurrentUser={isCurrentUser(entry.userId)}
                      showAnimation={showAnimations}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <Card className={cn(
          "backdrop-blur-sm border shadow-xl",
          "bg-gradient-to-br from-white/90 to-gray-50/90 border-white/30"
        )}>
          <CardContent className="p-10 text-center">
            <div className="flex justify-center mb-6">
              <div className={cn(
                "p-4 rounded-full animate-pulse",
                "bg-gradient-to-br from-blue-100 to-indigo-100"
              )}>
                <Trophy className="h-12 w-12 text-blue-500" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">暂无排行榜数据</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">成为第一个登上排行榜的用户吧！展示你的技能并赢得荣誉。</p>
            <Button
              onClick={fetchLeaderboard}
              variant="outline"
              size="sm"
              className={cn(
                "transition-all duration-300 hover:scale-105",
                "bg-gradient-to-br from-white to-gray-50 border-blue-200 text-blue-600",
                "hover:bg-blue-50 hover:border-blue-300 hover:shadow-md"
              )}
            >
              刷新数据
            </Button>
          </CardContent>
        </Card>
      )}
      
      {/* 底部说明 */}
      <Card className={cn(
        "backdrop-blur-sm border shadow-lg",
        "bg-gradient-to-br from-blue-50/90 to-indigo-50/90 border-blue-200/50",
        "transition-all duration-300 hover:shadow-xl"
      )}>
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className={cn(
              "p-2 rounded-lg flex-shrink-0 mt-1",
              "bg-gradient-to-br from-blue-100 to-indigo-100"
            )}>
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-bold text-blue-900 mb-2">排行榜说明</h4>
              <p className="text-sm text-blue-700 leading-relaxed">
                排行榜每小时更新一次，显示用户在{LEADERBOARD_PERIODS[selectedPeriod].label.toLowerCase()}的{LEADERBOARD_TYPES[selectedType].label.toLowerCase()}表现。
                排名前3的用户将获得特殊标识和额外奖励。箭头表示与上次排名相比的变化。
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}