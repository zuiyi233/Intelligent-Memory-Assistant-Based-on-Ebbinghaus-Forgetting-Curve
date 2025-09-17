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
  AreaChart,
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts'
import { useUserBehaviorTracking } from '@/hooks/useUserBehaviorTracking'
import { UserBehaviorData, ExtendedUserBehaviorEventType } from '@/services/userBehaviorAnalysis.service'
import { Download, Filter, Calendar, TrendingUp, Users, Brain, Activity } from 'lucide-react'

// 定义数据类型
interface EnhancedUserBehaviorAnalysisProps {
  userId: string
  days?: number
  className?: string
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FF6B6B', '#4ECDC4']

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

// 自定义工具提示组件
const CustomTooltip = ({ active, payload, label }: {
  active?: boolean
  payload?: Array<{
    name: string
    value: number | string
    color?: string
  }>
  label?: string
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="apple-card p-4 shadow-lg">
        <p className="font-medium">{`${label}`}</p>
        {payload.map((entry, index: number) => (
          <p key={index} style={{ color: entry.color }}>
            {`${entry.name}: ${entry.value}`}
          </p>
        ))}
      </div>
    )
  }
  return null
}

// 指标卡片组件
const MetricCard = ({ title, value, icon, trend, trendValue, color = 'blue' }: {
  title: string
  value: string | number
  icon: React.ReactNode
  trend?: 'up' | 'down' | 'stable'
  trendValue?: string
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red'
}) => {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100 dark:bg-blue-900',
    green: 'text-green-600 bg-green-100 dark:bg-green-900',
    purple: 'text-purple-600 bg-purple-100 dark:bg-purple-900',
    orange: 'text-orange-600 bg-orange-100 dark:bg-orange-900',
    red: 'text-red-600 bg-red-100 dark:bg-red-900'
  }

  const trendIcons = {
    up: '↑',
    down: '↓',
    stable: '→'
  }

  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    stable: 'text-gray-600'
  }

  return (
    <Card className="apple-card-hover transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-300">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {trend && trendValue && (
              <div className={`flex items-center mt-2 ${trendColors[trend]}`}>
                <span className="text-sm">{trendIcons[trend]}</span>
                <span className="text-sm ml-1">{trendValue}</span>
              </div>
            )}
          </div>
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// 时间范围选择器组件
const TimeRangeSelector = ({ timeRange, setTimeRange }: {
  timeRange: number
  setTimeRange: (days: number) => void
}) => {
  const ranges = [
    { label: '近7天', value: 7 },
    { label: '近30天', value: 30 },
    { label: '近90天', value: 90 }
  ]

  return (
    <div className="flex gap-2">
      {ranges.map((range) => (
        <Button
          key={range.value}
          variant={timeRange === range.value ? "default" : "outline"}
          size="sm"
          onClick={() => setTimeRange(range.value)}
          className="transition-all duration-200"
        >
          {range.label}
        </Button>
      ))}
    </div>
  )
}

// 数据导出组件
const DataExportControls = ({ data, onExport }: {
  data: UserBehaviorData | null
  onExport: (format: 'json' | 'csv') => void
}) => {
  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onExport('json')}
        disabled={!data}
        className="flex items-center gap-2"
      >
        <Download size={16} />
        导出JSON
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onExport('csv')}
        disabled={!data}
        className="flex items-center gap-2"
      >
        <Download size={16} />
        导出CSV
      </Button>
    </div>
  )
}

