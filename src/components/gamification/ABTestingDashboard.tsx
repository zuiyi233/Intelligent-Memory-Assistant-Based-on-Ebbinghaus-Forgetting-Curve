'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Beaker, 
  BarChart3, 
  TrendingUp, 
  Users, 
  Calendar, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  Settings,
  Plus,
  RefreshCw
} from 'lucide-react'
import { GamificationABTestingAnalyzer } from '@/services/gamificationABTestingAnalyzer.service'

// A/B测试状态类型
type TestStatus = 'draft' | 'running' | 'paused' | 'completed'

// A/B测试概览类型
interface ABTestOverview {
  id: string
  name: string
  status: TestStatus
  startDate: Date
  endDate: Date | null
  totalUsers: number
  variants: Array<{
    id: string
    name: string
    users: number
    percentage: number
  }>
  keyMetrics: {
    primary: string
    improvement: number
    confidence: number
  }
}

// A/B测试详情类型
interface ABTestDetail {
  id: string
  name: string
  description: string
  status: TestStatus
  startDate: Date
  endDate: Date | null
  createdAt: Date
  updatedAt: Date
  variants: Array<{
    id: string
    name: string
    description: string
    trafficAllocation: number
    isControl: boolean
    config: Record<string, unknown>
  }>
  metrics: Array<{
    id: string
    name: string
    description: string
    primary: boolean
    unit: string
  }>
}

// 测试结果类型
interface TestResult {
  variantId: string
  variantName: string
  metrics: Record<string, {
    value: number
    change: number
    changePercentage: number
    confidence: number
    significance: boolean
  }>
  isWinner: boolean
}

interface ABTestingDashboardProps {
  userId: string
  isAdmin?: boolean
}

