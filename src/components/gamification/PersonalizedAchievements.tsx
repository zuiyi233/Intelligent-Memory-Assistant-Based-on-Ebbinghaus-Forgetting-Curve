'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Award, TrendingUp, Target, RefreshCw } from 'lucide-react'

// 定义成就类型
interface Achievement {
  id: string
  name: string
  description: string
  difficulty?: number
  category?: string
  type?: string
  points?: number
  icon?: string
  recommendationScore?: number
  reasons?: string[]
}

interface PersonalizedAchievementsProps {
  userId: string
}

export function PersonalizedAchievements({ userId }: PersonalizedAchievementsProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPersonalizedAchievements()
  }, [userId])

  const fetchPersonalizedAchievements = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/gamification/personalized-achievements?userId=${encodeURIComponent(userId)}`)
      if (!response.ok) {
        throw new Error('获取个性化成就推荐失败')
      }
      const data = await response.json()
      setAchievements(data)
    } catch (err) {
      console.error('获取个性化成就推荐失败:', err)
      setError(err instanceof Error ? err.message : '未知错误')
    } finally {
      setLoading(false)
    }
  }

  const getDifficultyColor = (difficulty?: number) => {
    if (!difficulty) return 'bg-gray-100 text-gray-800'
    
    switch (difficulty) {
      case 1: return 'bg-green-100 text-green-800'
      case 2: return 'bg-blue-100 text-blue-800'
      case 3: return 'bg-yellow-100 text-yellow-800'
      case 4: return 'bg-orange-100 text-orange-800'
      case 5: return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDifficultyName = (difficulty?: number) => {
    if (!difficulty) return '普通'
    
    switch (difficulty) {
      case 1: return '简单'
      case 2: return '容易'
      case 3: return '中等'
      case 4: return '困难'
      case 5: return '专家'
      default: return '普通'
    }
  }

  const getRecommendationScoreColor = (score?: number) => {
    if (!score) return 'text-gray-600'
    
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    if (score >= 40) return 'text-orange-600'
    return 'text-red-600'
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
              onClick={fetchPersonalizedAchievements}
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

  if (achievements.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center">
            <Target className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">暂无个性化成就推荐</p>
            <p className="text-sm text-gray-400 mt-1">继续使用系统以获取更多个性化推荐</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* 刷新按钮 */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-500" />
          个性化成就推荐
        </h3>
        <button
          onClick={fetchPersonalizedAchievements}
          className="text-sm text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
        >
          <RefreshCw className="h-4 w-4" />
          刷新推荐
        </button>
      </div>

      {/* 成就推荐列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {achievements.map((achievement, index) => (
          <Card key={achievement.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                {/* 成就图标 */}
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Award className="h-6 w-6 text-blue-600" />
                </div>
                
                {/* 成就信息 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900 truncate">{achievement.name}</h4>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${getDifficultyColor(achievement.difficulty)}`}>
                      {getDifficultyName(achievement.difficulty)}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{achievement.description}</p>
                  
                  {/* 推荐分数 */}
                  {achievement.recommendationScore && (
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-500">推荐匹配度</span>
                      <span className={`text-sm font-bold ${getRecommendationScoreColor(achievement.recommendationScore)}`}>
                        {achievement.recommendationScore.toFixed(0)}%
                      </span>
                    </div>
                  )}
                  
                  {/* 推荐原因 */}
                  {achievement.reasons && achievement.reasons.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500 mb-1">推荐理由:</p>
                      <ul className="space-y-1">
                        {achievement.reasons.slice(0, 2).map((reason, idx) => (
                          <li key={idx} className="text-xs text-gray-600 flex items-start gap-1">
                            <span className="text-blue-500 mt-1">•</span>
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* 积分奖励 */}
                  {achievement.points && (
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                      <span className="text-xs text-gray-500">积分奖励</span>
                      <span className="text-sm font-medium text-yellow-600">
                        +{achievement.points}积分
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* 提示信息 */}
      <div className="text-center pt-2">
        <p className="text-xs text-gray-500">
          这些成就根据你的学习风格和使用习惯个性化推荐
        </p>
      </div>
    </div>
  )
}