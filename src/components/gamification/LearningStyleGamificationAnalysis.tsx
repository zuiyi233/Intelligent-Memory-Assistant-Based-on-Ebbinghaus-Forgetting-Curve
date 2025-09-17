'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Eye, Ear, Zap, BookOpen, TrendingUp, RefreshCw, Settings, Trophy, Star, Target, Lightbulb } from 'lucide-react'
import { animations, cardEffects } from '@/lib/inspira-ui'

// 定义学习风格类型
type LearningStyleType = 'VISUAL' | 'AUDITORY' | 'KINESTHETIC' | 'READING' | 'MIXED'

// 学习风格分析结果类型
interface LearningStyleAnalysis {
  primaryStyle: LearningStyleType
  secondaryStyle?: LearningStyleType
  scores: {
    visual: number
    auditory: number
    kinesthetic: number
    reading: number
  }
  confidence: number
  recommendations: string[]
  dataPoints: number
}

// 游戏化建议类型
interface GamificationRecommendation {
  recommendedElements: {
    id: string
    name: string
    description: string
    icon: React.ReactNode
    priority: 'high' | 'medium' | 'low'
  }[]
  recommendedContentTypes: {
    type: string
    name: string
    description: string
    effectiveness: number // 0-100
  }[]
  recommendedInteractionModes: {
    mode: string
    name: string
    description: string
    suitability: number // 0-100
  }[]
  recommendedTheme: {
    style: string
    primaryColor: string
    secondaryColor: string
    description: string
  }
  reasoning: string[]
  confidence: number
}

// 学习风格配置
const learningStyleConfig = {
  VISUAL: {
    name: '视觉型',
    description: '通过图像、图表和视觉材料学习效果最佳',
    icon: Eye,
    color: 'bg-blue-100 text-blue-800',
    recommendations: [
      '使用图表和图形来可视化信息',
      '观看视频教程和演示',
      '使用颜色编码来组织笔记',
      '创建思维导图和概念图'
    ]
  },
  AUDITORY: {
    name: '听觉型',
    description: '通过听讲、讨论和音频材料学习效果最佳',
    icon: Ear,
    color: 'bg-green-100 text-green-800',
    recommendations: [
      '参与讨论和小组学习',
      '听播客和音频课程',
      '大声朗读材料',
      '使用录音来复习内容'
    ]
  },
  KINESTHETIC: {
    name: '动觉型',
    description: '通过实践、动手操作和身体活动学习效果最佳',
    icon: Zap,
    color: 'bg-yellow-100 text-yellow-800',
    recommendations: [
      '动手实践和实验',
      '角色扮演和模拟',
      '边做边学',
      '使用物理对象来理解概念'
    ]
  },
  READING: {
    name: '阅读型',
    description: '通过阅读文本材料和写作学习效果最佳',
    icon: BookOpen,
    color: 'bg-purple-100 text-purple-800',
    recommendations: [
      '阅读详细的书面材料',
      '做笔记和总结',
      '写作和复述内容',
      '使用文本为基础的学习资源'
    ]
  },
  MIXED: {
    name: '混合型',
    description: '结合多种学习方式，适应性强',
    icon: TrendingUp,
    color: 'bg-gray-100 text-gray-800',
    recommendations: [
      '结合多种学习方法',
      '根据内容类型选择最适合的学习方式',
      '灵活调整学习策略',
      '使用多元化的学习资源'
    ]
  }
}

interface LearningStyleGamificationAnalysisProps {
  userId: string
}

/**
 * 学习风格分析与游戏化建议组件
 * 整合学习风格分析和基于学习风格的个性化游戏化建议
 */
