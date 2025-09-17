'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn, animations, cardEffects } from '@/lib/inspira-ui'
import { 
  ArrowDownTrayIcon,
  ArrowLeftIcon,
  ChartBarIcon,
  ChartPieIcon,
  DocumentTextIcon,
  LightBulbIcon,
  UserGroupIcon,
  CalendarIcon,
  TrophyIcon,
  CogIcon,
  InformationCircleIcon,
  FunnelIcon,
  ArrowsRightLeftIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline'
import { ABTest, ABTestResult, ABTestReport } from '@/types'

interface EnhancedABTestAnalyticsProps {
  test: ABTest
  onBack: () => void
}

// 模拟A/B测试分析数据
const mockAnalyticsData = {
  dailyData: [
    { date: '2023-10-01', variant1: 0.65, variant2: 0.60 },
    { date: '2023-10-02', variant1: 0.67, variant2: 0.61 },
    { date: '2023-10-03', variant1: 0.69, variant2: 0.62 },
    { date: '2023-10-04', variant1: 0.71, variant2: 0.63 },
    { date: '2023-10-05', variant1: 0.72, variant2: 0.64 },
    { date: '2023-10-06', variant1: 0.73, variant2: 0.65 },
    { date: '2023-10-07', variant1: 0.74, variant2: 0.65 },
    { date: '2023-10-08', variant1: 0.75, variant2: 0.66 },
    { date: '2023-10-09', variant1: 0.75, variant2: 0.67 },
    { date: '2023-10-10', variant1: 0.76, variant2: 0.68 },
    { date: '2023-10-11', variant1: 0.77, variant2: 0.69 },
    { date: '2023-10-12', variant1: 0.78, variant2: 0.70 },
    { date: '2023-10-13', variant1: 0.79, variant2: 0.71 },
    { date: '2023-10-14', variant1: 0.80, variant2: 0.72 }
  ],
  segmentData: [
    { segment: '新用户', variant1: 0.85, variant2: 0.65, improvement: 30.8 },
    { segment: '活跃用户', variant1: 0.75, variant2: 0.65, improvement: 15.4 },
    { segment: '付费用户', variant1: 0.90, variant2: 0.70, improvement: 28.6 },
    { segment: '流失风险用户', variant1: 0.65, variant2: 0.55, improvement: 18.2 }
  ],
  conversionFunnel: [
    { step: '访问', variant1: 10000, variant2: 10000 },
    { step: '注册', variant1: 3500, variant2: 3000 },
    { step: '激活', variant1: 2800, variant2: 2400 },
    { step: '留存', variant1: 2100, variant2: 1800 },
    { step: '付费', variant1: 1050, variant2: 900 }
  ],
  metricComparison: [
    { metric: '参与度', variant1: 0.75, variant2: 0.60, improvement: 25, significance: 0.95 },
    { metric: '转化率', variant1: 0.10, variant2: 0.09, improvement: 11.1, significance: 0.85 },
    { metric: '留存率', variant1: 0.75, variant2: 0.72, improvement: 4.2, significance: 0.70 },
    { metric: '满意度', variant1: 4.2, variant2: 3.9, improvement: 7.7, significance: 0.90 }
  ]
}

// 简单的图表组件，用于替代外部图表库
const SimpleLineChart = ({ data, labels }: { data: number[]; labels: string[] }) => (
  <div className="h-64 w-full">
    <div className="relative h-full">
      {/* Y轴标签 */}
      <div className="absolute left-0 top-0 bottom-0 w-8 flex flex-col justify-between text-xs text-gray-500">
        <span>100%</span>
        <span>75%</span>
        <span>50%</span>
        <span>25%</span>
        <span>0%</span>
      </div>
      
      {/* 图表区域 */}
      <div className="ml-10 h-full border-l border-b border-gray-200">
        {/* 网格线 */}
        <div className="absolute top-0 left-10 right-0 bottom-8 flex flex-col justify-between">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="border-t border-gray-100 w-full"></div>
          ))}
        </div>
        
        {/* 数据线 */}
        <svg className="absolute top-0 left-10 right-0 bottom-8" viewBox={`0 0 100 100`} preserveAspectRatio="none">
          <path
            d={`M ${data.map((value, i) => `${i * (100 / (data.length - 1))},${100 - value * 100}`).join(' L ')}`}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        
        {/* X轴标签 */}
        <div className="absolute bottom-0 left-10 right-0 flex justify-between text-xs text-gray-500 px-2">
          {labels.map((label, i) => (
            <span key={i} className="truncate" style={{ maxWidth: '40px' }}>{label}</span>
          ))}
        </div>
      </div>
    </div>
  </div>
)