export function ABTestingDashboard({ userId, isAdmin = false }: ABTestingDashboardProps) {
  const [tests, setTests] = useState<ABTestOverview[]>([])
  const [selectedTest, setSelectedTest] = useState<ABTestDetail | null>(null)
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [loading, setLoading] = useState(true)
  const [resultsLoading, setResultsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  
  const analyzer = new GamificationABTestingAnalyzer()

  useEffect(() => {
    fetchTests()
  }, [])

  // 获取A/B测试列表
  const fetchTests = async () => {
    try {
      setLoading(true)
      
      // 简化实现，使用模拟数据
      const mockTests: ABTestOverview[] = [
        {
          id: 'test-1',
          name: '成就通知系统优化',
          status: 'running',
          startDate: new Date('2023-06-01'),
          endDate: null,
          totalUsers: 1250,
          variants: [
            { id: 'variant-1', name: '标准通知', users: 625, percentage: 50 },
            { id: 'variant-2', name: '增强通知', users: 625, percentage: 50 }
          ],
          keyMetrics: {
            primary: '成就解锁率',
            improvement: 12.5,
            confidence: 0.92
          }
        },
        {
          id: 'test-2',
          name: '积分奖励机制',
          status: 'completed',
          startDate: new Date('2023-05-15'),
          endDate: new Date('2023-06-15'),
          totalUsers: 2100,
          variants: [
            { id: 'variant-1', name: '固定积分', users: 1050, percentage: 50 },
            { id: 'variant-2', name: '动态积分', users: 1050, percentage: 50 }
          ],
          keyMetrics: {
            primary: '用户参与度',
            improvement: 8.3,
            confidence: 0.87
          }
        },
        {
          id: 'test-3',
          name: '排行榜展示方式',
          status: 'draft',
          startDate: new Date('2023-07-01'),
          endDate: null,
          totalUsers: 0,
          variants: [
            { id: 'variant-1', name: '经典排行', users: 0, percentage: 0 },
            { id: 'variant-2', name: '分类排行', users: 0, percentage: 0 }
          ],
          keyMetrics: {
            primary: '页面停留时间',
            improvement: 0,
            confidence: 0
          }
        }
      ]
      
      setTests(mockTests)
    } catch (error) {
      console.error('获取A/B测试列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 获取测试详情
  const fetchTestDetail = async (testId: string) => {
    try {
      setResultsLoading(true)
      
      // 简化实现，使用模拟数据
      const mockTestDetail: ABTestDetail = {
        id: testId,
        name: testId === 'test-1' ? '成就通知系统优化' : 
             testId === 'test-2' ? '积分奖励机制' : 
             '排行榜展示方式',
        description: testId === 'test-1' ? '测试不同类型的成就通知对用户参与度的影响' : 
                     testId === 'test-2' ? '比较固定积分与动态积分奖励机制的效果' : 
                     '评估不同排行榜展示方式对用户体验的影响',
        status: tests.find(t => t.id === testId)?.status || 'draft',
        startDate: tests.find(t => t.id === testId)?.startDate || new Date(),
        endDate: tests.find(t => t.id === testId)?.endDate || null,
        createdAt: new Date('2023-05-01'),
        updatedAt: new Date(),
        variants: [
          {
            id: 'variant-1',
            name: testId === 'test-1' ? '标准通知' : 
                 testId === 'test-2' ? '固定积分' : 
                 '经典排行',
            description: testId === 'test-1' ? '使用标准的通知样式和动画' : 
                         testId === 'test-2' ? '每次完成成就获得固定积分' : 
                         '按照总积分进行排名',
            trafficAllocation: 50,
            isControl: true,
            config: {
              animationType: 'default',
              notificationSound: true,
              pointsPerAction: 10
            }
          },
          {
            id: 'variant-2',
            name: testId === 'test-1' ? '增强通知' : 
                 testId === 'test-2' ? '动态积分' : 
                 '分类排行',
            description: testId === 'test-1' ? '使用增强的动画和音效' : 
                         testId === 'test-2' ? '根据难度和完成情况动态调整积分' : 
                         '按类别进行排名展示',
            trafficAllocation: 50,
            isControl: false,
            config: {
              animationType: 'enhanced',
              notificationSound: true,
              celebrationEffect: true,
              pointsMultiplier: 1.2
            }
          }
        ],
        metrics: [
          {
            id: 'metric-1',
            name: '成就解锁率',
            description: '用户解锁成就的比例',
            primary: true,
            unit: '%'
          },
          {
            id: 'metric-2',
            name: '用户参与度',
            description: '用户与游戏化功能的互动频率',
            primary: false,
            unit: '次/天'
          },
          {
            id: 'metric-3',
            name: '页面停留时间',
            description: '用户在游戏化页面的平均停留时间',
            primary: false,
            unit: '分钟'
          }
        ]
      }
      
      setSelectedTest(mockTestDetail)
      
      // 获取测试结果
      if (mockTestDetail.status !== 'draft') {
        const mockResults: TestResult[] = [
          {
            variantId: 'variant-1',
            variantName: mockTestDetail.variants[0].name,
            metrics: {
              '成就解锁率': {
                value: 65.2,
                change: 0,
                changePercentage: 0,
                confidence: 0,
                significance: false
              },
              '用户参与度': {
                value: 3.2,
                change: 0,
                changePercentage: 0,
                confidence: 0,
                significance: false
              },
              '页面停留时间': {
                value: 4.5,
                change: 0,
                changePercentage: 0,
                confidence: 0,
                significance: false
              }
            },
            isWinner: false
          },
          {
            variantId: 'variant-2',
            variantName: mockTestDetail.variants[1].name,
            metrics: {
              '成就解锁率': {
                value: 73.4,
                change: 8.2,
                changePercentage: 12.6,
                confidence: 0.92,
                significance: true
              },
              '用户参与度': {
                value: 3.7,
                change: 0.5,
                changePercentage: 15.6,
                confidence: 0.88,
                significance: true
              },
              '页面停留时间': {
                value: 5.2,
                change: 0.7,
                changePercentage: 15.6,
                confidence: 0.85,
                significance: true
              }
            },
            isWinner: true
          }
        ]
        
        setTestResults(mockResults)
      } else {
        setTestResults([])
      }
    } catch (error) {
      console.error('获取测试详情失败:', error)
    } finally {
      setResultsLoading(false)
    }
  }

  // 处理测试选择
  const handleTestSelect = (testId: string) => {
    fetchTestDetail(testId)
    setActiveTab('detail')
  }

  // 获取状态标签样式
  const getStatusBadge = (status: TestStatus) => {
    switch (status) {
      case 'running':
        return <Badge className="bg-green-100 text-green-800">进行中</Badge>
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">已完成</Badge>
      case 'paused':
        return <Badge className="bg-yellow-100 text-yellow-800">已暂停</Badge>
      case 'draft':
        return <Badge className="bg-gray-100 text-gray-800">草稿</Badge>
      default:
        return <Badge>未知</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Beaker className="h-6 w-6 text-blue-600" />
            A/B测试仪表板
          </h1>
          <p className="text-gray-600 mt-1">管理和监控游戏化功能的A/B测试</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchTests}>
            <RefreshCw className="h-4 w-4 mr-2" />
            刷新
          </Button>
          {isAdmin && (
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              创建测试
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">测试概览</TabsTrigger>
          <TabsTrigger value="detail">测试详情</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tests.map((test) => (
              <Card key={test.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleTestSelect(test.id)}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{test.name}</CardTitle>
                    {getStatusBadge(test.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {test.startDate.toLocaleDateString()} - {' '}
                        {test.endDate ? test.endDate.toLocaleDateString() : '进行中'}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="h-4 w-4" />
                      <span>{test.totalUsers.toLocaleString()} 位用户</span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{test.keyMetrics.primary}</span>
                        <span className={`font-medium ${test.keyMetrics.improvement > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {test.keyMetrics.improvement > 0 ? '+' : ''}{test.keyMetrics.improvement}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${test.keyMetrics.confidence > 0.9 ? 'bg-green-500' : test.keyMetrics.confidence > 0.7 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${test.keyMetrics.confidence * 100}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500">
                        置信度: {(test.keyMetrics.confidence * 100).toFixed(1)}%
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {test.variants.map((variant) => (
                        <Badge key={variant.id} variant="outline" className="text-xs">
                          {variant.name} ({variant.percentage}%)
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="detail" className="space-y-4">
          {resultsLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : selectedTest ? (
            <div className="space-y-6">
              {/* 测试基本信息 */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{selectedTest.name}</CardTitle>
                    {getStatusBadge(selectedTest.status)}
                  </div>
                  <p className="text-gray-600">{selectedTest.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">开始日期</p>
                      <p className="font-medium">{selectedTest.startDate.toLocaleDateString()}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">结束日期</p>
                      <p className="font-medium">
                        {selectedTest.endDate ? selectedTest.endDate.toLocaleDateString() : '进行中'}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">创建时间</p>
                      <p className="font-medium">{selectedTest.createdAt.toLocaleDateString()}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">最后更新</p>
                      <p className="font-medium">{selectedTest.updatedAt.toLocaleDateString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 测试变体 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Beaker className="h-5 w-5" />
                    测试变体
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {selectedTest.variants.map((variant) => (
                      <div key={variant.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium flex items-center gap-2">
                            {variant.name}
                            {variant.isControl && (
                              <Badge variant="outline" className="text-xs">对照组</Badge>
                            )}
                          </h3>
                          <Badge className="text-xs">{variant.trafficAllocation}%</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{variant.description}</p>
                        <div className="text-xs">
                          <p className="font-medium mb-1">配置参数:</p>
                          <div className="space-y-1">
                            {Object.entries(variant.config).map(([key, value]) => (
                              <div key={key} className="flex gap-2">
                                <span className="text-gray-500">{key}:</span>
                                <span>{String(value)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 测试指标 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    测试指标
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    {selectedTest.metrics.map((metric) => (
                      <div key={metric.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{metric.name}</h3>
                            {metric.primary && (
                              <Badge className="text-xs">主要指标</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{metric.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">单位: {metric.unit}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 测试结果 */}
              {testResults.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      测试结果
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {testResults.map((result) => (
                        <div key={result.variantId} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-medium flex items-center gap-2">
                              {result.variantName}
                              {result.isWinner && (
                                <Badge className="bg-green-100 text-green-800 text-xs">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  优胜
                                </Badge>
                              )}
                            </h3>
                          </div>
                          
                          <div className="grid gap-3 md:grid-cols-3">
                            {Object.entries(result.metrics).map(([metricName, metricData]) => (
                              <div key={metricName} className="space-y-1">
                                <p className="text-sm font-medium">{metricName}</p>
                                <div className="flex items-baseline gap-2">
                                  <span className="text-lg font-bold">{metricData.value}</span>
                                  <span className="text-sm text-gray-500">{selectedTest.metrics.find(m => m.name === metricName)?.unit}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className={`text-sm ${metricData.change > 0 ? 'text-green-600' : metricData.change < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                                    {metricData.change > 0 ? '+' : ''}{metricData.change} ({metricData.changePercentage > 0 ? '+' : ''}{metricData.changePercentage}%)
                                  </span>
                                  {metricData.significance && (
                                    <Badge className="text-xs bg-blue-100 text-blue-800">显著</Badge>
                                  )}
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                  <div 
                                    className={`h-2 rounded-full ${metricData.confidence > 0.9 ? 'bg-green-500' : metricData.confidence > 0.7 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                    style={{ width: `${metricData.confidence * 100}%` }}
                                  ></div>
                                </div>
                                <div className="text-xs text-gray-500">
                                  置信度: {(metricData.confidence * 100).toFixed(1)}%
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 操作按钮 */}
              <div className="flex justify-end gap-2">
                {isAdmin && selectedTest.status === 'draft' && (
                  <Button>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    启动测试
                  </Button>
                )}
                {isAdmin && selectedTest.status === 'running' && (
                  <Button variant="outline">
                    <Clock className="h-4 w-4 mr-2" />
                    暂停测试
                  </Button>
                )}
                {isAdmin && selectedTest.status === 'paused' && (
                  <Button>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    继续测试
                  </Button>
                )}
                {isAdmin && (selectedTest.status === 'running' || selectedTest.status === 'paused') && (
                  <Button variant="destructive">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    结束测试
                  </Button>
                )}
                <Button variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  编辑测试
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">未选择测试</h3>
              <p className="text-gray-500 mb-4">请从测试概览中选择一个测试查看详情</p>
              <Button onClick={() => setActiveTab('overview')}>
                返回概览
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}