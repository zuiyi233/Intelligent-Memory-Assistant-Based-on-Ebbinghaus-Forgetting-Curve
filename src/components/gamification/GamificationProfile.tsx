'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Award, Coins, Sparkles, Target, TrendingUp, Trophy, Star, Zap } from 'lucide-react'
import { GamificationProfileWithDetails } from '@/types'
import { UserAchievement, PointTransaction, Achievement } from '@prisma/client'
import { useGamificationData } from '@/hooks/useGamificationData'
import { cn, gamificationUtils, cardEffects, textEffects, animations, backgroundEffects, buttonEffects, gamificationEffects } from '@/lib/inspira-ui'
import { motion } from 'framer-motion'

// 定义带有成就详情的用户成就类型
type UserAchievementWithDetails = UserAchievement & {
  achievement: Achievement
}

interface GamificationProfileProps {
  userId: string
  profile?: GamificationProfileWithDetails | null
  onRefresh?: () => Promise<void>
}

export function GamificationProfile({ userId, profile: externalProfile, onRefresh }: GamificationProfileProps) {
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
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  const {
    getUserAchievements,
    getPointsHistory,
    getUserAchievementStats
  } = useGamificationData(userId)

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
    }
  }, [userId, profile])

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

  // 刷新函数
  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      if (onRefresh) {
        await onRefresh()
      } else {
        setLoading(true)
        const response = await fetch(`/api/gamification/profile?userId=${encodeURIComponent(userId)}`)
        if (!response.ok) {
          throw new Error('刷新游戏化资料失败')
        }
        const profileData = await response.json()
        setProfile(profileData)
        // 刷新额外数据
        await fetchAdditionalData()
      }
    } catch (error) {
      console.error('刷新游戏化资料失败:', error)
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  // 动画变体
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  }

  const cardVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { scale: 1, opacity: 1 },
    hover: { scale: 1.03 }
  }

  const achievementVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: { x: 0, opacity: 1 },
    hover: { x: 5 }
  }

  const pointsVariants = {
    hidden: { x: 20, opacity: 0 },
    visible: { x: 0, opacity: 1 },
    hover: { x: -5 }
  }

  if (loading) {
    return (
      <div className="relative w-full overflow-hidden rounded-2xl">
        {/* 动态背景效果 */}
        <div className="absolute inset-0 z-0">
          <div className={cn(
            "absolute inset-0",
            "bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5"
          )} />
          <div className={cn(
            "absolute inset-0",
            "opacity-20 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]"
          )} style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} />
        </div>
        
        {/* 加载卡片 */}
        <Card className={cn(
          "relative z-10 w-full backdrop-blur-xl border-0 shadow-2xl overflow-hidden",
          "inspira-glass-effect"
        )}>
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center h-40">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <div className="absolute top-0 left-0 animate-ping rounded-full h-12 w-12 border-primary opacity-20"></div>
              </div>
              <p className="mt-4 text-sm font-medium text-muted-foreground">加载中...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="relative w-full overflow-hidden rounded-2xl">
        {/* 动态背景效果 */}
        <div className="absolute inset-0 z-0">
          <div className={cn(
            "absolute inset-0",
            "bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5"
          )} />
        </div>
        
        {/* 错误卡片 */}
        <Card className={cn(
          "relative z-10 w-full backdrop-blur-xl border-0 shadow-2xl",
          "inspira-glass-effect"
        )}>
          <CardContent className="p-8">
            <div className="text-center">
              <div className="mx-auto h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <Sparkles className="h-8 w-8 text-red-500" />
              </div>
              <p className="text-lg font-medium text-foreground">无法加载游戏化资料</p>
              <p className="text-sm text-muted-foreground mt-2">请稍后再试</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 使用从API获取的成就数据，如果没有则使用profile中的成就
  const achievementsData = userAchievements.length > 0 ? userAchievements : (profile?.achievements || [])
  // 要显示的成就数量
  const achievementsToShow = showMoreAchievements ? achievementsData : achievementsData.slice(0, 6)

  // 计算成就完成率
  const achievementCompletionRate = achievementStats.total > 0
    ? Math.round((achievementStats.unlocked / achievementStats.total) * 100)
    : 0

  return (
    <motion.div
      className="relative w-full"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      transition={{ staggerChildren: 0.1, duration: 0.5 }}
    >
      {/* 动态背景效果 */}
      <div className="absolute inset-0 -z-10 rounded-2xl overflow-hidden">
        <div className={cn(
          "absolute inset-0",
          "bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5"
        )} />
        <div className={cn(
          "absolute inset-0 opacity-20 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]"
        )} style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
      </div>

      {/* 主容器 */}
      <div className="space-y-6">
        {/* 顶部统计概览 */}
        <motion.div variants={itemVariants} transition={{ duration: 0.5 }}>
          <Card className={cn(
            "relative overflow-hidden backdrop-blur-xl border-0 shadow-2xl",
            "inspira-glass-effect"
          )}>
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h2 className={cn(
                "text-xl sm:text-2xl font-bold",
                "inspira-gradient-text"
              )}>
                游戏化资料
              </h2>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className={cn(
                  "flex items-center justify-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 w-full sm:w-auto",
                  "bg-primary/10 hover:bg-primary/20 text-primary hover:text-primary/80",
                  buttonEffects.ripple,
                  isRefreshing && "opacity-70 cursor-not-allowed"
                )}
              >
                <Sparkles className={cn(
                  "h-4 w-4",
                  isRefreshing && "animate-spin"
                )} />
                {isRefreshing ? '刷新中...' : '刷新'}
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* 积分卡片 */}
              <motion.div
                className={cn(
                  "relative overflow-hidden rounded-2xl p-5 cursor-pointer",
                  "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20",
                  "border border-blue-100 dark:border-blue-900",
                  "inspira-hover-lift"
                )}
                whileHover={{
                  scale: 1.03,
                  boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.25), 0 10px 10px -5px rgba(59, 130, 246, 0.1)"
                }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">总积分</p>
                    <motion.p
                      className="text-2xl font-bold text-blue-900 dark:text-blue-100"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{
                        duration: 0.5,
                        repeat: Infinity,
                        repeatDelay: 3,
                        repeatType: "reverse"
                      }}
                    >
                      {gamificationUtils.formatPoints(profile.points)}
                    </motion.p>
                  </div>
                  <motion.div
                    className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/50"
                    animate={{
                      rotate: [0, 10, -10, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 5
                    }}
                  >
                    <Coins className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </motion.div>
                </div>
                <div className="mt-3 h-1 w-full bg-blue-200 dark:bg-blue-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-blue-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, profile.points / 1000 * 100)}%` }}
                    transition={{ duration: 1, delay: 0.2 }}
                  />
                </div>
              </motion.div>
              
              {/* 等级卡片 */}
              <motion.div
                className={cn(
                  "relative overflow-hidden rounded-2xl p-5 cursor-pointer",
                  "bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20",
                  "border border-purple-100 dark:border-purple-900",
                  "inspira-hover-lift"
                )}
                whileHover={{
                  scale: 1.03,
                  boxShadow: "0 10px 25px -5px rgba(139, 92, 246, 0.25), 0 10px 10px -5px rgba(139, 92, 246, 0.1)"
                }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-1">等级</p>
                    <motion.p
                      className="text-2xl font-bold text-purple-900 dark:text-purple-100"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{
                        duration: 0.5,
                        repeat: Infinity,
                        repeatDelay: 3,
                        repeatType: "reverse"
                      }}
                    >
                      {profile.level}
                    </motion.p>
                  </div>
                  <motion.div
                    className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/50"
                    animate={{
                      rotate: [0, 15, -15, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 5
                    }}
                  >
                    <Trophy className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </motion.div>
                </div>
                <div className="mt-3 h-1 w-full bg-purple-200 dark:bg-purple-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-purple-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${gamificationUtils.calculateLevelProgress(profile.level, profile.experience)}%` }}
                    transition={{ duration: 1, delay: 0.4 }}
                  />
                </div>
              </motion.div>
              
              {/* 成就卡片 */}
              <motion.div
                className={cn(
                  "relative overflow-hidden rounded-2xl p-5 cursor-pointer",
                  "bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20",
                  "border border-amber-100 dark:border-amber-900",
                  "inspira-hover-lift"
                )}
                whileHover={{
                  scale: 1.03,
                  boxShadow: "0 10px 25px -5px rgba(245, 158, 11, 0.25), 0 10px 10px -5px rgba(245, 158, 11, 0.1)"
                }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-amber-600 dark:text-amber-400 mb-1">成就</p>
                    <motion.p
                      className="text-2xl font-bold text-amber-900 dark:text-amber-100"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{
                        duration: 0.5,
                        repeat: Infinity,
                        repeatDelay: 3,
                        repeatType: "reverse"
                      }}
                    >
                      {achievementStats.unlocked}/{achievementStats.total}
                    </motion.p>
                  </div>
                  <motion.div
                    className="p-3 rounded-full bg-amber-100 dark:bg-amber-900/50"
                    animate={{
                      rotate: [0, 20, -20, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 5
                    }}
                  >
                    <Award className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                  </motion.div>
                </div>
                <div className="mt-3 h-1 w-full bg-amber-200 dark:bg-amber-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-amber-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${achievementCompletionRate}%` }}
                    transition={{ duration: 1, delay: 0.6 }}
                  />
                </div>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

        {/* 成就展示区域 */}
        <motion.div variants={itemVariants} transition={{ duration: 0.5 }}>
          <Card className={cn(
            "relative overflow-hidden backdrop-blur-xl border-0 shadow-2xl",
            "inspira-glass-effect"
          )}>
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h3 className={cn(
                "text-lg sm:text-xl font-bold flex items-center gap-2",
                "inspira-gradient-text"
              )}>
                <Award className="h-5 w-5 text-amber-500" />
                最近成就
              </h3>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-xs text-muted-foreground">实时更新</span>
              </div>
            </div>
            
            {achievementsData.length > 0 ? (
              <div className="space-y-4">
                {achievementsToShow.slice(0, 3).map((userAchievement: UserAchievement & { achievement: Achievement }, index) => (
                  <motion.div
                    key={userAchievement.id}
                    variants={achievementVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover="hover"
                    className={cn(
                      "group relative overflow-hidden rounded-2xl p-4 transition-all duration-300",
                      "bg-gradient-to-r from-card to-card/80 backdrop-blur-sm",
                      "border border-border/50 hover:border-primary/50",
                      "inspira-hover-lift",
                      gamificationEffects.achievementUnlock
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <motion.div
                        className={cn(
                          "p-3 rounded-2xl flex-shrink-0",
                          gamificationUtils.getAchievementBgColor(userAchievement.achievement.category)
                        )}
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <motion.div
                          animate={{
                            rotate: [0, 10, -10, 0],
                          }}
                          transition={{
                            duration: 0.5,
                            delay: index * 0.1,
                            repeat: Infinity,
                            repeatDelay: 3
                          }}
                        >
                          <Award className={cn(
                            "h-6 w-6",
                            gamificationUtils.getAchievementColor(userAchievement.achievement.category)
                          )} />
                        </motion.div>
                      </motion.div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-bold text-base text-foreground truncate flex items-center gap-2">
                            {userAchievement.achievement.name}
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{
                                duration: 0.5,
                                delay: index * 0.1 + 0.2,
                                repeat: Infinity,
                                repeatDelay: 4,
                                repeatType: "reverse"
                              }}
                            >
                              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            </motion.div>
                          </h4>
                          <motion.span
                            className={cn(
                              "text-sm font-bold px-3 py-1 rounded-full",
                              "bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800",
                              "flex items-center gap-1"
                            )}
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Zap className="h-3 w-3" />
                            +{gamificationUtils.formatPoints(userAchievement.achievement.points)}
                          </motion.span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{userAchievement.achievement.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground bg-background/50 px-2 py-1 rounded-full">
                            {new Date(userAchievement.unlockedAt).toLocaleDateString()}
                          </span>
                          <motion.div
                            className="flex items-center gap-1"
                            animate={{ opacity: [0.7, 1, 0.7] }}
                            transition={{
                              duration: 2,
                              delay: index * 0.1,
                              repeat: Infinity,
                              repeatType: "reverse"
                            }}
                          >
                            <div className="h-2 w-2 rounded-full bg-green-500"></div>
                            <span className="text-xs text-green-600 font-medium">已解锁</span>
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                {achievementsData.length > 3 && (
                  <div className="text-center pt-2">
                    <button
                      onClick={() => setShowMoreAchievements(!showMoreAchievements)}
                      className={cn(
                        "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                        "bg-primary/10 hover:bg-primary/20 text-primary hover:text-primary/80",
                        buttonEffects.ripple
                      )}
                    >
                      <Sparkles className="h-4 w-4" />
                      {showMoreAchievements ? '收起成就' : `查看全部成就 (${achievementsData.length})`}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="mx-auto h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Award className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-lg font-medium text-foreground mb-1">暂无成就</p>
                <p className="text-sm text-muted-foreground">继续努力，解锁更多成就！</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

        {/* 积分记录区域 */}
        <motion.div variants={itemVariants} transition={{ duration: 0.5 }}>
          <Card className={cn(
            "relative overflow-hidden backdrop-blur-xl border-0 shadow-2xl",
            "inspira-glass-effect"
          )}>
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h3 className={cn(
                "text-lg sm:text-xl font-bold flex items-center gap-2",
                "inspira-gradient-text"
              )}>
                <Coins className="h-5 w-5 text-yellow-500" />
                积分记录
              </h3>
            </div>
            
            {pointsHistory.length > 0 ? (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                {pointsHistory.slice(0, 10).map((transaction: PointTransaction, index) => (
                  <motion.div
                    key={transaction.id}
                    variants={pointsVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover="hover"
                    className={cn(
                      "group flex items-center justify-between p-3 sm:p-4 rounded-2xl transition-all duration-300",
                      "bg-gradient-to-r from-card to-card/80 backdrop-blur-sm",
                      "border border-border/50 hover:border-primary/50",
                      "inspira-hover-lift",
                      transaction.amount > 0 ? gamificationEffects.pointsIncrease : ""
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate group-hover:text-primary transition-colors text-sm sm:text-base">
                        {transaction.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(transaction.createdAt).toLocaleDateString()} {new Date(transaction.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                    </div>
                    <motion.span
                      className={cn(
                        "font-bold text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full flex items-center gap-1",
                        transaction.amount > 0
                          ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800"
                          : "bg-gradient-to-r from-red-100 to-rose-100 text-red-800"
                      )}
                      whileHover={{ scale: 1.05 }}
                      animate={{
                        y: [0, -3, 0],
                      }}
                      transition={{
                        duration: 0.5,
                        delay: index * 0.05,
                        repeat: Infinity,
                        repeatDelay: 5,
                        repeatType: "reverse"
                      }}
                    >
                      <motion.div
                        animate={{ rotate: transaction.amount > 0 ? [0, 10, 0] : [0, -10, 0] }}
                        transition={{
                          duration: 0.5,
                          delay: index * 0.05 + 0.2,
                          repeat: Infinity,
                          repeatDelay: 5,
                          repeatType: "reverse"
                        }}
                      >
                        {transaction.amount > 0 ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingUp className="h-3 w-3 rotate-180" />
                        )}
                      </motion.div>
                      {transaction.amount > 0 ? '+' : ''}{gamificationUtils.formatPoints(transaction.amount)}
                    </motion.span>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="mx-auto h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Coins className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-lg font-medium text-foreground mb-1">暂无积分记录</p>
                <p className="text-sm text-muted-foreground">完成更多任务获取积分！</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
      </div>
    </motion.div>
  )
}