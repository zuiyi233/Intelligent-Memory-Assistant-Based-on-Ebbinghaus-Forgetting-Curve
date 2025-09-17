'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { InspiraButton } from '@/components/ui/inspira-button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BookOpen, 
  Clock, 
  Star, 
  Users, 
  Search, 
  Filter,
  Play,
  CheckCircle,
  Lock,
  Award,
  TrendingUp,
  Sparkles,
  Target,
  Zap,
  BookMarked,
  ArrowRight,
  Calendar,
  BarChart3
} from 'lucide-react'
import {
  Tutorial,
  UserTutorialProgress,
  TutorialCenterQueryParams,
  TutorialStats,
  TutorialRecommendation
} from '@/types'
import { tutorialService } from '@/services/tutorial.service'
import { cn, animations, cardEffects, textEffects, buttonEffects, gamificationUtils } from '@/lib/inspira-ui'

interface TutorialCenterProps {
  userId: string
  tutorials?: Tutorial[]
  userProgress?: UserTutorialProgress[]
  recommendations?: TutorialRecommendation[]
  stats?: TutorialStats
  onTutorialStart?: (tutorialId: string) => void
  onTutorialContinue?: (tutorialId: string, stepId: string) => void
  onTutorialRestart?: (tutorialId: string) => void
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
  className?: string
}

