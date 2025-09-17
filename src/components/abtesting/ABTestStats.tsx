'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ABTest } from '@/types'
import {
  ArrowLeftIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'

interface ABTestStatsProps {
  test: ABTest
  onBack: () => void
}

export const ABTestStats: React.FC<ABTestStatsProps> = ({
  test,
  onBack
}) => {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/gamification/abtesting/stats?testId=${test.id}`)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        setStats(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : '获取统计数据失败')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [test.id])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
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

  if (!stats) {
    return (
      <div className="bg-yellow-50 p-4 rounded-md text-yellow-700">
        <p>没有可用的统计数据</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 头部信息 */}
      <div className="flex justify-between items-start">
        <div>
          <Button variant="outline" onClick={onBack} className="flex items-center gap-1 mb-2">
            <ArrowLeftIcon className="h-4 w-4" />
            返回
          </Button>
          <h2 className="text-2xl font-bold">{test.name}</h2>
          <p className="text-gray-600 mt-1">{test.description}</p>
        </div>
      </div>

      {/* 统计数据 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChartBarIcon className="h-5 w-5" />
            统计分析
          </CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(stats).length === 0 ? (
            <p className="text-gray-500">暂无统计数据</p>
          ) : (
            <div className="space-y-8">
              {Object.entries(stats).map(([metricId, metricData]: [string, any]) => {
                if (!metricData || !metricData.metric) return null
                
                return (
                  <div key={metricId}>
                    <h3 className="font-semibold mb-4 text-lg">{metricData.metric.name}</h3>
                    <p className="text-sm text-gray-600 mb-4">{metricData.metric.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {Object.entries(metricData.variants).map(([variantId, variantData]: [string, any]) => {
                        if (!variantData || !variantData.variant) return null
                        
                        return (
                          <div key={variantId} className="border border-gray-200 rounded-lg p-4">
                            <h4 className="font-medium mb-3">
                              {variantData.variant.name}
                              {variantData.variant.isControl && (
                                <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                  对照组
                                </span>
                              )}
                            </h4>
                            
                            {variantData.stats ? (
                              <div className="space-y-3">
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-500">平均值</span>
                                  <span className="font-medium">
                                    {variantData.stats.avgValue.toFixed(2)} {metricData.metric.unit}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-500">标准差</span>
                                  <span className="font-medium">
                                    {variantData.stats.stdDev.toFixed(2)}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-500">样本量</span>
                                  <span className="font-medium">
                                    {variantData.stats.sampleSize}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-500">最小值</span>
                                  <span className="font-medium">
                                    {variantData.stats.min.toFixed(2)}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-500">最大值</span>
                                  <span className="font-medium">
                                    {variantData.stats.max.toFixed(2)}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-sm text-gray-500">95% 置信区间</span>
                                  <span className="font-medium">
                                    ±{variantData.stats.marginOfError.toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <p className="text-gray-500">暂无统计数据</p>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}