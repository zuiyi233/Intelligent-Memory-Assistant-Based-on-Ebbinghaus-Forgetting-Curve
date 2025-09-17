'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Trophy,
  Star,
  Target,
  Zap,
  Award,
  TrendingUp,
  Filter,
  CheckCircle,
  Lock,
  Calendar,
  Sparkles,
  Crown
} from 'lucide-react'
import { Achievement, UserAchievement, AchievementType } from '@prisma/client'
import { cn } from '@/lib/utils'
import {
  animations,
  cardEffects,
  textEffects,
  gamificationEffects,
  gamificationUtils
} from '@/lib/inspira-ui'

// 成就类别类型
type AchievementCategory = 'ALL' | 'REVIEW' | 'STREAK' | 'LEVEL' | 'POINTS' | 'CHALLENGE'

// 成就状态类型
type AchievementStatus = 'UNLOCKED' | 'IN_PROGRESS' | 'LOCKED'

// 带有详情的用户成就类型
interface AchievementWithDetails extends Achievement {
  userAchievement?: UserAchievement
}

// 成就类别配置
const ACHIEVEMENT_CATEGORIES: Record<AchievementCategory, { label: string; icon: React.ReactNode; color: string }> = {
  ALL: { label: '全部', icon: <Trophy className="h-4 w-4" />, color: 'text-purple-600' },
  REVIEW: { label: '复习', icon: <Target className="h-4 w-4" />, color: 'text-blue-600' },
  STREAK: { label: '连续学习', icon: <TrendingUp className="h-4 w-4" />, color: 'text-green-600' },
  LEVEL: { label: '等级', icon: <Star className="h-4 w-4" />, color: 'text-yellow-600' },
  POINTS: { label: '积分', icon: <Zap className="h-4 w-4" />, color: 'text-orange-600' },
  CHALLENGE: { label: '挑战', icon: <Award className="h-4 w-4" />, color: 'text-red-600' }
}

// 成就状态配置
const ACHIEVEMENT_STATUS: Record<AchievementStatus, { label: string; color: string; bgColor: string }> = {
  UNLOCKED: { label: '已解锁', color: 'text-green-600', bgColor: 'bg-green-50' },
  IN_PROGRESS: { label: '进行中', color: 'text-blue-600', bgColor: 'bg-blue-50' },
  LOCKED: { label: '未解锁', color: 'text-gray-600', bgColor: 'bg-gray-50' }
}

// 增强版圆形进度条组件
interface CircularProgressProps {
  progress: number
  size?: number
  strokeWidth?: number
  className?: string
  children?: React.ReactNode
  color?: string
  animated?: boolean
}

export function CircularProgress({
  progress,
  size = 80,
  strokeWidth = 6,
  className,
  children,
  color = "var(--primary)",
  animated = true
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDasharray = `${circumference} ${circumference}`
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* 背景圆 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(0, 0, 0, 0.05)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* 进度圆 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          fill="none"
          className={cn(
            "transition-all duration-1000 ease-out",
            animated && "animate-pulse"
          )}
          strokeLinecap="round"
          style={{
            filter: "drop-shadow(0 0 3px rgba(59, 130, 246, 0.5))"
          }}
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  )
}

// 增强版成就卡片组件
interface AchievementCardProps {
  achievement: AchievementWithDetails
  onClick?: () => void
  className?: string
}