export function LearningStyleGamificationAnalysis({ userId }: LearningStyleGamificationAnalysisProps) {
  const [analysis, setAnalysis] = useState<LearningStyleAnalysis | null>(null)
  const [gamificationRecommendation, setGamificationRecommendation] = useState<GamificationRecommendation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('analysis')

  useEffect(() => {
    fetchData()
  }, [userId])

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // 获取学习风格分析
      const analysisResponse = await fetch(`/api/gamification/learning-style?userId=${encodeURIComponent(userId)}`)
      if (!analysisResponse.ok) {
        throw new Error('获取学习风格分析失败')
      }
      const analysisData = await analysisResponse.json()
      setAnalysis(analysisData)

      // 获取个性化配置推荐
      if (analysisData.primaryStyle) {
        const recommendationResponse = await fetch(`/api/gamification/personalized-config/recommendations?userId=${encodeURIComponent(userId)}&learningStyle=${analysisData.primaryStyle}`)
        if (recommendationResponse.ok) {
          const recommendationData = await recommendationResponse.json()
          if (recommendationData.success) {
            // 将个性化配置推荐转换为游戏化建议
            const gamificationRec = convertToGamificationRecommendation(analysisData, recommendationData.data)
            setGamificationRecommendation(gamificationRec)
          }
        }
      }
    } catch (err) {
      console.error('获取数据失败:', err)
      setError(err instanceof Error ? err.message : '未知错误')
    } finally {
      setLoading(false)
    }
  }

  // 将个性化配置推荐转换为游戏化建议
  const convertToGamificationRecommendation = (
    analysis: LearningStyleAnalysis,
    recommendationData: {
      reasoning: string[];
      confidence: number;
      recommendations: Record<string, unknown>;
    }
  ): GamificationRecommendation => {
    const primaryStyle = analysis.primaryStyle
    const primaryConfig = learningStyleConfig[primaryStyle]
    
    // 基于学习风格生成推荐的游戏化元素
    const recommendedElements = generateGamificationElements(primaryStyle)
    
    // 基于学习风格生成推荐的内容类型
    const recommendedContentTypes = generateContentTypes(primaryStyle)
    
    // 基于学习风格生成推荐的交互模式
    const recommendedInteractionModes = generateInteractionModes(primaryStyle)
    
    // 基于学习风格生成推荐的主题
    const recommendedTheme = generateTheme(primaryStyle)
    
    return {
      recommendedElements,
      recommendedContentTypes,
      recommendedInteractionModes,
      recommendedTheme,
      reasoning: recommendationData.reasoning || [],
      confidence: recommendationData.confidence || 0.5
    }
  }

  // 生成推荐的游戏化元素
  const generateGamificationElements = (learningStyle: LearningStyleType) => {
    const baseElements = [
      {
        id: 'points',
        name: '积分系统',
        description: '通过完成学习任务获得积分',
        icon: <Star className="h-5 w-5" />,
        priority: 'high' as const
      },
      {
        id: 'achievements',
        name: '成就系统',
        description: '解锁学习成就，展示学习进度',
        icon: <Trophy className="h-5 w-5" />,
        priority: 'high' as const
      },
      {
        id: 'challenges',
        name: '挑战系统',
        description: '完成学习挑战，提升技能',
        icon: <Target className="h-5 w-5" />,
        priority: 'medium' as const
      },
      {
        id: 'leaderboard',
        name: '排行榜',
        description: '与其他学习者比较进度',
        icon: <TrendingUp className="h-5 w-5" />,
        priority: 'low' as const
      }
    ]

    // 根据学习风格调整优先级
    switch (learningStyle) {
      case 'VISUAL':
        return baseElements.map(el => 
          el.id === 'achievements' ? { ...el, priority: 'high' as const } : el
        )
      case 'AUDITORY':
        return baseElements.map(el => 
          el.id === 'challenges' ? { ...el, priority: 'high' as const } : el
        )
      case 'KINESTHETIC':
        return baseElements.map(el => 
          el.id === 'points' ? { ...el, priority: 'high' as const } : el
        )
      case 'READING':
        return baseElements.map(el => 
          el.id === 'achievements' ? { ...el, priority: 'high' as const } : el
        )
      default:
        return baseElements
    }
  }

  // 生成推荐的内容类型
  const generateContentTypes = (learningStyle: LearningStyleType) => {
    const contentTypes = [
      { type: 'TEXT', name: '文本内容', description: '文章、笔记和书面材料' },
      { type: 'IMAGE', name: '图像内容', description: '图表、图片和视觉材料' },
      { type: 'AUDIO', name: '音频内容', description: '播客、讲解和录音' },
      { type: 'VIDEO', name: '视频内容', description: '教程、演示和录像' },
      { type: 'INTERACTIVE', name: '交互内容', description: '模拟、游戏和实践' },
      { type: 'QUIZ', name: '测验内容', description: '问题、测试和评估' }
    ]

    // 根据学习风格设置效果值
    switch (learningStyle) {
      case 'VISUAL':
        return contentTypes.map(ct => ({
          ...ct,
          effectiveness: ct.type === 'IMAGE' ? 95 : 
                         ct.type === 'VIDEO' ? 90 :
                         ct.type === 'INTERACTIVE' ? 80 :
                         ct.type === 'TEXT' ? 70 :
                         ct.type === 'QUIZ' ? 60 : 40
        }))
      case 'AUDITORY':
        return contentTypes.map(ct => ({
          ...ct,
          effectiveness: ct.type === 'AUDIO' ? 95 : 
                         ct.type === 'VIDEO' ? 85 :
                         ct.type === 'TEXT' ? 75 :
                         ct.type === 'QUIZ' ? 70 :
                         ct.type === 'INTERACTIVE' ? 60 : 40
        }))
      case 'KINESTHETIC':
        return contentTypes.map(ct => ({
          ...ct,
          effectiveness: ct.type === 'INTERACTIVE' ? 95 : 
                         ct.type === 'QUIZ' ? 85 :
                         ct.type === 'VIDEO' ? 75 :
                         ct.type === 'IMAGE' ? 65 :
                         ct.type === 'TEXT' ? 55 : 40
        }))
      case 'READING':
        return contentTypes.map(ct => ({
          ...ct,
          effectiveness: ct.type === 'TEXT' ? 95 : 
                         ct.type === 'QUIZ' ? 90 :
                         ct.type === 'IMAGE' ? 75 :
                         ct.type === 'VIDEO' ? 65 :
                         ct.type === 'INTERACTIVE' ? 60 : 40
        }))
      default:
        return contentTypes.map(ct => ({ ...ct, effectiveness: 70 }))
    }
  }

  // 生成推荐的交互模式
  const generateInteractionModes = (learningStyle: LearningStyleType) => {
    const interactionModes = [
      { mode: 'CLICK', name: '点击交互', description: '通过点击进行操作' },
      { mode: 'DRAG_DROP', name: '拖放交互', description: '通过拖放进行操作' },
      { mode: 'GESTURE', name: '手势交互', description: '通过手势进行操作' },
      { mode: 'VOICE', name: '语音交互', description: '通过语音进行操作' },
      { mode: 'KEYBOARD', name: '键盘交互', description: '通过键盘进行操作' }
    ]

    // 根据学习风格设置适合度值
    switch (learningStyle) {
      case 'VISUAL':
        return interactionModes.map(im => ({
          ...im,
          suitability: im.mode === 'CLICK' ? 95 : 
                       im.mode === 'DRAG_DROP' ? 90 :
                       im.mode === 'GESTURE' ? 80 :
                       im.mode === 'KEYBOARD' ? 70 : 50
        }))
      case 'AUDITORY':
        return interactionModes.map(im => ({
          ...im,
          suitability: im.mode === 'VOICE' ? 95 : 
                       im.mode === 'CLICK' ? 85 :
                       im.mode === 'KEYBOARD' ? 75 :
                       im.mode === 'GESTURE' ? 60 : 40
        }))
      case 'KINESTHETIC':
        return interactionModes.map(im => ({
          ...im,
          suitability: im.mode === 'GESTURE' ? 95 : 
                       im.mode === 'DRAG_DROP' ? 90 :
                       im.mode === 'CLICK' ? 80 :
                       im.mode === 'KEYBOARD' ? 60 : 40
        }))
      case 'READING':
        return interactionModes.map(im => ({
          ...im,
          suitability: im.mode === 'KEYBOARD' ? 95 : 
                       im.mode === 'CLICK' ? 90 :
                       im.mode === 'DRAG_DROP' ? 70 :
                       im.mode === 'GESTURE' ? 60 : 40
        }))
      default:
        return interactionModes.map(im => ({ ...im, suitability: 70 }))
    }
  }

  // 生成推荐的主题
  const generateTheme = (learningStyle: LearningStyleType) => {
    switch (learningStyle) {
      case 'VISUAL':
        return {
          style: '浅色主题',
          primaryColor: '#3B82F6',
          secondaryColor: '#60A5FA',
          description: '浅色主题和蓝色调有助于提高视觉学习效果'
        }
      case 'AUDITORY':
        return {
          style: '自动主题',
          primaryColor: '#10B981',
          secondaryColor: '#34D399',
          description: '绿色主题有助于营造轻松的学习环境'
        }
      case 'KINESTHETIC':
        return {
          style: '深色主题',
          primaryColor: '#F59E0B',
          secondaryColor: '#FBBF24',
          description: '深色主题和暖色调有助于提高专注度'
        }
      case 'READING':
        return {
          style: '浅色主题',
          primaryColor: '#8B5CF6',
          secondaryColor: '#A78BFA',
          description: '浅色主题和紫色调有助于长时间阅读'
        }
      default:
        return {
          style: '自动主题',
          primaryColor: '#6366F1',
          secondaryColor: '#818CF8',
          description: '自适应主题可以满足不同学习场景的需求'
        }
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-gray-600'
  }

  const getProgressPercentage = (score: number) => {
    return Math.min(100, Math.max(0, score))
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return '高'
      case 'medium': return '中'
      case 'low': return '低'
      default: return '未知'
    }
  }

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex justify-center items-center h-32">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">正在加载学习风格分析...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-red-500">加载失败: {error}</p>
            <button
              onClick={fetchData}
              className="mt-2 text-blue-600 hover:text-blue-800 flex items-center justify-center gap-1"
            >
              <RefreshCw className="h-4 w-4" />
              重试
            </button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!analysis) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-gray-500">暂无学习风格分析数据</p>
            <p className="text-sm text-gray-400 mt-2">继续使用系统以生成分析</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const primaryStyle = learningStyleConfig[analysis.primaryStyle]
  const secondaryStyle = analysis.secondaryStyle ? learningStyleConfig[analysis.secondaryStyle] : null
  const PrimaryIcon = primaryStyle.icon
  const SecondaryIcon = secondaryStyle?.icon

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">学习风格分析与游戏化建议</h1>
        <button
          onClick={fetchData}
          className="text-sm text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
        >
          <RefreshCw className="h-4 w-4" />
          刷新分析
        </button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="analysis">学习风格分析</TabsTrigger>
          <TabsTrigger value="gamification">游戏化建议</TabsTrigger>
        </TabsList>
        
        <TabsContent value="analysis" className="space-y-4">
          {/* 主要学习风格 */}
          <Card className={`${animations.fadeIn} ${cardEffects.glowBorder()}`}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <PrimaryIcon className="h-5 w-5" />
                主要学习风格: {primaryStyle.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{primaryStyle.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">学习风格分数</h4>
                  <div className="space-y-3">
                    {Object.entries(analysis.scores).map(([style, score]) => {
                      const styleConfig = learningStyleConfig[style.toUpperCase() as LearningStyleType]
                      const Icon = styleConfig.icon
                      return (
                        <div key={style} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-2 text-sm">
                              <Icon className="h-4 w-4" />
                              {styleConfig.name}
                            </span>
                            <span className={`text-sm font-medium ${getScoreColor(score)}`}>
                              {score.toFixed(1)}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${getProgressPercentage(score)}%` }}
                            ></div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">分析信息</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">置信度:</span>
                      <span className={`font-medium ${getScoreColor(analysis.confidence)}`}>
                        {analysis.confidence.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">数据点数:</span>
                      <span className="font-medium">{analysis.dataPoints}</span>
                    </div>
                    {secondaryStyle && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">次要风格:</span>
                        <span className="font-medium flex items-center gap-1">
                          {SecondaryIcon && <SecondaryIcon className="h-4 w-4" />}
                          {secondaryStyle.name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 个性化推荐 */}
          <Card className={`${animations.fadeIn} ${cardEffects.glowBorder()}`}>
            <CardHeader className="pb-3">
              <CardTitle>个性化学习建议</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">基于主要学习风格的建议</h4>
                  <ul className="space-y-1">
                    {primaryStyle.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
                
                {secondaryStyle && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">基于次要学习风格的建议</h4>
                    <ul className="space-y-1">
                      {secondaryStyle.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                          <span className="text-green-500 mt-1">•</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              {analysis.recommendations.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium text-gray-700 mb-2">额外个性化建议</h4>
                  <ul className="space-y-1">
                    {analysis.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="text-purple-500 mt-1">•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="gamification" className="space-y-4">
          {gamificationRecommendation ? (
            <>
              {/* 推荐的游戏化元素 */}
              <Card className={`${animations.fadeIn} ${cardEffects.glowBorder()}`}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    推荐的游戏化元素
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {gamificationRecommendation.recommendedElements.map((element) => (
                      <div key={element.id} className="flex items-start gap-3 p-3 border rounded-lg">
                        <div className="text-blue-500 mt-1">
                          {element.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h5 className="font-medium">{element.name}</h5>
                            <Badge className={getPriorityColor(element.priority)}>
                              {getPriorityText(element.priority)}优先级
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{element.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 推荐的内容类型 */}
              <Card className={`${animations.fadeIn} ${cardEffects.glowBorder()}`}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    推荐的内容类型
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {gamificationRecommendation.recommendedContentTypes.map((contentType) => (
                      <div key={contentType.type} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium">{contentType.name}</h5>
                          <span className={`text-sm font-medium ${getScoreColor(contentType.effectiveness)}`}>
                            {contentType.effectiveness}% 匹配度
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${contentType.effectiveness}%` }}
                          ></div>
                        </div>
                        <p className="text-sm text-gray-600">{contentType.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 推荐的交互模式 */}
              <Card className={`${animations.fadeIn} ${cardEffects.glowBorder()}`}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    推荐的交互模式
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {gamificationRecommendation.recommendedInteractionModes.map((interactionMode) => (
                      <div key={interactionMode.mode} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium">{interactionMode.name}</h5>
                          <span className={`text-sm font-medium ${getScoreColor(interactionMode.suitability)}`}>
                            {interactionMode.suitability}% 适合度
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${interactionMode.suitability}%` }}
                          ></div>
                        </div>
                        <p className="text-sm text-gray-600">{interactionMode.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 推荐的主题 */}
              <Card className={`${animations.fadeIn} ${cardEffects.glowBorder()}`}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    推荐的视觉主题
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      <div 
                        className="w-16 h-16 rounded-lg border-2 border-gray-200"
                        style={{ 
                          backgroundColor: gamificationRecommendation.recommendedTheme.primaryColor 
                        }}
                      ></div>
                    </div>
                    <div>
                      <h5 className="font-medium">{gamificationRecommendation.recommendedTheme.style}</h5>
                      <div className="flex items-center gap-2 mt-1">
                        <div 
                          className="w-4 h-4 rounded-full border border-gray-300"
                          style={{ backgroundColor: gamificationRecommendation.recommendedTheme.primaryColor }}
                        ></div>
                        <div 
                          className="w-4 h-4 rounded-full border border-gray-300"
                          style={{ backgroundColor: gamificationRecommendation.recommendedTheme.secondaryColor }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        {gamificationRecommendation.recommendedTheme.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 推荐理由 */}
              <Card className={`${animations.fadeIn} ${cardEffects.glowBorder()}`}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    推荐理由
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">置信度:</h4>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${gamificationRecommendation.confidence * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {Math.round(gamificationRecommendation.confidence * 100)}% 匹配您的学习风格
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">推荐理由:</h4>
                    <ul className="space-y-1">
                      {gamificationRecommendation.reasoning.map((reason, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                          <span className="text-blue-500 mt-1">•</span>
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-gray-500">暂无游戏化建议</p>
                  <p className="text-sm text-gray-400 mt-2">请完成学习风格分析以获取个性化游戏化建议</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default LearningStyleGamificationAnalysis