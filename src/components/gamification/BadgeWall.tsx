'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BadgeDetailModal } from './BadgeDetailModal'
import { BadgeShare } from './BadgeShare'
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
  Crown,
  Search,
  Share2,
  Grid,
  List,
  SortAsc,
  SortDesc
} from 'lucide-react'
import { Achievement, UserAchievement, AchievementType } from '@prisma/client'
import { cn } from '@/lib/utils'
import {
  animations,
  cardEffects,
  textEffects,
  gamificationEffects,
  gamificationUtils,
  backgroundEffects
} from '@/lib/inspira-ui'

// 徽章类别类型
type BadgeCategory = 'ALL' | 'REVIEW' | 'STREAK' | 'LEVEL' | 'POINTS' | 'CHALLENGE'

// 徽章状态类型
type BadgeStatus = 'UNLOCKED' | 'IN_PROGRESS' | 'LOCKED'

// 徽章稀有度类型
type BadgeRarity = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'

// 带有详情的用户成就类型
interface BadgeWithDetails extends Achievement {
  userAchievement?: UserAchievement
  rarity?: BadgeRarity
}

// 徽章类别配置
const BADGE_CATEGORIES: Record<BadgeCategory, { label: string; icon: React.ReactNode; color: string }> = {
  ALL: { label: '全部', icon: <Trophy className="h-4 w-4" />, color: 'text-purple-600' },
  REVIEW: { label: '复习', icon: <Target className="h-4 w-4" />, color: 'text-blue-600' },
  STREAK: { label: '连续学习', icon: <TrendingUp className="h-4 w-4" />, color: 'text-green-600' },
  LEVEL: { label: '等级', icon: <Star className="h-4 w-4" />, color: 'text-yellow-600' },
  POINTS: { label: '积分', icon: <Zap className="h-4 w-4" />, color: 'text-orange-600' },
  CHALLENGE: { label: '挑战', icon: <Award className="h-4 w-4" />, color: 'text-red-600' }
}

// 徽章状态配置
const BADGE_STATUS: Record<BadgeStatus, { label: string; color: string; bgColor: string }> = {
  UNLOCKED: { label: '已解锁', color: 'text-green-600', bgColor: 'bg-green-50' },
  IN_PROGRESS: { label: '进行中', color: 'text-blue-600', bgColor: 'bg-blue-50' },
  LOCKED: { label: '未解锁', color: 'text-gray-600', bgColor: 'bg-gray-50' }
}

// 徽章稀有度配置
const BADGE_RARITY: Record<BadgeRarity, { label: string; color: string; bgColor: string; borderColor: string }> = {
  COMMON: { 
    label: '普通', 
    color: 'text-gray-600', 
    bgColor: 'bg-gray-100', 
    borderColor: 'border-gray-300' 
  },
  RARE: { 
    label: '稀有', 
    color: 'text-blue-600', 
    bgColor: 'bg-blue-100', 
    borderColor: 'border-blue-300' 
  },
  EPIC: { 
    label: '史诗', 
    color: 'text-purple-600', 
    bgColor: 'bg-purple-100', 
    borderColor: 'border-purple-300' 
  },
  LEGENDARY: { 
    label: '传说', 
    color: 'text-yellow-600', 
    bgColor: 'bg-yellow-100', 
    borderColor: 'border-yellow-300' 
  }
}

// 徽章组件
interface BadgeProps {
  badge: BadgeWithDetails
  onClick?: () => void
  className?: string
  viewMode: 'grid' | 'list'
}

