'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  Area,
  AreaChart
} from 'recharts'
import { useUserBehaviorTracking } from '@/hooks/useUserBehaviorTracking'
import { UserBehaviorData, ExtendedUserBehaviorEventType } from '@/services/userBehaviorAnalysis.service'

// 定义数据类型
interface UserBehaviorAnalysisProps {
  userId: string
  days?: number
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

// 事件类型中文映射
const eventTypeLabels: Record<string, string> = {
  [ExtendedUserBehaviorEventType.REVIEW_COMPLETED]: '复习完成',
  [ExtendedUserBehaviorEventType.MEMORY_CREATED]: '创建记忆',
  [ExtendedUserBehaviorEventType.CATEGORY_FOCUS]: '类别专注',
  [ExtendedUserBehaviorEventType.TIME_SPENT]: '花费时间',
  [ExtendedUserBehaviorEventType.ACCURACY_HIGH]: '高准确率',
  [ExtendedUserBehaviorEventType.ACCURACY_LOW]: '低准确率',
  [ExtendedUserBehaviorEventType.STREAK_MAINTAINED]: '保持连续',
  [ExtendedUserBehaviorEventType.CHALLENGE_COMPLETED]: '完成挑战',
  [ExtendedUserBehaviorEventType.ACHIEVEMENT_UNLOCKED]: '解锁成就',
  [ExtendedUserBehaviorEventType.LEVEL_UP]: '升级',
  [ExtendedUserBehaviorEventType.POINTS_EARNED]: '获得积分',
  [ExtendedUserBehaviorEventType.UI_INTERACTION]: 'UI交互',
  [ExtendedUserBehaviorEventType.THEME_CHANGED]: '主题变更',
  [ExtendedUserBehaviorEventType.CUSTOMIZATION]: '自定义',
  [ExtendedUserBehaviorEventType.SEARCH_PERFORMED]: '搜索操作',
  [ExtendedUserBehaviorEventType.FILTER_APPLIED]: '应用筛选',
  [ExtendedUserBehaviorEventType.SORT_CHANGED]: '排序变更',
  [ExtendedUserBehaviorEventType.PAGE_NAVIGATION]: '页面导航',
  [ExtendedUserBehaviorEventType.CONTENT_SHARED]: '内容分享',
  [ExtendedUserBehaviorEventType.CONTENT_EXPORTED]: '内容导出',
  [ExtendedUserBehaviorEventType.SETTING_CHANGED]: '设置变更',
  [ExtendedUserBehaviorEventType.HELP_ACCESSED]: '访问帮助',
  [ExtendedUserBehaviorEventType.FEEDBACK_SUBMITTED]: '提交反馈',
  [ExtendedUserBehaviorEventType.ERROR_ENCOUNTERED]: '遇到错误',
  [ExtendedUserBehaviorEventType.OFFLINE_MODE]: '离线模式',
  [ExtendedUserBehaviorEventType.SYNC_COMPLETED]: '同步完成',
  [ExtendedUserBehaviorEventType.SOCIAL_INTERACTION]: '社交互动'
}

// 内容类型中文映射
const contentTypeLabels: Record<string, string> = {
  'TEXT': '文本',
  'IMAGE': '图像',
  'AUDIO': '音频',
  'VIDEO': '视频',
  'INTERACTIVE': '交互',
  'QUIZ': '测验',
  'FLASHCARD': '闪卡',
  'ARTICLE': '文章',
  'COURSE': '课程',
  'EXERCISE': '练习'
}

export const UserBehaviorAnalysis: React.FC<UserBehaviorAnalysisProps> = ({
  userId,
  days = 30
}) => {
  const [data, setData] = useState<UserBehaviorData | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const { trackCustomEvent } = useUserBehaviorTracking()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/gamification/analysis/behavior?userId=${userId}&days=${days}`)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const result = await response.json()
        setData(result)
        
        // 记录查看分析事件
        trackCustomEvent(ExtendedUserBehaviorEventType.UI_INTERACTION, {
          metadata: {
            action: 'view_behavior_analysis',
            days
          }
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : '获取数据失败')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [userId, days, trackCustomEvent])

  const handleExportData = () => {
    if (data) {
      // 创建一个包含分析数据的JSON文件
      const dataStr = JSON.stringify(data, null, 2)
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
      
      const exportFileDefaultName = `用户行为分析_${userId}_${new Date().toISOString().split('T')[0]}.json`
      
      const linkElement = document.createElement('a')
      linkElement.setAttribute('href', dataUri)
      linkElement.setAttribute('download', exportFileDefaultName)
      linkElement.click()
      
      // 记录导出事件
      trackCustomEvent(ExtendedUserBehaviorEventType.CONTENT_EXPORTED, {
        metadata: {
          action: 'export_behavior_analysis',
          format: 'json'
        }
      })
    }
  }

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
        <h2 className="text-2xl font-bold">用户行为分析</h2>
        <div className="flex space-x-2">
          <Badge variant="outline">{data.period}</Badge>
          <Button onClick={handleExportData} variant="outline">
            导出数据
          </Button>
        </div>
      </div>

      <Tabs defaultValue="activity" className="w-full [&>div]:w-full">
        <TabsList className="[&>button]:w-full grid grid-cols-7">
          <TabsTrigger value="activity">活动模式</TabsTrigger>
          <TabsTrigger value="feature">功能使用</TabsTrigger>
          <TabsTrigger value="learning">学习模式</TabsTrigger>
          <TabsTrigger value="engagement">参与度</TabsTrigger>
          <TabsTrigger value="behavior">行为变化</TabsTrigger>
          <TabsTrigger value="predictive">预测分析</TabsTrigger>
          <TabsTrigger value="social">社交行为</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">总活动次数</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.activityPatterns.dailyActivity.reduce((sum, day) => sum + day.actionsCount, 0)}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">总时间花费</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round(data.activityPatterns.dailyActivity.reduce((sum, day) => sum + day.timeSpent, 0) / 60)}小时
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">平均每日活动</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round(data.activityPatterns.dailyActivity.reduce((sum, day) => sum + day.actionsCount, 0) / data.activityPatterns.dailyActivity.length)}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>每日活动趋势</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data.activityPatterns.dailyActivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="actionsCount" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>小时分布</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.activityPatterns.hourlyActivity}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="actionsCount" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>周分布</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.activityPatterns.weeklyActivity}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="actionsCount"
                      nameKey="day"
                      label={({ day, actionsCount }: any) => {
                        const total = data.activityPatterns.weeklyActivity.reduce((sum, item: any) => sum + item.actionsCount, 0);
                        const percentage = ((actionsCount || 0) / total) * 100;
                        return `${day}: ${percentage.toFixed(0)}%`;
                      }}
                    >
                      {data.activityPatterns.weeklyActivity.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="feature" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>功能使用分布</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={data.featureUsage.mostUsedFeatures}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="usageCount"
                    nameKey="featureName"
                    label={({ featureName, percentage }: any) => {
                      const label = eventTypeLabels[featureName] || featureName
                      return `${label}: ${percentage.toFixed(0)}%`
                    }}
                  >
                    {data.featureUsage.mostUsedFeatures.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {data.featureUsage.featureUsageTrends && data.featureUsage.featureUsageTrends.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>功能使用趋势</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.featureUsage.featureUsageTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="usageCount" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="learning" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">总保留率</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.learningPatterns.retentionRate.toFixed(1)}%</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">总学习会话</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.learningPatterns.learningSessions.length}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">平均准确率</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.learningPatterns.learningSessions.length > 0 
                    ? (data.learningPatterns.learningSessions.reduce((sum, session) => sum + session.accuracy, 0) / data.learningPatterns.learningSessions.length).toFixed(1)
                    : 0}%
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
                <ComposedChart data={data.learningPatterns.learningSessions}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="accuracy" name="准确率" stroke="#8884d8" activeDot={{ r: 8 }} />
                  <Bar yAxisId="right" dataKey="itemsReviewed" name="复习项目数" fill="#82ca9d" />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>难度进展</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.learningPatterns.difficultyProgression}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="averageDifficulty" name="平均难度" stroke="#8884d8" />
                  <Line yAxisId="right" type="monotone" dataKey="successRate" name="成功率" stroke="#82ca9d" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">会话频率</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.engagementMetrics.sessionFrequency.toFixed(2)}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">平均会话长度</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.engagementMetrics.averageSessionLength.toFixed(0)}分钟</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">跳出率</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.engagementMetrics.bounceRate.toFixed(1)}%</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">返回率</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.engagementMetrics.returnRate.toFixed(1)}%</div>
              </CardContent>
            </Card>
          </div>

          {data.engagementMetrics.depthEngagement && (
            <Card>
              <CardHeader>
                <CardTitle>深度参与指标</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">平均每会话操作数</span>
                      <span className="text-sm font-medium">{data.engagementMetrics.depthEngagement.averageActionsPerSession.toFixed(1)}</span>
                    </div>
                    <Progress value={Math.min(100, data.engagementMetrics.depthEngagement.averageActionsPerSession * 10)} className="w-full" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">功能探索率</span>
                      <span className="text-sm font-medium">{(data.engagementMetrics.depthEngagement.featureExplorationRate * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={data.engagementMetrics.depthEngagement.featureExplorationRate * 100} className="w-full" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">内容交互深度</span>
                      <span className="text-sm font-medium">{data.engagementMetrics.depthEngagement.contentInteractionDepth.toFixed(1)}</span>
                    </div>
                    <Progress value={Math.min(100, data.engagementMetrics.depthEngagement.contentInteractionDepth * 20)} className="w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {data.engagementMetrics.timeDistribution && (
            <Card>
              <CardHeader>
                <CardTitle>时间分布指标</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">高峰使用时间</h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={data.engagementMetrics.timeDistribution.peakUsageHours}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="hour" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="activityLevel" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="text-sm font-medium text-blue-800">工作日活动</h4>
                      <p className="text-2xl font-bold text-blue-600">{data.engagementMetrics.timeDistribution.weekdayVsWeekend.weekdayActivity.toFixed(1)}%</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="text-sm font-medium text-green-800">周末活动</h4>
                      <p className="text-2xl font-bold text-green-600">{data.engagementMetrics.timeDistribution.weekdayVsWeekend.weekendActivity.toFixed(1)}%</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="behavior" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>游戏化前后对比</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[
                  {
                    metric: '会话频率',
                    游戏化前: data.behaviorChanges.beforeGamification.sessionFrequency,
                    游戏化后: data.behaviorChanges.afterGamification.sessionFrequency
                  },
                  {
                    metric: '会话长度',
                    游戏化前: data.behaviorChanges.beforeGamification.averageSessionLength,
                    游戏化后: data.behaviorChanges.afterGamification.averageSessionLength
                  },
                  {
                    metric: '功能多样性',
                    游戏化前: data.behaviorChanges.beforeGamification.featureDiversity,
                    游戏化后: data.behaviorChanges.afterGamification.featureDiversity
                  }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="metric" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="游戏化前" fill="#8884d8" />
                  <Bar dataKey="游戏化后" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>改进百分比</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">会话频率改进</span>
                    <span className={`text-sm font-medium ${data.behaviorChanges.improvementPercentage.sessionFrequency >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {data.behaviorChanges.improvementPercentage.sessionFrequency >= 0 ? '+' : ''}{data.behaviorChanges.improvementPercentage.sessionFrequency.toFixed(1)}%
                    </span>
                  </div>
                  <Progress 
                    value={Math.abs(data.behaviorChanges.improvementPercentage.sessionFrequency)} 
                    className={`w-full ${data.behaviorChanges.improvementPercentage.sessionFrequency >= 0 ? 'bg-green-100' : 'bg-red-100'}`} 
                  />
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">会话长度改进</span>
                    <span className={`text-sm font-medium ${data.behaviorChanges.improvementPercentage.averageSessionLength >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {data.behaviorChanges.improvementPercentage.averageSessionLength >= 0 ? '+' : ''}{data.behaviorChanges.improvementPercentage.averageSessionLength.toFixed(1)}%
                    </span>
                  </div>
                  <Progress 
                    value={Math.abs(data.behaviorChanges.improvementPercentage.averageSessionLength)} 
                    className={`w-full ${data.behaviorChanges.improvementPercentage.averageSessionLength >= 0 ? 'bg-green-100' : 'bg-red-100'}`} 
                  />
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">功能多样性改进</span>
                    <span className={`text-sm font-medium ${data.behaviorChanges.improvementPercentage.featureDiversity >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {data.behaviorChanges.improvementPercentage.featureDiversity >= 0 ? '+' : ''}{data.behaviorChanges.improvementPercentage.featureDiversity.toFixed(1)}%
                    </span>
                  </div>
                  <Progress 
                    value={Math.abs(data.behaviorChanges.improvementPercentage.featureDiversity)} 
                    className={`w-full ${data.behaviorChanges.improvementPercentage.featureDiversity >= 0 ? 'bg-green-100' : 'bg-red-100'}`} 
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictive" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>流失风险分析</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">流失风险评分</span>
                    <span className={`text-sm font-medium ${
                      data.predictiveInsights.churnRisk.score < 30 ? 'text-green-600' : 
                      data.predictiveInsights.churnRisk.score < 70 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {data.predictiveInsights.churnRisk.score}/100
                    </span>
                  </div>
                  <Progress 
                    value={data.predictiveInsights.churnRisk.score} 
                    className={`w-full ${
                      data.predictiveInsights.churnRisk.score < 30 ? 'bg-green-100' : 
                      data.predictiveInsights.churnRisk.score < 70 ? 'bg-yellow-100' : 'bg-red-100'
                    }`} 
                  />
                </div>

                {data.predictiveInsights.churnRisk.factors.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">风险因素</h4>
                    <div className="space-y-2">
                      {data.predictiveInsights.churnRisk.factors.map((factor, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="text-sm">{factor.description}</span>
                          <Badge variant={factor.impact > 20 ? "destructive" : factor.impact > 10 ? "secondary" : "outline"}>
                            {factor.impact}%
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {data.predictiveInsights.churnRisk.recommendations.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">建议措施</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {data.predictiveInsights.churnRisk.recommendations.map((recommendation, index) => (
                        <li key={index} className="text-sm">{recommendation}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>参与度预测</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-800">趋势</h4>
                    <p className={`text-lg font-bold ${
                      data.predictiveInsights.engagementForecast.trend === 'increasing' ? 'text-green-600' : 
                      data.predictiveInsights.engagementForecast.trend === 'stable' ? 'text-blue-600' : 'text-red-600'
                    }`}>
                      {data.predictiveInsights.engagementForecast.trend === 'increasing' ? '上升' : 
                       data.predictiveInsights.engagementForecast.trend === 'stable' ? '稳定' : '下降'}
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="text-sm font-medium text-green-800">预测活动量</h4>
                    <p className="text-lg font-bold text-green-600">{data.predictiveInsights.engagementForecast.projectedValue}</p>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">预测置信度</span>
                    <span className="text-sm font-medium">{data.predictiveInsights.engagementForecast.confidence}%</span>
                  </div>
                  <Progress value={data.predictiveInsights.engagementForecast.confidence} className="w-full" />
                </div>
              </div>
            </CardContent>
          </Card>

          {data.predictiveInsights.nextActions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>预测下一步行动</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.predictiveInsights.nextActions.map((action, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm">{eventTypeLabels[action.action] || action.action}</span>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{action.timeframe}</Badge>
                        <Badge variant={(action.probability * 100) > 70 ? "default" : (action.probability * 100) > 40 ? "secondary" : "outline"}>
                          {(action.probability * 100).toFixed(0)}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="social" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">分享频率</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.socialBehavior.sharingFrequency}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">网络触达</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.socialBehavior.networkInfluence.reach}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">产生互动</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.socialBehavior.networkInfluence.engagementGenerated}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>交互类型分布</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.socialBehavior.interactionTypes}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="type"
                    label={({ type, percentage }: any) => {
                      const label = eventTypeLabels[type as string] || type
                      return `${label}: ${percentage.toFixed(0)}%`
                    }}
                  >
                    {data.socialBehavior.interactionTypes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}