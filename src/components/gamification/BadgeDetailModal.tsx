'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Trophy,
  Star,
  Target,
  Zap,
  Award,
  TrendingUp,
  Calendar,
  Share2,
  X,
  CheckCircle,
  Lock,
  Clock,
  Crown,
  Sparkles
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
const BADGE_RARITY: Record<BadgeRarity, { label: string; color: string; bgColor: string; borderColor: string; glow: string }> = {
  COMMON: { 
    label: '普通', 
    color: 'text-gray-600', 
    bgColor: 'bg-gray-100', 
    borderColor: 'border-gray-300',
    glow: 'rgba(156, 163, 175, 0.4)'
  },
  RARE: { 
    label: '稀有', 
    color: 'text-blue-600', 
    bgColor: 'bg-blue-100', 
    borderColor: 'border-blue-300',
    glow: 'rgba(59, 130, 246, 0.5)'
  },
  EPIC: { 
    label: '史诗', 
    color: 'text-purple-600', 
    bgColor: 'bg-purple-100', 
    borderColor: 'border-purple-300',
    glow: 'rgba(147, 51, 234, 0.6)'
  },
  LEGENDARY: { 
    label: '传说', 
    color: 'text-yellow-600', 
    bgColor: 'bg-yellow-100', 
    borderColor: 'border-yellow-300',
    glow: 'rgba(255, 215, 0, 0.8)'
  }
}

// 徽章详情弹窗组件
interface BadgeDetailModalProps {
  badge: BadgeWithDetails
  isOpen: boolean
  onClose: () => void
  onShare: () => void
}

