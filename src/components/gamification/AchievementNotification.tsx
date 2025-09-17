'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  CheckCircle,
  Star,
  Trophy,
  Zap,
  Award,
  X,
  Sparkles,
  Gift,
  Star as Confetti
} from 'lucide-react'
import { Achievement } from '@prisma/client'
import { cn } from '@/lib/utils'
import { CircularProgress } from './AchievementSystem'

// 成就通知类型
interface AchievementNotificationData {
  achievement: Achievement
  points: number
  timestamp: Date
  autoClose?: boolean
  duration?: number
}

// 全局通知状态管理
let globalAchievementNotifications: AchievementNotificationData[] = []
let globalAchievementListeners: ((notifications: AchievementNotificationData[]) => void)[] = []

// 添加全局通知监听器
export const addAchievementNotificationListener = (listener: (notifications: AchievementNotificationData[]) => void) => {
  globalAchievementListeners.push(listener)
  return () => {
    globalAchievementListeners = globalAchievementListeners.filter(l => l !== listener)
  }
}

// 通知所有监听器
const notifyAchievementListeners = () => {
  globalAchievementListeners.forEach(listener => listener([...globalAchievementNotifications]))
}

// 成就通知组件
interface AchievementNotificationProps {
  notification: AchievementNotificationData
  onClose: () => void
  onClaim?: () => void
}