function AchievementCard({ achievement, onClick, className }: AchievementCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isFlipped, setIsFlipped] = useState(false)
  const [isUnlocking, setIsUnlocking] = useState(false)
  
  const status: AchievementStatus = achievement.userAchievement
    ? achievement.userAchievement.progress >= 100
      ? 'UNLOCKED'
      : 'IN_PROGRESS'
    : 'LOCKED'
  
  const progress = achievement.userAchievement?.progress || 0
  
  // 获取成就类别
  const getCategory = (type: AchievementType): AchievementCategory => {
    switch (type) {
      case AchievementType.MILESTONE:
        return achievement.category.toUpperCase() as AchievementCategory
      case AchievementType.SPECIAL:
        return 'CHALLENGE'
      default:
        return 'ALL'
    }
  }
  
  const category = getCategory(achievement.type)
  const categoryConfig = ACHIEVEMENT_CATEGORIES[category]
  const statusConfig = ACHIEVEMENT_STATUS[status]
  
  // 获取成就图标
  const getAchievementIcon = () => {
    switch (category) {
      case 'REVIEW':
        return <Target className="h-8 w-8" />
      case 'STREAK':
        return <TrendingUp className="h-8 w-8" />
      case 'LEVEL':
        return <Star className="h-8 w-8" />
      case 'POINTS':
        return <Zap className="h-8 w-8" />
      case 'CHALLENGE':
        return <Award className="h-8 w-8" />
      default:
        return <Trophy className="h-8 w-8" />
    }
  }
  
  // 获取成就颜色
  const getAchievementColors = () => {
    switch (status) {
      case 'UNLOCKED':
        return {
          icon: 'text-yellow-500',
          bg: 'from-yellow-100 to-amber-100',
          border: 'border-yellow-300',
          glow: 'rgba(255, 215, 0, 0.5)',
          progress: 'var(--warning)'
        }
      case 'IN_PROGRESS':
        return {
          icon: 'text-blue-500',
          bg: 'from-blue-100 to-indigo-100',
          border: 'border-blue-300',
          glow: 'rgba(59, 130, 246, 0.5)',
          progress: 'var(--primary)'
        }
      case 'LOCKED':
        return {
          icon: 'text-gray-400',
          bg: 'from-gray-100 to-slate-100',
          border: 'border-gray-200',
          glow: 'rgba(156, 163, 175, 0.3)',
          progress: 'var(--muted)'
        }
    }
  }
  
  const colors = getAchievementColors()
  
  // 模拟解锁动画
  const triggerUnlockAnimation = () => {
    if (status === 'UNLOCKED' && !isUnlocking) {
      setIsUnlocking(true)
      setTimeout(() => setIsUnlocking(false), 2000)
    }
  }
  
  return (
    <div
      className={cn(
        "relative group cursor-pointer transition-all duration-500 transform-gpu",
        isHovered ? "scale-105" : "scale-100",
        isUnlocking && gamificationEffects.achievementUnlock,
        className
      )}
      style={{
        transformStyle: 'preserve-3d',
        perspective: '1000px'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => {
        setIsFlipped(!isFlipped)
        triggerUnlockAnimation()
      }}
    >
      {/* 3D 光泽效果 */}
      <div className={cn(
        "absolute inset-0 rounded-2xl transition-all duration-500 opacity-0 group-hover:opacity-100",
        "bg-gradient-to-br from-white/20 to-transparent",
        "pointer-events-none"
      )} />
      
      {/* 发光边框效果 */}
      <div
        className={cn(
          "absolute inset-0 rounded-2xl transition-all duration-500 opacity-0 group-hover:opacity-100",
          "pointer-events-none"
        )}
        style={{
          boxShadow: `0 0 20px ${colors.glow}, inset 0 0 20px ${colors.glow}20`
        }}
      />
      
      {/* 卡片主体 - 应用Inspira UI 3D卡片效果 */}
      <Card className={cn(
        "relative overflow-hidden transition-all duration-500 h-52 rounded-2xl",
        "bg-gradient-to-br " + colors.bg,
        "border-2 " + colors.border,
        "shadow-lg hover:shadow-xl",
        "transform-gpu transition-transform duration-500",
        isHovered && "rotate-y-6 rotate-x-3",
        cardEffects["3d"]
      )}>
        <CardContent className="p-4 h-full flex flex-col relative z-10">
          {/* 卡片正面 */}
          <div className={cn(
            "flex flex-col h-full transition-all duration-500 backface-hidden",
            isFlipped && "opacity-0 rotate-y-180 absolute inset-0"
          )}>
            {/* 头部 */}
            <div className="flex items-start justify-between mb-3">
              <div className={cn(
                "p-3 rounded-2xl transition-all duration-500",
                "bg-white/80 backdrop-blur-sm",
                "shadow-sm hover:shadow-md",
                "flex items-center justify-center",
                isHovered && "scale-110"
              )}>
                <div className={cn(colors.icon, "transition-all duration-500")}>
                  {getAchievementIcon()}
                </div>
              </div>
              
              <div className={cn(
                "text-xs px-3 py-1.5 rounded-full font-medium transition-all duration-300",
                "bg-white/80 backdrop-blur-sm shadow-sm",
                statusConfig.color,
                isHovered && "scale-105"
              )}>
                {statusConfig.label}
              </div>
            </div>
            
            {/* 内容 */}
            <div className="flex-1">
              <h3 className={cn(
                "font-bold text-base mb-2 line-clamp-1 transition-all duration-300",
                textEffects.gradient(["var(--primary)", "var(--accent)"]),
                isHovered && "scale-105"
              )}>
                {achievement.name}
              </h3>
              <p className="text-sm text-gray-700 mb-3 line-clamp-2 leading-relaxed">
                {achievement.description}
              </p>
              
              <div className="flex items-center gap-2 mb-3">
                <span className={cn(
                  "text-xs px-2 py-1 rounded-full font-medium",
                  "bg-white/70 backdrop-blur-sm",
                  categoryConfig.color
                )}>
                  {categoryConfig.label}
                </span>
                <span className="text-xs text-gray-500">•</span>
                <span className={cn(
                  "text-xs px-2 py-1 rounded-full font-bold",
                  "bg-gradient-to-r from-yellow-400 to-amber-500 text-white"
                )}>
                  +{gamificationUtils.formatPoints(achievement.points)}
                </span>
              </div>
            </div>
            
            {/* 底部进度 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {status === 'LOCKED' ? (
                  <div className="p-2 rounded-full bg-gray-200/50">
                    <Lock className="h-4 w-4 text-gray-500" />
                  </div>
                ) : (
                  <CircularProgress
                    progress={progress}
                    size={40}
                    strokeWidth={4}
                    color={colors.progress}
                    animated={status === 'IN_PROGRESS'}
                  >
                    <span className={cn(
                      "text-xs font-bold",
                      status === 'UNLOCKED' ? "text-yellow-600" : "text-gray-700"
                    )}>
                      {progress}%
                    </span>
                  </CircularProgress>
                )}
              </div>
              
              {status === 'UNLOCKED' && achievement.userAchievement?.unlockedAt && (
                <div className="flex items-center gap-1 text-xs text-gray-600 bg-white/70 px-2 py-1 rounded-full">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {new Date(achievement.userAchievement.unlockedAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* 卡片背面 - 详细信息 */}
          <div className={cn(
            "flex flex-col h-full p-2 transition-all duration-500 backface-hidden",
            !isFlipped && "opacity-0 rotate-y-180 absolute inset-0"
          )}>
            <div className="text-center mb-3">
              <h3 className={cn(
                "font-bold text-base mb-2",
                textEffects.gradient(["var(--primary)", "var(--accent)"])
              )}>
                {achievement.name}
              </h3>
              <div className={cn(
                "w-16 h-1.5 mx-auto rounded-full",
                "bg-gradient-to-r from-blue-500 to-purple-500"
              )} />
            </div>
            
            <div className="flex-1 text-sm text-gray-700 space-y-2 bg-white/50 p-3 rounded-xl backdrop-blur-sm">
              <p className="flex justify-between">
                <span className="font-medium text-gray-900">类别：</span>
                <span className={cn("font-medium", categoryConfig.color)}>
                  {categoryConfig.label}
                </span>
              </p>
              <p className="flex justify-between">
                <span className="font-medium text-gray-900">积分：</span>
                <span className={cn(
                  "font-bold bg-gradient-to-r from-yellow-400 to-amber-500 text-transparent bg-clip-text"
                )}>
                  +{gamificationUtils.formatPoints(achievement.points)}
                </span>
              </p>
              <p className="text-gray-900">
                <span className="font-medium">条件：</span>
                <span className="text-gray-700 ml-1">{achievement.condition}</span>
              </p>
              {status === 'UNLOCKED' && achievement.userAchievement?.unlockedAt && (
                <p className="text-gray-900">
                  <span className="font-medium">解锁时间：</span>
                  <span className="text-gray-700 ml-1">
                    {new Date(achievement.userAchievement.unlockedAt).toLocaleDateString()}
                  </span>
                </p>
              )}
            </div>
            
            <div className="text-center mt-3">
              <span className="text-xs text-gray-600 bg-white/70 px-3 py-1.5 rounded-full inline-block">
                点击返回
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* 悬停效果 */}
      {isHovered && status === 'UNLOCKED' && (
        <div className="absolute -top-2 -right-2 z-20">
          <div className="relative">
            <Sparkles className="h-6 w-6 text-yellow-500 animate-ping absolute" />
            <Crown className="h-6 w-6 text-yellow-500 relative animate-bounce" />
          </div>
        </div>
      )}
      
      {/* 解锁动画效果 */}
      {isUnlocking && (
        <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
          <div className="text-4xl animate-bounce text-yellow-500">
            🎉
          </div>
        </div>
      )}
    </div>
  )
}

