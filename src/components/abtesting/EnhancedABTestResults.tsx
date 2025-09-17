'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn, animations, cardEffects } from '@/lib/inspira-ui'
import { 
  ArrowLeftIcon,
  ChartBarIcon,
  DocumentArrowDownIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon,
  UserGroupIcon,
  FunnelIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  LightBulbIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  TableCellsIcon
} from '@heroicons/react/24/outline'
import { ABTest, ABTestResult, ABTestReport, ABTestVariant } from '@/types'

interface EnhancedABTestResultsProps {
  test: ABTest
  onBack: () => void
}

// 模拟测试结果数据
const mockTestResults: ABTestResult[] = [
  {
    id: 'result1',
    testId: 'test1',
    variantId: 'variant1',
    metricId: 'metric1',
    value: 0.75,
    change: 0.15,
    changePercentage: 25,
    confidence: 0.95,
    significance: true,
    sampleSize: 2500,
    createdAt: new Date('2023-10-01'),
    updatedAt: new Date('2023-10-15')
  },
  {
    id: 'result2',
    testId: 'test1',
    variantId: 'variant2',
    metricId: 'metric1',
    value: 0.60,
    change: 0,
    changePercentage: 0,
    confidence: 0.95,
    significance: false,
    sampleSize: 2500,
    createdAt: new Date('2023-10-01'),
    updatedAt: new Date('2023-10-15')
  },
  {
    id: 'result3',
    testId: 'test1',
    variantId: 'variant1',
    metricId: 'metric2',
    value: 0.12,
    change: 0.02,
    changePercentage: 20,
    confidence: 0.85,
    significance: true,
    sampleSize: 2500,
    createdAt: new Date('2023-10-01'),
    updatedAt: new Date('2023-10-15')
  },
  {
    id: 'result4',
    testId: 'test1',
    variantId: 'variant2',
    metricId: 'metric2',
    value: 0.10,
    change: 0,
    changePercentage: 0,
    confidence: 0.85,
    significance: false,
    sampleSize: 2500,
    createdAt: new Date('2023-10-01'),
    updatedAt: new Date('2023-10-15')
  }
]

// 模拟测试报告数据
const mockTestReport: ABTestReport = {
  test: {
    id: 'test1',
    name: '主页优化测试',
    description: '测试主页布局优化对用户参与度的影响',
    status: 'COMPLETED',
    startDate: new Date('2023-10-01'),
    endDate: new Date('2023-10-15'),
    targetAudience: {
      userSegments: ['all_users'],
      percentage: 100,
      criteria: {},
      allocationStrategy: { type: 'RANDOM' }
    },
    createdAt: new Date('2023-09-25'),
    updatedAt: new Date('2023-10-15'),
    variants: [
      {
        id: 'variant1',
        testId: 'test1',
        name: '变体A',
        description: '优化后的主页布局',
        config: {},
        trafficPercentage: 50,
        isControl: false,
        createdAt: new Date('2023-09-25')
      },
      {
        id: 'variant2',
        testId: 'test1',
        name: '变体B',
        description: '原始主页布局',
        config: {},
        trafficPercentage: 50,
        isControl: true,
        createdAt: new Date('2023-09-25')
      }
    ],
    metrics: [
      {
        id: 'metric1',
        testId: 'test1',
        name: '参与度',
        description: '用户与主页互动的程度',
        type: 'ENGAGEMENT',
        formula: '',
        unit: '%',
        isActive: true,
        createdAt: new Date('2023-09-25')
      },
      {
        id: 'metric2',
        testId: 'test1',
        name: '转化率',
        description: '用户完成目标行动的比例',
        type: 'CONVERSION',
        formula: '',
        unit: '%',
        isActive: true,
        createdAt: new Date('2023-09-25')
      }
    ],
    results: mockTestResults
  },
  results: mockTestResults,
  winner: {
    variantId: 'variant1',
    confidence: 0.95
  },
  recommendations: [
    '建议全面启用变体A（优化后的主页布局），因为它在参与度和转化率方面都有显著提升。',
    '参与度提升25%，转化率提升20%，表明优化后的设计对用户行为有积极影响。',
    '用户反馈显示新布局更直观，更容易找到所需内容。',
    '建议进一步测试其他页面元素，以持续优化用户体验。'
  ],
  summary: {
    totalUsers: 5000,
    testDuration: 14,
    keyFindings: [
      '变体A在所有关键指标上均优于变体B',
      '参与度提升25%，达到统计显著性水平',
      '转化率提升20%，达到统计显著性水平',
      '用户反馈积极，没有发现负面体验'
    ]
  }
}

