'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, TrendingUp, Users, BarChart3, AlertTriangle, CheckCircle, Target } from 'lucide-react'

interface AdvancedStatsProps {
  testId: string
}

interface StatsData {
  basicStats: Record<string, any>
  advancedStats: {
    overallPerformance: any
    variantComparison: Record<string, any>
    metricAnalysis: Record<string, any>
    statisticalSignificance: Record<string, any>
    confidenceIntervals: Record<string, any>
    effectSizes: Record<string, any>
  }
  userBreakdown: any
  trends: any[]
  insights: {
    summary: string[]
    recommendations: string[]
    warnings: string[]
    opportunities: string[]
  }
  report: any
}

export default function ABTestAdvancedStats({ testId }: AdvancedStatsProps) {
  const [statsData, setStatsData] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d')
  const [selectedMetric, setSelectedMetric] = useState('all')

  useEffect(() => {
    fetchAdvancedStats()
  }, [testId, selectedTimeRange])

  const fetchAdvancedStats = async () => {
    setLoading(true)
    setError(null)

    try {
      const timeRange = getTimeRange(selectedTimeRange)
      
      const response = await fetch('/api/gamification/abtesting/advanced-stats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          testId,
          timeRange,
          includeUserBreakdown: true,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setStatsData(result.data)
      } else {
        setError(result.error || '获取统计数据失败')
      }
    } catch (err) {
      setError('获取统计数据时发生错误')
      console.error('获取统计数据错误:', err)
    } finally {
      setLoading(false)
    }
  }

  const getTimeRange = (range: string) => {
    const endDate = new Date()
    const startDate = new Date()

    switch (range) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7)
        break
      case '14d':
        startDate.setDate(startDate.getDate() - 14)
        break
      case '30d':
        startDate.setDate(startDate.getDate() - 30)
        break
      case '90d':
        startDate.setDate(startDate.getDate() - 90)
        break
      default:
        startDate.setDate(startDate.getDate() - 30)
    }

    return { startDate: startDate.toISOString(), endDate: endDate.toISOString() }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">加载统计数据中...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
            <p className="mt-4 text-destructive">{error}</p>
            <Button onClick={fetchAdvancedStats} className="mt-4">
              重试
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!statsData) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* 控制面板 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            高级统计分析
          </CardTitle>
          <CardDescription>
            查看A/B测试的详细统计分析和洞察
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">时间范围</label>
              <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">最近7天</SelectItem>
                  <SelectItem value="14d">最近14天</SelectItem>
                  <SelectItem value="30d">最近30天</SelectItem>
                  <SelectItem value="90d">最近90天</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">指标</label>
              <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有指标</SelectItem>
                  {Object.entries(statsData.advancedStats.metricAnalysis).map(([metricId, metric]) => (
                    <SelectItem key={metricId} value={metricId}>
                      {metric.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button onClick={fetchAdvancedStats} variant="outline">
                刷新数据
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 洞察面板 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {statsData.insights.summary.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="h-5 w-5" />
                关键发现
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {statsData.insights.summary.map((insight, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{insight}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {statsData.insights.warnings.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertTriangle className="h-5 w-5" />
                注意事项
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {statsData.insights.warnings.map((warning, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <span>{warning}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {/* 详细统计 */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">概览</TabsTrigger>
          <TabsTrigger value="comparison">变体对比</TabsTrigger>
          <TabsTrigger value="significance">显著性分析</TabsTrigger>
          <TabsTrigger value="trends">趋势分析</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">总样本量</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsData.advancedStats.overallPerformance.totalSampleSize.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  所有变体的总用户数
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">整体平均值</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsData.advancedStats.overallPerformance.overallAverage.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  所有变体的平均表现
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">测试状态</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {statsData.report.test.status === 'COMPLETED' ? (
                    <Badge variant="default">已完成</Badge>
                  ) : statsData.report.test.status === 'ACTIVE' ? (
                    <Badge variant="secondary">进行中</Badge>
                  ) : (
                    <Badge variant="outline">其他</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  当前测试状态
                </p>
              </CardContent>
            </Card>
          </div>

          {/* 变体表现概览 */}
          <Card>
            <CardHeader>
              <CardTitle>变体表现概览</CardTitle>
              <CardDescription>
                各变体的相对表现和贡献度
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(statsData.advancedStats.variantComparison).map(([variantId, data]: [string, any]) => (
                  <div key={variantId} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">变体 {variantId}</h3>
                      <p className="text-sm text-muted-foreground">
                        样本量: {data.sampleSize.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {data.relativePerformance > 0 ? '+' : ''}{(data.relativePerformance * 100).toFixed(1)}%
                      </div>
                      <p className="text-sm text-muted-foreground">
                        贡献度: {(data.contribution * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>指标详细分析</CardTitle>
              <CardDescription>
                各指标在不同变体下的表现分析
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(statsData.advancedStats.metricAnalysis).map(([metricId, metric]: [string, any]) => (
                  <div key={metricId} className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium">{metric.name}</h3>
                      <p className="text-sm text-muted-foreground">类型: {metric.type}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(metric.variants).map(([variantId, variant]: [string, any]) => (
                        <div key={variantId} className="p-4 border rounded-lg">
                          <h4 className="font-medium mb-2">变体 {variantId}</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm">平均值:</span>
                              <span className="font-medium">{variant.avgValue.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">标准差:</span>
                              <span>{variant.stdDev.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">样本量:</span>
                              <span>{variant.sampleSize}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm">变异系数:</span>
                              <span>{(variant.coefficientOfVariation * 100).toFixed(1)}%</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="significance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>统计显著性分析</CardTitle>
              <CardDescription>
                各变体之间的统计显著性和效应量分析
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(statsData.advancedStats.statisticalSignificance).map(([metricId, tests]: [string, any]) => (
                  <div key={metricId} className="space-y-4">
                    <h3 className="text-lg font-medium">{metricId}</h3>
                    
                    <div className="space-y-3">
                      {Object.entries(tests).map(([testKey, test]: [string, any]) => (
                        <div key={testKey} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{testKey.replace('_', ' vs ')}</h4>
                            <Badge variant={test.isSignificant ? "default" : "secondary"}>
                              {test.isSignificant ? "显著" : "不显著"}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">t统计量:</span>
                              <div className="font-medium">{test.tStatistic.toFixed(3)}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">p值:</span>
                              <div className="font-medium">{test.pValue.toFixed(4)}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">置信度:</span>
                              <div className="font-medium">{(test.confidenceLevel * 100).toFixed(1)}%</div>
                            </div>
                            {statsData.advancedStats.effectSizes[metricId]?.[testKey] && (
                              <div>
                                <span className="text-muted-foreground">效应量:</span>
                                <div className="font-medium">
                                  {statsData.advancedStats.effectSizes[metricId][testKey].cohensD.toFixed(2)} 
                                  ({statsData.advancedStats.effectSizes[metricId][testKey].magnitude})
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                趋势分析
              </CardTitle>
              <CardDescription>
                各变体随时间的变化趋势
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center text-muted-foreground">
                  趋势图表将显示在这里
                </div>
                
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-4">趋势数据表</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">日期</th>
                          {Object.keys(statsData.trends[0] || {})
                            .filter(key => key !== 'date')
                            .map(variant => (
                              <th key={variant} className="text-left p-2">{variant}</th>
                            ))}
                        </tr>
                      </thead>
                      <tbody>
                        {statsData.trends.slice(0, 10).map((trend, index) => (
                          <tr key={index} className="border-b">
                            <td className="p-2">{trend.date}</td>
                            {Object.keys(trend)
                              .filter(key => key !== 'date')
                              .map(variant => (
                                <td key={variant} className="p-2">{trend[variant]}</td>
                              ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}