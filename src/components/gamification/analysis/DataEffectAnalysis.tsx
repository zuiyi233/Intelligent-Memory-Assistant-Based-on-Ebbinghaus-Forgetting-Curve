'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { InspiraCard, InspiraCardHeader, InspiraCardTitle, InspiraCardContent } from '@/components/ui/inspira-card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { InspiraButton } from '@/components/ui/inspira-button'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
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
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts'

// 定义数据类型
interface UserEngagementData {
  date: string
  dailyActiveUsers: number
  sessionDuration: number
  sessionFrequency: number
  featureUsage: Record<string, number>
}

interface RetentionData {
  period: string
  newUsers: number
  retainedUsers: number
  retentionRate: number
  cohortData: Array<{
    cohort: string
    day1: number
    day7: number
    day30: number
    day90: number
  }>
}

interface ConversionData {
  period: string
  totalUsers: number
  convertedUsers: number
  conversionRate: number
  funnelData: Array<{
    stage: string
    users: number
    conversion: number
  }>
  featureConversion: Array<{
    feature: string
    impressions: number
    actions: number
    conversion: number
  }>
}

interface DataEffectAnalysisProps {
  timeRange?: '7d' | '30d' | '90d'
  className?: string
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

export const DataEffectAnalysis: React.FC<DataEffectAnalysisProps> = ({
  timeRange = '30d',
  className
}) => {
  const [engagementData, setEngagementData] = useState<UserEngagementData[]>([])
  const [retentionData, setRetentionData] = useState<RetentionData | null>(null)
  const [conversionData, setConversionData] = useState<ConversionData | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>(timeRange)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const days = selectedTimeRange === '7d' ? 7 : selectedTimeRange === '30d' ? 30 : 90
        
        // 并行获取所有数据
        const [engagementResponse, retentionResponse, conversionResponse] = await Promise.all([
          fetch(`/api/gamification/analysis/engagement?days=${days}`),
          fetch(`/api/gamification/analysis/retention?days=${days}`),
          fetch(`/api/gamification/analysis/conversion?days=${days}`)
        ])

        if (!engagementResponse.ok || !retentionResponse.ok || !conversionResponse.ok) {
          throw new Error('获取数据失败')
        }

        const [engagementResult, retentionResult, conversionResult] = await Promise.all([
          engagementResponse.json(),
          retentionResponse.json(),
          conversionResponse.json()
        ])

        setEngagementData(engagementResult)
        setRetentionData(retentionResult)
        setConversionData(conversionResult)
      } catch (err) {
        setError(err instanceof Error ? err.message : '获取数据失败')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [selectedTimeRange])