function AchievementNotification({ notification, onClose, onClaim }: AchievementNotificationProps) {
  const [isExiting, setIsExiting] = useState(false)
  const [showConfetti, setShowConfetti] = useState(true)
  const [isClaimed, setIsClaimed] = useState(false)

  useEffect(() => {
    // 5秒后自动关闭
    const timer = setTimeout(() => {
      if (notification.autoClose !== false) {
        handleClose()
      }
    }, notification.duration || 5000)

    return () => clearTimeout(timer)
  }, [notification.autoClose, notification.duration])

  // 3秒后停止彩纸效果
  useEffect(() => {
    const confettiTimer = setTimeout(() => {
      setShowConfetti(false)
    }, 3000)

    return () => clearTimeout(confettiTimer)
  }, [])

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(() => {
      onClose()
    }, 300) // 等待退出动画完成
  }

  const handleClaim = () => {
    setIsClaimed(true)
    if (onClaim) {
      onClaim()
    }
    handleClose()
  }

  // 获取成就图标
  const getAchievementIcon = () => {
    switch (notification.achievement.category) {
      case '复习':
        return <Trophy className="h-8 w-8" />
      case '连续学习':
        return <Zap className="h-8 w-8" />
      case '等级':
        return <Star className="h-8 w-8" />
      case '积分':
        return <Gift className="h-8 w-8" />
      case '挑战':
        return <Award className="h-8 w-8" />
      default:
        return <Trophy className="h-8 w-8" />
    }
  }

  // 获取成就颜色
  const getAchievementColor = () => {
    switch (notification.achievement.category) {
      case '复习':
        return 'text-blue-600'
      case '连续学习':
        return 'text-green-600'
      case '等级':
        return 'text-yellow-600'
      case '积分':
        return 'text-orange-600'
      case '挑战':
        return 'text-red-600'
      default:
        return 'text-purple-600'
    }
  }

  // 获取成就背景色
  const getAchievementBgColor = () => {
    switch (notification.achievement.category) {
      case '复习':
        return 'bg-blue-50 border-blue-200'
      case '连续学习':
        return 'bg-green-50 border-green-200'
      case '等级':
        return 'bg-yellow-50 border-yellow-200'
      case '积分':
        return 'bg-orange-50 border-orange-200'
      case '挑战':
        return 'bg-red-50 border-red-200'
      default:
        return 'bg-purple-50 border-purple-200'
    }
  }

  const iconColor = getAchievementColor()
  const bgColor = getAchievementBgColor()

  return (
    <div className="relative">
      {/* 彩纸效果 */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 animate-bounce">
            <Confetti className="h-4 w-4 text-yellow-500" />
          </div>
          <div className="absolute top-2 right-1/4 animate-bounce" style={{ animationDelay: '0.2s' }}>
            <Confetti className="h-3 w-3 text-blue-500" />
          </div>
          <div className="absolute top-4 left-1/2 animate-bounce" style={{ animationDelay: '0.4s' }}>
            <Confetti className="h-5 w-5 text-red-500" />
          </div>
          <div className="absolute top-1 right-1/3 animate-bounce" style={{ animationDelay: '0.6s' }}>
            <Confetti className="h-4 w-4 text-green-500" />
          </div>
          <div className="absolute top-3 left-1/3 animate-bounce" style={{ animationDelay: '0.8s' }}>
            <Confetti className="h-3 w-3 text-purple-500" />
          </div>
        </div>
      )}

      {/* 通知卡片 */}
      <Card
        className={cn(
          "w-80 shadow-xl border-2 transition-all duration-300 transform",
          isExiting ? "opacity-0 scale-95 translate-x-full" : "opacity-100 scale-100 translate-x-0",
          bgColor
        )}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* 成就图标 */}
            <div className={cn(
              "flex-shrink-0 p-3 rounded-xl border-2",
              bgColor
            )}>
              <div className={iconColor}>
                {getAchievementIcon()}
              </div>
            </div>

            {/* 内容 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-gray-900 truncate">成就解锁!</h3>
                <Sparkles className="h-4 w-4 text-yellow-500 animate-pulse" />
              </div>
              <p className="text-sm font-medium text-gray-900 mb-1 truncate">
                {notification.achievement.name}
              </p>
              <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                {notification.achievement.description}
              </p>

              {/* 积分奖励 */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center gap-1">
                  <Gift className="h-3 w-3 text-yellow-500" />
                  <span className="text-xs font-medium text-yellow-600">
                    +{notification.points}积分
                  </span>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleClaim}
                  disabled={isClaimed}
                  className={cn(
                    "flex-1 text-xs",
                    isClaimed ? "bg-green-100 text-green-700" : "bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600"
                  )}
                >
                  {isClaimed ? (
                    <>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      已领取
                    </>
                  ) : (
                    <>
                      <Gift className="h-3 w-3 mr-1" />
                      领取奖励
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClose}
                  className="text-xs"
                >
                  稍后
                </Button>
              </div>
            </div>

            {/* 关闭按钮 */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="flex-shrink-0 h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// 成就通知管理器组件
export function AchievementNotificationManager() {
  const [notifications, setNotifications] = useState<AchievementNotificationData[]>([])
  const [visibleNotifications, setVisibleNotifications] = useState<Set<string>>(new Set())

  // 监听全局通知变化
  useEffect(() => {
    const handleNotificationsChange = (newNotifications: AchievementNotificationData[]) => {
      setNotifications(newNotifications)
      
      // 自动显示新通知
      const newNotificationIds = newNotifications
        .filter(n => !visibleNotifications.has(n.achievement.id))
        .map(n => n.achievement.id)
      
      if (newNotificationIds.length > 0) {
        setVisibleNotifications(prev => new Set([...prev, ...newNotificationIds]))
      }
    }

    const unsubscribe = addAchievementNotificationListener(handleNotificationsChange)
    return unsubscribe
  }, [visibleNotifications])

  // 自动关闭通知
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date()
      const notificationsToClose = notifications.filter(notification => {
        if (notification.autoClose !== false) {
          const duration = notification.duration || 5000 // 默认5秒
          return now.getTime() - notification.timestamp.getTime() > duration
        }
        return false
      })

      if (notificationsToClose.length > 0) {
        const idsToClose = notificationsToClose.map(n => n.achievement.id)
        setVisibleNotifications(prev => {
          const newSet = new Set(prev)
          idsToClose.forEach(id => newSet.delete(id))
          return newSet
        })

        // 从全局通知中移除
        globalAchievementNotifications = globalAchievementNotifications.filter(n => !idsToClose.includes(n.achievement.id))
        notifyAchievementListeners()
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [notifications])

  // 处理通知关闭
  const handleCloseNotification = (achievementId: string) => {
    setVisibleNotifications(prev => {
      const newSet = new Set(prev)
      newSet.delete(achievementId)
      return newSet
    })
    
    globalAchievementNotifications = globalAchievementNotifications.filter(n => n.achievement.id !== achievementId)
    notifyAchievementListeners()
  }

  // 处理奖励领取
  const handleClaimReward = (achievementId: string) => {
    // 这里可以添加领取奖励的逻辑
    console.log('领取成就奖励:', achievementId)
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm">
      {notifications
        .filter(notification => visibleNotifications.has(notification.achievement.id))
        .map((notification) => (
          <AchievementNotification
            key={notification.achievement.id}
            notification={notification}
            onClose={() => handleCloseNotification(notification.achievement.id)}
            onClaim={() => handleClaimReward(notification.achievement.id)}
          />
        ))}
    </div>
  )
}

// 显示成就通知的便捷函数
export const showAchievementNotification = (achievement: Achievement, points: number) => {
  const newNotification: AchievementNotificationData = {
    achievement,
    points,
    timestamp: new Date(),
    autoClose: false, // 成就通知默认不自动关闭，需要用户手动关闭
    duration: 10000 // 10秒后可以自动关闭
  }

  // 添加到全局通知列表
  globalAchievementNotifications = [...globalAchievementNotifications, newNotification]
  notifyAchievementListeners()

  // 如果浏览器通知权限已授予，显示浏览器通知
  if (typeof window !== 'undefined' && Notification.permission === "granted") {
    new Notification(`成就解锁: ${achievement.name}`, {
      body: `${achievement.description} - 获得${points}积分`,
      icon: "/favicon.ico"
    })
  }
}

// 初始化成就通知系统
export const initAchievementNotifications = () => {
  if (typeof window !== 'undefined' && Notification.permission === 'default') {
    Notification.requestPermission()
  }
}