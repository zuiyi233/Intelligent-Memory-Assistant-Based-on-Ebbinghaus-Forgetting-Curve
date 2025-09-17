'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  CheckCircle,
  Star,
  Trophy,
  Zap,
  Target,
  Award,
  TrendingUp,
  Gift,
  X,
  Sparkles,
  Coins
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  animations,
  cardEffects,
  textEffects,
  specialEffects,
  gamificationEffects,
  gamificationUtils,
  buttonEffects
} from '@/lib/inspira-ui'
import { motion, AnimatePresence } from 'framer-motion'

// 游戏化通知类型
type GamificationNotificationType = 
  | 'POINTS_EARNED'
  | 'EXPERIENCE_GAINED'
  | 'ACHIEVEMENT_UNLOCKED'
  | 'LEVEL_UP'
  | 'CHALLENGE_COMPLETED'
  | 'STREAK_BONUS'
  | 'REWARD_CLAIMED'

// 游戏化通知数据
interface GamificationNotificationData {
  id: string
  type: GamificationNotificationType
  title: string
  message: string
  amount?: number
  timestamp: Date
  autoClose?: boolean
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

// 全局通知状态管理
let globalNotifications: GamificationNotificationData[] = []
let globalListeners: ((notifications: GamificationNotificationData[]) => void)[] = []

// 添加全局通知监听器
export const addGamificationNotificationListener = (listener: (notifications: GamificationNotificationData[]) => void) => {
  globalListeners.push(listener)
  return () => {
    globalListeners = globalListeners.filter(l => l !== listener)
  }
}

// 通知所有监听器
const notifyListeners = () => {
  globalListeners.forEach(listener => listener([...globalNotifications]))
}

// 通知配置 - 应用Inspira UI设计原则
interface NotificationConfig {
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  animation: ReturnType<typeof animations.slideIn>;
  particleType: 'confetti' | 'stars' | 'sparkles' | 'waves';
  cardEffect: React.CSSProperties;
  specialEffect: React.CSSProperties;
}

const NOTIFICATION_CONFIG: Record<GamificationNotificationType, NotificationConfig> = {
  POINTS_EARNED: {
    icon: <Coins className="h-6 w-6" />,
    color: 'text-yellow-500',
    bgColor: 'bg-gradient-to-br from-yellow-50 to-amber-50',
    borderColor: 'border-yellow-200',
    animation: animations.slideIn('right', 400),
    particleType: 'sparkles',
    cardEffect: cardEffects.glowBorder('rgba(245, 158, 11, 0.5)'),
    specialEffect: specialEffects.sparkle('rgba(245, 158, 11, 0.8)')
  },
  EXPERIENCE_GAINED: {
    icon: <Zap className="h-6 w-6" />,
    color: 'text-blue-500',
    bgColor: 'bg-gradient-to-br from-blue-50 to-sky-50',
    borderColor: 'border-blue-200',
    animation: animations.slideIn('right', 400),
    particleType: 'stars',
    cardEffect: cardEffects.glowBorder('rgba(59, 130, 246, 0.5)'),
    specialEffect: specialEffects.beam('rgba(59, 130, 246, 0.8)')
  },
  ACHIEVEMENT_UNLOCKED: {
    icon: <Trophy className="h-6 w-6" />,
    color: 'text-purple-500',
    bgColor: 'bg-gradient-to-br from-purple-50 to-violet-50',
    borderColor: 'border-purple-200',
    animation: animations.bounce(500),
    particleType: 'confetti',
    cardEffect: cardEffects.glowBorder('rgba(139, 92, 246, 0.5)'),
    specialEffect: specialEffects.confetti
  },
  LEVEL_UP: {
    icon: <TrendingUp className="h-6 w-6" />,
    color: 'text-green-500',
    bgColor: 'bg-gradient-to-br from-green-50 to-emerald-50',
    borderColor: 'border-green-200',
    animation: animations.scaleIn(400),
    particleType: 'confetti',
    cardEffect: cardEffects.glowBorder('rgba(16, 185, 129, 0.5)'),
    specialEffect: gamificationEffects.levelUp
  },
  CHALLENGE_COMPLETED: {
    icon: <Target className="h-6 w-6" />,
    color: 'text-red-500',
    bgColor: 'bg-gradient-to-br from-red-50 to-rose-50',
    borderColor: 'border-red-200',
    animation: animations.slideIn('right', 400),
    particleType: 'stars',
    cardEffect: cardEffects.glowBorder('rgba(239, 68, 68, 0.5)'),
    specialEffect: specialEffects.beam('rgba(239, 68, 68, 0.8)')
  },
  STREAK_BONUS: {
    icon: <TrendingUp className="h-6 w-6" />,
    color: 'text-orange-500',
    bgColor: 'bg-gradient-to-br from-orange-50 to-amber-50',
    borderColor: 'border-orange-200',
    animation: animations.slideIn('right', 400),
    particleType: 'sparkles',
    cardEffect: cardEffects.glowBorder('rgba(249, 115, 22, 0.5)'),
    specialEffect: specialEffects.sparkle('rgba(249, 115, 22, 0.8)')
  },
  REWARD_CLAIMED: {
    icon: <Gift className="h-6 w-6" />,
    color: 'text-indigo-500',
    bgColor: 'bg-gradient-to-br from-indigo-50 to-violet-50',
    borderColor: 'border-indigo-200',
    animation: animations.bounce(500),
    particleType: 'confetti',
    cardEffect: cardEffects.glowBorder('rgba(99, 102, 241, 0.5)'),
    specialEffect: specialEffects.confetti
  }
}

// 增强粒子效果组件 - 应用Inspira UI动画系统
interface ParticleEffectProps {
  type: 'confetti' | 'stars' | 'sparkles' | 'waves'
  color?: string
  count?: number
  duration?: number
}

function ParticleEffect({ type, color = 'text-yellow-500', count = 20, duration = 2000 }: ParticleEffectProps) {
  const particles = Array.from({ length: count }, (_, i) => i)
  const containerRef = useRef<HTMLDivElement>(null)
  
  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
      <AnimatePresence>
        {particles.map((i) => {
          const angle = (i / count) * Math.PI * 2
          const distance = 50 + Math.random() * 100
          const size = type === 'confetti' ? 8 : type === 'stars' ? 6 : 4
          
          return (
            <motion.div
              key={i}
              className={cn(
                "absolute rounded-full",
                color
              )}
              style={{
                width: `${size}px`,
                height: `${size}px`,
                top: '50%',
                left: '50%',
              }}
              initial={{
                opacity: 0,
                scale: 0,
                x: 0,
                y: 0
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0.5],
                x: Math.cos(angle) * distance,
                y: Math.sin(angle) * distance,
                rotate: type === 'confetti' ? 360 : 0
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: duration / 1000,
                delay: i * 0.05,
                ease: "easeOut"
              }}
            >
              {type === 'stars' && <Star className="w-full h-full fill-current" />}
              {type === 'sparkles' && <Sparkles className="w-full h-full fill-current" />}
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}

// 增强通知项组件 - 应用Inspira UI设计原则
interface NotificationItemProps {
  notification: GamificationNotificationData
  onClose: () => void
}

function NotificationItem({ notification, onClose }: NotificationItemProps) {
  const [isExiting, setIsExiting] = useState(false)
  const [showParticles, setShowParticles] = useState(true)
  const [isHovered, setIsHovered] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  
  const config = NOTIFICATION_CONFIG[notification.type]
  
  // 入场动画
  useEffect(() => {
    setIsVisible(true)
  }, [])
  
  // 自动关闭
  useEffect(() => {
    if (notification.autoClose !== false) {
      const timer = setTimeout(() => {
        handleClose()
      }, notification.duration || 5000)
      
      return () => clearTimeout(timer)
    }
  }, [notification.autoClose, notification.duration])
  
  // 停止粒子效果
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowParticles(false)
    }, 3000)
    
    return () => clearTimeout(timer)
  }, [])
  
