'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ABTestList } from '@/components/abtesting/ABTestList'
import { ABTestForm } from '@/components/abtesting/ABTestForm'
import { ABTestReport } from '@/components/abtesting/ABTestReport'
import { ABTestStats } from '@/components/abtesting/ABTestStats'
import ABTestAdvancedStats from '@/components/abtesting/ABTestAdvancedStats'
import { Navigation } from '@/components/layout/Navigation'
import { ABTest } from '@/types'
import {
  PlusIcon,
  ChartBarIcon,
  DocumentTextIcon,
  CogIcon,
  TrendingUpIcon,
  HomeIcon,
  AdjustmentsHorizontalIcon,
  UserGroupIcon,
  EyeIcon,
  ChartPieIcon
} from '@heroicons/react/24/outline'

// 导入增强的Inspira UI组件
import { ABTestingDashboard } from '@/components/abtesting/ABTestingDashboard'
import { EnhancedABTestList } from '@/components/abtesting/EnhancedABTestList'
import { EnhancedABTestForm } from '@/components/abtesting/EnhancedABTestForm'
import { EnhancedABTestReport } from '@/components/abtesting/EnhancedABTestReport'
import { EnhancedABTestAnalytics } from '@/components/abtesting/EnhancedABTestAnalytics'
import { EnhancedABTestConfig } from '@/components/abtesting/EnhancedABTestConfig'
import { EnhancedABTestUserAllocation } from '@/components/abtesting/EnhancedABTestUserAllocation'
import { EnhancedABTestResults } from '@/components/abtesting/EnhancedABTestResults'

export default function ABTestingPage() {
  const [selectedTest, setSelectedTest] = useState<ABTest | null>(null)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [refreshKey, setRefreshKey] = useState(0)

  const handleTestSelect = (test: ABTest) => {
    setSelectedTest(test)
    setActiveTab('list')
  }

  const handleTestCreated = () => {
    setRefreshKey(prev => prev + 1)
    setActiveTab('list')
  }

  const handleTestUpdated = () => {
    setRefreshKey(prev => prev + 1)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navigation />
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* 页面标题 */}
        <div className="mb-6 md:mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 md:mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              A/B测试管理
            </span>
          </h1>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto px-4">
            创建、管理和分析A/B测试，优化游戏化功能的效果
          </p>
        </div>

        {/* 主要内容区域 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-8 mb-6 md:mb-8">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <HomeIcon className="h-5 w-5" />
              <span className="hidden sm:inline">仪表板</span>
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center gap-2">
              <DocumentTextIcon className="h-5 w-5" />
              <span className="hidden sm:inline">测试列表</span>
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center gap-2">
              <PlusIcon className="h-5 w-5" />
              <span className="hidden sm:inline">创建测试</span>
            </TabsTrigger>
            <TabsTrigger value="config" disabled={!selectedTest} className="flex items-center gap-2">
              <AdjustmentsHorizontalIcon className="h-5 w-5" />
              <span className="hidden sm:inline">测试配置</span>
            </TabsTrigger>
            <TabsTrigger value="allocation" disabled={!selectedTest} className="flex items-center gap-2">
              <UserGroupIcon className="h-5 w-5" />
              <span className="hidden sm:inline">用户分配</span>
            </TabsTrigger>
            <TabsTrigger value="results" disabled={!selectedTest} className="flex items-center gap-2">
              <EyeIcon className="h-5 w-5" />
              <span className="hidden sm:inline">结果可视化</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" disabled={!selectedTest} className="flex items-center gap-2">
              <ChartPieIcon className="h-5 w-5" />
              <span className="hidden sm:inline">统计分析</span>
            </TabsTrigger>
            <TabsTrigger value="report" disabled={!selectedTest} className="flex items-center gap-2">
              <ChartBarIcon className="h-5 w-5" />
              <span className="hidden sm:inline">测试报告</span>
            </TabsTrigger>
          </TabsList>

          {/* 仪表板 */}
          <TabsContent value="dashboard" className="space-y-6">
            <ABTestingDashboard
              onCreateTest={() => setActiveTab('create')}
              onViewTestList={() => setActiveTab('list')}
              onViewAnalytics={() => {
                if (selectedTest) {
                  setActiveTab('analytics')
                }
              }}
            />
          </TabsContent>

          {/* 测试列表 */}
          <TabsContent value="list" className="space-y-6">
            <EnhancedABTestList
              key={refreshKey}
              onSelectTest={handleTestSelect}
              onEditTest={(test) => {
                setSelectedTest(test)
                setActiveTab('create')
              }}
              onCreateTest={() => setActiveTab('create')}
            />
          </TabsContent>

          {/* 创建测试 */}
          <TabsContent value="create" className="space-y-6">
            <EnhancedABTestForm
              test={selectedTest}
              onTestCreated={handleTestCreated}
              onTestUpdated={handleTestUpdated}
              onCancel={() => {
                setSelectedTest(null)
                setActiveTab('dashboard')
              }}
            />
          </TabsContent>

          {/* 测试配置 */}
          <TabsContent value="config" className="space-y-6">
            {selectedTest && (
              <EnhancedABTestConfig
                test={selectedTest}
                onSave={(updatedTest) => {
                  setSelectedTest({ ...selectedTest, ...updatedTest })
                  setRefreshKey(prev => prev + 1)
                }}
                onBack={() => setActiveTab('list')}
              />
            )}
          </TabsContent>

          {/* 用户分配 */}
          <TabsContent value="allocation" className="space-y-6">
            {selectedTest && (
              <EnhancedABTestUserAllocation
                test={selectedTest}
                onBack={() => setActiveTab('list')}
              />
            )}
          </TabsContent>

          {/* 结果可视化 */}
          <TabsContent value="results" className="space-y-6">
            {selectedTest && (
              <EnhancedABTestResults
                test={selectedTest}
                onBack={() => setActiveTab('list')}
              />
            )}
          </TabsContent>

          {/* 统计分析 */}
          <TabsContent value="analytics" className="space-y-6">
            {selectedTest && (
              <EnhancedABTestAnalytics
                test={selectedTest}
                onBack={() => setActiveTab('list')}
              />
            )}
          </TabsContent>

          {/* 测试报告 */}
          <TabsContent value="report" className="space-y-6">
            {selectedTest && (
              <EnhancedABTestReport
                test={selectedTest}
                onBack={() => setActiveTab('list')}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}