function Badge({ badge, onClick, className, viewMode }: BadgeProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isShining, setIsShining] = useState(false)
  
  const status: BadgeStatus = badge.userAchievement
    ? badge.userAchievement.progress >= 100
      ? 'UNLOCKED'
      : 'IN_PROGRESS'
    : 'LOCKED'
  
  const progress = badge.userAchievement?.progress || 0
  
  // 获取徽章类别
  const getCategory = (type: AchievementType): BadgeCategory => {
    switch (type) {
      case AchievementType.MILESTONE:
        return badge.category.toUpperCase() as BadgeCategory
      case AchievementType.SPECIAL:
        return 'CHALLENGE'
      default:
        return 'ALL'
    }
  }
  
  const category = getCategory(badge.type)
  const categoryConfig = BADGE_CATEGORIES[category]
  const statusConfig = BADGE_STATUS[status]
  
  // 根据积分确定稀有度
  const getRarity = (points: number): BadgeRarity => {
    if (points >= 500) return 'LEGENDARY'
    if (points >= 300) return 'EPIC'
    if (points >= 100) return 'RARE'
    return 'COMMON'
  }
  
  const rarity = badge.rarity || getRarity(badge.points)
  const rarityConfig = BADGE_RARITY[rarity]
  
  // 获取徽章图标
  const getBadgeIcon = () => {
    switch (category) {
      case 'REVIEW':
        return <Target className="h-6 w-6" />
      case 'STREAK':
        return <TrendingUp className="h-6 w-6" />
      case 'LEVEL':
        return <Star className="h-6 w-6" />
      case 'POINTS':
        return <Zap className="h-6 w-6" />
      case 'CHALLENGE':
        return <Award className="h-6 w-6" />
      default:
        return <Trophy className="h-6 w-6" />
    }
  }
  
  // 获取徽章颜色
  const getBadgeColors = () => {
    switch (status) {
      case 'UNLOCKED':
        return {
          icon: rarityConfig.color,
          bg: rarityConfig.bgColor,
          border: rarityConfig.borderColor,
          glow: rarity === 'LEGENDARY' ? 'rgba(255, 215, 0, 0.8)' : 
                 rarity === 'EPIC' ? 'rgba(147, 51, 234, 0.6)' : 
                 rarity === 'RARE' ? 'rgba(59, 130, 246, 0.5)' : 
                 'rgba(156, 163, 175, 0.4)',
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
  
  const colors = getBadgeColors()
  
  // 触发光泽动画
  const triggerShineAnimation = () => {
    if (status === 'UNLOCKED') {
      setIsShining(true)
      setTimeout(() => setIsShining(false), 1000)
    }
  }
  
  // 网格视图
  if (viewMode === 'grid') {
    return (
      <div
        className={cn(
          "relative group cursor-pointer transition-all duration-500 transform-gpu",
          isHovered ? "scale-105" : "scale-100",
          isShining && gamificationEffects.achievementUnlock,
          className
        )}
        style={{
          transformStyle: 'preserve-3d',
          perspective: '1000px'
        }}
        onMouseEnter={() => {
          setIsHovered(true)
          triggerShineAnimation()
        }}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onClick}
      >
        {/* 光泽效果 */}
        <div className={cn(
          "absolute inset-0 rounded-2xl transition-all duration-500 opacity-0 group-hover:opacity-100",
          "bg-gradient-to-br from-white/30 to-transparent",
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
        
        {/* 徽章主体 */}
        <Card className={cn(
          "relative overflow-hidden transition-all duration-500 h-48 rounded-2xl",
          "bg-gradient-to-br " + colors.bg,
          "border-2 " + colors.border,
          "shadow-lg hover:shadow-xl",
          "transform-gpu transition-transform duration-500",
          isHovered && "rotate-y-6 rotate-x-3",
          cardEffects["3d"]
        )}>
          <CardContent className="p-4 h-full flex flex-col relative z-10">
            {/* 头部 */}
            <div className="flex items-start justify-between mb-3">
              <div className={cn(
                "p-3 rounded-2xl transition-all duration-500",
                "bg-white/80 backdrop-blur-sm shadow-sm",
                "flex items-center justify-center",
                isHovered && "scale-110"
              )}>
                <div className={cn(colors.icon, "transition-all duration-500")}>
                  {getBadgeIcon()}
                </div>
              </div>
              
              <div className="flex flex-col gap-1">
                <div className={cn(
                  "text-xs px-2 py-1 rounded-full font-medium transition-all duration-300",
                  "bg-white/80 backdrop-blur-sm shadow-sm",
                  statusConfig.color,
                  isHovered && "scale-105"
                )}>
                  {statusConfig.label}
                </div>
                <div className={cn(
                  "text-xs px-2 py-1 rounded-full font-bold",
                  "bg-gradient-to-r from-yellow-400 to-amber-500 text-white"
                )}>
                  {rarityConfig.label}
                </div>
              </div>
            </div>
            
            {/* 内容 */}
            <div className="flex-1">
              <h3 className={cn(
                "font-bold text-sm mb-2 line-clamp-1 transition-all duration-300",
                textEffects.gradient(["var(--primary)", "var(--accent)"]),
                isHovered && "scale-105"
              )}>
                {badge.name}
              </h3>
              <p className="text-xs text-gray-700 mb-3 line-clamp-2 leading-relaxed">
                {badge.description}
              </p>
              
              <div className="flex items-center gap-2">
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
                  +{gamificationUtils.formatPoints(badge.points)}
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
                  <div className="relative w-10 h-10">
                    <div className="absolute inset-0 rounded-full bg-gray-200"></div>
                    <div 
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-1000"
                      style={{ 
                        clipPath: `inset(0 0 ${100 - progress}% 0)` 
                      }}
                    ></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className={cn(
                        "text-xs font-bold",
                        status === 'UNLOCKED' ? "text-yellow-600" : "text-gray-700"
                      )}>
                        {progress}%
                      </span>
                    </div>
                  </div>
                )}
              </div>
              
              {status === 'UNLOCKED' && badge.userAchievement?.unlockedAt && (
                <div className="flex items-center gap-1 text-xs text-gray-600 bg-white/70 px-2 py-1 rounded-full">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {new Date(badge.userAchievement.unlockedAt).toLocaleDateString()}
                  </span>
                </div>
              )}
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
        
        {/* 光泽动画效果 */}
        {isShining && (
          <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
            <div className="text-4xl animate-bounce text-yellow-500">
              ✨
            </div>
          </div>
        )}
      </div>
    )
  }
  
  // 列表视图
  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-500 rounded-2xl cursor-pointer",
        "bg-gradient-to-br " + colors.bg,
        "border-2 " + colors.border,
        "shadow-lg hover:shadow-xl",
        isHovered && "scale-[1.02]",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className={cn(
            "p-4 rounded-2xl transition-all duration-500",
            "bg-white/80 backdrop-blur-sm shadow-sm",
            "flex items-center justify-center",
            isHovered && "scale-110"
          )}>
            <div className={cn(colors.icon, "transition-all duration-500")}>
              {getBadgeIcon()}
            </div>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className={cn(
                "font-bold text-base transition-all duration-300",
                textEffects.gradient(["var(--primary)", "var(--accent)"]),
                isHovered && "scale-105"
              )}>
                {badge.name}
              </h3>
              
              <div className="flex gap-2">
                <div className={cn(
                  "text-xs px-2 py-1 rounded-full font-medium transition-all duration-300",
                  "bg-white/80 backdrop-blur-sm shadow-sm",
                  statusConfig.color,
                  isHovered && "scale-105"
                )}>
                  {statusConfig.label}
                </div>
                <div className={cn(
                  "text-xs px-2 py-1 rounded-full font-bold",
                  "bg-gradient-to-r from-yellow-400 to-amber-500 text-white"
                )}>
                  {rarityConfig.label}
                </div>
              </div>
            </div>
            
            <p className="text-sm text-gray-700 mb-3 line-clamp-2 leading-relaxed">
              {badge.description}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={cn(
                  "text-xs px-2 py-1 rounded-full font-medium",
                  "bg-white/70 backdrop-blur-sm",
                  categoryConfig.color
                )}>
                  {categoryConfig.label}
                </span>
                <span className={cn(
                  "text-xs px-2 py-1 rounded-full font-bold",
                  "bg-gradient-to-r from-yellow-400 to-amber-500 text-white"
                )}>
                  +{gamificationUtils.formatPoints(badge.points)}
                </span>
                
                {status !== 'LOCKED' && (
                  <div className="flex items-center gap-1">
                    <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-1000"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-600">{progress}%</span>
                  </div>
                )}
              </div>
              
              {status === 'UNLOCKED' && badge.userAchievement?.unlockedAt && (
                <div className="flex items-center gap-1 text-xs text-gray-600 bg-white/70 px-2 py-1 rounded-full">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {new Date(badge.userAchievement.unlockedAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// 徽章展示墙主组件
interface BadgeWallProps {
  className?: string
}

export function BadgeWall({ className }: BadgeWallProps) {
  const [badges, setBadges] = useState<BadgeWithDetails[]>([])
  const [allBadges, setAllBadges] = useState<Achievement[]>([])
  const [selectedCategory, setSelectedCategory] = useState<BadgeCategory>('ALL')
  const [selectedStatus, setSelectedStatus] = useState<BadgeStatus | 'ALL'>('ALL')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'points' | 'rarity'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBadge, setSelectedBadge] = useState<BadgeWithDetails | null>(null)
  const [showShareModal, setShowShareModal] = useState(false)
  const [badgeToShare, setBadgeToShare] = useState<BadgeWithDetails | null>(null)
  
  // 获取徽章数据
  const fetchBadges = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/gamification/badges')
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || '获取徽章数据失败'
        throw new Error(errorMessage)
      }
      const data = await response.json()
      setBadges(data.badges)
      setAllBadges(data.badges)
    } catch (error) {
      console.error('获取徽章数据失败:', error)
      // 设置错误状态，以便在UI中显示
      setError(error instanceof Error ? error.message : '获取徽章数据失败')
      setBadges([])
      setAllBadges([])
    } finally {
      setLoading(false)
    }
  }
  
  // 初始化数据
  useEffect(() => {
    const initializeData = async () => {
      await fetchBadges()
    }
    
    initializeData()
  }, [])
  
  // 刷新数据
  const handleRefresh = async () => {
    await fetchBadges()
  }
  
  // 打开徽章详情
  const handleBadgeClick = (badge: BadgeWithDetails) => {
    setSelectedBadge(badge)
  }
  
  // 关闭徽章详情
  const handleCloseDetail = () => {
    setSelectedBadge(null)
  }
  
  // 打开分享弹窗
  const handleShareBadge = (badge: BadgeWithDetails) => {
    setBadgeToShare(badge)
    setShowShareModal(true)
  }
  
  // 关闭分享弹窗
  const handleCloseShare = () => {
    setShowShareModal(false)
    setBadgeToShare(null)
  }
  
  // 过滤徽章
  const filteredBadges = badges.filter(badge => {
    // 搜索过滤
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      if (!badge.name.toLowerCase().includes(query) && 
          !badge.description.toLowerCase().includes(query) &&
          !badge.category.toLowerCase().includes(query)) {
        return false
      }
    }
    
    // 类别过滤
    if (selectedCategory !== 'ALL') {
      const categoryMatch = 
        (selectedCategory === 'REVIEW' && badge.category === '复习') ||
        (selectedCategory === 'STREAK' && badge.category === '连续学习') ||
        (selectedCategory === 'LEVEL' && badge.category === '等级') ||
        (selectedCategory === 'POINTS' && badge.category === '积分') ||
        (selectedCategory === 'CHALLENGE' && badge.category === '挑战')
      
      if (!categoryMatch) return false
    }
    
    // 状态过滤
    if (selectedStatus !== 'ALL') {
      const status: BadgeStatus = badge.userAchievement 
        ? badge.userAchievement.progress >= 100 
          ? 'UNLOCKED' 
          : 'IN_PROGRESS'
        : 'LOCKED'
      
      if (status !== selectedStatus) return false
    }
    
    return true
  })
  
  // 排序徽章
  const sortedBadges = [...filteredBadges].sort((a, b) => {
    let compareValue = 0
    
    switch (sortBy) {
      case 'date':
        const dateA = a.userAchievement?.unlockedAt ? new Date(a.userAchievement.unlockedAt).getTime() : 0
        const dateB = b.userAchievement?.unlockedAt ? new Date(b.userAchievement.unlockedAt).getTime() : 0
        compareValue = dateA - dateB
        break
      case 'name':
        compareValue = a.name.localeCompare(b.name)
        break
      case 'points':
        compareValue = a.points - b.points
        break
      case 'rarity':
        const rarityOrder = { 'COMMON': 1, 'RARE': 2, 'EPIC': 3, 'LEGENDARY': 4 }
        const rarityA = rarityOrder[a.rarity || 'COMMON']
        const rarityB = rarityOrder[b.rarity || 'COMMON']
        compareValue = rarityA - rarityB
        break
    }
    
    return sortOrder === 'asc' ? compareValue : -compareValue
  })
  
  // 统计数据
  const stats = {
    total: badges.length,
    unlocked: badges.filter(b => b.userAchievement?.progress !== undefined && b.userAchievement.progress >= 100).length,
    inProgress: badges.filter(b => b.userAchievement?.progress !== undefined && b.userAchievement.progress > 0 && b.userAchievement.progress < 100).length,
    locked: badges.filter(b => !b.userAchievement || b.userAchievement.progress === 0).length
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

  if (error) {
    return (
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
            "bg-gradient-to-br from-red-100 to-red-200",
            "shadow-inner"
          )}>
            <Trophy className="h-16 w-16 text-red-400" />
          </div>
          <h3 className={cn(
            "text-xl font-bold mb-3",
            textEffects.gradient(["var(--primary)", "var(--accent)"])
          )}>
            加载徽章数据失败
          </h3>
          <p className="text-gray-600 max-w-md mx-auto mb-6">
            {error}
          </p>
          <Button
            onClick={handleRefresh}
            className={cn(
              "transition-all duration-300",
              "bg-gradient-to-r from-blue-500 to-purple-500",
              "hover:from-blue-600 hover:to-purple-600",
              "text-white shadow-lg hover:shadow-xl",
              "hover:scale-105"
            )}
          >
            重试
          </Button>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <div className={cn("relative space-y-6", className)}>
      {/* 动态背景效果 */}
      <div className={cn(
        "fixed inset-0 -z-10 overflow-hidden",
        backgroundEffects.particles
      )}>
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/20 via-purple-50/10 to-pink-50/20"></div>
        {/* 浮动元素 */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '2000ms' }}></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '4000ms' }}></div>
      </div>
      
      {/* 头部统计和控制面板 */}
      <Card className={cn(
        "overflow-hidden transition-all duration-500",
        "bg-gradient-to-br from-white/90 to-white/70",
        "backdrop-blur-xl border border-white/30",
        "shadow-xl hover:shadow-2xl",
        cardEffects.glass,
        cardEffects.hover
      )}>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2 rounded-xl",
                "bg-gradient-to-br from-purple-400 to-pink-500",
                "shadow-lg transform transition-transform duration-300 hover:scale-110"
              )}>
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <h2 className={cn(
                "text-xl font-bold",
                textEffects.gradient(["var(--primary)", "var(--accent)"])
              )}>
                徽章展示墙
              </h2>
            </div>
            
            <div className="flex items-center gap-3">
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
              
              {stats.unlocked > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setBadgeToShare(null)
                    setShowShareModal(true)
                  }}
                  className={cn(
                    "text-xs transition-all duration-300",
                    "bg-white/80 backdrop-blur-sm",
                    "border border-white/30 shadow-sm hover:shadow-md",
                    "hover:bg-white hover:scale-105"
                  )}
                >
                  <Share2 className="h-3 w-3 mr-1" />
                  分享成就
                </Button>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                label: '总徽章',
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
      
      {/* 筛选器和控制面板 */}
      <Card className={cn(
        "overflow-hidden transition-all duration-500",
        "bg-gradient-to-br from-white/90 to-white/70",
        "backdrop-blur-xl border border-white/30",
        "shadow-xl hover:shadow-2xl",
        cardEffects.glass,
        cardEffects.hover
      )}>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* 搜索框 */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="搜索徽章..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(
                  "w-full pl-10 pr-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all duration-300",
                  "bg-white/80 backdrop-blur-sm",
                  "border-white/30 shadow-sm hover:shadow-md",
                  "focus:ring-blue-500 focus:border-blue-500",
                  "hover:bg-white/90"
                )}
              />
            </div>
            
            {/* 类别筛选 */}
            <div className="flex flex-wrap gap-2">
              {Object.entries(BADGE_CATEGORIES).map(([key, config]) => (
                <Button
                  key={key}
                  variant={selectedCategory === key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(key as BadgeCategory)}
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
            
            {/* 状态筛选和排序 */}
            <div className="flex items-center gap-2">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as BadgeStatus | 'ALL')}
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
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'name' | 'points' | 'rarity')}
                className={cn(
                  "text-xs border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 transition-all duration-300",
                  "bg-white/80 backdrop-blur-sm",
                  "border-white/30 shadow-sm hover:shadow-md",
                  "focus:ring-blue-500 focus:border-blue-500",
                  "hover:bg-white/90"
                )}
              >
                <option value="date">按时间</option>
                <option value="name">按名称</option>
                <option value="points">按积分</option>
                <option value="rarity">按稀有度</option>
              </select>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className={cn(
                  "text-xs transition-all duration-300",
                  "bg-white/80 backdrop-blur-sm",
                  "border border-white/30 shadow-sm hover:shadow-md",
                  "hover:scale-105 hover:bg-white/90"
                )}
              >
                {sortOrder === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />}
              </Button>
              
              <div className="flex border rounded-lg overflow-hidden">
                <Button
                  variant={viewMode === 'grid' ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    "text-xs transition-all duration-300",
                    "bg-white/80 backdrop-blur-sm",
                    "border-r border-white/30",
                    viewMode === 'grid' ? "bg-blue-500 text-white" : "hover:bg-white/90"
                  )}
                >
                  <Grid className="h-3 w-3" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={cn(
                    "text-xs transition-all duration-300",
                    "bg-white/80 backdrop-blur-sm",
                    viewMode === 'list' ? "bg-blue-500 text-white" : "hover:bg-white/90"
                  )}
                >
                  <List className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* 徽章列表 */}
      {sortedBadges.length > 0 ? (
        <div className={cn(
          viewMode === 'grid'
            ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
            : "space-y-4",
          "transition-all duration-500"
        )}>
          {sortedBadges.map((badge, index) => (
            <div
              key={badge.id}
              style={{
                animationDelay: `${index * 50}ms`,
                animationFillMode: 'both'
              }}
              className={cn(
                "animate-fade-in-up",
                animations.slideIn('up', 500)
              )}
            >
              <Badge
                badge={badge}
                onClick={() => handleBadgeClick(badge)}
                viewMode={viewMode}
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
              没有找到徽章
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              {selectedCategory === 'ALL' && selectedStatus === 'ALL' && !searchQuery
                ? '暂无徽章数据，继续努力解锁更多徽章吧！'
                : '没有符合筛选条件的徽章，请尝试其他筛选条件'}
            </p>
          </CardContent>
        </Card>
      )}
      
      {/* 徽章详情弹窗 */}
      {selectedBadge && (
        <BadgeDetailModal
          badge={selectedBadge}
          isOpen={!!selectedBadge}
          onClose={handleCloseDetail}
          onShare={() => handleShareBadge(selectedBadge)}
        />
      )}
      
      {/* 分享弹窗 */}
      {showShareModal && badgeToShare && (
        <BadgeShare
          badge={badgeToShare}
          isOpen={showShareModal}
          onClose={handleCloseShare}
        />
      )}
    </div>
  )
}