// 主组件
export const EnhancedUserBehaviorAnalysis: React.FC<EnhancedUserBehaviorAnalysisProps> = ({
  userId,
  days = 30,
  className
}) => {
  const [data, setData] = useState<UserBehaviorData | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState<number>(days)
  const { trackCustomEvent } = useUserBehaviorTracking()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/user-behavior/analysis?userId=${userId}&days=${timeRange}`)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const result = await response.json()
        setData(result.data)
        
        // 记录查看分析事件
        trackCustomEvent(ExtendedUserBehaviorEventType.UI_INTERACTION, {
          metadata: {
            action: 'view_enhanced_behavior_analysis',
            days: timeRange
          }
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : '获取数据失败')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [userId, timeRange, trackCustomEvent])

  const handleExportData = (format: 'json' | 'csv') => {
    if (data) {
      if (format === 'json') {
        // 创建JSON文件
        const dataStr = JSON.stringify(data, null, 2)
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
        
        const exportFileDefaultName = `用户行为分析_${userId}_${new Date().toISOString().split('T')[0]}.json`
        
        const linkElement = document.createElement('a')
        linkElement.setAttribute('href', dataUri)
        linkElement.setAttribute('download', exportFileDefaultName)
        linkElement.click()
      } else if (format === 'csv') {
        // 创建CSV文件
        let csvContent = "data:text/csv;charset=utf-8,"
        
        // 添加活动模式数据
        csvContent += "活动模式数据\n"
        csvContent += "日期,操作次数,花费时间(分钟)\n"
        data.activityPatterns.dailyActivity.forEach(day => {
          csvContent += `${day.date},${day.actionsCount},${Math.round(day.timeSpent / 60)}\n`
        })
        
        // 添加功能使用数据
        csvContent += "\n功能使用数据\n"
        csvContent += "功能名称,使用次数,使用百分比\n"
        data.featureUsage.mostUsedFeatures.forEach(feature => {
          csvContent += `${eventTypeLabels[feature.featureName] || feature.featureName},${feature.usageCount},${feature.percentage.toFixed(1)}%\n`
        })
        
        // 添加学习模式数据
        csvContent += "\n学习模式数据\n"
        csvContent += "日期,持续时间(分钟),复习项目数,准确率\n"
        data.learningPatterns.learningSessions.forEach(session => {
          csvContent += `${session.date},${session.duration},${session.itemsReviewed},${session.accuracy.toFixed(1)}\n`
        })
        
        const encodedUri = encodeURI(csvContent)
        const exportFileDefaultName = `用户行为分析_${userId}_${new Date().toISOString().split('T')[0]}.csv`
        
        const linkElement = document.createElement('a')
        linkElement.setAttribute('href', encodedUri)
        linkElement.setAttribute('download', exportFileDefaultName)
        linkElement.click()
      }
      
      // 记录导出事件
      trackCustomEvent(ExtendedUserBehaviorEventType.CONTENT_EXPORTED, {
        metadata: {
          action: 'export_enhanced_behavior_analysis',
          format
        }
      })
    }
  }

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`bg-red-50 p-4 rounded-md text-red-700 ${className}`}>
        <p>加载失败: {error}</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className={`bg-yellow-50 p-4 rounded-md text-yellow-700 ${className}`}>
        <p>没有可用的数据</p>
      </div>
    )
  }

  // 计算总活动次数
  const totalActions = data.activityPatterns.dailyActivity.reduce((sum, day) => sum + day.actionsCount, 0)
  
  // 计算总时间花费（转换为小时）
  const totalTimeSpent = Math.round(data.activityPatterns.dailyActivity.reduce((sum, day) => sum + day.timeSpent, 0) / 60)
  
  // 计算平均每日活动
  const averageDailyActivity = Math.round(totalActions / data.activityPatterns.dailyActivity.length)

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 标题和控制区域 */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">用户行为分析</h2>
          <p className="text-gray-600 dark:text-gray-300">{data.period}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <TimeRangeSelector timeRange={timeRange} setTimeRange={setTimeRange} />
          <DataExportControls data={data} onExport={handleExportData} />
        </div>
      </div>

      {/* 关键指标卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="总活动次数"
          value={totalActions}
          icon={<Activity size={24} />}
          color="blue"
        />
        <MetricCard
          title="总时间花费"
          value={`${totalTimeSpent}小时`}
          icon={<Calendar size={24} />}
          color="green"
        />
        <MetricCard
          title="平均每日活动"
          value={averageDailyActivity}
          icon={<TrendingUp size={24} />}
          color="purple"
        />
        <MetricCard
          title="功能多样性"
          value={data.featureUsage.mostUsedFeatures.length}
          icon={<Brain size={24} />}
          color="orange"
        />
      </div>

      {/* 分析标签页 */}
      <Tabs defaultValue="activity">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity size={16} />
            <span className="hidden sm:inline">活动模式</span>
          </TabsTrigger>
          <TabsTrigger value="feature" className="flex items-center gap-2">
            <Filter size={16} />
            <span className="hidden sm:inline">功能使用</span>
          </TabsTrigger>
          <TabsTrigger value="learning" className="flex items-center gap-2">
            <Brain size={16} />
            <span className="hidden sm:inline">学习模式</span>
          </TabsTrigger>
          <TabsTrigger value="engagement" className="flex items-center gap-2">
            <TrendingUp size={16} />
            <span className="hidden sm:inline">参与度</span>
          </TabsTrigger>
          <TabsTrigger value="behavior" className="flex items-center gap-2">
            <Users size={16} />
            <span className="hidden sm:inline">行为变化</span>
          </TabsTrigger>
          <TabsTrigger value="predictive" className="flex items-center gap-2">
            <Calendar size={16} />
            <span className="hidden sm:inline">预测分析</span>
          </TabsTrigger>
          <TabsTrigger value="social" className="flex items-center gap-2">
            <Users size={16} />
            <span className="hidden sm:inline">社交行为</span>
          </TabsTrigger>
        </TabsList>

        {/* 活动模式标签页 */}
        <TabsContent value="activity" className="space-y-4">
          <Card className="apple-card-hover">
            <CardHeader>
              <CardTitle>每日活动趋势</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data.activityPatterns.dailyActivity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="actionsCount" 
                    stroke="#8884d8" 
                    fill="#8884d8" 
                    fillOpacity={0.3} 
                    animationDuration={1000}
                    animationEasing="ease-in-out"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="apple-card-hover">
              <CardHeader>
                <CardTitle>小时分布</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.activityPatterns.hourlyActivity}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="actionsCount" 
                      fill="#82ca9d" 
                      animationDuration={1000}
                      animationEasing="ease-in-out"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="apple-card-hover">
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
                      label={(props) => {
                        const { day, actionsCount } = props as any;
                        const total = data.activityPatterns.weeklyActivity.reduce((sum, item) => sum + item.actionsCount, 0);
                        const percentage = ((actionsCount || 0) / total) * 100;
                        return `${day}: ${percentage.toFixed(0)}%`;
                      }}
                      animationDuration={1000}
                      animationEasing="ease-in-out"
                    >
                      {data.activityPatterns.weeklyActivity.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 功能使用标签页 */}
        <TabsContent value="feature" className="space-y-4">
          <Card className="apple-card-hover">
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
                    label={(props) => {
                      const { featureName, percentage } = props as any;
                      const label = eventTypeLabels[featureName] || featureName
                      return `${label}: ${percentage.toFixed(0)}%`
                    }}
                    animationDuration={1000}
                    animationEasing="ease-in-out"
                  >
                    {data.featureUsage.mostUsedFeatures.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {data.featureUsage.featureUsageTrends && data.featureUsage.featureUsageTrends.length > 0 && (
            <Card className="apple-card-hover">
              <CardHeader>
                <CardTitle>功能使用趋势</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.featureUsage.featureUsageTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="usageCount" 
                      fill="#8884d8" 
                      animationDuration={1000}
                      animationEasing="ease-in-out"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* 学习模式标签页 */}
        <TabsContent value="learning" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard
              title="总保留率"
              value={`${data.learningPatterns.retentionRate.toFixed(1)}%`}
              icon={<Brain size={24} />}
              color="blue"
            />
            <MetricCard
              title="总学习会话"
              value={data.learningPatterns.learningSessions.length}
              icon={<Calendar size={24} />}
              color="green"
            />
            <MetricCard
              title="平均准确率"
              value={`${
                data.learningPatterns.learningSessions.length > 0 
                  ? (data.learningPatterns.learningSessions.reduce((sum, session) => sum + session.accuracy, 0) / data.learningPatterns.learningSessions.length).toFixed(1)
                  : 0
              }%`}
              icon={<TrendingUp size={24} />}
              color="purple"
            />
          </div>

          <Card className="apple-card-hover">
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
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line 
                    yAxisId="left" 
                    type="monotone" 
                    dataKey="accuracy" 
                    name="准确率" 
                    stroke="#8884d8" 
                    activeDot={{ r: 8 }}
                    animationDuration={1000}
                    animationEasing="ease-in-out"
                  />
                  <Bar 
                    yAxisId="right" 
                    dataKey="itemsReviewed" 
                    name="复习项目数" 
                    fill="#82ca9d"
                    animationDuration={1000}
                    animationEasing="ease-in-out"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="apple-card-hover">
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
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line 
                    yAxisId="left" 
                    type="monotone" 
                    dataKey="averageDifficulty" 
                    name="平均难度" 
                    stroke="#8884d8"
                    animationDuration={1000}
                    animationEasing="ease-in-out"
                  />
                  <Line 
                    yAxisId="right" 
                    type="monotone" 
                    dataKey="successRate" 
                    name="成功率" 
                    stroke="#82ca9d"
                    animationDuration={1000}
                    animationEasing="ease-in-out"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 参与度标签页 */}
        <TabsContent value="engagement" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <MetricCard
              title="会话频率"
              value={data.engagementMetrics.sessionFrequency.toFixed(2)}
              icon={<Calendar size={24} />}
              color="blue"
            />
            <MetricCard
              title="平均会话长度"
              value={`${data.engagementMetrics.averageSessionLength.toFixed(0)}分钟`}
              icon={<Calendar size={24} />}
              color="green"
            />
            <MetricCard
              title="跳出率"
              value={`${data.engagementMetrics.bounceRate.toFixed(1)}%`}
              icon={<TrendingUp size={24} />}
              color="orange"
            />
            <MetricCard
              title="返回率"
              value={`${data.engagementMetrics.returnRate.toFixed(1)}%`}
              icon={<Users size={24} />}
              color="purple"
            />
          </div>

          {data.engagementMetrics.depthEngagement && (
            <Card className="apple-card-hover">
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
                    <Progress 
                      value={Math.min(100, data.engagementMetrics.depthEngagement.averageActionsPerSession * 10)} 
                      className="w-full" 
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">功能探索率</span>
                      <span className="text-sm font-medium">{(data.engagementMetrics.depthEngagement.featureExplorationRate * 100).toFixed(1)}%</span>
                    </div>
                    <Progress 
                      value={data.engagementMetrics.depthEngagement.featureExplorationRate * 100} 
                      className="w-full" 
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">内容交互深度</span>
                      <span className="text-sm font-medium">{data.engagementMetrics.depthEngagement.contentInteractionDepth.toFixed(1)}</span>
                    </div>
                    <Progress 
                      value={Math.min(100, data.engagementMetrics.depthEngagement.contentInteractionDepth * 20)} 
                      className="w-full" 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {data.engagementMetrics.timeDistribution && (
            <Card className="apple-card-hover">
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
                        <Tooltip content={<CustomTooltip />} />
                        <Bar 
                          dataKey="activityLevel" 
                          fill="#8884d8"
                          animationDuration={1000}
                          animationEasing="ease-in-out"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                      <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">工作日活动</h4>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-300">{data.engagementMetrics.timeDistribution.weekdayVsWeekend.weekdayActivity.toFixed(1)}%</p>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-900 rounded-lg">
                      <h4 className="text-sm font-medium text-green-800 dark:text-green-200">周末活动</h4>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-300">{data.engagementMetrics.timeDistribution.weekdayVsWeekend.weekendActivity.toFixed(1)}%</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* 行为变化标签页 */}
        <TabsContent value="behavior" className="space-y-4">
          <Card className="apple-card-hover">
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
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar 
                    dataKey="游戏化前" 
                    fill="#8884d8"
                    animationDuration={1000}
                    animationEasing="ease-in-out"
                  />
                  <Bar 
                    dataKey="游戏化后" 
                    fill="#82ca9d"
                    animationDuration={1000}
                    animationEasing="ease-in-out"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="apple-card-hover">
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

        {/* 预测分析标签页 */}
        <TabsContent value="predictive" className="space-y-4">
          <Card className="apple-card-hover">
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
                        <div key={index} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
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

          <Card className="apple-card-hover">
            <CardHeader>
              <CardTitle>参与度预测</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">趋势</h4>
                    <p className={`text-lg font-bold ${
                      data.predictiveInsights.engagementForecast.trend === 'increasing' ? 'text-green-600' : 
                      data.predictiveInsights.engagementForecast.trend === 'stable' ? 'text-blue-600' : 'text-red-600'
                    }`}>
                      {data.predictiveInsights.engagementForecast.trend === 'increasing' ? '上升' : 
                       data.predictiveInsights.engagementForecast.trend === 'stable' ? '稳定' : '下降'}
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-900 rounded-lg">
                    <h4 className="text-sm font-medium text-green-800 dark:text-green-200">预测活动量</h4>
                    <p className="text-lg font-bold text-green-600 dark:text-green-300">{data.predictiveInsights.engagementForecast.projectedValue}</p>
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
            <Card className="apple-card-hover">
              <CardHeader>
                <CardTitle>预测下一步行动</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.predictiveInsights.nextActions.map((action, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
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

        {/* 社交行为标签页 */}
        <TabsContent value="social" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard
              title="分享频率"
              value={data.socialBehavior.sharingFrequency}
              icon={<Users size={24} />}
              color="blue"
            />
            <MetricCard
              title="网络触达"
              value={data.socialBehavior.networkInfluence.reach}
              icon={<TrendingUp size={24} />}
              color="green"
            />
            <MetricCard
              title="产生互动"
              value={data.socialBehavior.networkInfluence.engagementGenerated}
              icon={<Activity size={24} />}
              color="purple"
            />
          </div>

          <Card className="apple-card-hover">
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
                    label={(props) => {
                      const { type, percentage } = props as any;
                      const label = eventTypeLabels[type as string] || type
                      return `${label}: ${percentage.toFixed(0)}%`
                    }}
                    animationDuration={1000}
                    animationEasing="ease-in-out"
                  >
                    {data.socialBehavior.interactionTypes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}