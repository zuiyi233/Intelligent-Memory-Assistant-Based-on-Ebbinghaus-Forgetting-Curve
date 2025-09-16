'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Trophy, Medal, Crown, TrendingUp, Calendar, Star } from 'lucide-react'
import { LeaderboardEntry, LeaderboardType, LeaderboardPeriod, User, GamificationProfile } from '@prisma/client'

interface LeaderboardProps {
  userId?: string
}

export function Leaderboard({ userId }: LeaderboardProps) {
  // 定义排行榜条目的扩展类型
  type LeaderboardEntryWithDetails = LeaderboardEntry & {
    user: User
    profile: GamificationProfile
  }

  const [leaderboardEntries, setLeaderboardEntries] = useState<LeaderboardEntryWithDetails[]>([])
  const [selectedType, setSelectedType] = useState<LeaderboardType>('POINTS')
  const [selectedPeriod, setSelectedPeriod] = useState<LeaderboardPeriod>('WEEKLY')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch(`/api/gamification/leaderboard?type=${selectedType}&period=${selectedPeriod}&limit=10`)
        if (!response.ok) {
          throw new Error('获取排行榜数据失败')
        }
        const entries = await response.json()
        setLeaderboardEntries(entries)
      } catch (error) {
        console.error('获取排行榜数据失败:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [selectedType, selectedPeriod])

  const handleTypeChange = (type: LeaderboardType) => {
    setSelectedType(type)
    setLoading(true)
  }

  const handlePeriodChange = (period: LeaderboardPeriod) => {
    setSelectedPeriod(period)
    setLoading(true)
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <div className="relative">
            <Crown className="h-6 w-6 text-yellow-500" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
          </div>
        )
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />
      case 3:
        return <Medal className="h-6 w-6 text-amber-600" />
      default:
        return <span className="text-sm font-bold text-gray-500">#{rank}</span>
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'POINTS':
        return '积分榜'
      case 'LEVEL':
        return '等级榜'
      case 'STREAK':
        return '连续学习榜'
      case 'REVIEW_COUNT':
        return '复习次数榜'
      case 'ACCURACY':
        return '准确率榜'
      default:
        return '排行榜'
    }
  }

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case 'DAILY':
        return '每日'
      case 'WEEKLY':
        return '每周'
      case 'MONTHLY':
        return '每月'
      case 'ALL_TIME':
        return '总榜'
      default:
        return '周期'
    }
  }

  const getScoreLabel = () => {
    switch (selectedType) {
      case 'POINTS':
        return '积分'
      case 'LEVEL':
        return '等级'
      case 'STREAK':
        return '连续天数'
      case 'REVIEW_COUNT':
        return '复习次数'
      case 'ACCURACY':
        return '准确率'
      default:
        return '分数'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'POINTS':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'LEVEL':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'STREAK':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'REVIEW_COUNT':
        return 'text-purple-600 bg-purple-50 border-purple-200'
      case 'ACCURACY':
        return 'text-indigo-600 bg-indigo-50 border-indigo-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const formatScore = (score: number) => {
    if (selectedType === 'ACCURACY') {
      return `${score.toFixed(1)}%`
    }
    return score.toString()
  }

  const isCurrentUser = (entryUserId: string) => {
    return userId && entryUserId === userId
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

  return (
    <div className="space-y-3 md:space-y-4">
      {/* 排行榜筛选器 - 优化为紧凑布局 */}
      <div className="bg-white rounded-lg p-2 md:p-3 shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600 font-medium">
              {getTypeLabel(selectedType)} · {getPeriodLabel(selectedPeriod)}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Calendar className="h-3 w-3" />
            <span>{new Date().toLocaleDateString()}</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-1">
          {['POINTS', 'LEVEL', 'STREAK', 'REVIEW_COUNT', 'ACCURACY'].map((type) => (
            <button
              key={type}
              onClick={() => handleTypeChange(type as LeaderboardType)}
              className={`text-xs px-1.5 md:px-2 py-1 rounded transition-colors ${
                selectedType === type
                  ? `shadow-sm ${getTypeColor(type)}`
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
            >
              {getTypeLabel(type)}
            </button>
          ))}
          
          <div className="border-l border-gray-300 mx-1 hidden sm:block"></div>
          
          {['DAILY', 'WEEKLY', 'MONTHLY', 'ALL_TIME'].map((period) => (
            <button
              key={period}
              onClick={() => handlePeriodChange(period as LeaderboardPeriod)}
              className={`text-xs px-1.5 md:px-2 py-1 rounded transition-colors ${
                selectedPeriod === period
                  ? "bg-blue-100 text-blue-700 shadow-sm"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
            >
              {getPeriodLabel(period)}
            </button>
          ))}
        </div>
      </div>

      {/* 排行榜列表 - 优化为紧凑布局 */}
      {leaderboardEntries.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden max-h-60 md:max-h-80">
          <div className="space-y-0">
            {leaderboardEntries.slice(0, 8).map((entry: LeaderboardEntryWithDetails, index) => (
              <div
                key={entry.id}
                className={`flex items-center justify-between p-2 md:p-3 transition-colors ${
                  index > 0 && "border-t border-gray-100"
                } ${
                  isCurrentUser(entry.userId)
                    ? "bg-blue-50"
                    : "hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="flex-shrink-0 w-6 h-6 md:w-8 md:h-8 flex items-center justify-center">
                    {getRankIcon(entry.rank)}
                  </div>
                   
                  <div className="flex items-center gap-2">
                    {entry.user.avatar ? (
                      <div
                        style={{ backgroundImage: `url(${entry.user.avatar})` }}
                        className="w-6 h-6 md:w-8 md:h-8 rounded-full object-cover border border-gray-200 bg-cover bg-center"
                        title={entry.user.name || entry.user.username}
                      />
                    ) : (
                      <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gray-200 flex items-center justify-center border border-gray-300">
                        <span className="text-gray-600 font-bold text-xs">
                          {(entry.user.name || entry.user.username || '用户').charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                     
                    <div>
                      <div className="flex items-center gap-1">
                        <span className={`font-medium text-sm ${
                          isCurrentUser(entry.userId) ? "text-blue-600" : "text-gray-900"
                        }`}>
                          {entry.user.name || entry.user.username}
                        </span>
                        {isCurrentUser(entry.userId) && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-1 py-0.5 rounded">
                            你
                          </span>
                        )}
                        {entry.rank <= 3 && (
                          <Star className="h-3 w-3 text-yellow-500" />
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <span>Lv.{entry.profile.level}</span>
                        <span>·</span>
                        <span>{entry.profile.points}积分</span>
                      </div>
                    </div>
                  </div>
                </div>
                 
                <div className="flex items-center gap-1">
                  <span className={`font-bold ${
                    entry.rank === 1 && "text-yellow-600"
                  } ${
                    entry.rank === 2 && "text-gray-500"
                  } ${
                    entry.rank === 3 && "text-amber-600"
                  }`}>
                    {formatScore(entry.score)}
                  </span>
                  <span className="text-xs text-gray-500">
                    {getScoreLabel()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg p-6 text-center border border-gray-200">
          <Trophy className="h-8 w-8 mx-auto text-gray-300 mb-2" />
          <p className="text-sm text-gray-500 mb-1">暂无排行榜数据</p>
          <p className="text-xs text-gray-400">成为第一个登上排行榜的用户吧！</p>
        </div>
      )}
       
      {/* 排行榜说明 - 优化为紧凑布局 */}
      <div className="text-xs text-gray-500 bg-blue-50 p-2 md:p-3 rounded-lg">
        <div className="flex items-start gap-2">
          <TrendingUp className="h-3 w-3 text-blue-600 mt-0.5 flex-shrink-0" />
          <p>排行榜每小时更新一次，显示用户在{getPeriodLabel(selectedPeriod).toLowerCase()}的{getTypeLabel(selectedType).toLowerCase()}表现。排名前3的用户将获得特殊标识和额外奖励。</p>
        </div>
      </div>
    </div>
  )
}