const SimpleBarChart = ({ data, labels }: { data: { name: string; value: number }[]; labels: string[] }) => (
  <div className="h-64 w-full">
    <div className="relative h-full">
      {/* Y轴标签 */}
      <div className="absolute left-0 top-0 bottom-0 w-8 flex flex-col justify-between text-xs text-gray-500">
        <span>100%</span>
        <span>75%</span>
        <span>50%</span>
        <span>25%</span>
        <span>0%</span>
      </div>
      
      {/* 图表区域 */}
      <div className="ml-10 h-full border-l border-b border-gray-200">
        {/* 网格线 */}
        <div className="absolute top-0 left-10 right-0 bottom-8 flex flex-col justify-between">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="border-t border-gray-100 w-full"></div>
          ))}
        </div>
        
        {/* 柱状图 */}
        <div className="absolute top-0 left-10 right-0 bottom-8 flex items-end justify-around px-4">
          {data.map((item, i) => (
            <div key={i} className="flex flex-col items-center">
              <div 
                className="w-8 bg-blue-500 rounded-t-md"
                style={{ height: `${item.value * 80}%` }}
              ></div>
              <span className="text-xs text-gray-500 mt-1 truncate max-w-[40px]">{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
)

const SimpleFunnelChart = ({ data }: { data: { step: string; variant1: number; variant2: number }[] }) => {
  const maxValue = Math.max(...data.map(d => Math.max(d.variant1, d.variant2)))
  
  return (
    <div className="h-64 w-full">
      <div className="relative h-full">
        <div className="space-y-2">
          {data.map((item, i) => (
            <div key={i} className="flex items-center">
              <span className="text-sm w-20 text-gray-600 truncate">{item.step}</span>
              <div className="flex-1 flex">
                <div 
                  className="h-8 bg-blue-500 rounded-l-md flex items-center justify-end pr-2 text-white text-xs font-medium"
                  style={{ width: `${(item.variant1 / maxValue) * 80}%` }}
                >
                  {item.variant1}
                </div>
                <div 
                  className="h-8 bg-gray-400 rounded-r-md flex items-center justify-start pl-2 text-white text-xs font-medium"
                  style={{ width: `${(item.variant2 / maxValue) * 80}%` }}
                >
                  {item.variant2}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const SimpleComparisonChart = ({ data }: { data: { metric: string; variant1: number; variant2: number; improvement: number }[] }) => {
  const maxValue = Math.max(...data.map(d => Math.max(d.variant1, d.variant2)))
  
  return (
    <div className="h-64 w-full">
      <div className="relative h-full">
        <div className="space-y-4">
          {data.map((item, i) => (
            <div key={i} className="space-y-1">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-700">{item.metric}</span>
                <span className="text-sm font-medium text-green-600">+{item.improvement}%</span>
              </div>
              <div className="flex">
                <div className="w-24 text-xs text-gray-500">变体A</div>
                <div className="w-24 text-xs text-gray-500">变体B</div>
              </div>
              <div className="flex h-6">
                <div 
                  className="bg-blue-500 rounded-l-md flex items-center justify-end pr-1 text-white text-xs"
                  style={{ width: `${(item.variant1 / maxValue) * 100}%` }}
                >
                  {item.variant1}
                </div>
                <div 
                  className="bg-gray-400 rounded-r-md flex items-center justify-start pl-1 text-white text-xs"
                  style={{ width: `${(item.variant2 / maxValue) * 100}%` }}
                >
                  {item.variant2}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export const EnhancedABTestAnalytics: React.FC<EnhancedABTestAnalyticsProps> = ({
  test,
  onBack
}) => {
  const [loading, setLoading] = useState(true)
  const [analyticsData, setAnalyticsData] = useState(mockAnalyticsData)
  const [timeRange, setTimeRange] = useState<string>('all')
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    // 模拟API请求获取分析数据
    const fetchAnalyticsData = async () => {
      setLoading(true)
      try {
        // 在实际应用中，这里会调用API获取真实数据
        // const response = await fetch(`/api/gamification/abtesting/${test.id}/analytics`)
        // const data = await response.json()
        
        // 使用模拟数据
        setTimeout(() => {
          setAnalyticsData(mockAnalyticsData)
          setLoading(false)
        }, 1000)
      } catch (error) {
        console.error('获取A/B测试分析数据失败:', error)
        setLoading(false)
      }
    }

    fetchAnalyticsData()
  }, [test.id, timeRange])

  const StatCard = ({ 
    title, 
    value, 
    description, 
    icon: Icon, 
    trend, 
    trendValue 
  }: {
    title: string
    value: string | number
    description?: string
    icon: React.ElementType
    trend?: 'up' | 'down' | 'neutral'
    trendValue?: string
  }) => (
    <motion.div
      initial={animations.slideIn('up', 0.1)}
      animate={animations.slideIn('up', 0.1)}
      className="h-full"
    >
      <Card className="h-full transition-all duration-300 hover:translate-y-[-5px] hover:shadow-xl">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
              {description && (
                <p className="text-xs text-gray-500 mt-1">{description}</p>
              )}
            </div>
            <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
              <Icon className="h-5 w-5" />
            </div>
          </div>
          
          {trend && trendValue && (
            <div className="mt-4 flex items-center">
              <span className={cn(
                "text-sm font-medium",
                trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'
              )}>
                {trendValue}
              </span>
              <span className="text-sm text-gray-500 ml-2">与对照相比</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )

  const InsightCard = ({ 
    title, 
    description, 
    icon: Icon,
    type = 'info'
  }: {
    title: string
    description: string
    icon: React.ElementType
    type?: 'info' | 'warning' | 'success'
  }) => (
    <motion.div
      initial={animations.slideIn('right', 0.1)}
      animate={animations.slideIn('right', 0.1)}
      className="h-full"
    >
      <Card className={cn(
        "h-full transition-all duration-300 hover:translate-y-[-5px] hover:shadow-xl",
        type === 'success' ? "border-l-4 border-l-green-500" :
        type === 'warning' ? "border-l-4 border-l-yellow-500" :
        "border-l-4 border-l-blue-500"
      )}>
        <CardContent className="p-5">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className={cn(
                "p-2 rounded-lg",
                type === 'success' ? "bg-green-100 text-green-600" :
                type === 'warning' ? "bg-yellow-100 text-yellow-600" :
                "bg-blue-100 text-blue-600"
              )}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{title}</h3>
              <p className="text-sm text-gray-600 mt-1">{description}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">正在加载A/B测试分析数据...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 md:p-8">
      {/* 背景装饰 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* 页面标题 */}
        <motion.div
          initial={animations.slideIn('down', 0.2)}
          animate={animations.slideIn('down', 0.2)}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <Button
                variant="outline"
                onClick={onBack}
                className="mb-4"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                返回
              </Button>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{test.name} - 数据分析</h1>
              <p className="text-gray-600">{test.description}</p>
            </div>
            
            <div className="flex items-center gap-3">
              <select 
                value={timeRange} 
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">全部时间</option>
                <option value="7d">最近7天</option>
                <option value="14d">最近14天</option>
                <option value="30d">最近30天</option>
              </select>
              <Button className="flex items-center gap-2">
                <ArrowDownTrayIcon className="h-4 w-4" />
                导出数据
              </Button>
            </div>
          </div>
        </motion.div>

        {/* 测试状态和基本信息 */}
        <motion.div
          initial={animations.slideIn('up', 0.2)}
          animate={animations.slideIn('up', 0.2)}
          className="mb-8"
        >
          <Card className="bg-white/10 backdrop-blur-md border border-white/20">
            <CardContent className="p-6">
              <div className="flex flex-wrap items-center gap-4">
                <Badge 
                  className={cn(
                    "text-sm font-medium",
                    test.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                    test.status === 'ACTIVE' ? 'bg-blue-100 text-blue-800' :
                    test.status === 'PAUSED' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  )}
                >
                  {test.status === 'COMPLETED' ? '已完成' :
                   test.status === 'ACTIVE' ? '进行中' :
                   test.status === 'PAUSED' ? '已暂停' :
                   test.status === 'DRAFT' ? '草稿' : '已取消'}
                </Badge>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CalendarIcon className="h-4 w-4" />
                  <span>
                    {test.startDate && `开始: ${new Date(test.startDate).toLocaleDateString()}`}
                    {test.endDate && ` - 结束: ${new Date(test.endDate).toLocaleDateString()}`}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-blue-600 font-medium">
                  <AdjustmentsHorizontalIcon className="h-4 w-4" />
                  <span>时间范围: {
                    timeRange === 'all' ? '全部时间' :
                    timeRange === '7d' ? '最近7天' :
                    timeRange === '14d' ? '最近14天' :
                    '最近30天'
                  }</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <ChartBarIcon className="h-4 w-4" />
              <span>概览</span>
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex items-center gap-2">
              <ArrowsRightLeftIcon className="h-4 w-4" />
              <span>趋势</span>
            </TabsTrigger>
            <TabsTrigger value="segments" className="flex items-center gap-2">
              <UserGroupIcon className="h-4 w-4" />
              <span>细分</span>
            </TabsTrigger>
            <TabsTrigger value="funnel" className="flex items-center gap-2">
              <FunnelIcon className="h-4 w-4" />
              <span>漏斗</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* 关键指标卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatCard
                title="总体提升"
                value="+25%"
                description="变体A相比变体B的提升"
                icon={TrophyIcon}
                trend="up"
                trendValue="+5% 较上周"
              />
              <StatCard
                title="统计显著性"
                value="95%"
                description="结果的置信度"
                icon={ChartBarIcon}
              />
              <StatCard
                title="样本总量"
                value="3,000"
                description="参与测试的用户总数"
                icon={UserGroupIcon}
              />
              <StatCard
                title="测试周期"
                value="14天"
                description="测试运行的总天数"
                icon={CalendarIcon}
              />
            </div>

            {/* 指标对比图表 */}
            <Card className="transition-all duration-300 hover:translate-y-[-5px] hover:shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChartBarIcon className="h-5 w-5" />
                  指标对比
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SimpleComparisonChart data={analyticsData.metricComparison} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            {/* 趋势图表 */}
            <Card className="transition-all duration-300 hover:translate-y-[-5px] hover:shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowsRightLeftIcon className="h-5 w-5" />
                  每日趋势
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SimpleLineChart 
                  data={analyticsData.dailyData.map(d => d.variant1)} 
                  labels={analyticsData.dailyData.map(d => d.date.substring(5))} 
                />
                <div className="flex justify-center mt-4 gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-500 rounded-sm"></div>
                    <span className="text-sm text-gray-600">变体A</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-400 rounded-sm"></div>
                    <span className="text-sm text-gray-600">变体B</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 趋势洞察 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InsightCard
                title="持续增长"
                description="变体A的表现持续优于变体B，且差距在测试期间逐渐扩大。"
                icon={LightBulbIcon}
                type="success"
              />
              <InsightCard
                title="稳定性分析"
                description="两个变体的表现都相对稳定，没有出现异常波动。"
                icon={ChartBarIcon}
                type="info"
              />
            </div>
          </TabsContent>

          <TabsContent value="segments" className="space-y-6">
            {/* 用户细分图表 */}
            <Card className="transition-all duration-300 hover:translate-y-[-5px] hover:shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserGroupIcon className="h-5 w-5" />
                  用户细分表现
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SimpleBarChart 
                  data={analyticsData.segmentData.map(d => ({ name: d.segment, value: d.improvement }))} 
                  labels={analyticsData.segmentData.map(d => d.segment)} 
                />
                <div className="mt-4 text-center text-sm text-gray-600">
                  各用户群体中变体A相比变体B的提升百分比
                </div>
              </CardContent>
            </Card>

            {/* 细分洞察 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InsightCard
                title="新用户反应最佳"
                description="新用户对变体A的反应最为积极，参与度提升了30.8%。"
                icon={LightBulbIcon}
                type="success"
              />
              <InsightCard
                title="付费用户价值高"
                description="付费用户在变体A中的参与度最高，达到90%。"
                icon={TrophyIcon}
                type="success"
              />
            </div>
          </TabsContent>

          <TabsContent value="funnel" className="space-y-6">
            {/* 转化漏斗图表 */}
            <Card className="transition-all duration-300 hover:translate-y-[-5px] hover:shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FunnelIcon className="h-5 w-5" />
                  转化漏斗分析
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SimpleFunnelChart data={analyticsData.conversionFunnel} />
                <div className="flex justify-center mt-4 gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-500 rounded-sm"></div>
                    <span className="text-sm text-gray-600">变体A</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-400 rounded-sm"></div>
                    <span className="text-sm text-gray-600">变体B</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 漏斗洞察 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InsightCard
                title="整体转化提升"
                description="变体A在各个转化步骤中均优于变体B，整体转化率提升了16.7%。"
                icon={LightBulbIcon}
                type="success"
              />
              <InsightCard
                title="付费转化显著"
                description="付费步骤的提升最为显著，变体A比变体B高出16.7%。"
                icon={TrophyIcon}
                type="success"
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}