  const handleClose = () => {
    setIsExiting(true)
    setTimeout(() => {
      onClose()
    }, 500)
  }
  
  // 获取粒子颜色
  const getParticleColor = () => {
    switch (notification.type) {
      case 'POINTS_EARNED':
        return 'text-yellow-500'
      case 'EXPERIENCE_GAINED':
        return 'text-blue-500'
      case 'ACHIEVEMENT_UNLOCKED':
        return 'text-purple-500'
      case 'LEVEL_UP':
        return 'text-green-500'
      case 'CHALLENGE_COMPLETED':
        return 'text-red-500'
      case 'STREAK_BONUS':
        return 'text-orange-500'
      case 'REWARD_CLAIMED':
        return 'text-indigo-500'
      default:
        return 'text-yellow-500'
    }
  }
  
  return (
    <div className="relative">
      {/* 粒子效果 */}
      {showParticles && (
        <ParticleEffect
          type={config.particleType}
          color={getParticleColor()}
          count={25}
          duration={2000}
        />
      )}
      
      {/* 通知卡片 - 应用Inspira UI卡片效果 */}
      <motion.div
        initial={config.animation.initial}
        animate={isVisible ? config.animation.animate : {}}
        exit={{
          opacity: 0,
          x: 300,
          scale: 0.8,
          transition: { duration: 0.5 }
        }}
        className="relative"
      >
        <Card
          className={cn(
            "w-80 overflow-hidden transition-all duration-300 backdrop-blur-sm",
            "bg-white/80 dark:bg-gray-900/80",
            config.borderColor,
            config.bgColor,
            config.cardEffect,
            isHovered && "shadow-2xl scale-[1.02] translate-y-[-2px]"
          )}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={config.specialEffect}
        >
          <CardContent className="p-4 relative">
            {/* Inspira UI光泽效果 */}
            <div className={cn(
              "absolute inset-0 pointer-events-none overflow-hidden",
              cardEffects.shimmer(true).position,
              cardEffects.shimmer(true).overflow
            )}>
              <div className={cn(
                "absolute top-0 left-[-100px] w-[50px] h-full",
                "bg-gradient-to-r from-transparent via-white/20 to-transparent",
                "animate-[shimmer_2s_infinite]"
              )} />
            </div>
            
            <div className="flex items-start gap-3 relative z-10">
              {/* 图标 - 应用Inspira UI动画效果 */}
              <motion.div
                className={cn(
                  "flex-shrink-0 p-3 rounded-xl backdrop-blur-sm",
                  "bg-white/60 dark:bg-gray-800/60",
                  "border border-white/20 dark:border-gray-700/20"
                )}
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className={config.color}
                  animate={isHovered ? { scale: 1.2, rotate: 10 } : {}}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  {config.icon}
                </motion.div>
              </motion.div>
              
              {/* 内容 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <motion.h3
                    className="font-bold text-gray-900 dark:text-gray-100 truncate"
                    style={textEffects.gradient(['var(--primary)', 'var(--accent)'])}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    {notification.title}
                  </motion.h3>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4, type: "spring" }}
                  >
                    <Sparkles className="h-4 w-4 text-yellow-500 animate-pulse" />
                  </motion.div>
                </div>
                
                <motion.p
                  className="text-sm text-gray-600 dark:text-gray-300 mb-2 line-clamp-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {notification.message}
                </motion.p>
                
                {/* 数值显示 - 应用Inspira UI动画效果 */}
                {notification.amount !== undefined && (
                  <motion.div
                    className="flex items-center gap-1 mb-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <motion.div
                      className={cn(
                        "text-lg font-bold",
                        config.color
                      )}
                      initial={{ scale: 0.5 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5, type: "spring" }}
                    >
                      +{gamificationUtils.formatPoints(notification.amount)}
                    </motion.div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {notification.type === 'POINTS_EARNED' && '积分'}
                      {notification.type === 'EXPERIENCE_GAINED' && '经验值'}
                      {notification.type === 'LEVEL_UP' && '等级'}
                    </div>
                  </motion.div>
                )}
                
                {/* 操作按钮 - 应用Inspira UI按钮效果 */}
                <motion.div
                  className="flex gap-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  {notification.action && (
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        size="sm"
                        onClick={notification.action.onClick}
                        className={cn(
                          "text-xs backdrop-blur-sm",
                          "bg-white/60 dark:bg-gray-800/60",
                          "border border-white/20 dark:border-gray-700/20",
                          buttonEffects.glowBorder(config.color.replace('text-', 'rgba(').replace('500', ', 0.5)')) as React.CSSProperties
                        )}
                      >
                        {notification.action.label}
                      </Button>
                    </motion.div>
                  )}
                  
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClose}
                      className={cn(
                        "text-xs backdrop-blur-sm",
                        "bg-white/60 dark:bg-gray-800/60",
                        "border border-white/20 dark:border-gray-700/20"
                      )}
                    >
                      知道了
                    </Button>
                  </motion.div>
                </motion.div>
              </div>
              
              {/* 关闭按钮 - 应用Inspira UI动画效果 */}
              <motion.div
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  className="flex-shrink-0 h-6 w-6 p-0 text-gray-400 hover:text-gray-600 backdrop-blur-sm"
                >
                  <X className="h-4 w-4" />
                </Button>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

