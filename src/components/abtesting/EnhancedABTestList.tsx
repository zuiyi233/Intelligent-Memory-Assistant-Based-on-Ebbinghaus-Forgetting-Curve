'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { cn, animations, cardEffects, textEffects } from '@/lib/inspira-ui'
import { 
  PencilIcon,
  TrashIcon,
  PlayIcon,
  PauseIcon,
  ChartBarIcon,
  EyeIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  PlusIcon
} from '@heroicons/react/24/outline'
import { ABTest } from '@/types'

interface EnhancedABTestListProps {
  onSelectTest: (test: ABTest) => void
  onEditTest: (test: ABTest) => void
  onCreateTest: () => void
  refreshKey?: number
}

export const EnhancedABTestList: React.FC<EnhancedABTestListProps> = ({
  onSelectTest,
  onEditTest,
  onCreateTest,
  refreshKey = 0
}) => {
  const [tests, setTests] = useState<ABTest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'createdAt' | 'name' | 'status'>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

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
        return <Badge className="bg-gray-100 text-gray-800">草稿</Badge>
      case 'ACTIVE':
        return <Badge className="bg-green-100 text-green-800 animate-pulse-slow">进行中</Badge>
      case 'PAUSED':
        return <Badge className="bg-yellow-100 text-yellow-800">已暂停</Badge>
      case 'COMPLETED':
        return <Badge className="bg-blue-100 text-blue-800">已完成</Badge>
      case 'CANCELLED':
        return <Badge className="bg-red-100 text-red-800">已取消</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>
    }
  }

  // 过滤和排序测试
  const filteredTests = tests
    .filter(test => {
      const matchesSearch = test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          test.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'all' || test.status === statusFilter
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      let compareValue = 0
      
      switch (sortBy) {
        case 'createdAt':
          compareValue = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
        case 'name':
          compareValue = a.name.localeCompare(b.name)
          break
        case 'status':
          compareValue = a.status.localeCompare(b.status)
          break
      }
      
      return sortOrder === 'asc' ? compareValue : -compareValue
    })

  const TestCard = ({ test, index }: { test: ABTest; index: number }) => (
    <motion.div
      key={test.id}
      initial={animations.slideIn('up', 0.1 * index)}
      animate={animations.slideIn('up', 0.1 * index)}
      whileHover={{ y: -5 }}
      className="h-full"
    >
      <Card className={cn(
        "h-full transition-all duration-300",
        cardEffects.hover,
        "relative overflow-hidden group"
      )}>
        {/* 状态指示条 */}
        <div className={cn(
          "absolute top-0 left-0 w-full h-1",
          test.status === 'ACTIVE' ? 'bg-green-500' :
          test.status === 'COMPLETED' ? 'bg-blue-500' :
          test.status === 'PAUSED' ? 'bg-yellow-500' :
          test.status === 'DRAFT' ? 'bg-gray-400' :
          'bg-red-500'
        )} />
        
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold mb-1 group-hover:text-blue-600 transition-colors">
                {test.name}
              </CardTitle>
              <p className="text-sm text-gray-600 line-clamp-2">{test.description}</p>
            </div>
            <div className="flex items-center gap-2 ml-4">
              {getStatusBadge(test.status)}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* 测试统计 */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">变体数量</p>
              <motion.p 
                className="text-lg font-bold text-gray-900"
                initial={animations.scaleIn(0.2)}
                animate={animations.scaleIn(0.2)}
              >
                {test.variants.length}
              </motion.p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">指标数量</p>
              <motion.p 
                className="text-lg font-bold text-gray-900"
                initial={animations.scaleIn(0.3)}
                animate={animations.scaleIn(0.3)}
              >
                {test.metrics.length}
              </motion.p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">创建时间</p>
              <p className="text-sm font-medium text-gray-900">
                {new Date(test.createdAt).toLocaleDateString('zh-CN')}
              </p>
            </div>
          </div>
          
          {/* 操作按钮 */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSelectTest(test)}
              className={cn(
                "flex items-center gap-1",
                "relative overflow-hidden"
              )}
            >
              <ChartBarIcon className="h-4 w-4" />
              查看报告
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEditTest(test)}
              className={cn(
                "flex items-center gap-1",
                "relative overflow-hidden"
              )}
            >
              <PencilIcon className="h-4 w-4" />
              编辑
            </Button>
            
            {test.status === 'DRAFT' || test.status === 'PAUSED' ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleToggleTestStatus(test.id, test.status)}
                className={cn(
                  "flex items-center gap-1 text-green-600 hover:text-green-700",
                  "relative overflow-hidden"
                )}
              >
                <PlayIcon className="h-4 w-4" />
                启动
              </Button>
            ) : test.status === 'ACTIVE' ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleToggleTestStatus(test.id, test.status)}
                className={cn(
                  "flex items-center gap-1 text-yellow-600 hover:text-yellow-700",
                  "relative overflow-hidden"
                )}
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
                className={cn(
                  "flex items-center gap-1 text-red-600 hover:text-red-700",
                  "relative overflow-hidden"
                )}
              >
                <TrashIcon className="h-4 w-4" />
                删除
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <motion.div
          animate={animations.spin(1000)}
          className="w-12 h-12 border-t-2 border-b-2 border-blue-500 rounded-full"
        />
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-red-600 mb-4">加载失败: {error}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            重试
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* 标题和创建按钮 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">A/B测试列表</h2>
          <p className="text-gray-600">管理和监控所有A/B测试</p>
        </div>
        <Button
          onClick={onCreateTest}
          className={cn(
            "flex items-center gap-2",
            "relative overflow-hidden"
          )}
        >
          <PlusIcon className="h-5 w-5" />
          创建新测试
        </Button>
      </div>

      {/* 搜索和筛选 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* 搜索框 */}
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="搜索测试名称或描述..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* 状态筛选 */}
            <div className="flex flex-wrap gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">所有状态</option>
                <option value="DRAFT">草稿</option>
                <option value="ACTIVE">进行中</option>
                <option value="PAUSED">已暂停</option>
                <option value="COMPLETED">已完成</option>
                <option value="CANCELLED">已取消</option>
              </select>
              
              {/* 排序 */}
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-')
                  setSortBy(field as 'createdAt' | 'name' | 'status')
                  setSortOrder(order as 'asc' | 'desc')
                }}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="createdAt-desc">创建时间 (新到旧)</option>
                <option value="createdAt-asc">创建时间 (旧到新)</option>
                <option value="name-asc">名称 (A-Z)</option>
                <option value="name-desc">名称 (Z-A)</option>
                <option value="status-asc">状态 (A-Z)</option>
                <option value="status-desc">状态 (Z-A)</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 测试列表 */}
      {filteredTests.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-gray-400 mb-4">
              <FunnelIcon className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">没有找到匹配的测试</h3>
            <p className="text-gray-600 mb-4">尝试调整搜索条件或创建新的测试</p>
            <Button onClick={onCreateTest}>
              <PlusIcon className="h-4 w-4 mr-2" />
              创建新测试
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredTests.map((test, index) => (
              <TestCard key={test.id} test={test} index={index} />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* 统计信息 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap justify-between items-center text-sm text-gray-600">
            <span>共 {tests.length} 个测试</span>
            <span>显示 {filteredTests.length} 个</span>
            <span>
              进行中: {tests.filter(t => t.status === 'ACTIVE').length} | 
              已完成: {tests.filter(t => t.status === 'COMPLETED').length} | 
              已暂停: {tests.filter(t => t.status === 'PAUSED').length}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}