export function BadgeDetailModal({ badge, isOpen, onClose, onShare }: BadgeDetailModalProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  
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
        return <Target className="h-12 w-12" />
      case 'STREAK':
        return <TrendingUp className="h-12 w-12" />
      case 'LEVEL':
        return <Star className="h-12 w-12" />
      case 'POINTS':
        return <Zap className="h-12 w-12" />
      case 'CHALLENGE':
        return <Award className="h-12 w-12" />
      default:
        return <Trophy className="h-12 w-12" />
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
          glow: rarityConfig.glow
        }
      case 'IN_PROGRESS':
        return {
          icon: 'text-blue-500',
          bg: 'from-blue-100 to-indigo-100',
          border: 'border-blue-300',
          glow: 'rgba(59, 130, 246, 0.5)'
        }
      case 'LOCKED':
        return {
          icon: 'text-gray-400',
          bg: 'from-gray-100 to-slate-100',
          border: 'border-gray-200',
          glow: 'rgba(156, 163, 175, 0.3)'
        }
    }
  }
  
  const colors = getBadgeColors()
  
  // 触发动画
  const triggerAnimation = () => {
    if (status === 'UNLOCKED') {
      setIsAnimating(true)
      setTimeout(() => setIsAnimating(false), 2000)
    }
  }
  
  // 计算解锁所需进度
  const calculateProgressNeeded = () => {
    if (status === 'UNLOCKED') return 0
    if (status === 'IN_PROGRESS' && badge.userAchievement) {
      return 100 - badge.userAchievement.progress
    }
    return 100
  }
  
  const progressNeeded = calculateProgressNeeded()
  
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 背景遮罩 */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* 模态框内容 */}
      <div className={cn(
        "relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl",
        "bg-gradient-to-br from-white/90 to-white/70",
        "backdrop-blur-xl border border-white/30",
        "shadow-2xl",
        animations.fadeIn(300)
      )}>
        {/* 背景装饰 */}
        <div className={cn(
          "absolute inset-0 -z-10 overflow-hidden rounded-2xl",
          backgroundEffects.particles
        )}>
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/20 via-purple-50/10 to-pink-50/20 rounded-2xl"></div>
          {/* 浮动元素 */}
          <div className="absolute top-10 left-10 w-24 h-24 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-24 h-24 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '2000ms' }}></div>
        </div>
        
        <div className="p-6">
          {/* 头部 */}
          <div className="flex items-center justify-between mb-6">
            <h3 className={cn(
              "text-xl font-bold",
              textEffects.gradient(["var(--primary)", "var(--accent)"])
            )}>
              徽章详情
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="rounded-full p-2 hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex flex-col md:flex-row gap-6">
            {/* 徽章展示 */}
            <div className="flex-shrink-0">
              <div className="relative">
                {/* 徽章主体 */}
                <Card className={cn(
                  "relative overflow-hidden transition-all duration-500 w-48 h-48 rounded-3xl",
                  "bg-gradient-to-br " + colors.bg,
                  "border-4 " + colors.border,
                  "shadow-xl hover:shadow-2xl",
                  "flex items-center justify-center",
                  status === 'UNLOCKED' ? "animate-pulse" : "",
                  cardEffects.glass,
                  cardEffects.hover,
                  status === 'UNLOCKED' && gamificationEffects.achievementUnlock
                )}>
                  <CardContent className="p-0 flex items-center justify-center h-full">
                    <div className={cn(
                      "p-6 rounded-2xl transition-all duration-500",
                      "bg-white/80 backdrop-blur-sm shadow-lg",
                      "flex items-center justify-center",
                      "hover:scale-110"
                    )}>
                      <div className={cn(colors.icon, "transition-all duration-500 hover:scale-110")}>
                        {getBadgeIcon()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* 发光效果 */}
                {status === 'UNLOCKED' && (
                  <div
                    className="absolute inset-0 rounded-3xl pointer-events-none transition-all duration-500"
                    style={{
                      boxShadow: `0 0 30px ${colors.glow}, inset 0 0 30px ${colors.glow}20`,
                      animation: 'pulse 2s infinite'
                    }}
                  />
                )}
                
                {/* 动画效果 */}
                {isAnimating && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-6xl animate-bounce text-yellow-500">
                      ✨
                    </div>
                  </div>
                )}
                
                {/* 状态标签 */}
                <div className={cn(
                  "absolute -bottom-2 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold shadow-lg transition-all duration-300 hover:scale-105",
                  status === 'UNLOCKED'
                    ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                    : status === 'IN_PROGRESS'
                    ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
                    : "bg-gradient-to-r from-gray-500 to-slate-500 text-white"
                )}>
                  {statusConfig.label}
                </div>
                
                {/* 解锁特效 */}
                {status === 'UNLOCKED' && (
                  <>
                    <div className="absolute top-2 right-2 animate-bounce">
                      <Crown className="h-6 w-6 text-yellow-500" />
                    </div>
                    <div className="absolute -top-1 -left-1">
                      <Sparkles className="h-5 w-5 text-yellow-400 animate-ping" />
                    </div>
                  </>
                )}
              </div>
            </div>
            
            {/* 徽章信息 */}
            <div className="flex-1 space-y-4">
              {/* 标题和稀有度 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className={cn(
                    "text-2xl font-bold transition-all duration-300 hover:scale-105",
                    textEffects.gradient(["var(--primary)", "var(--accent)"])
                  )}>
                    {badge.name}
                  </h3>
                  <div className={cn(
                    "px-3 py-1 rounded-full text-xs font-bold transition-all duration-300 hover:scale-105 hover:shadow-md",
                    "bg-gradient-to-r " +
                    (rarity === 'LEGENDARY' ? 'from-yellow-400 to-amber-500' :
                     rarity === 'EPIC' ? 'from-purple-400 to-purple-600' :
                     rarity === 'RARE' ? 'from-blue-400 to-blue-600' :
                     'from-gray-400 to-gray-600') +
                    " text-white shadow-sm"
                  )}>
                    {rarityConfig.label}
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  {badge.description}
                </p>
              </div>
              
              {/* 基本信息 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">类别：</span>
                    <div className={cn(
                      "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-all duration-300 hover:scale-105 hover:shadow-md",
                      "bg-white/70 backdrop-blur-sm shadow-sm",
                      categoryConfig.color
                    )}>
                      {categoryConfig.icon}
                      {categoryConfig.label}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">积分：</span>
                    <div className={cn(
                      "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold transition-all duration-300 hover:scale-105 hover:shadow-md",
                      "bg-gradient-to-r from-yellow-400 to-amber-500 text-white shadow-sm"
                    )}>
                      +{gamificationUtils.formatPoints(badge.points)}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">状态：</span>
                    <div className={cn(
                      "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-all duration-300 hover:scale-105 hover:shadow-md",
                      statusConfig.bgColor,
                      statusConfig.color,
                      "shadow-sm"
                    )}>
                      {status === 'UNLOCKED' && <CheckCircle className="h-3 w-3" />}
                      {status === 'IN_PROGRESS' && <Clock className="h-3 w-3" />}
                      {status === 'LOCKED' && <Lock className="h-3 w-3" />}
                      {statusConfig.label}
                    </div>
                  </div>
                  
                  {badge.userAchievement?.unlockedAt && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">解锁时间：</span>
                      <div className="text-sm text-gray-900">
                        {new Date(badge.userAchievement.unlockedAt).toLocaleDateString()}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* 进度和条件 */}
              <Card className={cn(
                "overflow-hidden transition-all duration-500",
                "bg-gradient-to-br from-white/90 to-white/70",
                "backdrop-blur-xl border border-white/30",
                "shadow-lg hover:shadow-xl",
                cardEffects.glass,
                cardEffects.hover,
                animations.slideIn('up', 300)
              )}>
                <CardContent className="p-4 space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">完成进度</span>
                      <span className={cn(
                        "text-sm font-bold transition-all duration-300",
                        status === 'UNLOCKED' ? "text-green-600" : "text-gray-900"
                      )}>{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-1000",
                          status === 'UNLOCKED'
                            ? "bg-gradient-to-r from-green-500 to-emerald-500"
                            : "bg-gradient-to-r from-blue-500 to-purple-500"
                        )}
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium text-gray-900">获取条件</span>
                    <p className="text-sm text-gray-700 mt-1 transition-all duration-300">
                      {badge.condition}
                    </p>
                  </div>
                  
                  {progressNeeded > 0 && (
                    <div className={cn(
                      "p-3 rounded-xl transition-all duration-300 hover:shadow-md",
                      "bg-gradient-to-r from-blue-50 to-indigo-50",
                      "border border-blue-200"
                    )}>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-600 animate-pulse" />
                        <span className="text-sm text-blue-800">
                          还需完成 {progressNeeded}% 即可解锁此徽章
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* 底部按钮 */}
          <div className="flex justify-between mt-6 pt-4 border-t border-gray-200">
            <Button
              variant="ghost"
              onClick={onClose}
              className={cn(
                "text-gray-600 hover:text-gray-900 transition-all duration-300",
                "hover:bg-white/80 hover:scale-105 rounded-full"
              )}
            >
              关闭
            </Button>
            
            <div className="flex gap-2">
              {status === 'UNLOCKED' && (
                <Button
                  onClick={triggerAnimation}
                  className={cn(
                    "transition-all duration-300",
                    "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600",
                    "text-white hover:scale-105 shadow-lg hover:shadow-xl"
                  )}
                >
                  <Sparkles className="h-4 w-4 mr-1" />
                  展示动画
                </Button>
              )}
              
              <Button
                onClick={onShare}
                className={cn(
                  "transition-all duration-300",
                  "bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600",
                  "text-white hover:scale-105 shadow-lg hover:shadow-xl"
                )}
              >
                <Share2 className="h-4 w-4 mr-1" />
                分享徽章
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}