  const handleTimeRangeChange = (range: string) => {
    setSelectedTimeRange(range)
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

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold">数据效果分析</h2>
        <div className="flex flex-wrap gap-2">
          {['7d', '30d', '90d'].map((range) => (
            <InspiraButton
              key={range}
              variant={selectedTimeRange === range ? 'gradient' : 'outline'}
              size="sm"
              onClick={() => handleTimeRangeChange(range)}
            >
              {range === '7d' ? '最近7天' : range === '30d' ? '最近30天' : '最近90天'}
            </InspiraButton>
          ))}
        </div>
      </div>

      <Tabs defaultValue="engagement">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="engagement">用户参与度</TabsTrigger>
          <TabsTrigger value="retention">留存率分析</TabsTrigger>
          <TabsTrigger value="conversion">转化率分析</TabsTrigger>
        </TabsList>

        <TabsContent value="engagement" className="space-y-6">
          {/* 用户参与度概览卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <InspiraCard variant="glass">
              <InspiraCardHeader className="pb-2">
                <InspiraCardTitle className="text-sm font-medium">日活跃用户</InspiraCardTitle>
              </InspiraCardHeader>
              <InspiraCardContent>
                <div className="text-2xl font-bold">
                  {engagementData.length > 0 
                    ? engagementData[engagementData.length - 1].dailyActiveUsers 
                    : 0}
                </div>
                <Badge variant="outline" className="mt-2">
                  {engagementData.length > 1 
                    ? `${((engagementData[engagementData.length - 1].dailyActiveUsers - engagementData[0].dailyActiveUsers) / engagementData[0].dailyActiveUsers * 100).toFixed(1)}%`
                    : '0%'} 较初期
                </Badge>
              </InspiraCardContent>
            </InspiraCard>
            
            <InspiraCard variant="glass">
              <InspiraCardHeader className="pb-2">
                <InspiraCardTitle className="text-sm font-medium">平均会话时长</InspiraCardTitle>
              </InspiraCardHeader>
              <InspiraCardContent>
                <div className="text-2xl font-bold">
                  {engagementData.length > 0 
                    ? `${engagementData[engagementData.length - 1].sessionDuration.toFixed(1)}分钟`
                    : '0分钟'}
                </div>
                <Badge variant="outline" className="mt-2">
                  {engagementData.length > 1 
                    ? `${((engagementData[engagementData.length - 1].sessionDuration - engagementData[0].sessionDuration) / engagementData[0].sessionDuration * 100).toFixed(1)}%`
                    : '0%'} 较初期
                </Badge>
              </InspiraCardContent>
            </InspiraCard>
            
            <InspiraCard variant="glass">
              <InspiraCardHeader className="pb-2">
                <InspiraCardTitle className="text-sm font-medium">会话频率</InspiraCardTitle>
              </InspiraCardHeader>
              <InspiraCardContent>
                <div className="text-2xl font-bold">
                  {engagementData.length > 0 
                    ? `${engagementData[engagementData.length - 1].sessionFrequency.toFixed(1)}次/天`
                    : '0次/天'}
                </div>
                <Badge variant="outline" className="mt-2">
                  {engagementData.length > 1 
                    ? `${((engagementData[engagementData.length - 1].sessionFrequency - engagementData[0].sessionFrequency) / engagementData[0].sessionFrequency * 100).toFixed(1)}%`
                    : '0%'} 较初期
                </Badge>
              </InspiraCardContent>
            </InspiraCard>
            
            <InspiraCard variant="glass">
              <InspiraCardHeader className="pb-2">
                <InspiraCardTitle className="text-sm font-medium">功能使用分布</InspiraCardTitle>
              </InspiraCardHeader>
              <InspiraCardContent>
                <div className="text-2xl font-bold">
                  {engagementData.length > 0 
                    ? Object.keys(engagementData[engagementData.length - 1].featureUsage).length
                    : 0}个
                </div>
                <Badge variant="outline" className="mt-2">
                  核心功能
                </Badge>
              </InspiraCardContent>
            </InspiraCard>
          </div>

          {/* 用户参与度趋势图 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <InspiraCard variant="default">
              <InspiraCardHeader>
                <InspiraCardTitle>用户活跃度趋势</InspiraCardTitle>
              </InspiraCardHeader>
              <InspiraCardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={engagementData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="dailyActiveUsers" 
                      name="日活跃用户" 
                      stroke="#8884d8" 
                      fill="#8884d8" 
                      fillOpacity={0.3} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </InspiraCardContent>
            </InspiraCard>

            <InspiraCard variant="default">
              <InspiraCardHeader>
                <InspiraCardTitle>会话时长与频率</InspiraCardTitle>
              </InspiraCardHeader>
              <InspiraCardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={engagementData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line 
                      yAxisId="left" 
                      type="monotone" 
                      dataKey="sessionDuration" 
                      name="会话时长(分钟)" 
                      stroke="#82ca9d" 
                      activeDot={{ r: 8 }} 
                    />
                    <Line 
                      yAxisId="right" 
                      type="monotone" 
                      dataKey="sessionFrequency" 
                      name="会话频率(次/天)" 
                      stroke="#8884d8" 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </InspiraCardContent>
            </InspiraCard>
          </div>

          {/* 功能使用分布图 */}
          {engagementData.length > 0 && (
            <InspiraCard variant="default">
              <InspiraCardHeader>
                <InspiraCardTitle>功能使用分布</InspiraCardTitle>
              </InspiraCardHeader>
              <InspiraCardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={Object.entries(engagementData[engagementData.length - 1].featureUsage).map(([name, value]) => ({
                        name,
                        value
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, value }) => {
                        const total = Object.values(engagementData[engagementData.length - 1].featureUsage).reduce((sum, val) => sum + val, 0);
                        const percentage = (Number(value) / total) * 100;
                        return `${name}: ${percentage.toFixed(0)}%`;
                      }}
                    >
                      {Object.entries(engagementData[engagementData.length - 1].featureUsage).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </InspiraCardContent>
            </InspiraCard>
          )}
        </TabsContent>

        <TabsContent value="retention" className="space-y-6">
          {retentionData && (
            <>
              {/* 留存率概览卡片 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <InspiraCard variant="glass">
                  <InspiraCardHeader className="pb-2">
                    <InspiraCardTitle className="text-sm font-medium">新增用户</InspiraCardTitle>
                  </InspiraCardHeader>
                  <InspiraCardContent>
                    <div className="text-2xl font-bold">{retentionData.newUsers}</div>
                    <Badge variant="outline" className="mt-2">
                      {selectedTimeRange}期间
                    </Badge>
                  </InspiraCardContent>
                </InspiraCard>
                
                <InspiraCard variant="glass">
                  <InspiraCardHeader className="pb-2">
                    <InspiraCardTitle className="text-sm font-medium">留存用户</InspiraCardTitle>
                  </InspiraCardHeader>
                  <InspiraCardContent>
                    <div className="text-2xl font-bold">{retentionData.retainedUsers}</div>
                    <Badge variant="outline" className="mt-2">
                      {selectedTimeRange}期间
                    </Badge>
                  </InspiraCardContent>
                </InspiraCard>
                
                <InspiraCard variant="glass">
                  <InspiraCardHeader className="pb-2">
                    <InspiraCardTitle className="text-sm font-medium">留存率</InspiraCardTitle>
                  </InspiraCardHeader>
                  <InspiraCardContent>
                    <div className="text-2xl font-bold">{(retentionData.retentionRate * 100).toFixed(1)}%</div>
                    <Progress value={retentionData.retentionRate * 100} className="mt-2" />
                  </InspiraCardContent>
                </InspiraCard>
                
                <InspiraCard variant="glass">
                  <InspiraCardHeader className="pb-2">
                    <InspiraCardTitle className="text-sm font-medium">7日留存</InspiraCardTitle>
                  </InspiraCardHeader>
                  <InspiraCardContent>
                    <div className="text-2xl font-bold">
                      {retentionData.cohortData.length > 0 
                        ? `${(retentionData.cohortData[0].day7 * 100).toFixed(1)}%`
                        : '0%'}
                    </div>
                    <Badge variant="outline" className="mt-2">
                      最新批次
                    </Badge>
                  </InspiraCardContent>
                </InspiraCard>
              </div>

              {/* 留存率趋势图 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <InspiraCard variant="default">
                  <InspiraCardHeader>
                    <InspiraCardTitle>留存率趋势</InspiraCardTitle>
                  </InspiraCardHeader>
                  <InspiraCardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={engagementData.map((item, index) => ({
                        date: item.date,
                        retention: index > 0 ? (item.dailyActiveUsers / engagementData[index - 1].dailyActiveUsers) : 1
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="retention" 
                          name="留存率" 
                          stroke="#82ca9d" 
                          activeDot={{ r: 8 }} 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </InspiraCardContent>
                </InspiraCard>

                <InspiraCard variant="default">
                  <InspiraCardHeader>
                    <InspiraCardTitle>用户群组留存</InspiraCardTitle>
                  </InspiraCardHeader>
                  <InspiraCardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={retentionData.cohortData.map(item => ({
                        subject: item.cohort,
                        day1: item.day1 * 100,
                        day7: item.day7 * 100,
                        day30: item.day30 * 100,
                        day90: item.day90 * 100
                      }))}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="subject" />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} />
                        <Radar name="1日留存" dataKey="day1" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                        <Radar name="7日留存" dataKey="day7" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                        <Radar name="30日留存" dataKey="day30" stroke="#ffc658" fill="#ffc658" fillOpacity={0.6} />
                        <Radar name="90日留存" dataKey="day90" stroke="#ff8042" fill="#ff8042" fillOpacity={0.6} />
                        <Legend />
                      </RadarChart>
                    </ResponsiveContainer>
                  </InspiraCardContent>
                </InspiraCard>
              </div>

              {/* 群组留存热力图 */}
              <InspiraCard variant="default">
                <InspiraCardHeader>
                  <InspiraCardTitle>用户群组留存热力图</InspiraCardTitle>
                </InspiraCardHeader>
                <InspiraCardContent>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            群组
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            1日
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            7日
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            30日
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            90日
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {retentionData.cohortData.map((cohort, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {cohort.cohort}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex items-center">
                                <div className="w-16 bg-gray-200 rounded-full h-2.5 mr-2">
                                  <div 
                                    className="bg-green-600 h-2.5 rounded-full" 
                                    style={{ width: `${cohort.day1 * 100}%` }}
                                  ></div>
                                </div>
                                <span>{(cohort.day1 * 100).toFixed(1)}%</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex items-center">
                                <div className="w-16 bg-gray-200 rounded-full h-2.5 mr-2">
                                  <div 
                                    className="bg-blue-600 h-2.5 rounded-full" 
                                    style={{ width: `${cohort.day7 * 100}%` }}
                                  ></div>
                                </div>
                                <span>{(cohort.day7 * 100).toFixed(1)}%</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex items-center">
                                <div className="w-16 bg-gray-200 rounded-full h-2.5 mr-2">
                                  <div 
                                    className="bg-yellow-600 h-2.5 rounded-full" 
                                    style={{ width: `${cohort.day30 * 100}%` }}
                                  ></div>
                                </div>
                                <span>{(cohort.day30 * 100).toFixed(1)}%</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex items-center">
                                <div className="w-16 bg-gray-200 rounded-full h-2.5 mr-2">
                                  <div 
                                    className="bg-red-600 h-2.5 rounded-full" 
                                    style={{ width: `${cohort.day90 * 100}%` }}
                                  ></div>
                                </div>
                                <span>{(cohort.day90 * 100).toFixed(1)}%</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </InspiraCardContent>
              </InspiraCard>
            </>
          )}
        </TabsContent>

        <TabsContent value="conversion" className="space-y-6">
          {conversionData && (
            <>
              {/* 转化率概览卡片 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <InspiraCard variant="glass">
                  <InspiraCardHeader className="pb-2">
                    <InspiraCardTitle className="text-sm font-medium">总用户数</InspiraCardTitle>
                  </InspiraCardHeader>
                  <InspiraCardContent>
                    <div className="text-2xl font-bold">{conversionData.totalUsers}</div>
                    <Badge variant="outline" className="mt-2">
                      {selectedTimeRange}期间
                    </Badge>
                  </InspiraCardContent>
                </InspiraCard>
                
                <InspiraCard variant="glass">
                  <InspiraCardHeader className="pb-2">
                    <InspiraCardTitle className="text-sm font-medium">转化用户</InspiraCardTitle>
                  </InspiraCardHeader>
                  <InspiraCardContent>
                    <div className="text-2xl font-bold">{conversionData.convertedUsers}</div>
                    <Badge variant="outline" className="mt-2">
                      {selectedTimeRange}期间
                    </Badge>
                  </InspiraCardContent>
                </InspiraCard>
                
                <InspiraCard variant="glass">
                  <InspiraCardHeader className="pb-2">
                    <InspiraCardTitle className="text-sm font-medium">转化率</InspiraCardTitle>
                  </InspiraCardHeader>
                  <InspiraCardContent>
                    <div className="text-2xl font-bold">{(conversionData.conversionRate * 100).toFixed(1)}%</div>
                    <Progress value={conversionData.conversionRate * 100} className="mt-2" />
                  </InspiraCardContent>
                </InspiraCard>
                
                <InspiraCard variant="glass">
                  <InspiraCardHeader className="pb-2">
                    <InspiraCardTitle className="text-sm font-medium">核心功能转化</InspiraCardTitle>
                  </InspiraCardHeader>
                  <InspiraCardContent>
                    <div className="text-2xl font-bold">
                      {conversionData.featureConversion.length > 0 
                        ? `${(conversionData.featureConversion[0].conversion * 100).toFixed(1)}%`
                        : '0%'}
                    </div>
                    <Badge variant="outline" className="mt-2">
                      最高转化功能
                    </Badge>
                  </InspiraCardContent>
                </InspiraCard>
              </div>

              {/* 转化率趋势图 */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <InspiraCard variant="default">
                  <InspiraCardHeader>
                    <InspiraCardTitle>转化率趋势</InspiraCardTitle>
                  </InspiraCardHeader>
                  <InspiraCardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={engagementData.map((item, index) => ({
                        date: item.date,
                        conversion: Math.random() * 0.3 + 0.1 // 模拟数据
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Area 
                          type="monotone" 
                          dataKey="conversion" 
                          name="转化率" 
                          stroke="#8884d8" 
                          fill="#8884d8" 
                          fillOpacity={0.3} 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </InspiraCardContent>
                </InspiraCard>

                <InspiraCard variant="default">
                  <InspiraCardHeader>
                    <InspiraCardTitle>转化漏斗</InspiraCardTitle>
                  </InspiraCardHeader>
                  <InspiraCardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={conversionData.funnelData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="stage" type="category" width={100} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="users" name="用户数" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </InspiraCardContent>
                </InspiraCard>
              </div>

              {/* 功能转化率图 */}
              <InspiraCard variant="default">
                <InspiraCardHeader>
                  <InspiraCardTitle>功能转化率</InspiraCardTitle>
                </InspiraCardHeader>
                <InspiraCardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={conversionData.featureConversion}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="feature" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="conversion" name="转化率" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </InspiraCardContent>
              </InspiraCard>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default DataEffectAnalysis