'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
  InformationCircleIcon
} from '@heroicons/react/24/outline'
import { ABTest, ABTestResult, ABTestReport } from '@/types'

interface EnhancedABTestReportProps {
  test: ABTest
  onBack: () => void
}

// 模拟A/B测试结果数据
const mockResults: ABTestResult[] = [
  {
    id: "1",
    testId: "test-1",
    variantId: "variant-1",
    metricId: "metric-1",
    value: 0.75,
    change: 0.15,
    changePercentage: 25,
    confidence: 0.95,
    significance: true,
    sampleSize: 1500,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "2",
    testId: "test-1",
    variantId: "variant-2",
    metricId: "metric-1",
    value: 0.60,
    change: 0,
    changePercentage: 0,
    confidence: 0.95,
    significance: false,
    sampleSize: 1500,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]

// 模拟A/B测试报告数据
const mockReport: ABTestReport = {
  test: {} as ABTest,
  results: mockResults,
  winner: {
    variantId: "variant-1",
    confidence: 0.95
  },
  recommendations: [
    "建议全面实施变体A，因为它在用户参与度方面表现显著更好",
    "考虑进一步优化变体A的UI元素，以最大化用户参与度",
    "在未来测试中尝试更高的流量分配比例，以加速数据收集"
  ],
  summary: {
    totalUsers: 3000,
    testDuration: 14,
    keyFindings: [
      "变体A的用户参与度提高了25%",
      "变体A在所有用户群体中表现一致",
      "测试达到了95%的统计显著性"
    ]
  }
}

export const EnhancedABTestReport: React.FC<EnhancedABTestReportProps> = ({
  test,
  onBack
}) => {
  const [report, setReport] = useState<ABTestReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [exportFormat, setExportFormat] = useState<string>('pdf')
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    // 模拟API请求获取报告数据
    const fetchReport = async () => {
      setLoading(true)
      try {
        // 在实际应用中，这里会调用API获取真实数据
        // const response = await fetch(`/api/gamification/abtesting/${test.id}/report`)
        // const data = await response.json()
        
        // 使用模拟数据
        setTimeout(() => {
          setReport({
            ...mockReport,
            test: test
          })
          setLoading(false)
        }, 1000)
      } catch (error) {
        console.error('获取A/B测试报告失败:', error)
        setLoading(false)
      }
    }

    fetchReport()
  }, [test.id])

  const handleExport = () => {
    // 在实际应用中，这里会调用API导出报告
    console.log(`导出报告为 ${exportFormat} 格式`)
    alert(`报告已导出为 ${exportFormat.toUpperCase()} 格式`)
  }

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

  const ResultCard = ({ 
    variantName, 
    isWinner, 
    isControl,
    metrics 
  }: {
    variantName: string
    isWinner?: boolean
    isControl?: boolean
    metrics: {
      name: string
      value: number
      change: number
      changePercentage: number
      unit?: string
    }[]
  }) => (
    <motion.div
      initial={animations.scaleIn(0.1)}
      animate={animations.scaleIn(0.1)}
      className="h-full"
    >
      <Card className={cn(
        "h-full border-2 transition-all duration-300 hover:translate-y-[-5px] hover:shadow-xl",
        isWinner ? "border-green-200 bg-green-50" : "border-gray-200"
      )}>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                {variantName}
                {isControl && (
                  <Badge className="bg-blue-100 text-blue-800">对照组</Badge>
                )}
                {isWinner && (
                  <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                    <TrophyIcon className="h-3 w-3" />
                    获胜
                  </Badge>
                )}
              </CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {metrics.map((metric, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">{metric.name}</span>
                <span className="text-sm font-bold text-gray-900">
                  {metric.value}{metric.unit}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className={cn(
                      "h-2 rounded-full transition-all duration-300",
                      metric.change > 0 ? "bg-green-600" : metric.change < 0 ? "bg-red-600" : "bg-gray-600"
                    )}
                    style={{ width: `${Math.min(Math.abs(metric.changePercentage) * 2, 100)}%` }}
                  ></div>
                </div>
                <span className={cn(
                  "text-xs font-medium",
                  metric.change > 0 ? "text-green-600" : metric.change < 0 ? "text-red-600" : "text-gray-600"
                )}>
                  {metric.change > 0 ? '+' : ''}{metric.changePercentage}%
                </span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </motion.div>
  )

  const RecommendationCard = ({ 
    title, 
    description, 
    icon: Icon 
  }: {
    title: string
    description: string
    icon: React.ElementType
  }) => (
    <motion.div
      initial={animations.slideIn('right', 0.1)}
      animate={animations.slideIn('right', 0.1)}
      className="h-full"
    >
      <Card className="h-full border-l-4 border-l-blue-500 transition-all duration-300 hover:translate-y-[-5px] hover:shadow-xl">
        <CardContent className="p-5">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
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
          <p className="mt-4 text-gray-600">正在生成A/B测试报告...</p>
        </div>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 md:p-8 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <InformationCircleIcon className="h-12 w-12 text-red-500 mx-auto" />
            <h3 className="text-lg font-medium text-gray-900 mt-4">无法加载报告</h3>
            <p className="text-gray-600 mt-2">请稍后再试或联系支持团队</p>
            <Button onClick={onBack} className="mt-4">
              返回
            </Button>
          </CardContent>
        </Card>
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{test.name} - 测试报告</h1>
              <p className="text-gray-600">{test.description}</p>
            </div>
            
            <div className="flex items-center gap-3">
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-32"
              >
                <option value="pdf">PDF</option>
                <option value="excel">Excel</option>
                <option value="csv">CSV</option>
                <option value="json">JSON</option>
              </select>
              <Button onClick={handleExport} className="flex items-center gap-2">
                <ArrowDownTrayIcon className="h-4 w-4" />
                导出报告
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
                
                {report.winner && (
                  <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                    <TrophyIcon className="h-4 w-4" />
                    <span>获胜变体: {test.variants.find(v => v.id === report.winner?.variantId)?.name}</span>
                  </div>
                )}
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
            <TabsTrigger value="results" className="flex items-center gap-2">
              <ChartPieIcon className="h-4 w-4" />
              <span>结果</span>
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <LightBulbIcon className="h-4 w-4" />
              <span>洞察</span>
            </TabsTrigger>
            <TabsTrigger value="details" className="flex items-center gap-2">
              <DocumentTextIcon className="h-4 w-4" />
              <span>详情</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* 关键指标卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                title="总用户数"
                value={report.summary.totalUsers.toLocaleString()}
                description="参与测试的用户总数"
                icon={UserGroupIcon}
              />
              <StatCard
                title="测试时长"
                value={`${report.summary.testDuration} 天`}
                description="测试运行的总天数"
                icon={CalendarIcon}
              />
              <StatCard
                title="置信度"
                value={`${(report.winner?.confidence || 0) * 100}%`}
                description="结果的统计显著性"
                icon={ChartBarIcon}
              />
            </div>

            {/* 关键发现 */}
            <Card className="transition-all duration-300 hover:translate-y-[-5px] hover:shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LightBulbIcon className="h-5 w-5" />
                  关键发现
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {report.summary.keyFindings.map((finding, index) => (
                    <motion.li
                      key={index}
                      initial={animations.slideIn('right', 0.1 * index)}
                      animate={animations.slideIn('right', 0.1 * index)}
                      className="flex items-start gap-2"
                    >
                      <div className="mt-1 h-2 w-2 rounded-full bg-blue-500"></div>
                      <span className="text-gray-700">{finding}</span>
                    </motion.li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results" className="space-y-6">
            {/* 测试结果对比 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {test.variants.map((variant, index) => {
                const variantResults = report.results.filter(r => r.variantId === variant.id)
                const isWinner = report.winner?.variantId === variant.id
                
                return (
                  <ResultCard
                    key={variant.id}
                    variantName={variant.name}
                    isWinner={isWinner}
                    isControl={variant.isControl}
                    metrics={variantResults.map(result => ({
                      name: test.metrics.find(m => m.id === result.metricId)?.name || '指标',
                      value: result.value,
                      change: result.change,
                      changePercentage: result.changePercentage,
                      unit: test.metrics.find(m => m.id === result.metricId)?.unit
                    }))}
                  />
                )
              })}
            </div>

            {/* 详细结果表格 */}
            <Card className="transition-all duration-300 hover:translate-y-[-5px] hover:shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChartBarIcon className="h-5 w-5" />
                  详细结果
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">变体</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">指标</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">数值</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">变化</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">变化率</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">置信度</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">样本量</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {report.results.map((result, index) => {
                        const variant = test.variants.find(v => v.id === result.variantId)
                        const metric = test.metrics.find(m => m.id === result.metricId)
                        
                        return (
                          <motion.tr
                            key={index}
                            initial={animations.fadeIn(0.1 * index)}
                            animate={animations.fadeIn(0.1 * index)}
                            className={result.significance ? "bg-green-50" : ""}
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {variant?.name}
                              {variant?.isControl && (
                                <Badge className="ml-2 bg-blue-100 text-blue-800">对照组</Badge>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{metric?.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {result.value}{metric?.unit}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className={result.change > 0 ? "text-green-600" : result.change < 0 ? "text-red-600" : "text-gray-600"}>
                                {result.change > 0 ? '+' : ''}{result.change}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className={result.changePercentage > 0 ? "text-green-600" : result.changePercentage < 0 ? "text-red-600" : "text-gray-600"}>
                                {result.changePercentage > 0 ? '+' : ''}{result.changePercentage}%
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <div className="flex items-center gap-2">
                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-blue-600 h-2 rounded-full"
                                    style={{ width: `${result.confidence * 100}%` }}
                                  ></div>
                                </div>
                                <span>{(result.confidence * 100).toFixed(0)}%</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {result.sampleSize.toLocaleString()}
                            </td>
                          </motion.tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            {/* 建议卡片 */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">建议与洞察</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {report.recommendations.map((recommendation, index) => (
                  <RecommendationCard
                    key={index}
                    title={`建议 ${index + 1}`}
                    description={recommendation}
                    icon={LightBulbIcon}
                  />
                ))}
              </div>
            </div>

            {/* 用户细分洞察 */}
            <Card className="transition-all duration-300 hover:translate-y-[-5px] hover:shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserGroupIcon className="h-5 w-5" />
                  用户细分洞察
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-600">
                    基于测试结果，我们发现不同用户群体对变体的反应存在一些有趣的差异：
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-medium text-blue-800">新用户</h3>
                      <p className="text-sm text-blue-600 mt-2">
                        变体A在新用户中的表现尤为突出，参与度提升了35%。
                      </p>
                    </div>
                    
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h3 className="font-medium text-green-800">活跃用户</h3>
                      <p className="text-sm text-green-600 mt-2">
                        变体A在活跃用户中的表现稳定，参与度提升了20%。
                      </p>
                    </div>
                    
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h3 className="font-medium text-purple-800">付费用户</h3>
                      <p className="text-sm text-purple-600 mt-2">
                        变体A在付费用户中的表现最为显著，参与度提升了40%。
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details" className="space-y-6">
            {/* 测试配置详情 */}
            <Card className="transition-all duration-300 hover:translate-y-[-5px] hover:shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CogIcon className="h-5 w-5" />
                  测试配置
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">基本信息</h3>
                    <dl className="space-y-2">
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-500">测试名称</dt>
                        <dd className="text-sm font-medium text-gray-900">{test.name}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-500">测试状态</dt>
                        <dd className="text-sm font-medium text-gray-900">
                          {test.status === 'COMPLETED' ? '已完成' :
                           test.status === 'ACTIVE' ? '进行中' :
                           test.status === 'PAUSED' ? '已暂停' :
                           test.status === 'DRAFT' ? '草稿' : '已取消'}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-500">开始日期</dt>
                        <dd className="text-sm font-medium text-gray-900">
                          {test.startDate ? new Date(test.startDate).toLocaleDateString() : '未设置'}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-500">结束日期</dt>
                        <dd className="text-sm font-medium text-gray-900">
                          {test.endDate ? new Date(test.endDate).toLocaleDateString() : '未设置'}
                        </dd>
                      </div>
                    </dl>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">目标受众</h3>
                    <dl className="space-y-2">
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-500">流量分配</dt>
                        <dd className="text-sm font-medium text-gray-900">
                          {test.targetAudience?.percentage || 100}%
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-500">用户细分</dt>
                        <dd className="text-sm font-medium text-gray-900">
                          {test.targetAudience?.userSegments.length 
                            ? test.targetAudience.userSegments.join(', ') 
                            : '所有用户'}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 变体配置详情 */}
            <Card className="transition-all duration-300 hover:translate-y-[-5px] hover:shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DocumentTextIcon className="h-5 w-5" />
                  变体配置
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {test.variants.map((variant, index) => (
                    <div key={variant.id} className="border-l-4 border-l-blue-500 pl-4">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">{variant.name}</h3>
                        {variant.isControl && (
                          <Badge className="bg-blue-100 text-blue-800">对照组</Badge>
                        )}
                        {report.winner?.variantId === variant.id && (
                          <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                            <TrophyIcon className="h-3 w-3" />
                            获胜
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-600 mb-3">{variant.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">流量分配</h4>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${variant.trafficPercentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-900">{variant.trafficPercentage}%</span>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">配置</h4>
                          <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                            {JSON.stringify(variant.config, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}