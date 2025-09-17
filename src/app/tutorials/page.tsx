'use client'

import { useEffect, useState } from 'react'
import { TutorialCenter } from '@/components/gamification/TutorialCenter'
import { InteractiveTutorial } from '@/components/gamification/InteractiveTutorial'
import { Tutorial, UserTutorialProgress, TutorialStats } from '@/types'
import { tutorialService } from '@/services/tutorial.service'
import { TutorialStorageService } from '@/services/tutorialStorage.service'
import { useSession } from 'next-auth/react'
import { InspiraBackground } from '@/components/ui/inspira-background'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TutorialsPage() {
  const { data: session } = useSession()
  const user = session?.user
  const [tutorials, setTutorials] = useState<Tutorial[]>([])
  const [userProgress, setUserProgress] = useState<UserTutorialProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rewards, setRewards] = useState<Array<{
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
  }>>([])
  const [showTutorial, setShowTutorial] = useState(false)
  const [currentTutorial, setCurrentTutorial] = useState<Tutorial | null>(null)
  const [stats, setStats] = useState<TutorialStats | null>(null)

  useEffect(() => {
    const loadTutorials = async () => {
      if (!user) return

      try {
        setLoading(true)
        
        // 获取所有教程
        const tutorialResponse = await tutorialService.getAllTutorials()
        setTutorials(tutorialResponse.tutorials)
        
        // 获取用户进度
        const progress = await tutorialService.getUserTutorialProgress(user.id)
        setUserProgress(progress)
        
        // 获取教程统计
        const tutorialStats = await tutorialService.getTutorialStats(user.id)
        setStats(tutorialStats)
        
        // 同步本地存储
        if (progress && progress.length > 0) {
          TutorialStorageService.saveUserProgress(user.id, progress[0])
        }
      } catch (err) {
        console.error('加载教程失败:', err)
        setError('加载教程失败，请稍后再试')
      } finally {
        setLoading(false)
      }
    }

    loadTutorials()
  }, [user])

  // 处理奖励完成
  const handleRewardComplete = (rewardId: string) => {
    setRewards(prev => prev.filter(r => r.id !== rewardId))
  }

  // 处理奖励
  const handleReward = (reward: {
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
  }) => {
    setRewards(prev => [...prev, reward])
  }

  const handleStartTutorial = async (tutorialId: string) => {
    if (!user) return

    try {
      const tutorial = tutorials.find(t => t.id === tutorialId)
      if (tutorial) {
        setCurrentTutorial(tutorial)
        setShowTutorial(true)
      }
    } catch (err) {
      console.error('开始教程失败:', err)
      setError('开始教程失败，请稍后再试')
    }
  }

  const handleContinueTutorial = async (tutorialId: string, stepId: string) => {
    if (!user) return

    try {
      const tutorial = tutorials.find(t => t.id === tutorialId)
      if (tutorial) {
        setCurrentTutorial(tutorial)
        setShowTutorial(true)
      }
    } catch (err) {
      console.error('继续教程失败:', err)
      setError('继续教程失败，请稍后再试')
    }
  }

  const handleCompleteTutorial = async () => {
    if (!user || !currentTutorial) return

    try {
      // 刷新用户进度
      const progress = await tutorialService.getUserTutorialProgress(user.id)
      setUserProgress(progress)
      
      // 更新统计信息
      const tutorialStats = await tutorialService.getTutorialStats(user.id)
      setStats(tutorialStats)
      
      // 保存到本地存储
      progress.forEach((p: UserTutorialProgress) => {
        if (p.tutorialId === currentTutorial.id) {
          TutorialStorageService.saveUserProgress(user.id, p)
          if (p.status === 'COMPLETED') {
            TutorialStorageService.addCompletedTutorial(user.id, p.tutorialId)
          }
        }
      })
      
      setShowTutorial(false)
      setCurrentTutorial(null)
    } catch (err) {
      console.error('完成教程失败:', err)
      setError('完成教程失败，请稍后再试')
    }
  }

  const handleSkipTutorial = async (tutorialId: string) => {
    if (!user) return

    try {
      await tutorialService.skipTutorial(user.id, tutorialId)
      TutorialStorageService.addSkippedTutorial(user.id, tutorialId)
      
      // 更新进度
      const progress = await tutorialService.getUserTutorialProgress(user.id)
      setUserProgress(progress)
      
      // 更新统计信息
      const tutorialStats = await tutorialService.getTutorialStats(user.id)
      setStats(tutorialStats)
    } catch (err) {
      console.error('跳过教程失败:', err)
      setError('跳过教程失败，请稍后再试')
    }
  }

  const handleResetTutorial = async (tutorialId: string) => {
    if (!user) return

    try {
      await tutorialService.resetTutorialProgress(user.id, tutorialId)
      
      // 清除本地存储的相关数据
      const completedTutorials = TutorialStorageService.getCompletedTutorials(user.id)
      const skippedTutorials = TutorialStorageService.getSkippedTutorials(user.id)
      
      if (completedTutorials.includes(tutorialId)) {
        localStorage.removeItem(`${TutorialStorageService['STORAGE_KEYS'].COMPLETED_TUTORIALS}_${user.id}`)
      }
      
      if (skippedTutorials.includes(tutorialId)) {
        localStorage.removeItem(`${TutorialStorageService['STORAGE_KEYS'].SKIPPED_TUTORIALS}_${user.id}`)
      }
      
      // 更新进度
      const progress = await tutorialService.getUserTutorialProgress(user.id)
      setUserProgress(progress)
      
      // 更新统计信息
      const tutorialStats = await tutorialService.getTutorialStats(user.id)
      setStats(tutorialStats)
    } catch (err) {
      console.error('重置教程失败:', err)
      setError('重置教程失败，请稍后再试')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">加载教程中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">错误</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors"
            >
              重新加载
            </button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">需要登录</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center mb-4">请先登录以访问教程中心</p>
            <button
              onClick={() => window.location.href = '/auth/login'}
              className="w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors"
            >
              登录
            </button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative">
      <InspiraBackground />
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">教程中心</h1>
          <p className="text-gray-600">通过我们的交互式教程，快速掌握系统功能</p>
        </div>

        <TutorialCenter
          userId={user.id}
          tutorials={tutorials}
          userProgress={userProgress}
          stats={stats || undefined}
          onTutorialStart={handleStartTutorial}
          onTutorialContinue={handleContinueTutorial}
          onTutorialRestart={handleResetTutorial}
          onReward={handleReward}
        />
        
        {/* 交互式教程弹窗 */}
        {showTutorial && currentTutorial && (
          <InteractiveTutorial
            userId={user.id}
            tutorial={currentTutorial}
            isOpen={showTutorial}
            onClose={() => setShowTutorial(false)}
            onComplete={handleCompleteTutorial}
            onSkip={() => setShowTutorial(false)}
            onReward={handleReward}
          />
        )}
      </div>
    </div>
  )
}