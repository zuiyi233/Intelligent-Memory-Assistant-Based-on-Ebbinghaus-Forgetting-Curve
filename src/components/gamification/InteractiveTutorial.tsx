'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { InspiraButton } from '@/components/ui/inspira-button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  SkipForward, 
  CheckCircle, 
  Info,
  MousePointer,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Star,
  Award,
  Sparkles
} from 'lucide-react'
import {
  Tutorial,
  TutorialStep,
  TutorialAction,
  TutorialConfig
} from '@/types'
import { tutorialService } from '@/services/tutorial.service'
import { cn, animations, cardEffects, textEffects, buttonEffects } from '@/lib/inspira-ui'

interface InteractiveTutorialProps {
  tutorial: Tutorial
  config?: Partial<TutorialConfig>
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
  onSkip?: () => void
  onStepChange?: (stepId: string) => void
  userId: string
  currentStepId?: string
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
}

export function InteractiveTutorial({
  tutorial,
  config = {},
  isOpen,
  onClose,
  onComplete,
  onSkip,
  onStepChange,
  userId,
  currentStepId,
  onReward
}: InteractiveTutorialProps) {
  // 合并默认配置
  const defaultConfig: TutorialConfig = {
    autoStart: true,
    showOnFirstLogin: true,
    allowSkip: true,
    showProgress: true,
    highlightTarget: true,
    overlayOpacity: 0.7,
    animationSpeed: 'normal',
    language: 'zh-CN',
    theme: 'auto',
    ...config
  }

  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [isActionInProgress, setIsActionInProgress] = useState(false)
  const [highlightPosition, setHighlightPosition] = useState<{ top: number; left: number; width: number; height: number } | null>(null)
  const [completedActions, setCompletedActions] = useState<Set<string>>(new Set())
  const [tutorialStartTime, setTutorialStartTime] = useState<number | null>(null)
  const [showSkipConfirm, setShowSkipConfirm] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)

  // 根据currentStepId查找当前步骤索引
  useEffect(() => {
    if (currentStepId) {
      const index = tutorial.steps.findIndex(step => step.id === currentStepId)
      if (index !== -1) {
        setCurrentStepIndex(index)
      }
    }
  }, [currentStepId, tutorial.steps])

  // 获取当前步骤
  const currentStep = tutorial.steps[currentStepIndex]

  // 记录教程开始时间
  useEffect(() => {
    if (isOpen && !tutorialStartTime) {
      setTutorialStartTime(Date.now())
      // 开始教程
      tutorialService.startTutorial(userId, tutorial.id).catch(error => {
        console.error('开始教程失败:', error)
      })
    }
  }, [isOpen, tutorialStartTime, userId, tutorial.id])

  // 更新高亮位置
  useEffect(() => {
    if (!isOpen || !currentStep?.target || !defaultConfig.highlightTarget) {
      setHighlightPosition(null)
      return
    }

    const updateHighlightPosition = () => {
      const targetElement = document.querySelector(currentStep.target!)
      if (targetElement) {
        const rect = targetElement.getBoundingClientRect()
        const scrollX = window.pageXOffset || document.documentElement.scrollLeft
        const scrollY = window.pageYOffset || document.documentElement.scrollTop
        
        setHighlightPosition({
          top: rect.top + scrollY,
          left: rect.left + scrollX,
          width: rect.width,
          height: rect.height
        })
      } else {
        setHighlightPosition(null)
      }
    }

    updateHighlightPosition()
    window.addEventListener('resize', updateHighlightPosition)
    window.addEventListener('scroll', updateHighlightPosition)

    return () => {
      window.removeEventListener('resize', updateHighlightPosition)
      window.removeEventListener('scroll', updateHighlightPosition)
    }
  }, [isOpen, currentStep, defaultConfig.highlightTarget])

  // 处理步骤变化
  const handleStepChange = (newIndex: number) => {
    if (newIndex < 0 || newIndex >= tutorial.steps.length) return
    
    setCurrentStepIndex(newIndex)
    setCompletedActions(new Set())
    onStepChange?.(tutorial.steps[newIndex].id)
  }

  // 处理步骤完成奖励
  const handleStepReward = (step: TutorialStep) => {
    if (!step.points || step.points <= 0) return
    
    onReward?.({
      id: `step-reward-${step.id}-${Date.now()}`,
      type: 'POINTS',
      title: '步骤完成奖励',
      description: `完成步骤"${step.title}"获得${step.points}积分`,
      amount: step.points,
      color: 'text-yellow-600',
      icon: <Star className="h-5 w-5" />,
      animation: 'bounce',
      rarity: 'COMMON',
      soundEnabled: true,
      hapticEnabled: true
    })
  }

  // 处理教程完成奖励
  const handleTutorialCompleteReward = () => {
    if (!tutorial.points || tutorial.points <= 0) return
    
    onReward?.({
      id: `tutorial-reward-${tutorial.id}-${Date.now()}`,
      type: 'POINTS',
      title: '教程完成奖励',
      description: `完成教程"${tutorial.name}"获得${tutorial.points}积分`,
      amount: tutorial.points,
      color: 'text-purple-600',
      icon: <Award className="h-5 w-5" />,
      animation: 'scale',
      rarity: tutorial.points > 100 ? 'RARE' : 'COMMON',
      soundEnabled: true,
      hapticEnabled: true
    })
  }

  // 处理教程操作
  const handleAction = async (action: TutorialAction) => {
    if (completedActions.has(action.id)) return

    setIsActionInProgress(true)

    try {
      switch (action.type) {
        case 'CLICK':
          if (action.selector) {
            const element = document.querySelector(action.selector) as HTMLElement
            if (element) {
              element.click()
            }
          }
          break

        case 'INPUT':
          if (action.selector && action.value) {
            const element = document.querySelector(action.selector) as HTMLInputElement
            if (element) {
              element.value = action.value
              element.dispatchEvent(new Event('input', { bubbles: true }))
            }
          }
          break

        case 'SCROLL':
          if (action.selector) {
            const element = document.querySelector(action.selector)
            if (element) {
              element.scrollIntoView({ behavior: 'smooth' })
            }
          } else {
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }
          break

        case 'NAVIGATE':
          if (action.value) {
            window.location.href = action.value
          }
          break

        case 'WAIT':
          await new Promise(resolve => setTimeout(resolve, action.timeout || 1000))
          break
      }

      setCompletedActions(prev => new Set(prev).add(action.id))
    } catch (error) {
      console.error('Tutorial action failed:', error)
    } finally {
      setIsActionInProgress(false)
    }
  }

  // 检查当前步骤是否可以继续
  const canProceedToNext = () => {
    if (!currentStep?.actions || currentStep.actions.length === 0) return true
    return currentStep.actions.every(action => completedActions.has(action.id))
  }

  // 处理下一步
  const handleNext = async () => {
    // 计算步骤花费的时间
    const stepTimeSpent = tutorialStartTime ? Date.now() - tutorialStartTime : 0
    
    if (currentStepIndex < tutorial.steps.length - 1) {
      // 完成当前步骤
      if (currentStep) {
        try {
          await tutorialService.completeTutorialStep(userId, tutorial.id, currentStep.id, stepTimeSpent)
          // 触发步骤完成奖励
          handleStepReward(currentStep)
        } catch (error) {
          console.error('完成教程步骤失败:', error)
        }
      }
      
      handleStepChange(currentStepIndex + 1)
      // 重置教程开始时间为当前步骤的开始时间
      setTutorialStartTime(Date.now())
    } else {
      // 完成最后一步和整个教程
      if (currentStep) {
        try {
          await tutorialService.completeTutorialStep(userId, tutorial.id, currentStep.id, stepTimeSpent)
          // 触发步骤完成奖励
          handleStepReward(currentStep)
          
          // 触发教程完成奖励
          handleTutorialCompleteReward()
        } catch (error) {
          console.error('完成教程步骤失败:', error)
        }
      }
      
      onComplete()
    }
  }

  // 处理上一步
  const handlePrev = () => {
    if (currentStepIndex > 0) {
      handleStepChange(currentStepIndex - 1)
    }
  }

  // 处理跳过教程
  const handleSkip = () => {
    setShowSkipConfirm(true)
  }

  // 确认跳过教程
  const confirmSkip = async () => {
    try {
      await tutorialService.skipTutorial(userId, tutorial.id, '用户手动跳过')
    } catch (error) {
      console.error('跳过教程失败:', error)
    }
    setShowSkipConfirm(false)
    onSkip?.()
    onClose()
  }

  // 取消跳过教程
  const cancelSkip = () => {
    setShowSkipConfirm(false)
  }

  // 获取步骤位置指示器
  const getPositionIndicator = (position?: string) => {
    switch (position) {
      case 'top':
        return <ArrowUp className="h-4 w-4" />
      case 'bottom':
        return <ArrowDown className="h-4 w-4" />
      case 'left':
        return <ArrowLeft className="h-4 w-4" />
      case 'right':
        return <ArrowRight className="h-4 w-4" />
      default:
        return <MousePointer className="h-4 w-4" />
    }
  }

  // 计算进度
  const progress = ((currentStepIndex + 1) / tutorial.steps.length) * 100

  // 动画速度配置
  const animationDuration = {
    slow: 500,
    normal: 300,
    fast: 150
  }[defaultConfig.animationSpeed]

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {/* 覆盖层 */}
      <motion.div
        ref={overlayRef}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: animationDuration / 1000 }}
        onClick={onClose}
      />

      {/* 高亮区域 */}
      {highlightPosition && (
        <motion.div
          className="fixed z-40 pointer-events-none"
          style={{
            top: highlightPosition.top,
            left: highlightPosition.left,
            width: highlightPosition.width,
            height: highlightPosition.height,
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: animationDuration / 1000 }}
        >
          <div className="absolute inset-0 ring-4 ring-blue-400 rounded-lg shadow-lg" />
          <div className="absolute inset-0 bg-blue-400/20 rounded-lg animate-pulse" />
        </motion.div>
      )}

      {/* 跳过确认对话框 */}
      {showSkipConfirm && (
        <motion.div
          className="fixed inset-0 z-60 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={cancelSkip} />
          <motion.div
            className="relative bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-6 max-w-sm w-full"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold mb-2">确认跳过教程</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              您确定要跳过&ldquo;{tutorial.name}&rdquo;教程吗？跳过后将无法获得教程完成奖励。
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={cancelSkip}
                className="px-4"
              >
                取消
              </Button>
              <Button
                onClick={confirmSkip}
                className="px-4"
              >
                确认跳过
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* 教程内容 */}
      <motion.div
        className={cn(
          "fixed z-50 max-w-md w-full mx-4",
          // 根据位置确定教程卡片显示位置
          currentStep?.position === 'top' && "bottom-auto top-4",
          currentStep?.position === 'bottom' && "top-auto bottom-4",
          currentStep?.position === 'left' && "right-auto left-4",
          currentStep?.position === 'right' && "left-auto right-4",
          (!currentStep?.position || currentStep.position === 'center') && "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        )}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: animationDuration / 1000 }}
        onClick={(e) => e.stopPropagation()}
      >
        <Card className={cn(
          "overflow-hidden backdrop-blur-xl border-0 shadow-2xl",
          "bg-gradient-to-br from-white/95 to-white/90 dark:from-gray-900/95 dark:to-gray-900/90",
          cardEffects.glass,
          cardEffects.hover
        )}>
          {/* 头部 */}
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "p-2 rounded-lg",
                  "bg-gradient-to-br from-blue-500 to-purple-500"
                )}>
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className={cn(
                    "text-lg font-bold",
                    textEffects.gradient(["var(--primary)", "var(--accent)"])
                  )}>
                    {tutorial.name}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {currentStepIndex + 1} / {tutorial.steps.length}
                    </Badge>
                    {currentStep?.points && (
                      <Badge variant="outline" className="text-xs gap-1">
                        <Star className="h-3 w-3" />
                        +{currentStep.points}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* 进度条 */}
            {defaultConfig.showProgress && (
              <div className="mt-3">
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  完成进度: {Math.round(progress)}%
                </p>
              </div>
            )}
          </CardHeader>

          {/* 内容 */}
          <CardContent className="space-y-4">
            {/* 步骤标题 */}
            <div className="flex items-center gap-2">
              {getPositionIndicator(currentStep?.position)}
              <h3 className="text-lg font-semibold">{currentStep?.title}</h3>
              {currentStep?.isRequired && (
                <Badge variant="destructive" className="text-xs">
                  必需
                </Badge>
              )}
            </div>

            {/* 步骤内容 */}
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {currentStep?.content}
              </p>

              {/* 步骤图片或视频 */}
              {currentStep?.image && (
                <div className="rounded-lg overflow-hidden">
                  <img 
                    src={currentStep.image} 
                    alt={currentStep.title}
                    className="w-full h-auto object-cover"
                  />
                </div>
              )}

              {currentStep?.video && (
                <div className="rounded-lg overflow-hidden">
                  <video 
                    src={currentStep.video}
                    controls
                    className="w-full h-auto"
                  >
                    您的浏览器不支持视频播放。
                  </video>
                </div>
              )}

              {/* 操作列表 */}
              {currentStep?.actions && currentStep.actions.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium flex items-center gap-1">
                    <MousePointer className="h-4 w-4" />
                    请完成以下操作：
                  </h4>
                  <div className="space-y-2">
                    {currentStep.actions.map((action) => (
                      <div
                        key={action.id}
                        className={cn(
                          "flex items-center gap-2 p-2 rounded-lg border transition-all",
                          completedActions.has(action.id)
                            ? "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800"
                            : "bg-muted/50 border-border"
                        )}
                      >
                        <div className={cn(
                          "flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center",
                          completedActions.has(action.id)
                            ? "bg-green-500 text-white"
                            : "bg-muted-foreground/20 text-muted-foreground"
                        )}>
                          {completedActions.has(action.id) ? (
                            <CheckCircle className="h-3 w-3" />
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-current" />
                          )}
                        </div>
                        <p className="text-sm flex-1">{action.instruction}</p>
                        {!completedActions.has(action.id) && (
                          <InspiraButton
                            variant="outline"
                            size="sm"
                            onClick={() => handleAction(action)}
                            disabled={isActionInProgress}
                            className="text-xs"
                          >
                            {isActionInProgress ? '处理中...' : '执行'}
                          </InspiraButton>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 底部按钮 */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex gap-2">
                {defaultConfig.allowSkip && (
                  <InspiraButton
                    variant="outline"
                    size="sm"
                    onClick={handleSkip}
                    className="text-xs"
                  >
                    <SkipForward className="h-3 w-3 mr-1" />
                    跳过教程
                  </InspiraButton>
                )}
              </div>

              <div className="flex gap-2">
                <InspiraButton
                  variant="outline"
                  size="sm"
                  onClick={handlePrev}
                  disabled={currentStepIndex === 0 || isActionInProgress}
                  className="text-xs"
                >
                  <ChevronLeft className="h-3 w-3 mr-1" />
                  上一步
                </InspiraButton>

                <InspiraButton
                  size="sm"
                  onClick={handleNext}
                  disabled={!canProceedToNext() || isActionInProgress}
                  className={cn(
                    "text-xs",
                    currentStepIndex === tutorial.steps.length - 1
                      ? buttonEffects.gradient(["var(--green-500)", "var(--emerald-500)"])
                      : buttonEffects.gradient(["var(--primary)", "var(--accent)"])
                  )}
                >
                  {currentStepIndex === tutorial.steps.length - 1 ? (
                    <>
                      <Award className="h-3 w-3 mr-1" />
                      完成教程
                    </>
                  ) : (
                    <>
                      下一步
                      <ChevronRight className="h-3 w-3 ml-1" />
                    </>
                  )}
                </InspiraButton>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}