// 增强版游戏化通知管理器组件 - 应用Inspira UI布局和动画
export function EnhancedGamificationNotifications() {
  const [notifications, setNotifications] = useState<GamificationNotificationData[]>([])
  const [visibleNotifications, setVisibleNotifications] = useState<Set<string>>(new Set())

  // 监听全局通知变化
  useEffect(() => {
    const handleNotificationsChange = (newNotifications: GamificationNotificationData[]) => {
      setNotifications(newNotifications)
      
      // 自动显示新通知
      const newNotificationIds = newNotifications
        .filter(n => !visibleNotifications.has(n.id))
        .map(n => n.id)
      
      if (newNotificationIds.length > 0) {
        setVisibleNotifications(prev => new Set([...prev, ...newNotificationIds]))
      }
    }

    const unsubscribe = addGamificationNotificationListener(handleNotificationsChange)
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
        const idsToClose = notificationsToClose.map(n => n.id)
        setVisibleNotifications(prev => {
          const newSet = new Set(prev)
          idsToClose.forEach(id => newSet.delete(id))
          return newSet
        })

        // 从全局通知中移除
        globalNotifications = globalNotifications.filter(n => !idsToClose.includes(n.id))
        notifyListeners()
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [notifications])

  // 处理通知关闭
  const handleCloseNotification = (notificationId: string) => {
    setVisibleNotifications(prev => {
      const newSet = new Set(prev)
      newSet.delete(notificationId)
      return newSet
    })
    
    globalNotifications = globalNotifications.filter(n => n.id !== notificationId)
    notifyListeners()
  }

  return (
    <div className="fixed top-4 right-4 z-[60] space-y-4 max-w-sm">
      <AnimatePresence>
        {notifications
          .filter(notification => visibleNotifications.has(notification.id))
          .map((notification, index) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 100, scale: 0.8 }}
              animate={{
                opacity: 1,
                x: 0,
                scale: 1,
                transition: {
                  delay: index * 0.1,
                  duration: 0.5,
                  ease: "easeOut"
                }
              }}
              exit={{
                opacity: 0,
                x: 100,
                scale: 0.8,
                transition: { duration: 0.3 }
              }}
              layout
            >
              <NotificationItem
                notification={notification}
                onClose={() => handleCloseNotification(notification.id)}
              />
            </motion.div>
          ))}
      </AnimatePresence>
    </div>
  )
}

