'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ABTest, ABTestReport as ABTestReportType } from '@/types'
import {
  ArrowLeftIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

interface ABTestReportProps {
  test: ABTest
  onBack: () => void
}

export const ABTestReport: React.FC<ABTestReportProps> = ({
  test,
  onBack
}) => {
  const [report, setReport] = useState<ABTestReportType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/gamification/abtesting/${test.id}/results?report=true`)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        setReport(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : '获取测试报告失败')
      } finally {
        setLoading(false)
      }
    }

    fetchReport()
  }, [test.id])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return <Badge variant="secondary">草稿</Badge>
      case 'ACTIVE':
        return <Badge variant="default">进行中</Badge>
      case 'PAUSED':
        return <Badge variant="outline">已暂停</Badge>
      case 'COMPLETED':
        return <Badge variant="default">已完成</Badge>
      case 'CANCELLED':
        return <Badge variant="destructive">已取消</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

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

  if (!report) {
    return (
      <div className="bg-yellow-50 p-4 rounded-md text-yellow-700">
        <p>没有可用的测试报告</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 头部信息 */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Button variant="outline" onClick={onBack} className="flex items-center gap-1">
              <ArrowLeftIcon className="h-4 w-4" />
              返回
            </Button>
            {getStatusBadge(test.status)}
          </div>
          <h2 className="text-2xl font-bold">{test.name}</h2>
          <p className="text-gray-600 mt-1">{test.description}</p>
        </div>
      </div>

      {/* 测试概览 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChartBarIcon className="h-5 w-5" />
            测试概览
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">测试时长</p>
              <p className="font-medium">{report.summary.testDuration} 天</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">参与用户</p>
              <p className="font-medium">{report.summary.totalUsers}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">变体数量</p>
              <p className="font-medium">{test.variants.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">指标数量</p>
              <p className="font-medium">{test.metrics.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 测试结果 */}
      <Card>
        <CardHeader>
          <CardTitle>测试结果</CardTitle>
        </CardHeader>
        <CardContent>
          {report.results.length === 0 ? (
            <p className="text-gray-500">暂无测试结果</p>
          ) : (
            <div className="space-y-6">
              {test.metrics.map(metric => {
                const metricResults = report.results.filter(r => r.metricId === metric.id)
                
                if (metricResults.length === 0) return null
                
                return (
                  <div key={metric.id}>
                    <h3 className="font-semibold mb-3">{metric.name}</h3>
                    <p className="text-sm text-gray-600 mb-4">{metric.description}</p>
                    
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              变体
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              值
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              变化
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              置信度
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              样本量
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {metricResults.map(result => {
                            const variant = test.variants.find(v => v.id === result.variantId)
                            return (
                              <tr key={`${metric.id}-${result.variantId}`}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    {variant && (
                                      <>
                                        <span className="font-medium">{variant.name}</span>
                                        {variant.isControl && (
                                          <Badge variant="outline" className="ml-2">
                                            对照组
                                          </Badge>
                                        )}
                                        {report.winner?.variantId === variant.id && (
                                          <CheckCircleIcon className="h-5 w-5 text-green-500 ml-2" />
                                        )}
                                      </>
                                    )}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  {result.value.toFixed(2)} {metric.unit}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <span className={result.change > 0 ? 'text-green-600' : result.change < 0 ? 'text-red-600' : 'text-gray-600'}>
                                      {result.change > 0 ? '+' : ''}{result.change.toFixed(2)} ({result.changePercentage.toFixed(2)}%)
                                    </span>
                                    {result.significance && (
                                      <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500 ml-1" />
                                    )}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                                      <div
                                        className="bg-blue-600 h-2 rounded-full"
                                        style={{ width: `${result.confidence * 100}%` }}
                                      ></div>
                                    </div>
                                    <span>{(result.confidence * 100).toFixed(1)}%</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  {result.sampleSize}
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 关键发现 */}
      <Card>
        <CardHeader>
          <CardTitle>关键发现</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {report.summary.keyFindings.map((finding, index) => (
              <li key={index} className="flex items-start">
                <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></span>
                <span>{finding}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* 建议 */}
      <Card>
        <CardHeader>
          <CardTitle>建议</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {report.recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></span>
                <span>{recommendation}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* 胜者变体 */}
      {report.winner && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <CheckCircleIcon className="h-5 w-5" />
              推荐变体
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="font-medium">
                  {test.variants.find(v => v.id === report.winner?.variantId)?.name}
                </p>
                <p className="text-sm text-green-600">
                  置信度: {(report.winner.confidence * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}