export function TutorialCenter({
  userId,
  tutorials = [],
  userProgress = [],
  recommendations = [],
  stats,
  onTutorialStart,
  onTutorialContinue,
  onTutorialRestart,
  onReward,
  className
}: TutorialCenterProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL')
  const [selectedAudience, setSelectedAudience] = useState<string>('ALL')
  const [activeTab, setActiveTab] = useState('all')
  
  // 获取用户进度映射
  const progressMap = new Map(userProgress.map(p => [p.tutorialId, p]))

  // 过滤教程
  const filteredTutorials = tutorials.filter(tutorial => {
    const matchesSearch = !searchQuery || 
      tutorial.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tutorial.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tutorial.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'ALL' || tutorial.category === selectedCategory
    const matchesDifficulty = selectedDifficulty === 'ALL' || tutorial.difficulty === selectedDifficulty
    const matchesAudience = selectedAudience === 'ALL' || tutorial.audience === selectedAudience
    
    return matchesSearch && matchesCategory && matchesDifficulty && matchesAudience
  })

  // 分类教程
  const recommendedTutorials = filteredTutorials.filter(tutorial =>
    recommendations.some(rec => rec.tutorialId === tutorial.id)
  )
  
  const inProgressTutorials = filteredTutorials.filter(tutorial => {
    const progress = progressMap.get(tutorial.id)
    return progress?.status === 'IN_PROGRESS'
  })
  
  const completedTutorials = filteredTutorials.filter(tutorial => {
    const progress = progressMap.get(tutorial.id)
    return progress?.status === 'COMPLETED'
  })
  
  const notStartedTutorials = filteredTutorials.filter(tutorial => {
    const progress = progressMap.get(tutorial.id)
    return !progress || progress.status === 'NOT_STARTED'
  })

  // 获取教程状态
  const getTutorialStatus = (tutorialId: string) => {
    const progress = progressMap.get(tutorialId)
    return progress?.status || 'NOT_STARTED'
  }

  // 获取教程进度
  const getTutorialProgress = (tutorialId: string) => {
    const progress = progressMap.get(tutorialId)
    return progress?.progress || 0
  }

  // 获取难度颜色
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'BEGINNER':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20'
      case 'INTERMEDIATE':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20'
      case 'ADVANCED':
        return 'text-red-600 bg-red-100 dark:bg-red-900/20'
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20'
    }
  }

  // 获取类别颜色
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'BASICS':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20'
      case 'ADVANCED':
        return 'text-purple-600 bg-purple-100 dark:bg-purple-900/20'
      case 'FEATURES':
        return 'text-cyan-600 bg-cyan-100 dark:bg-cyan-900/20'
      case 'ACHIEVEMENTS':
        return 'text-amber-600 bg-amber-100 dark:bg-amber-900/20'
      case 'REWARDS':
        return 'text-pink-600 bg-pink-100 dark:bg-pink-900/20'
      case 'CHALLENGES':
        return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20'
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20'
    }
  }

  // 获取状态文本
  const getStatusText = (status: string) => {
    switch (status) {
      case 'NOT_STARTED':
        return '未开始'
      case 'IN_PROGRESS':
        return '进行中'
      case 'COMPLETED':
        return '已完成'
      case 'SKIPPED':
        return '已跳过'
      default:
        return '未知'
    }
  }

  // 获取状态图标
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'NOT_STARTED':
        return <Lock className="h-4 w-4" />
      case 'IN_PROGRESS':
        return <Play className="h-4 w-4" />
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4" />
      case 'SKIPPED':
        return <Users className="h-4 w-4" />
      default:
        return <BookOpen className="h-4 w-4" />
    }
  }

  // 教程卡片组件
  const TutorialCard = ({ tutorial, featured = false }: { tutorial: Tutorial; featured?: boolean }) => {
    const status = getTutorialStatus(tutorial.id)
    const progress = getTutorialProgress(tutorial.id)
    const isRecommended = recommendations.some(rec => rec.tutorialId === tutorial.id)
    const userProgress = progressMap.get(tutorial.id)

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ scale: 1.02 }}
        className={cn(
          "relative overflow-hidden rounded-xl border transition-all duration-300",
          featured && "ring-2 ring-blue-500",
          cardEffects.hover
        )}
      >
        <Card className={cn(
          "h-full overflow-hidden",
          "bg-gradient-to-br from-white/95 to-white/90 dark:from-gray-900/95 dark:to-gray-900/90",
          cardEffects.glass
        )}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <CardTitle className={cn(
                    "text-lg font-bold line-clamp-1",
                    textEffects.gradient(["var(--primary)", "var(--accent)"])
                  )}>
                    {tutorial.name}
                  </CardTitle>
                  {isRecommended && (
                    <Badge variant="outline" className="text-xs gap-1">
                      <Star className="h-3 w-3" />
                      推荐
                    </Badge>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-1 mb-2">
                  <Badge variant="secondary" className={cn("text-xs", getCategoryColor(tutorial.category))}>
                    {tutorial.category}
                  </Badge>
                  <Badge variant="outline" className={cn("text-xs", getDifficultyColor(tutorial.difficulty))}>
                    {tutorial.difficulty}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {tutorial.audience}
                  </Badge>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium">{tutorial.points}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{tutorial.estimatedTime}分钟</span>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {tutorial.description}
            </p>

            {/* 标签 */}
            {tutorial.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {tutorial.tags.slice(0, 3).map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
                {tutorial.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{tutorial.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}

            {/* 进度条 */}
            {status === 'IN_PROGRESS' && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span>进度</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* 状态和操作 */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "flex items-center gap-1 text-xs px-2 py-1 rounded-full",
                  status === 'COMPLETED' && "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
                  status === 'IN_PROGRESS' && "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
                  status === 'NOT_STARTED' && "bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400",
                  status === 'SKIPPED' && "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400"
                )}>
                  {getStatusIcon(status)}
                  <span>{getStatusText(status)}</span>
                </div>
                
                {status === 'COMPLETED' && userProgress?.completedAt && (
                  <div className="text-xs text-muted-foreground">
                    {new Date(userProgress.completedAt).toLocaleDateString()}
                  </div>
                )}
              </div>

              <div className="flex gap-1">
                {status === 'NOT_STARTED' && (
                  <InspiraButton
                    size="sm"
                    onClick={async () => {
                      try {
                        await tutorialService.startTutorial(userId, tutorial.id)
                        onTutorialStart?.(tutorial.id)
                      } catch (error) {
                        console.error('开始教程失败:', error)
                      }
                    }}
                    className={cn(
                      "text-xs",
                      buttonEffects.gradient(["var(--primary)", "var(--accent)"])
                    )}
                  >
                    <Play className="h-3 w-3 mr-1" />
                    开始
                  </InspiraButton>
                )}
                
                {status === 'IN_PROGRESS' && userProgress?.currentStepId && (
                  <InspiraButton
                    size="sm"
                    onClick={async () => {
                      try {
                        onTutorialContinue?.(tutorial.id, userProgress.currentStepId)
                      } catch (error) {
                        console.error('继续教程失败:', error)
                      }
                    }}
                    className={cn(
                      "text-xs",
                      buttonEffects.gradient(["var(--blue-500)", "var(--cyan-500)"])
                    )}
                  >
                    <Play className="h-3 w-3 mr-1" />
                    继续
                  </InspiraButton>
                )}
                
                {status === 'COMPLETED' && (
                  <InspiraButton
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      try {
                        await tutorialService.resetTutorialProgress(userId, tutorial.id)
                        onTutorialRestart?.(tutorial.id)
                      } catch (error) {
                        console.error('重置教程进度失败:', error)
                      }
                    }}
                    className="text-xs"
                  >
                    <ArrowRight className="h-3 w-3 mr-1 rotate-180" />
                    重看
                  </InspiraButton>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 特色标记 */}
        {featured && (
          <div className="absolute top-2 right-2">
            <div className="relative">
              <Sparkles className="h-5 w-5 text-blue-500 animate-pulse" />
            </div>
          </div>
        )}
      </motion.div>
    )
  }

  // 统计卡片组件
  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    color, 
    bgColor 
  }: { 
    title: string; 
    value: string | number; 
    icon: React.ElementType; 
    color: string; 
    bgColor: string 
  }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "p-4 rounded-xl border",
        "bg-gradient-to-br " + bgColor,
        cardEffects.hover
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className={cn("text-2xl font-bold", color)}>{value}</p>
        </div>
        <div className={cn("p-2 rounded-lg", color)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </motion.div>
  )

  return (
    <div className={cn("w-full space-y-6", className)}>
      {/* 头部 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-2"
      >
        <h1 className={cn(
          "text-3xl font-bold",
          textEffects.gradient(["var(--primary)", "var(--accent)"])
        )}>
          教程中心
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          通过我们的互动教程，快速掌握游戏化系统的各项功能。完成教程可获得积分奖励！
        </p>
      </motion.div>

      {/* 统计卡片 */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <StatCard
            title="总教程数"
            value={stats.totalTutorials}
            icon={BookOpen}
            color="text-blue-600"
            bgColor="from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20"
          />
          <StatCard
            title="已完成"
            value={stats.completedTutorials}
            icon={CheckCircle}
            color="text-green-600"
            bgColor="from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20"
          />
          <StatCard
            title="进行中"
            value={stats.inProgressTutorials}
            icon={Play}
            color="text-yellow-600"
            bgColor="from-yellow-50 to-yellow-100 dark:from-yellow-950/20 dark:to-yellow-900/20"
          />
          <StatCard
            title="总积分"
            value={gamificationUtils.formatPoints(stats.totalPoints)}
            icon={Star}
            color="text-purple-600"
            bgColor="from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20"
          />
        </motion.div>
      )}

      {/* 搜索和筛选 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="space-y-4"
      >
        {/* 搜索框 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="搜索教程..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* 筛选器 */}
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">筛选:</span>
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-sm border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2"
          >
            <option value="ALL">所有类别</option>
            <option value="BASICS">基础教程</option>
            <option value="ADVANCED">高级教程</option>
            <option value="FEATURES">功能教程</option>
            <option value="ACHIEVEMENTS">成就教程</option>
            <option value="REWARDS">奖励教程</option>
            <option value="CHALLENGES">挑战教程</option>
          </select>

          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="text-sm border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2"
          >
            <option value="ALL">所有难度</option>
            <option value="BEGINNER">初级</option>
            <option value="INTERMEDIATE">中级</option>
            <option value="ADVANCED">高级</option>
          </select>

          <select
            value={selectedAudience}
            onChange={(e) => setSelectedAudience(e.target.value)}
            className="text-sm border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2"
          >
            <option value="ALL">所有用户</option>
            <option value="NEW_USER">新用户</option>
            <option value="RETURNING_USER">回访用户</option>
            <option value="POWER_USER">高级用户</option>
          </select>
        </div>
      </motion.div>

      {/* 标签页 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all" className="text-xs">
              全部教程 ({filteredTutorials.length})
            </TabsTrigger>
            <TabsTrigger value="recommended" className="text-xs">
              推荐教程 ({recommendedTutorials.length})
            </TabsTrigger>
            <TabsTrigger value="inProgress" className="text-xs">
              进行中 ({inProgressTutorials.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="text-xs">
              已完成 ({completedTutorials.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            {filteredTutorials.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTutorials.map((tutorial, index) => (
                  <TutorialCard 
                    key={tutorial.id} 
                    tutorial={tutorial}
                    featured={index === 0 && recommendedTutorials.length === 0}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">没有找到教程</h3>
                <p className="text-muted-foreground">尝试调整搜索条件或筛选器</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="recommended" className="mt-6">
            {recommendedTutorials.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendedTutorials.map((tutorial) => (
                  <TutorialCard 
                    key={tutorial.id} 
                    tutorial={tutorial}
                    featured
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Star className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">暂无推荐教程</h3>
                <p className="text-muted-foreground">完成更多基础教程后，我们将为您推荐适合的内容</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="inProgress" className="mt-6">
            {inProgressTutorials.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {inProgressTutorials.map((tutorial) => (
                  <TutorialCard key={tutorial.id} tutorial={tutorial} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Play className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">没有进行中的教程</h3>
                <p className="text-muted-foreground">从&ldquo;全部教程&rdquo;中选择一个开始学习吧</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="mt-6">
            {completedTutorials.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedTutorials.map((tutorial) => (
                  <TutorialCard key={tutorial.id} tutorial={tutorial} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <CheckCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">还没有完成任何教程</h3>
                <p className="text-muted-foreground">完成教程可获得积分奖励，开始学习吧</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}