// 显示游戏化通知的便捷函数
export const showGamificationNotification = (
  type: GamificationNotificationType,
  title: string,
  message: string,
  amount?: number,
  options?: {
    autoClose?: boolean
    duration?: number
    action?: {
      label: string
      onClick: () => void
    }
  }
) => {
  const newNotification: GamificationNotificationData = {
    id: `notification-${Date.now()}-${Math.random()}`,
    type,
    title,
    message,
    amount,
    timestamp: new Date(),
    autoClose: options?.autoClose ?? true,
    duration: options?.duration ?? 5000,
    action: options?.action
  }

  // 添加到全局通知列表
  globalNotifications = [...globalNotifications, newNotification]
  notifyListeners()

  // 如果浏览器通知权限已授予，显示浏览器通知
  if (typeof window !== 'undefined' && Notification.permission === "granted") {
    new Notification(title, {
      body: message,
      icon: "/favicon.ico"
    })
  }
}

// 特殊通知便捷函数
export const showPointsNotification = (amount: number, description: string) => {
  showGamificationNotification(
    'POINTS_EARNED',
    '获得积分',
    description,
    amount
  )
}

export const showExperienceNotification = (amount: number, description: string) => {
  showGamificationNotification(
    'EXPERIENCE_GAINED',
    '获得经验值',
    description,
    amount
  )
}

export const showAchievementNotification = (name: string, points: number) => {
  showGamificationNotification(
    'ACHIEVEMENT_UNLOCKED',
    '成就解锁',
    `恭喜你解锁了成就: ${name}`,
    points,
    {
      autoClose: false,
      duration: 10000
    }
  )
}

export const showLevelUpNotification = (oldLevel: number, newLevel: number, bonusPoints: number) => {
  showGamificationNotification(
    'LEVEL_UP',
    '等级提升',
    `恭喜你从 ${oldLevel} 级升到了 ${newLevel} 级`,
    bonusPoints,
    {
      autoClose: false,
      duration: 10000
    }
  )
}

export const showChallengeCompletedNotification = (title: string, points: number) => {
  showGamificationNotification(
    'CHALLENGE_COMPLETED',
    '挑战完成',
    `恭喜你完成了挑战: ${title}`,
    points
  )
}

export const showStreakBonusNotification = (streak: number, points: number) => {
  showGamificationNotification(
    'STREAK_BONUS',
    '连续学习奖励',
    `连续学习${streak}天，获得额外积分奖励`,
    points
  )
}

export const showRewardClaimedNotification = (reward: string) => {
  showGamificationNotification(
    'REWARD_CLAIMED',
    '奖励已领取',
    `恭喜你成功领取了奖励: ${reward}`
  )
}

// 初始化游戏化通知系统
export const initEnhancedGamificationNotifications = () => {
  if (typeof window !== 'undefined' && Notification.permission === 'default') {
    Notification.requestPermission()
  }
}