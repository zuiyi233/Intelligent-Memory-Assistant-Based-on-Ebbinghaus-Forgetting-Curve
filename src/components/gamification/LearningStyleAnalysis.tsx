'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, Ear, Zap, BookOpen, TrendingUp, RefreshCw } from 'lucide-react'

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

interface LearningStyleAnalysisProps {
  userId: string
}

export function LearningStyleAnalysis({ userId }: LearningStyleAnalysisProps) {
  const [analysis, setAnalysis] = useState<LearningStyleAnalysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAnalysis()
  }, [userId])

  const fetchAnalysis = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/gamification/learning-style?userId=${encodeURIComponent(userId)}`)
      if (!response.ok) {
        throw new Error('获取学习风格分析失败')
      }
      const data = await response.json()
      setAnalysis(data)
    } catch (err) {
      console.error('获取学习风格分析失败:', err)
      setError(err instanceof Error ? err.message : '未知错误')
    } finally {
      setLoading(false)
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

  if (loading) {
    return (
      <Card className="w-full">
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
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-red-500">加载失败: {error}</p>
            <button
              onClick={fetchAnalysis}
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
    <div className="space-y-4">
      {/* 刷新按钮 */}
      <div className="flex justify-end">
        <button
          onClick={fetchAnalysis}
          className="text-sm text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
        >
          <RefreshCw className="h-4 w-4" />
          刷新分析
        </button>
      </div>

      {/* 主要学习风格 */}
      <Card>
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
      <Card>
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
    </div>
  )
}