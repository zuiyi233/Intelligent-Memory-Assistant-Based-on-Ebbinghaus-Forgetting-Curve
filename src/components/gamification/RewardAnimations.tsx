'use client'

import React, { useState, useEffect, useRef, useCallback, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Coins, 
  Star, 
  Gift, 
  Trophy, 
  TrendingUp,
  Sparkles,
  CheckCircle,
  Zap,
  Crown,
  Diamond,
  Medal
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  animations,
  cardEffects,
  textEffects,
  backgroundEffects,
  gamificationEffects,
  gamificationUtils
} from '@/lib/inspira-ui'

// 扩展 Window 接口以包含 ReactDOM
declare global {
  interface Window {
    ReactDOM?: {
      createRoot: (container: Element | DocumentFragment) => {
        render: (element: React.ReactElement) => void
        unmount: () => void
      }
    }
  }
}

// 奖励类型
type RewardType = 
  | 'POINTS'
  | 'BADGE'
  | 'TROPHY'
  | 'LEVEL_UP'
  | 'STREAK_BONUS'
  | 'SPECIAL_GIFT'
  | 'ACHIEVEMENT_UNLOCK'

// 奖励稀有度
type RewardRarity = 
  | 'COMMON'
  | 'RARE'
  | 'EPIC'
  | 'LEGENDARY'

// 奖励数据接口
interface RewardData {
  id: string
  type: RewardType
  title: string
  description: string
  amount?: number
  color?: string
  icon?: React.ReactNode
  animation?: string
  rarity?: RewardRarity
  soundEnabled?: boolean
  hapticEnabled?: boolean
}

// 奖励动画组件属性
interface RewardAnimationProps {
  reward: RewardData
  visible: boolean
  onComplete: () => void
  autoClose?: boolean
  duration?: number
}

// 粒子效果组件
interface ParticleProps {
  color: string
  count: number
  duration: number
  size: 'small' | 'medium' | 'large'
  type: 'confetti' | 'stars' | 'bubbles' | 'sparkles'
}

const ParticleEffect = memo(({ color, count, duration, size, type }: ParticleProps) => {
  const particles = Array.from({ length: count }, (_, i) => i)
  
  const getSizeClass = () => {
    switch (size) {
      case 'small': return 'w-1.5 h-1.5'
      case 'medium': return 'w-3 h-3'
      case 'large': return 'w-4 h-4'
      default: return 'w-3 h-3'
    }
  }
  
  const getParticleIcon = () => {
    switch (type) {
      case 'stars': return <Star className="w-full h-full fill-current" />
      case 'sparkles': return <Sparkles className="w-full h-full fill-current" />
      case 'bubbles': return <div className="w-full h-full rounded-full bg-current opacity-70" />
      default: return <div className="w-full h-full rounded-sm bg-current" />
    }
  }
  
  const getParticleSize = () => {
    switch (size) {
      case 'small': return { min: 2, max: 4 }
      case 'medium': return { min: 3, max: 6 }
      case 'large': return { min: 4, max: 8 }
      default: return { min: 3, max: 6 }
    }
  }
  
  const getParticleAnimation = (index: number) => {
    const angle = (index / count) * Math.PI * 2
    const distance = 120 + Math.random() * 80
    const delay = index * 20
    const particleSize = getParticleSize()
    const size = particleSize.min + Math.random() * (particleSize.max - particleSize.min)
    
    return {
      initial: {
        opacity: 0,
        scale: 0,
        x: 0,
        y: 0,
        rotate: 0,
        width: size,
        height: size
      },
      animate: {
        opacity: [0, 1, 1, 0],
        scale: [0, 1, 1, 0.3],
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        rotate: Math.random() * 720 - 360,
        width: size * 1.5,
        height: size * 1.5
      },
      transition: {
        duration: duration / 1000,
        delay: delay / 1000,
        ease: [0.25, 0.1, 0.25, 1.0] as const, // cubic-bezier for smoother animation
        times: [0, 0.2, 0.8, 1] // keyframes for more control
      },
      whileHover: {
        scale: 1.5,
        transition: { duration: 0.2 }
      }
    }
  }
  
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((i) => (
        <motion.div
          key={i}
          className={cn(
            "absolute",
            getSizeClass(),
            color ? `text-[${color}]` : 'text-yellow-400'
          )}
          {...getParticleAnimation(i)}
        >
          {getParticleIcon()}
        </motion.div>
      ))}
    </div>
  )
})