// 模拟详细数据
const mockDetailedData = {
  dailyResults: [
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
    { date: '2023-10-14', variant1: 0.80, variant2: 0.72 },
    { date: '2023-10-15', variant1: 0.75, variant2: 0.60 }
  ],
  segmentResults: [
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
  ]
}

export const EnhancedABTestResults: React.FC<EnhancedABTestResultsProps> = ({
  test,
  onBack
}) => {
  const [loading, setLoading] = useState(true)
  const [testResults, setTestResults] = useState<ABTestResult[]>([])
  const [testReport, setTestReport] = useState<ABTestReport>(mockTestReport)
  const [detailedData, setDetailedData] = useState(mockDetailedData)
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'pdf'>('csv')
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    // 模拟API请求获取测试结果数据
    const fetchTestResults = async () => {
      setLoading(true)
      try {
        // 在实际应用中，这里会调用API获取真实数据
        // const response = await fetch(`/api/gamification/abtesting/${test.id}/results`)
        // const data = await response.json()
        
        // 使用模拟数据
        setTimeout(() => {
          setTestResults(mockTestResults)
          setTestReport(mockTestReport)
          setDetailedData(mockDetailedData)
          setLoading(false)
        }, 1000)
      } catch (error) {
        console.error('获取A/B测试结果数据失败:', error)
        setLoading(false)
      }
    }

    fetchTestResults()
  }, [test.id])

  // 导出数据
  const exportData = () => {
    // 在实际应用中，这里会调用API导出数据
    console.log(`导出数据格式: ${exportFormat}`)
    
    // 模拟导出成功
    alert(`数据已成功导出为${exportFormat.toUpperCase()}格式`)
  }

  // 获取变体结果
  const getVariantResults = (variantId: string) => {
    return testResults.filter(result => result.variantId === variantId)
  }

  // 获取指标结果
  const getMetricResults = (metricId: string) => {
    return testResults.filter(result => result.metricId === metricId)
  }

  // 比较变体结果
  const compareVariants = () => {
    if (testReport.test.variants.length < 2) return null
    
    const variant1Results = getVariantResults(testReport.test.variants[0].id)
    const variant2Results = getVariantResults(testReport.test.variants[1].id)
    
    return {
      variant1: testReport.test.variants[0],
      variant2: testReport.test.variants[1],
      variant1Results,
      variant2Results
    }
  }

  const comparison = compareVariants()

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
              {trend === 'up' ? (
                <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
              ) : trend === 'down' ? (
                <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
              ) : (
                <div className="h-4 w-4 mr-1"></div>
              )}
              <span className={cn(
                "text-sm font-medium",
                trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'
              )}>
                {trendValue}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )

  const ResultComparisonCard = ({ 
    variant, 
    results, 
    isWinner 
  }: {
    variant: ABTestVariant
    results: ABTestResult[]
    isWinner?: boolean
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-gray-900">{variant.name}</h3>
              {variant.isControl && (
                <Badge className="bg-blue-100 text-blue-800">控制组</Badge>
              )}
              {isWinner && (
                <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                  <CheckCircleIcon className="h-3 w-3" />
                  获胜
                </Badge>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-600">{variant.description}</p>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-4">
            {results.map((result, index) => {
              const metric = testReport.test.metrics.find(m => m.id === result.metricId)
              return (
                <div key={index} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">{metric?.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-900">{(result.value * 100).toFixed(1)}{metric?.unit}</span>
                      {result.changePercentage > 0 && (
                        <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                          +{result.changePercentage}%
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-gray-500">置信度: {(result.confidence * 100).toFixed(0)}%</span>
                    {result.significance ? (
                      <span className="text-xs font-medium text-green-600">显著</span>
                    ) : (
                      <span className="text-xs font-medium text-gray-600">不显著</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  const ComparisonChart = ({ data }: { data: { date: string; variant1: number; variant2: number }[] }) => (
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
              d={`M ${data.map((d, i) => `${i * (100 / (data.length - 1))},${100 - d.variant1 * 100}`).join(' L ')}`}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={`M ${data.map((d, i) => `${i * (100 / (data.length - 1))},${100 - d.variant2 * 100}`).join(' L ')}`}
              fill="none"
              stroke="#9ca3af"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="5,5"
            />
          </svg>
          
          {/* X轴标签 */}
          <div className="absolute bottom-0 left-10 right-0 flex justify-between text-xs text-gray-500 px-2">
            {data.map((d, i) => (
              <span key={i} className="truncate" style={{ maxWidth: '40px' }}>{d.date.substring(5)}</span>
            ))}
          </div>
        </div>
      </div>
      
      {/* 图例 */}
      <div className="flex justify-center mt-4 gap-6">
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-blue-500"></div>
          <span className="text-sm text-gray-600">变体A</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-gray-400 border-dashed" style={{ borderWidth: '0 0 2px 0' }}></div>
          <span className="text-sm text-gray-600">变体B</span>
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">正在加载A/B测试结果数据...</p>
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{test.name} - 测试结果</h1>
              <p className="text-gray-600">查看和分析A/B测试的结果和洞察</p>
            </div>
            
            <div className="flex items-center gap-3">
              <select 
                value={exportFormat} 
                onChange={(e) => setExportFormat(e.target.value as 'csv' | 'json' | 'pdf')}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="csv">CSV</option>
                <option value="json">JSON</option>
                <option value="pdf">PDF</option>
              </select>
              <Button onClick={exportData} className="flex items-center gap-2">
                <DocumentArrowDownIcon className="h-4 w-4" />
                导出结果
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
                <Badge className="bg-green-100 text-green-800">已完成</Badge>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CalendarIcon className="h-4 w-4" />
                  <span>
                    {testReport.test.startDate && `开始: ${new Date(testReport.test.startDate).toLocaleDateString()}`}
                    {testReport.test.endDate && ` - 结束: ${new Date(testReport.test.endDate).toLocaleDateString()}`}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-blue-600 font-medium">
                  <UserGroupIcon className="h-4 w-4" />
                  <span>总用户: {testReport.summary.totalUsers}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-purple-600 font-medium">
                  <FunnelIcon className="h-4 w-4" />
                  <span>测试时长: {testReport.summary.testDuration} 天</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 获胜变体通知 */}
        {testReport.winner && (
          <motion.div
            initial={animations.slideIn('up', 0.2)}
            animate={animations.slideIn('up', 0.2)}
            className="mb-8"
          >
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-green-100 text-green-600">
                    <CheckCircleIcon className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-green-800">测试完成！</h3>
                    <p className="text-green-700">
                      {testReport.test.variants.find(v => v.id === testReport.winner?.variantId)?.name} 
                      获胜，置信度为 {(testReport.winner.confidence * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <ChartBarIcon className="h-4 w-4" />
              <span>结果概览</span>
            </TabsTrigger>
            <TabsTrigger value="comparison" className="flex items-center gap-2">
              <FunnelIcon className="h-4 w-4" />
              <span>变体对比</span>
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <LightBulbIcon className="h-4 w-4" />
              <span>洞察分析</span>
            </TabsTrigger>
            <TabsTrigger value="details" className="flex items-center gap-2">
              <TableCellsIcon className="h-4 w-4" />
              <span>详细数据</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* 统计卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatCard
                title="总用户数"
                value={testReport.summary.totalUsers.toLocaleString()}
                description="参与测试的总用户数"
                icon={UserGroupIcon}
              />
              <StatCard
                title="测试时长"
                value={`${testReport.summary.testDuration} 天`}
                description="测试运行的总天数"
                icon={CalendarIcon}
              />
              <StatCard
                title="置信度"
                value={`${(testReport.winner?.confidence || 0) * 100}%`}
                description="结果的统计置信度"
                icon={ChartBarIcon}
                trend="up"
                trendValue="高置信度"
              />
              <StatCard
                title="关键指标"
                value={testReport.results.length}
                description="测试的指标数量"
                icon={FunnelIcon}
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
                <ul className="space-y-3">
                  {testReport.summary.keyFindings.map((finding, index) => (
                    <motion.li
                      key={index}
                      initial={animations.slideIn('right', 0.1 * index)}
                      animate={animations.slideIn('right', 0.1 * index)}
                      className="flex items-start gap-3"
                    >
                      <div className="mt-1 h-2 w-2 rounded-full bg-blue-500"></div>
                      <span className="text-gray-700">{finding}</span>
                    </motion.li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* 推荐行动 */}
            <Card className="transition-all duration-300 hover:translate-y-[-5px] hover:shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ExclamationTriangleIcon className="h-5 w-5" />
                  推荐行动
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {testReport.recommendations.map((recommendation, index) => (
                    <motion.li
                      key={index}
                      initial={animations.slideIn('left', 0.1 * index)}
                      animate={animations.slideIn('left', 0.1 * index)}
                      className="flex items-start gap-3"
                    >
                      <div className="mt-1 h-2 w-2 rounded-full bg-green-500"></div>
                      <span className="text-gray-700">{recommendation}</span>
                    </motion.li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comparison" className="space-y-6">
            {/* 变体对比 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {testReport.test.variants.map(variant => {
                const results = getVariantResults(variant.id)
                const isWinner = testReport.winner?.variantId === variant.id
                return (
                  <ResultComparisonCard
                    key={variant.id}
                    variant={variant}
                    results={results}
                    isWinner={isWinner}
                  />
                )
              })}
            </div>

            {/* 趋势对比图表 */}
            <Card className="transition-all duration-300 hover:translate-y-[-5px] hover:shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChartBarIcon className="h-5 w-5" />
                  趋势对比
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ComparisonChart data={detailedData.dailyResults} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            {/* 细分分析 */}
            <Card className="transition-all duration-300 hover:translate-y-[-5px] hover:shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserGroupIcon className="h-5 w-5" />
                  用户细分分析
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {detailedData.segmentResults.map((segment, index) => (
                    <motion.div
                      key={index}
                      initial={animations.scaleIn(0.1 * index)}
                      animate={animations.scaleIn(0.1 * index)}
                      className="bg-white border border-gray-200 rounded-lg p-4"
                    >
                      <div className="text-sm font-medium text-gray-700 mb-1">{segment.segment}</div>
                      <div className="text-lg font-bold text-gray-900 mb-1">+{segment.improvement}%</div>
                      <div className="text-xs text-gray-500">变体A相比变体B的提升</div>
                      <div className="mt-2 flex justify-between text-xs text-gray-600">
                        <span>变体A: {(segment.variant1 * 100).toFixed(0)}%</span>
                        <span>变体B: {(segment.variant2 * 100).toFixed(0)}%</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details" className="space-y-6">
            {/* 详细数据表格 */}
            <Card className="transition-all duration-300 hover:translate-y-[-5px] hover:shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TableCellsIcon className="h-5 w-5" />
                  详细数据
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">变体</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">指标</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">值</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">变化</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">变化率</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">置信度</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">显著性</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">样本量</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {testResults.map((result, index) => {
                        const variant = testReport.test.variants.find(v => v.id === result.variantId)
                        const metric = testReport.test.metrics.find(m => m.id === result.metricId)
                        
                        return (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="text-sm font-medium text-gray-900">{variant?.name}</div>
                                {variant?.isControl && (
                                  <Badge className="ml-2 bg-blue-100 text-blue-800 text-xs">控制组</Badge>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{metric?.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {(result.value * 100).toFixed(1)}{metric?.unit}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {result.change > 0 ? '+' : ''}{result.change}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={cn(
                                "text-sm font-medium",
                                result.changePercentage > 0 ? 'text-green-600' : 'text-red-600'
                              )}>
                                {result.changePercentage > 0 ? '+' : ''}{result.changePercentage}%
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {(result.confidence * 100).toFixed(0)}%
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {result.significance ? (
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                  显著
                                </span>
                              ) : (
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                  不显著
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {result.sampleSize.toLocaleString()}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}