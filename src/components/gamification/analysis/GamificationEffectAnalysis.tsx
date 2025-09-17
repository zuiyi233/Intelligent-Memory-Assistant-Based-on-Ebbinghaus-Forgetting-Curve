'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

// 定义数据类型
interface GamificationEffectAnalysisData {
  period: string
  userEngagement: {
    totalPoints: number
    achievementsUnlocked: number
    challengesCompleted: number
    loginStreak: number
    dailyActiveMinutes: number
  }
  learningProgress: {
    memoriesCreated: number
    reviewsCompleted: number
    averageAccuracy: number
    learningCurve: Array<{
      date: string
      accuracy: number
      reviews: number
    }>
  }
  behaviorPatterns: {
    timeOfDayActivity: Array<{
      hour: number
      activity: number
    }>
    featureUsage: Array<{
      feature: string
      usage: number
    }>
  }
  gamificationImpact: {
    motivationLevel: number
    retentionRate: number
    completionRate: number
    satisfactionScore: number
    preGamificationVsPost: Array<{
      metric: string
      before: number
      after: number
      improvement: number
    }>
  }
  correlations: {
    pointsVsAccuracy: number
    achievementsVsConsistency: number
    challengesVsLearningSpeed: number
  }
}

interface GamificationEffectAnalysisProps {
  userId: string
  days?: number
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export const GamificationEffectAnalysis: React.FC<GamificationEffectAnalysisProps> = ({
  userId,
  days = 30
}) => {
  const [data, setData] = useState<GamificationEffectAnalysisData | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/gamification/analysis/effect?userId=${userId}&days=${days}`)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const result = await response.json()
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : '获取数据失败')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [userId, days])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md text-red-700">
        <p>加载失败: {error}</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="bg-yellow-50 p-4 rounded-md text-yellow-700">
        <p>没有可用的数据</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">游戏化效果分析</h2>
        <Badge variant="outline">{data.period}</Badge>
      </div>

      <Tabs defaultValue="engagement" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="engagement">用户参与度</TabsTrigger>
          <TabsTrigger value="progress">学习进度</TabsTrigger>
          <TabsTrigger value="behavior">行为模式</TabsTrigger>
          <TabsTrigger value="impact">游戏化影响</TabsTrigger>
          <TabsTrigger value="correlation">相关性分析</TabsTrigger>
        </TabsList>

        <TabsContent value="engagement" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">总积分</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.userEngagement.totalPoints}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">解锁成就</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.userEngagement.achievementsUnlocked}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">完成挑战</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.userEngagement.challengesCompleted}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">登录连续天数</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.userEngagement.loginStreak}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>每日活跃时间 (分钟)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Progress value={Math.min(100, (data.userEngagement.dailyActiveMinutes / 60) * 100)} className="flex-1" />
                <span className="text-sm font-medium">{data.userEngagement.dailyActiveMinutes} 分钟</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">创建记忆</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.learningProgress.memoriesCreated}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">完成复习</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.learningProgress.reviewsCompleted}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">平均准确率</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <div className="text-2xl font-bold">{(data.learningProgress.averageAccuracy * 100).toFixed(1)}%</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>学习曲线</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.learningProgress.learningCurve}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="accuracy" name="准确率" stroke="#8884d8" activeDot={{ r: 8 }} />
                  <Line yAxisId="right" type="monotone" dataKey="reviews" name="复习次数" stroke="#82ca9d" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="behavior" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>时间分布活动</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.behaviorPatterns.timeOfDayActivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" label={{ value: '小时', position: 'insideBottomRight', offset: -5 }} />
                  <YAxis label={{ value: '活动量', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Bar dataKey="activity" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>功能使用分布</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.behaviorPatterns.featureUsage}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="usage"
                    nameKey="feature"
                    label={({ name, value }) => {
                      const total = data.behaviorPatterns.featureUsage.reduce((sum, item) => sum + item.usage, 0);
                      const percentage = ((Number(value) || 0) / total) * 100;
                      return `${name}: ${percentage.toFixed(0)}%`;
                    }}
                  >
                    {data.behaviorPatterns.featureUsage.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="impact" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">动机水平</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(data.gamificationImpact.motivationLevel * 100).toFixed(1)}%</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">保留率</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(data.gamificationImpact.retentionRate * 100).toFixed(1)}%</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">完成率</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(data.gamificationImpact.completionRate * 100).toFixed(1)}%</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">满意度评分</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.gamificationImpact.satisfactionScore.toFixed(1)}/5</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>游戏化前后对比</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.gamificationImpact.preGamificationVsPost}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="metric" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="before" name="游戏化前" fill="#8884d8" />
                  <Bar dataKey="after" name="游戏化后" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="correlation" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">积分与准确率相关性</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <div className="text-2xl font-bold">{(data.correlations.pointsVsAccuracy * 100).toFixed(1)}%</div>
                </div>
                <Progress value={Math.abs(data.correlations.pointsVsAccuracy) * 100} className="mt-2" />
                <div className="text-sm mt-1">
                  {data.correlations.pointsVsAccuracy > 0.5 ? '强正相关' : 
                   data.correlations.pointsVsAccuracy > 0.3 ? '中等正相关' : 
                   data.correlations.pointsVsAccuracy > -0.3 ? '弱相关' : 
                   data.correlations.pointsVsAccuracy > -0.5 ? '中等负相关' : '强负相关'}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">成就与一致性相关性</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <div className="text-2xl font-bold">{(data.correlations.achievementsVsConsistency * 100).toFixed(1)}%</div>
                </div>
                <Progress value={Math.abs(data.correlations.achievementsVsConsistency) * 100} className="mt-2" />
                <div className="text-sm mt-1">
                  {data.correlations.achievementsVsConsistency > 0.5 ? '强正相关' : 
                   data.correlations.achievementsVsConsistency > 0.3 ? '中等正相关' : 
                   data.correlations.achievementsVsConsistency > -0.3 ? '弱相关' : 
                   data.correlations.achievementsVsConsistency > -0.5 ? '中等负相关' : '强负相关'}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">挑战与学习速度相关性</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <div className="text-2xl font-bold">{(data.correlations.challengesVsLearningSpeed * 100).toFixed(1)}%</div>
                </div>
                <Progress value={Math.abs(data.correlations.challengesVsLearningSpeed) * 100} className="mt-2" />
                <div className="text-sm mt-1">
                  {data.correlations.challengesVsLearningSpeed > 0.5 ? '强正相关' : 
                   data.correlations.challengesVsLearningSpeed > 0.3 ? '中等正相关' : 
                   data.correlations.challengesVsLearningSpeed > -0.3 ? '弱相关' : 
                   data.correlations.challengesVsLearningSpeed > -0.5 ? '中等负相关' : '强负相关'}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>相关性分析说明</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>积分与准确率相关性</strong>: 衡量获得积分的多少与学习准确率之间的关系。正相关表示积分增加与准确率提高相关。</p>
                <p><strong>成就与一致性相关性</strong>: 衡量获得成就的数量与用户使用频率（一致性）之间的关系。正相关表示成就系统可能有助于提高用户粘性。</p>
                <p><strong>挑战与学习速度相关性</strong>: 衡量完成挑战的数量与学习速度之间的关系。正相关表明挑战系统可能有助于提高学习效率。</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}