ParticleEffect.displayName = 'ParticleEffect'

// 光环效果组件
interface HaloEffectProps {
  color: string
  size: number
  duration: number
  intensity: 'low' | 'medium' | 'high'
}

const HaloEffect = memo(({ color, size, duration, intensity }: HaloEffectProps) => {
  const intensityMap = {
    low: { opacity: 0.2, scale: 1.2 },
    medium: { opacity: 0.3, scale: 1.5 },
    high: { opacity: 0.4, scale: 1.8 }
  }
  
  const { opacity, scale } = intensityMap[intensity]
  
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        background: `radial-gradient(circle, ${color || '#F59E0B'} 0%, transparent 70%)`,
        opacity: 0,
      }}
      initial={{
        scale: 0.3,
        opacity: 0
      }}
      animate={{
        scale: [0.3, scale, scale * 1.5],
        opacity: [0, opacity * 1.2, 0],
        rotate: 360
      }}
      transition={{
        duration: duration / 1000,
        ease: [0.42, 0, 0.58, 1] as const, // ease-in-out
        times: [0, 0.4, 1], // keyframes for more control
        rotate: {
          duration: duration / 500,
          repeat: Infinity,
          ease: "linear" as const
        }
      }}
    />
  )
})

HaloEffect.displayName = 'HaloEffect'

// 闪光效果组件
interface SparkleEffectProps {
  color: string
  count: number
  duration: number
}

const SparkleEffect = memo(({ color, count, duration }: SparkleEffectProps) => {
  const sparkles = Array.from({ length: count }, (_, i) => i)
  
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {sparkles.map((i) => {
        const angle = (i / count) * Math.PI * 2
        const distance = 50 + Math.random() * 30
        const size = 16 + Math.random() * 8 // Random size between 16-24
        const delay = i * 0.15
        
        return (
          <motion.div
            key={i}
            className="absolute"
            style={{
              color: color || '#F59E0B',
              filter: 'drop-shadow(0 0 2px currentColor)'
            }}
            initial={{
              opacity: 0,
              scale: 0,
              rotate: angle,
              translateX: 0,
              translateY: -distance
            }}
            animate={{
              opacity: [0, 1, 1, 0],
              scale: [0, 1, 1, 0.5],
              rotate: angle + 720, // Full rotation
              translateX: Math.sin(i * 0.7) * 15,
              translateY: -distance + Math.cos(i * 0.7) * 10
            }}
            transition={{
              duration: duration / 1000,
              delay: delay,
              repeat: Infinity,
              repeatDelay: (duration / 1000) / count * 2,
              ease: "easeInOut" as const,
              times: [0, 0.2, 0.8, 1]
            }}
            whileHover={{
              scale: 1.8,
              filter: 'drop-shadow(0 0 6px currentColor)',
              transition: { duration: 0.3 }
            }}
          >
            <Star className="fill-current" style={{ width: `${size}px`, height: `${size}px` }} />
          </motion.div>
        )
      })}
    </div>
  )
})

SparkleEffect.displayName = 'SparkleEffect'

// 波纹效果组件
interface RippleEffectProps {
  color: string
  count: number
  duration: number
}

const RippleEffect = memo(({ color, count, duration }: RippleEffectProps) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            background: `radial-gradient(circle, ${color || '#F59E0B'} 0%, transparent 70%)`,
            opacity: 0.4,
          }}
          initial={{
            width: 0,
            height: 0,
            opacity: 0.8,
            scale: 0.8
          }}
          animate={{
            width: '150%',
            height: '150%',
            opacity: 0,
            scale: 1.2
          }}
          transition={{
            duration: duration / 1000,
            delay: i * (duration / count) / 1000,
            ease: [0.4, 0, 0.2, 1] as const, // custom easing for more natural ripple
            times: [0, 0.5, 1] // keyframes for more control
          }}
        />
      ))}
    </div>
  )
})

