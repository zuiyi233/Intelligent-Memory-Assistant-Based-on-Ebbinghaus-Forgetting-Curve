'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ABTest } from '@/types'
import {
  PencilIcon,
  TrashIcon,
  PlayIcon,
  PauseIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'

interface ABTestListProps {
  onSelectTest: (test: ABTest) => void
  onEditTest: (test: ABTest) => void
  refreshKey?: number
}

export const ABTestList: React.FC<ABTestListProps> = ({
  onSelectTest,
  onEditTest,
  refreshKey = 0
}) => {
  const [tests, setTests] = useState<ABTest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTests = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/gamification/abtesting')
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        setTests(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : '获取A/B测试列表失败')
      } finally {
        setLoading(false)
      }
    }

    fetchTests()
  }, [refreshKey])

  const handleDeleteTest = async (testId: string) => {
    if (!confirm('确定要删除这个A/B测试吗？此操作不可撤销。')) {
      return
    }

    try {
      const response = await fetch(`/api/gamification/abtesting/${testId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      setTests(prev => prev.filter(test => test.id !== testId))
    } catch (err) {
      console.error('删除A/B测试失败:', err)
      alert('删除A/B测试失败')
    }
  }

  const handleToggleTestStatus = async (testId: string, currentStatus: string) => {
    try {
      let action = ''
      switch (currentStatus) {
        case 'DRAFT':
        case 'PAUSED':
          action = 'start'
          break
        case 'ACTIVE':
          action = 'pause'
          break
        case 'COMPLETED':
          alert('已完成的测试无法更改状态')
          return
        default:
          return
      }

      const response = await fetch(`/api/gamification/abtesting/${testId}/${action}`, {
        method: 'POST'
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const updatedTest = await response.json()
      setTests(prev => prev.map(test => 
        test.id === testId ? updatedTest : test
      ))
    } catch (err) {
      console.error('更改测试状态失败:', err)
      alert('更改测试状态失败')
    }
  }

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

  if (tests.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-500 mb-4">暂无A/B测试</p>
          <Button onClick={() => window.location.reload()}>
            刷新页面
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {tests.map((test) => (
        <Card key={test.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg font-semibold">{test.name}</CardTitle>
                <p className="text-sm text-gray-600 mt-1">{test.description}</p>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(test.status)}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-500">变体数量</p>
                <p className="font-medium">{test.variants.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">指标数量</p>
                <p className="font-medium">{test.metrics.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">创建时间</p>
                <p className="font-medium">
                  {new Date(test.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSelectTest(test)}
                className="flex items-center gap-1"
              >
                <ChartBarIcon className="h-4 w-4" />
                查看报告
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEditTest(test)}
                className="flex items-center gap-1"
              >
                <PencilIcon className="h-4 w-4" />
                编辑
              </Button>
              
              {test.status === 'DRAFT' || test.status === 'PAUSED' ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleTestStatus(test.id, test.status)}
                  className="flex items-center gap-1"
                >
                  <PlayIcon className="h-4 w-4" />
                  启动
                </Button>
              ) : test.status === 'ACTIVE' ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleTestStatus(test.id, test.status)}
                  className="flex items-center gap-1"
                >
                  <PauseIcon className="h-4 w-4" />
                  暂停
                </Button>
              ) : null}
              
              {(test.status === 'DRAFT' || test.status === 'PAUSED' || test.status === 'CANCELLED') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteTest(test.id)}
                  className="flex items-center gap-1 text-red-600 hover:text-red-700"
                >
                  <TrashIcon className="h-4 w-4" />
                  删除
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}