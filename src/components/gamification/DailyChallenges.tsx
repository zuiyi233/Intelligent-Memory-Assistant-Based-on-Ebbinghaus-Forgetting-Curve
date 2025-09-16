'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import { Target, CheckCircle, Clock, Gift, Trophy, Sparkles, Zap } from 'lucide-react'
import { DailyChallenge, UserDailyChallenge } from '@prisma/client'
import { cn } from '@/lib/utils'

interface DailyChallengesProps {
  userId: string
  onUpdateChallengeProgress?: (challengeId: string, progress: number) => Promise<void>
  onClaimChallengeReward?: (challengeId: string) => Promise<void>
}

export function DailyChallenges({ userId, onUpdateChallengeProgress, onClaimChallengeReward }: DailyChallengesProps) {
  const [dailyChallenges, setDailyChallenges] = useState<DailyChallenge[]>([])
  const [userChallenges, setUserChallenges] = useState<UserDailyChallenge[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/gamification/challenges?userId=${userId}`)
        if (!response.ok) {
          throw new Error('获取每日挑战失败')
        }
        const challenges = await response.json()
        
        setDailyChallenges(challenges)
        setUserChallenges(challenges.map((c: any) => c.userChallenges?.[0] || { 
          progress: 0, 
          completed: false, 
          claimed: false 
        }))
      } catch (error) {
        console.error('获取每日挑战失败:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [userId])

  const handleClaimReward = async (challengeId: string) => {
    try {
      if (onClaimChallengeReward) {
        await onClaimChallengeReward(challengeId)
      } else {
        const response = await fetch('/api/gamification/challenges/claim', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            challengeId,
          }),
        })

        if (!response.ok) {
          throw new Error('领取奖励失败')
        }
        
        // 更新用户挑战状态
        const updatedResponse = await fetch(`/api/gamification/challenges?userId=${userId}`)
        if (updatedResponse.ok) {
          const updatedChallenges = await updatedResponse.json()
          setUserChallenges(updatedChallenges.map((c: any) => c.userChallenges?.[0] || { 
            progress: 0, 
            completed: false, 
            claimed: false 
          }))
        }
      }
    } catch (error) {
      console.error('领取奖励失败:', error)
      alert('领取奖励失败，请重试')
    }
  }

  const getChallengeProgress = (challengeId: string) => {
    const userChallenge = userChallenges.find(uc => uc.challengeId === challengeId)
    return userChallenge || { progress: 0, completed: false, claimed: false } as UserDailyChallenge
  }

  const getChallengeTypeLabel = (type: string) => {
    switch (type) {
      case 'REVIEW_COUNT':
        return '复习次数'
      case 'REVIEW_ACCURACY':
        return '复习准确率'
      case 'MEMORY_CREATED':
        return '创建记忆'
      case 'STREAK_DAYS':
        return '连续学习'
      case 'CATEGORY_FOCUS':
        return '类别专注'
      default:
        return '挑战'
    }
  }

  const getChallengeTypeIcon = (type: string) => {
    switch (type) {
      case 'REVIEW_COUNT':
        return <Target className="h-4 w-4" />
      case 'REVIEW_ACCURACY':
        return <CheckCircle className="h-4 w-4" />
      case 'MEMORY_CREATED':
        return <Gift className="h-4 w-4" />
      case 'STREAK_DAYS':
        return <Zap className="h-4 w-4" />
      case 'CATEGORY_FOCUS':
        return <Target className="h-4 w-4" />
      default:
        return <Target className="h-4 w-4" />
    }
  }

  const getChallengeTypeColor = (type: string) => {
    switch (type) {
      case 'REVIEW_COUNT':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'REVIEW_ACCURACY':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'MEMORY_CREATED':
        return 'text-purple-600 bg-purple-50 border-purple-200'
      case 'STREAK_DAYS':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'CATEGORY_FOCUS':
        return 'text-indigo-600 bg-indigo-50 border-indigo-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  if (loading) {
    return (
      <Card className="w-full overflow-hidden backdrop-blur-sm bg-white/80 border border-white/20 shadow-lg">
        <CardContent className="p-6">
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const completedChallenges = userChallenges.filter(uc => uc.completed).length
  const totalChallenges = dailyChallenges.length
  const progressPercentage = totalChallenges > 0 ? (completedChallenges / totalChallenges) * 100 : 0

  return (
    <div className="space-y-3 md:space-y-4">
      {/* 每日挑战进度概览 - 优化为紧凑布局 */}
      <div className="bg-white rounded-lg p-3 md:p-4 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-2 md:mb-3">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium text-gray-700">今日挑战进度</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900">
              {completedChallenges} / {totalChallenges}
            </span>
            <span className="text-xs font-medium bg-gray-100 px-2 py-1 rounded-full">
              {Math.round(progressPercentage)}%
            </span>
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* 挑战列表 - 优化为紧凑布局 */}
      {dailyChallenges.length > 0 ? (
        <div className="space-y-2 md:space-y-3 max-h-60 md:max-h-80 overflow-y-auto">
          {dailyChallenges.map((challenge) => {
            const userProgress = getChallengeProgress(challenge.id)
            const progressPercentage = Math.min(100, (userProgress.progress / challenge.target) * 100)
            const challengeTypeColor = getChallengeTypeColor(challenge.type)
             
            return (
              <div
                key={challenge.id}
                className="bg-white rounded-lg p-2 md:p-3 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`p-1.5 rounded border ${challengeTypeColor}`}>
                        {getChallengeTypeIcon(challenge.type)}
                      </div>
                      <h3 className="font-medium text-sm text-gray-900">{challenge.title}</h3>
                    </div>
                    <p className="text-xs text-gray-600 ml-7">{challenge.description}</p>
                     
                    <div className="flex items-center gap-2 mt-2 ml-7">
                      <span className={`text-xs px-1.5 py-0.5 rounded border ${challengeTypeColor}`}>
                        {getChallengeTypeLabel(challenge.type)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {userProgress.progress}/{challenge.target}
                      </span>
                      <span className="text-xs font-medium text-yellow-600">
                        +{challenge.points}积分
                      </span>
                    </div>
                  </div>
                   
                  <div className="flex flex-col items-end gap-1">
                    {userProgress.completed && !userProgress.claimed && (
                      <button
                        onClick={() => handleClaimReward(challenge.id)}
                        className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white text-xs px-2 py-1 rounded flex items-center gap-1"
                      >
                        <Gift className="h-3 w-3" />
                        领取
                      </button>
                    )}
                     
                    {userProgress.completed && userProgress.claimed && (
                      <div className="flex items-center gap-1 text-green-600 text-xs px-2 py-1 bg-green-50 rounded-full">
                        <CheckCircle className="h-3 w-3" />
                        已完成
                      </div>
                    )}
                  </div>
                </div>
                 
                <div className="space-y-2">
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        userProgress.completed
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                          : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                      }`}
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                   
                  <div className="flex items-center justify-between">
                    {userProgress.progress >= challenge.target && !userProgress.completed && (
                      <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                        可领取奖励
                      </span>
                    )}
                     
                    <div className="flex items-center gap-1 text-xs text-gray-500 ml-auto">
                      <Clock className="h-3 w-3" />
                      <span>23:59截止</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white rounded-lg p-6 text-center border border-gray-200">
          <Target className="h-8 w-8 mx-auto text-gray-300 mb-2" />
          <p className="text-sm text-gray-500 mb-1">今日没有挑战</p>
          <p className="text-xs text-gray-400">明天再来查看新挑战</p>
        </div>
      )}
    </div>
  )
}