// 成就系统主组件
interface AchievementSystemProps {
  userId: string
  achievements?: AchievementWithDetails[]
  onRefresh?: () => Promise<void>
  className?: string
}

export function AchievementSystem({ userId, achievements: externalAchievements, onRefresh, className }: AchievementSystemProps) {
  const [achievements, setAchievements] = useState<AchievementWithDetails[]>(externalAchievements || [])
  const [allAchievements, setAllAchievements] = useState<Achievement[]>([])
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory>('ALL')
  const [loading, setLoading] = useState(!externalAchievements)
  const [selectedStatus, setSelectedStatus] = useState<AchievementStatus | 'ALL'>('ALL')
  
  // 获取所有成就
  const fetchAllAchievements = async () => {
    try {
      const response = await fetch('/api/gamification/achievements/all')
      if (!response.ok) {
        throw new Error('获取成就列表失败')
      }
      const data = await response.json()
      setAllAchievements(data)
    } catch (error) {
      console.error('获取成就列表失败:', error)
    }
  }
  
  // 获取用户成就
  const fetchUserAchievements = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/gamification/achievements?userId=${userId}`)
      if (!response.ok) {
        throw new Error('获取用户成就失败')
      }
      const userAchievements = await response.json()
      
      // 合并所有成就和用户成就
      const mergedAchievements = allAchievements.map(achievement => {
        const userAchievement = userAchievements.find((ua: UserAchievement) => ua.achievementId === achievement.id)
        return {
          ...achievement,
          userAchievement
        }
      })
      
      setAchievements(mergedAchievements)
    } catch (error) {
      console.error('获取用户成就失败:', error)
    } finally {
      setLoading(false)
    }
  }
  
  // 初始化数据
  useEffect(() => {
    const initializeData = async () => {
      if (!externalAchievements) {
        await fetchAllAchievements()
      }
    }
    
    initializeData()
  }, [])
  
  // 当所有成就数据加载完成后，获取用户成就
  useEffect(() => {
    if (allAchievements.length > 0 && !externalAchievements) {
      fetchUserAchievements()
    }
  }, [allAchievements, externalAchievements])
  
  // 如果有外部传入的成就数据，直接使用
  useEffect(() => {
    if (externalAchievements) {
      setAchievements(externalAchievements)
      setLoading(false)
    }
  }, [externalAchievements])
  
  // 刷新数据
  const handleRefresh = async () => {
    if (onRefresh) {
      await onRefresh()
    } else {
      await fetchUserAchievements()
    }
  }
  
  // 过滤成就
  const filteredAchievements = achievements.filter(achievement => {
    // 类别过滤
    if (selectedCategory !== 'ALL') {
      const categoryMatch = 
        (selectedCategory === 'REVIEW' && achievement.category === '复习') ||
        (selectedCategory === 'STREAK' && achievement.category === '连续学习') ||
        (selectedCategory === 'LEVEL' && achievement.category === '等级') ||
        (selectedCategory === 'POINTS' && achievement.category === '积分') ||
        (selectedCategory === 'CHALLENGE' && achievement.category === '挑战')
      
      if (!categoryMatch) return false
    }
    
    // 状态过滤
    if (selectedStatus !== 'ALL') {
      const status: AchievementStatus = achievement.userAchievement 
        ? achievement.userAchievement.progress >= 100 
          ? 'UNLOCKED' 
          : 'IN_PROGRESS'
        : 'LOCKED'
      
      if (status !== selectedStatus) return false
    }
    
    return true
  })
  
  // 统计数据
  const stats = {
    total: achievements.length,
    unlocked: achievements.filter(a => a.userAchievement?.progress !== undefined && a.userAchievement.progress >= 100).length,
    inProgress: achievements.filter(a => a.userAchievement?.progress !== undefined && a.userAchievement.progress > 0 && a.userAchievement.progress < 100).length,
    locked: achievements.filter(a => !a.userAchievement || a.userAchievement.progress === 0).length
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
  
  // 动态背景效果组件
  const DynamicBackground = () => (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 opacity-50" />
      <div className="absolute top-0 left-0 w-full h-full">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-gradient-to-r from-blue-200 to-purple-200 opacity-20"
            style={{
              width: `${Math.random() * 100 + 50}px`,
              height: `${Math.random() * 100 + 50}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 10 + 10}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div>
    </div>
  )

  return (
    <div className={cn("relative min-h-screen", className)}>
      <DynamicBackground />
      <div className="relative z-10 space-y-6">
      {/* 头部统计 - 应用Inspira UI卡片效果 */}
      <Card className={cn(
        "overflow-hidden transition-all duration-500",
        "bg-gradient-to-br from-white/90 to-white/70",
        "backdrop-blur-xl border border-white/30",
        "shadow-xl hover:shadow-2xl",
        cardEffects.glass,
        cardEffects.hover
      )}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2 rounded-xl",
                "bg-gradient-to-br from-yellow-400 to-amber-500",
                "shadow-lg transform transition-transform duration-300 hover:scale-110"
              )}>
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <h2 className={cn(
                "text-xl font-bold",
                textEffects.gradient(["var(--primary)", "var(--accent)"])
              )}>
                成就系统
              </h2>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className={cn(
                "text-xs transition-all duration-300",
                "bg-white/80 backdrop-blur-sm",
                "border border-white/30 shadow-sm hover:shadow-md",
                "hover:bg-white hover:scale-105"
              )}
            >
              刷新
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                label: '总成就',
                value: stats.total,
                color: 'text-gray-700',
                bgColor: 'from-gray-100 to-gray-200',
                icon: <Trophy className="h-5 w-5" />
              },
              {
                label: '已解锁',
                value: stats.unlocked,
                color: 'text-green-700',
                bgColor: 'from-green-100 to-emerald-200',
                icon: <CheckCircle className="h-5 w-5" />
              },
              {
                label: '进行中',
                value: stats.inProgress,
                color: 'text-blue-700',
                bgColor: 'from-blue-100 to-indigo-200',
                icon: <TrendingUp className="h-5 w-5" />
              },
              {
                label: '未解锁',
                value: stats.locked,
                color: 'text-gray-700',
                bgColor: 'from-gray-100 to-slate-200',
                icon: <Lock className="h-5 w-5" />
              }
            ].map((stat, index) => (
              <div
                key={index}
                className={cn(
                  "text-center p-4 rounded-2xl transition-all duration-300",
                  "bg-gradient-to-br " + stat.bgColor,
                  "shadow-sm hover:shadow-md hover:scale-105",
                  "border border-white/50"
                )}
              >
                <div className={cn(
                  "flex items-center justify-center mb-2",
                  stat.color
                )}>
                  {stat.icon}
                </div>
                <div className={cn("text-2xl font-bold mb-1", stat.color)}>
                  {stat.value}
                </div>
                <div className="text-xs text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* 筛选器 - 应用Inspira UI设计 */}
      <Card className={cn(
        "overflow-hidden transition-all duration-500",
        "bg-gradient-to-br from-white/90 to-white/70",
        "backdrop-blur-xl border border-white/30",
        "shadow-xl hover:shadow-2xl",
        cardEffects.glass,
        cardEffects.hover
      )}>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* 类别筛选 */}
            <div className="flex flex-wrap gap-3">
              {Object.entries(ACHIEVEMENT_CATEGORIES).map(([key, config]) => (
                <Button
                  key={key}
                  variant={selectedCategory === key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(key as AchievementCategory)}
                  className={cn(
                    "text-xs transition-all duration-300",
                    "bg-white/80 backdrop-blur-sm",
                    "border border-white/30 shadow-sm hover:shadow-md",
                    "hover:scale-105 hover:bg-white/90",
                    selectedCategory === key &&
                      "bg-gradient-to-r " +
                      config.color.replace('text-', 'from-').replace('600', '-500') +
                      " to-" +
                      config.color.replace('text-', 'to-').replace('600', '-600') +
                      " text-white border-0 shadow-md"
                  )}
                >
                  <span className="mr-1">{config.icon}</span>
                  {config.label}
                </Button>
              ))}
            </div>
            
            {/* 状态筛选 */}
            <div className="flex items-center gap-2">
              <div className={cn(
                "p-2 rounded-lg",
                "bg-white/80 backdrop-blur-sm",
                "border border-white/30 shadow-sm"
              )}>
                <Filter className="h-4 w-4 text-gray-600" />
              </div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as AchievementStatus | 'ALL')}
                className={cn(
                  "text-xs border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 transition-all duration-300",
                  "bg-white/80 backdrop-blur-sm",
                  "border-white/30 shadow-sm hover:shadow-md",
                  "focus:ring-blue-500 focus:border-blue-500",
                  "hover:bg-white/90"
                )}
              >
                <option value="ALL">全部状态</option>
                <option value="UNLOCKED">已解锁</option>
                <option value="IN_PROGRESS">进行中</option>
                <option value="LOCKED">未解锁</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* 成就列表 */}
      {filteredAchievements.length > 0 ? (
        <div className={cn(
          "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6",
          "transition-all duration-500"
        )}>
          {filteredAchievements.map((achievement, index) => (
            <div
              key={achievement.id}
              style={{
                animationDelay: `${index * 100}ms`,
                animationFillMode: 'both'
              }}
              className={cn(
                "animate-fade-in-up",
                animations.slideIn('up', 500)
              )}
            >
              <AchievementCard
                achievement={achievement}
              />
            </div>
          ))}
        </div>
      ) : (
        <Card className={cn(
          "overflow-hidden transition-all duration-500",
          "bg-gradient-to-br from-white/90 to-white/70",
          "backdrop-blur-xl border border-white/30",
          "shadow-xl",
          cardEffects.glass
        )}>
          <CardContent className="p-12 text-center">
            <div className={cn(
              "mb-6 inline-block p-4 rounded-2xl",
              "bg-gradient-to-br from-gray-100 to-gray-200",
              "shadow-inner"
            )}>
              <Trophy className="h-16 w-16 text-gray-400" />
            </div>
            <h3 className={cn(
              "text-xl font-bold mb-3",
              textEffects.gradient(["var(--primary)", "var(--accent)"])
            )}>
              没有找到成就
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              {selectedCategory === 'ALL' && selectedStatus === 'ALL'
                ? '暂无成就数据，继续努力解锁更多成就吧！'
                : '没有符合筛选条件的成就，请尝试其他筛选条件'}
            </p>
          </CardContent>
        </Card>
      )}
      </div>
    </div>
  )
}