RippleEffect.displayName = 'RippleEffect'

// 主奖励动画组件
export function RewardAnimation({
  reward,
  visible,
  onComplete,
  autoClose = true,
  duration = 3000
}: RewardAnimationProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [showReward, setShowReward] = useState(false)
  const [showEffects, setShowEffects] = useState({
    particles: false,
    halo: false,
    sparkles: false,
    ripple: false
  })
  const [screenSize, setScreenSize] = useState<'sm' | 'md' | 'lg'>('lg')
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // 响应式屏幕尺寸检测
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      if (width < 640) {
        setScreenSize('sm')
      } else if (width < 768) {
        setScreenSize('md')
      } else {
        setScreenSize('lg')
      }
    }
    
    // 初始检测
    handleResize()
    
    // 添加事件监听
    window.addEventListener('resize', handleResize)
    
    // 清理函数
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])
  
  // 根据屏幕尺寸获取效果配置
  const getEffectConfig = () => {
    switch (screenSize) {
      case 'sm':
        return {
          haloSize: 180,
          particleCount: 20,
          particleSize: 'small' as const,
          sparkleCount: 6
        }
      case 'md':
        return {
          haloSize: 220,
          particleCount: 25,
          particleSize: 'small' as const,
          sparkleCount: 8
        }
      case 'lg':
      default:
        return {
          haloSize: 240,
          particleCount: 30,
          particleSize: 'small' as const,
          sparkleCount: 8
        }
    }
  }
  
  // 声音缓存
  const soundCache = useRef<Record<string, HTMLAudioElement | null>>({})
  
  // 预加载声音资源
  const preloadSounds = useCallback(() => {
    if (reward.soundEnabled !== false && typeof Audio !== 'undefined') {
      const soundFiles = [
        '/sounds/coin.mp3',
        '/sounds/badge.mp3',
        '/sounds/trophy.mp3',
        '/sounds/level-up.mp3',
        '/sounds/streak.mp3',
        '/sounds/gift.mp3',
        '/sounds/achievement.mp3',
        '/sounds/default.mp3'
      ]
      
      soundFiles.forEach(file => {
        if (!soundCache.current[file]) {
          try {
            const audio = new Audio(file)
            audio.volume = 0.5
            audio.preload = 'auto' // 预加载
            soundCache.current[file] = audio
          } catch (e) {
            console.log(`Sound preload error for ${file}:`, e)
            soundCache.current[file] = null
          }
        }
      })
    }
  }, [reward.soundEnabled])
  
  // 触摸反馈函数 - 使用useCallback优化性能
  const triggerHapticFeedback = useCallback(() => {
    if (reward.hapticEnabled !== false && 'vibrate' in navigator) {
      // 根据奖励类型提供不同的震动反馈
      let pattern: number[] = [20]
      
      switch (reward.type) {
        case 'POINTS':
          pattern = [10]
          break
        case 'BADGE':
          pattern = [20, 50, 20]
          break
        case 'TROPHY':
          pattern = [30, 50, 30, 50, 30]
          break
        case 'LEVEL_UP':
          pattern = [50, 30, 50, 30, 50]
          break
        case 'STREAK_BONUS':
          pattern = [40, 40, 40]
          break
        case 'SPECIAL_GIFT':
          pattern = [20, 30, 20, 30, 20, 30, 20]
          break
        case 'ACHIEVEMENT_UNLOCK':
          pattern = [30, 50, 30, 50, 30, 50, 30]
          break
      }
      
      navigator.vibrate(pattern)
    }
  }, [reward.hapticEnabled, reward.type])
  
  // 播放声音函数 - 使用useCallback优化性能
  const playSound = useCallback(() => {
    if (reward.soundEnabled !== false && typeof Audio !== 'undefined') {
      try {
        // 根据奖励类型选择不同的声音
        let soundFile = ''
        
        switch (reward.type) {
          case 'POINTS':
            soundFile = '/sounds/coin.mp3'
            break
          case 'BADGE':
            soundFile = '/sounds/badge.mp3'
            break
          case 'TROPHY':
            soundFile = '/sounds/trophy.mp3'
            break
          case 'LEVEL_UP':
            soundFile = '/sounds/level-up.mp3'
            break
          case 'STREAK_BONUS':
            soundFile = '/sounds/streak.mp3'
            break
          case 'SPECIAL_GIFT':
            soundFile = '/sounds/gift.mp3'
            break
          case 'ACHIEVEMENT_UNLOCK':
            soundFile = '/sounds/achievement.mp3'
            break
          default:
            soundFile = '/sounds/default.mp3'
        }
        
        // 使用缓存的音频或创建新的
        const audio = soundCache.current[soundFile] || new Audio(soundFile)
        audio.volume = 0.5
        audio.currentTime = 0 // 重置播放位置
        audio.play().catch(e => console.log('Audio play failed:', e))
      } catch (e) {
        console.log('Sound playback error:', e)
      }
    }
  }, [reward.soundEnabled, reward.type])
  
  // 预加载声音资源
  useEffect(() => {
    preloadSounds()
  }, [preloadSounds])
  
  // 使用useEffect管理动画状态，并添加性能优化
  useEffect(() => {
    if (visible) {
      setIsAnimating(true)
      setShowReward(true)
      
      // 触发触摸反馈
      triggerHapticFeedback()
      
      // 播放声音
      playSound()
      
      // 逐步显示各种效果
      timeoutRef.current = setTimeout(() => {
        setShowEffects(prev => ({ ...prev, halo: true }))
      }, 100)
      
      timeoutRef.current = setTimeout(() => {
        setShowEffects(prev => ({ ...prev, particles: true }))
      }, 300)
      
      timeoutRef.current = setTimeout(() => {
        setShowEffects(prev => ({ ...prev, sparkles: true }))
      }, 500)
      
      timeoutRef.current = setTimeout(() => {
        setShowEffects(prev => ({ ...prev, ripple: true }))
      }, 700)
      
      // 自动关闭
      if (autoClose) {
        timeoutRef.current = setTimeout(() => {
          handleClose()
        }, duration)
      }
    }
  }, [visible, autoClose, duration, triggerHapticFeedback, playSound])
  
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])
  
  // 性能优化：使用requestAnimationFrame来优化动画帧
  const animationFrameRef = useRef<number | null>(null)
  
  useEffect(() => {
    if (isAnimating) {
      const animate = () => {
        // 在这里可以添加任何需要在每一帧更新的动画逻辑
        animationFrameRef.current = requestAnimationFrame(animate)
      }
      
      animationFrameRef.current = requestAnimationFrame(animate)
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isAnimating])
  
  const handleClose = () => {
    setIsAnimating(false)
    setShowEffects({
      particles: false,
      halo: false,
      sparkles: false,
      ripple: false
    })
    
    setTimeout(() => {
      setShowReward(false)
      onComplete()
    }, 500)
  }
  
  // 使用useCallback优化getter函数性能
  const getRewardColor = useCallback(() => {
    if (reward.color) return reward.color
    
    switch (reward.type) {
      case 'POINTS': return 'text-yellow-500'
      case 'BADGE': return 'text-blue-500'
      case 'TROPHY': return 'text-purple-500'
      case 'LEVEL_UP': return 'text-green-500'
      case 'STREAK_BONUS': return 'text-orange-500'
      case 'SPECIAL_GIFT': return 'text-indigo-500'
      case 'ACHIEVEMENT_UNLOCK': return 'text-pink-500'
      default: return 'text-yellow-500'
    }
  }, [reward.color, reward.type])
  
  const getRewardBgColor = useCallback(() => {
    switch (reward.type) {
      case 'POINTS': return 'bg-gradient-to-br from-yellow-50 to-amber-50'
      case 'BADGE': return 'bg-gradient-to-br from-blue-50 to-indigo-50'
      case 'TROPHY': return 'bg-gradient-to-br from-purple-50 to-violet-50'
      case 'LEVEL_UP': return 'bg-gradient-to-br from-green-50 to-emerald-50'
      case 'STREAK_BONUS': return 'bg-gradient-to-br from-orange-50 to-amber-50'
      case 'SPECIAL_GIFT': return 'bg-gradient-to-br from-indigo-50 to-purple-50'
      case 'ACHIEVEMENT_UNLOCK': return 'bg-gradient-to-br from-pink-50 to-rose-50'
      default: return 'bg-gradient-to-br from-yellow-50 to-amber-50'
    }
  }, [reward.type])
  
  const getRewardIcon = useCallback(() => {
    if (reward.icon) return reward.icon
    
    const iconClass = "h-12 w-12 sm:h-16 sm:w-16"
    
    switch (reward.type) {
      case 'POINTS': return <Coins className={iconClass} />
      case 'BADGE': return <Medal className={iconClass} />
      case 'TROPHY': return <Trophy className={iconClass} />
      case 'LEVEL_UP': return <TrendingUp className={iconClass} />
      case 'STREAK_BONUS': return <Zap className={iconClass} />
      case 'SPECIAL_GIFT': return <Gift className={iconClass} />
      case 'ACHIEVEMENT_UNLOCK': return <Crown className={iconClass} />
      default: return <Coins className={iconClass} />
    }
  }, [reward.icon, reward.type])
  
  const getParticleColor = useCallback(() => {
    switch (reward.type) {
      case 'POINTS': return '#F59E0B' // yellow-500
      case 'BADGE': return '#3B82F6' // blue-500
      case 'TROPHY': return '#8B5CF6' // purple-500
      case 'LEVEL_UP': return '#10B981' // green-500
      case 'STREAK_BONUS': return '#F97316' // orange-500
      case 'SPECIAL_GIFT': return '#6366F1' // indigo-500
      case 'ACHIEVEMENT_UNLOCK': return '#EC4899' // pink-500
      default: return '#F59E0B' // yellow-500
    }
  }, [reward.type])
  
  const getParticleType = useCallback(() => {
    switch (reward.type) {
      case 'POINTS': return 'confetti'
      case 'BADGE': return 'stars'
      case 'TROPHY': return 'sparkles'
      case 'LEVEL_UP': return 'stars'
      case 'STREAK_BONUS': return 'sparkles'
      case 'SPECIAL_GIFT': return 'bubbles'
      case 'ACHIEVEMENT_UNLOCK': return 'sparkles'
      default: return 'confetti'
    }
  }, [reward.type])
  
  const getBorderGlowColor = useCallback(() => {
    switch (reward.type) {
      case 'POINTS': return 'rgba(245, 158, 11, 0.5)'
      case 'BADGE': return 'rgba(59, 130, 246, 0.5)'
      case 'TROPHY': return 'rgba(139, 92, 246, 0.5)'
      case 'LEVEL_UP': return 'rgba(16, 185, 129, 0.5)'
      case 'STREAK_BONUS': return 'rgba(249, 115, 22, 0.5)'
      case 'SPECIAL_GIFT': return 'rgba(99, 102, 241, 0.5)'
      case 'ACHIEVEMENT_UNLOCK': return 'rgba(236, 72, 153, 0.5)'
      default: return 'rgba(245, 158, 11, 0.5)'
    }
  }, [reward.type])
  
  // 使用useCallback和memo优化徽章性能
  const getRarityBadge = useCallback(() => {
    if (!reward.rarity) return null
    
    const rarityConfig = {
      COMMON: {
        text: '普通',
        color: 'bg-gray-100 text-gray-800 border-gray-300'
      },
      RARE: {
        text: '稀有',
        color: 'bg-blue-100 text-blue-800 border-blue-300'
      },
      EPIC: {
        text: '史诗',
        color: 'bg-purple-100 text-purple-800 border-purple-300'
      },
      LEGENDARY: {
        text: '传说',
        color: 'bg-yellow-100 text-yellow-800 border-yellow-300'
      }
    }
    
    const config = rarityConfig[reward.rarity]
    
    return (
      <motion.div
        className={cn(
          "absolute top-2 sm:top-4 right-2 sm:right-4 px-2 sm:px-3 py-1 rounded-full text-xs font-semibold border",
          config.color,
          reward.rarity === 'LEGENDARY' && textEffects.neon('#fbbf24'),
          reward.rarity === 'EPIC' && textEffects.neon('#a855f7'),
          reward.rarity === 'RARE' && textEffects.neon('#3b82f6')
        )}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8, duration: 0.3 }}
        whileHover={{
          scale: 1.1,
          transition: { duration: 0.2 }
        }}
      >
        {config.text}
      </motion.div>
    )
  }, [reward.rarity])
  
  if (!showReward) return null
  
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className={cn(
            "fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm",
            reward.rarity === 'LEGENDARY' && backgroundEffects.gradient(['rgba(251, 191, 36, 0.1)', 'rgba(245, 158, 11, 0.05)']),
            reward.rarity === 'EPIC' && backgroundEffects.gradient(['rgba(168, 85, 247, 0.1)', 'rgba(139, 92, 246, 0.05)']),
            reward.rarity === 'RARE' && backgroundEffects.gradient(['rgba(59, 130, 246, 0.1)', 'rgba(37, 99, 235, 0.05)'])
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            className="relative"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{
              type: 'spring',
              damping: 25,
              stiffness: 300,
              duration: 0.5
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* 波纹效果 */}
            {showEffects.ripple && (
              <RippleEffect 
                color={getParticleColor()}
                count={3}
                duration={2000}
              />
            )}
            
            {/* 光环效果 */}
            {showEffects.halo && (
              <HaloEffect
                color={getParticleColor()}
                size={getEffectConfig().haloSize} // 根据屏幕尺寸调整
                duration={1500}
                intensity="high"
              />
            )}
            
            {/* 粒子效果 */}
            {showEffects.particles && (
              <ParticleEffect
                color={getParticleColor()}
                count={getEffectConfig().particleCount} // 根据屏幕尺寸调整
                duration={2000}
                size={getEffectConfig().particleSize} // 根据屏幕尺寸调整
                type={getParticleType()}
              />
            )}
            
            {/* 闪光效果 */}
            {showEffects.sparkles && (
              <SparkleEffect
                color={getParticleColor()}
                count={getEffectConfig().sparkleCount} // 根据屏幕尺寸调整
                duration={2000}
              />
            )}
            
            {/* 奖励卡片 */}
            <motion.div
              className={cn(
                "relative z-10 w-80 sm:w-96 md:w-[28rem] shadow-2xl border-2 overflow-hidden",
                "mx-2 sm:mx-0", // 在小屏幕上添加水平边距
                getRewardBgColor(),
                cardEffects.glowBorder(getBorderGlowColor()),
                cardEffects["3d"],
                cardEffects.hover
              )}
              initial={{ y: 20, opacity: 0, rotateX: 15 }}
              animate={{ y: 0, opacity: 1, rotateX: 0 }}
              transition={{
                delay: 0.2,
                duration: 0.5,
                type: 'spring',
                damping: 20,
                stiffness: 300
              }}
              whileHover={{
                y: -5,
                transition: { duration: 0.2 }
              }}
            >
              {/* 稀有度徽章 */}
              {getRarityBadge()}
              
              <div className="p-6 sm:p-8 text-center">
                {/* 奖励图标 */}
                <motion.div
                  className={cn(
                    "flex items-center justify-center mb-6 relative",
                    reward.rarity === 'LEGENDARY' && gamificationEffects.achievementUnlock,
                    reward.rarity === 'EPIC' && gamificationEffects.levelUp,
                    reward.rarity === 'RARE' && gamificationEffects.pointsIncrease
                  )}
                  initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
                  animate={{ scale: 1.1, opacity: 1, rotate: 0 }}
                  transition={{
                    delay: 0.4,
                    duration: 0.5,
                    type: 'spring',
                    damping: 15,
                    stiffness: 300
                  }}
                  whileHover={{
                    scale: 1.2,
                    rotate: [0, 5, -5, 0],
                    transition: {
                      duration: 0.5,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }
                  }}
                >
                  <motion.div
                    className={getRewardColor()}
                    animate={reward.rarity === 'LEGENDARY' ? {
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0],
                      transition: {
                        duration: 2,
                        repeat: Infinity,
                        repeatType: "reverse"
                      }
                    } : {}}
                  >
                    {getRewardIcon()}
                  </motion.div>
                </motion.div>
                
                {/* 奖励标题 */}
                <motion.h2
                  className={cn(
                    "text-2xl sm:text-3xl font-bold mb-3",
                    textEffects.gradient(['var(--primary)', 'var(--accent)']),
                    reward.rarity === 'LEGENDARY' && textEffects["3d"]
                  )}
                  initial={{ y: 20, opacity: 0, scale: 0.9 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  transition={{
                    delay: 0.6,
                    duration: 0.5,
                    type: 'spring',
                    damping: 20,
                    stiffness: 300
                  }}
                  whileHover={{
                    scale: 1.05,
                    textShadow: reward.rarity === 'LEGENDARY'
                      ? "0px 0px 15px rgba(251, 191, 36, 0.7)"
                      : "0px 0px 8px rgba(59, 130, 246, 0.5)"
                  }}
                >
                  {reward.title}
                </motion.h2>
                
                {/* 奖励描述 */}
                <motion.p
                  className="text-sm sm:text-base text-gray-600 mb-6"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{
                    delay: 0.7,
                    duration: 0.5,
                    ease: "easeOut" as const
                  }}
                >
                  {reward.description}
                </motion.p>
                
                {/* 奖励数量 */}
                {reward.amount !== undefined && (
                  <motion.div
                    className={cn(
                      "text-3xl sm:text-4xl font-bold mb-6",
                      getRewardColor(),
                      textEffects.neon(getRewardColor().replace('text-', ''))
                    )}
                    initial={{ y: 20, opacity: 0, scale: 0.8 }}
                    animate={{
                      y: 0,
                      opacity: 1,
                      scale: [0.8, 1.2, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{
                      delay: 0.8,
                      duration: 0.5,
                      type: 'spring',
                      damping: 15,
                      stiffness: 300
                    }}
                    whileHover={{
                      scale: 1.1,
                      transition: { duration: 0.2 }
                    }}
                  >
                    +{gamificationUtils.formatPoints(reward.amount)}
                  </motion.div>
                )}
                
                {/* 确认按钮 */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.9, duration: 0.5 }}
                >
                  <motion.button
                    className={cn(
                      "px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold text-white text-sm sm:text-base",
                      "bg-gradient-to-r from-primary to-accent",
                      "relative overflow-hidden before:absolute before:top-1/2 before:left-1/2 before:w-0 before:h-0 before:rounded-full before:bg-white/30 before:transform before:-translate-x-1/2 before:-translate-y-1/2 before:transition-all before:duration-600 active:before:w-[300px] active:before:h-[300px]"
                    )}
                    whileHover={{
                      scale: 1.05,
                      boxShadow: "0px 0px 15px rgba(59, 130, 246, 0.6)"
                    }}
                    whileTap={{
                      scale: 0.95,
                      boxShadow: "0px 0px 5px rgba(59, 130, 246, 0.8)"
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 400,
                      damping: 17
                    }}
                    onClick={() => {
                      triggerHapticFeedback() // 点击按钮时也触发触摸反馈
                      handleClose()
                    }}
                    onTouchStart={() => {
                      // 触摸开始时的反馈
                      if ('vibrate' in navigator) {
                        navigator.vibrate(10)
                      }
                    }}
                  >
                    <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 inline mr-2" />
                    太棒了！
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// 奖励动画管理器组件
interface RewardAnimationManagerProps {
  rewards: RewardData[]
  onRewardComplete: (rewardId: string) => void
}

export function RewardAnimationManager({ rewards, onRewardComplete }: RewardAnimationManagerProps) {
  const [currentRewardIndex, setCurrentRewardIndex] = useState(0)
  const [showCurrentReward, setShowCurrentReward] = useState(false)
  
  useEffect(() => {
    if (rewards.length > 0 && currentRewardIndex < rewards.length) {
      // 显示当前奖励
      setShowCurrentReward(true)
    }
  }, [rewards, currentRewardIndex])
  
  const handleRewardComplete = () => {
    setShowCurrentReward(false)
    
    // 通知父组件奖励已完成
    if (currentRewardIndex < rewards.length) {
      const completedReward = rewards[currentRewardIndex]
      onRewardComplete(completedReward.id)
    }
    
    // 显示下一个奖励
    setTimeout(() => {
      if (currentRewardIndex < rewards.length - 1) {
        setCurrentRewardIndex(prev => prev + 1)
      } else {
        // 所有奖励显示完毕，重置状态
        setCurrentRewardIndex(0)
      }
    }, 500)
  }
  
  if (rewards.length === 0 || currentRewardIndex >= rewards.length) return null
  
  return (
    <RewardAnimation
      reward={rewards[currentRewardIndex]}
      visible={showCurrentReward}
      onComplete={handleRewardComplete}
    />
  )
}

// 便捷函数：显示奖励动画
export const showRewardAnimation = (
  reward: Omit<RewardData, 'id'>,
  onComplete?: () => void
) => {
  const rewardWithId: RewardData = {
    ...reward,
    id: `reward-${Date.now()}-${Math.random()}`
  }
  
  // 创建临时容器
  const container = document.createElement('div')
  document.body.appendChild(container)
  
  // 渲染组件
  const root = window.ReactDOM?.createRoot?.(container)
  if (!root) {
    document.body.removeChild(container)
    console.error('ReactDOM not available')
    onComplete?.()
    return
  }
  
  root.render(
    React.createElement(RewardAnimation, {
      reward: rewardWithId,
      visible: true,
      onComplete: () => {
        root.unmount()
        document.body.removeChild(container)
        onComplete?.()
      }
    })
  )
}

// 特殊奖励便捷函数
export const showPointsReward = (amount: number, description: string, rarity?: RewardRarity) => {
  showRewardAnimation({
    type: 'POINTS',
    title: '获得积分！',
    description,
    amount,
    rarity
  })
}

export const showBadgeReward = (name: string, rarity?: RewardRarity) => {
  showRewardAnimation({
    type: 'BADGE',
    title: '获得徽章！',
    description: `恭喜你获得了 ${name} 徽章`,
    rarity
  })
}

export const showTrophyReward = (name: string, rarity: RewardRarity = 'EPIC') => {
  showRewardAnimation({
    type: 'TROPHY',
    title: '获得奖杯！',
    description: `恭喜你赢得了 ${name} 奖杯`,
    rarity
  })
}

export const showLevelUpReward = (oldLevel: number, newLevel: number, rarity: RewardRarity = 'RARE') => {
  showRewardAnimation({
    type: 'LEVEL_UP',
    title: '等级提升！',
    description: `恭喜你从 ${oldLevel} 级升到了 ${newLevel} 级`,
    rarity
  })
}

export const showStreakBonusReward = (streak: number, points: number, rarity?: RewardRarity) => {
  let rarityToUse = rarity
  if (!rarityToUse) {
    if (streak >= 30) rarityToUse = 'LEGENDARY'
    else if (streak >= 7) rarityToUse = 'EPIC'
    else if (streak >= 3) rarityToUse = 'RARE'
    else rarityToUse = 'COMMON'
  }
  
  showRewardAnimation({
    type: 'STREAK_BONUS',
    title: '连续学习奖励！',
    description: `连续学习${streak}天`,
    amount: points,
    rarity: rarityToUse
  })
}

export const showSpecialGiftReward = (giftName: string, rarity: RewardRarity = 'LEGENDARY') => {
  showRewardAnimation({
    type: 'SPECIAL_GIFT',
    title: '特别奖励！',
    description: `恭喜你获得了 ${giftName}`,
    rarity
  })
}

export const showAchievementUnlockReward = (achievementName: string, rarity?: RewardRarity) => {
  showRewardAnimation({
    type: 'ACHIEVEMENT_UNLOCK',
    title: '成就解锁！',
    description: `恭喜你解锁了「${achievementName}」成就`,
    rarity
  })
}