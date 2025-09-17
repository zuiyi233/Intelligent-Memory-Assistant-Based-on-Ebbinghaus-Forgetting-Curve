'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn, animations, cardEffects, textEffects, backgroundEffects } from '@/lib/inspira-ui'
import {
  PlusIcon,
  ChartBarIcon,
  DocumentTextIcon,
  CogIcon,
  TrendingUpIcon,
  UsersIcon,
  LightBulbIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline'

interface ABTestingDashboardProps {
  onCreateTest: () => void
  onViewTestList: () => void
  onViewAnalytics: () => void
}

export const ABTestingDashboard: React.FC<ABTestingDashboardProps> = ({
  onCreateTest,
  onViewTestList,
  onViewAnalytics
}) => {
  const [stats, setStats] = useState({
    totalTests: 0,
    activeTests: 0,
    completedTests: 0,
    totalUsers: 0
  })
  const [loading, setLoading] = useState(true)
  const [recentTests, setRecentTests] = useState<Array<{
    id: string
    name: string
    status: string
    createdAt: string
  }>>([])

  useEffect(() => {
    // 模拟获取统计数据
    const fetchStats = async () => {
      setLoading(true)
      try {
        // 这里应该调用API获取真实数据
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        setStats({
          totalTests: 24,
          activeTests: 5,
          completedTests: 12,
          totalUsers: 15420
        })
        
        setRecentTests([
          { id: '1', name: '首页布局优化', status: 'ACTIVE', createdAt: '2023-09-10' },
          { id: '2', name: '按钮颜色测试', status: 'COMPLETED', createdAt: '2023-09-05' },
          { id: '3', name: '用户引导流程', status: 'PAUSED', createdAt: '2023-09-01' }
        ])
      } catch (error) {
        console.error('获取统计数据失败:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-green-100 text-green-800">进行中</Badge>
      case 'COMPLETED':
        return <Badge className="bg-blue-100 text-blue-800">已完成</Badge>
      case 'PAUSED':
        return <Badge className="bg-yellow-100 text-yellow-800">已暂停</Badge>
      case 'DRAFT':
        return <Badge className="bg-gray-100 text-gray-800">草稿</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>
    }
  }

  const StatCard = ({ title, value, icon: Icon, description, trend }: {
    title: string
    value: string | number
    icon: React.ElementType
    description: string
    trend?: 'up' | 'down' | 'stable'
  }) => (
    <motion.div
      initial={animations.slideIn('up', 0.1)}
      animate={animations.slideIn('up', 0.1)}
      className="group"
    >
      <Card className={cn(
        "h-full transition-all duration-300",
        cardEffects.hover,
        "relative overflow-hidden"
      )}>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <CardHeader className="pb-2 relative z-10">
          <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
            <Icon className="h-4 w-4 text-blue-600" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="flex items-baseline gap-2">
            <motion.div 
              className="text-2xl font-bold text-gray-900"
              initial={animations.scaleIn(0.3)}
              animate={animations.scaleIn(0.3)}
            >
              {value}
            </motion.div>
            {trend && (
              <div className={cn(
                "text-xs px-2 py-1 rounded-full",
                trend === 'up' ? 'bg-green-100 text-green-800' : 
                trend === 'down' ? 'bg-red-100 text-red-800' : 
                'bg-gray-100 text-gray-800'
              )}>
                {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'} 
                {trend === 'up' ? '12%' : trend === 'down' ? '5%' : '0%'}
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  )

  const QuickActionCard = ({ title, description, icon: Icon, onClick, color = 'blue' }: {
    title: string
    description: string
    icon: React.ElementType
    onClick: () => void
    color?: 'blue' | 'green' | 'purple' | 'orange'
  }) => {
    const colorClasses = {
      blue: 'from-blue-500 to-blue-600',
      green: 'from-green-500 to-green-600',
      purple: 'from-purple-500 to-purple-600',
      orange: 'from-orange-500 to-orange-600'
    }

    return (
      <motion.div
        initial={animations.slideIn('up', 0.2)}
        animate={animations.slideIn('up', 0.2)}
        whileHover={{ y: -5 }}
        className="h-full"
      >
        <Card 
          className={cn(
            "h-full cursor-pointer transition-all duration-300",
            cardEffects.hover,
            "bg-gradient-to-br " + colorClasses[color],
            "text-white border-0"
          )}
          onClick={onClick}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/20">
                <Icon className="h-6 w-6" />
              </div>
              <span className="text-lg font-semibold">{title}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm opacity-90">{description}</p>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          animate={animations.spin(1000)}
          className="w-12 h-12 border-t-2 border-b-2 border-blue-500 rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 md:p-8">
      {/* 背景装饰 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* 页面标题 */}
        <motion.div
          initial={animations.slideIn('down', 0.3)}
          animate={animations.slideIn('down', 0.3)}
          className="text-center mb-8 md:mb-12"
        >
          <h1 className={cn(
            "text-4xl md:text-5xl font-bold mb-4",
            textEffects.gradient(["#3b82f6", "#8b5cf6", "#ec4899"])
          )}>
            A/B测试管理
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            通过数据驱动的A/B测试，优化产品体验，提升用户参与度和转化率
          </p>
        </motion.div>

        {/* 统计卡片 */}
        <motion.div
          initial={animations.slideIn('up', 0.4)}
          animate={animations.slideIn('up', 0.4)}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8"
        >
          <StatCard
            title="总测试数"
            value={stats.totalTests}
            icon={DocumentTextIcon}
            description="已创建的A/B测试总数"
            trend="up"
          />
          <StatCard
            title="进行中测试"
            value={stats.activeTests}
            icon={RocketLaunchIcon}
            description="当前正在运行的测试"
            trend="up"
          />
          <StatCard
            title="已完成测试"
            value={stats.completedTests}
            icon={ChartBarIcon}
            description="已完成的测试数量"
            trend="stable"
          />
          <StatCard
            title="参与用户"
            value={stats.totalUsers.toLocaleString()}
            icon={UsersIcon}
            description="参与测试的用户总数"
            trend="up"
          />
        </motion.div>

        {/* 快速操作 */}
        <motion.div
          initial={animations.slideIn('up', 0.5)}
          animate={animations.slideIn('up', 0.5)}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <LightBulbIcon className="h-6 w-6 text-yellow-500" />
            快速开始
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <QuickActionCard
              title="创建新测试"
              description="从零开始创建新的A/B测试"
              icon={PlusIcon}
              onClick={onCreateTest}
              color="blue"
            />
            <QuickActionCard
              title="查看测试列表"
              description="浏览和管理所有A/B测试"
              icon={DocumentTextIcon}
              onClick={onViewTestList}
              color="green"
            />
            <QuickActionCard
              title="数据分析"
              description="查看测试结果和统计分析"
              icon={TrendingUpIcon}
              onClick={onViewAnalytics}
              color="purple"
            />
          </div>
        </motion.div>

        {/* 最近测试和标签页 */}
        <motion.div
          initial={animations.slideIn('up', 0.6)}
          animate={animations.slideIn('up', 0.6)}
        >
          <Tabs defaultValue="recent">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="recent" className="flex items-center gap-2">
                <DocumentTextIcon className="h-4 w-4" />
                <span>最近测试</span>
              </TabsTrigger>
              <TabsTrigger value="insights" className="flex items-center gap-2">
                <LightBulbIcon className="h-4 w-4" />
                <span>数据洞察</span>
              </TabsTrigger>
              <TabsTrigger value="templates" className="flex items-center gap-2">
                <CogIcon className="h-4 w-4" />
                <span>测试模板</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="recent" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DocumentTextIcon className="h-5 w-5" />
                    最近的测试
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {recentTests.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">暂无最近的测试</p>
                  ) : (
                    <div className="space-y-4">
                      {recentTests.map((test, index) => (
                        <motion.div
                          key={test.id}
                          initial={animations.slideIn('right', 0.1 * index)}
                          animate={animations.slideIn('right', 0.1 * index)}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div>
                            <h3 className="font-medium text-gray-900">{test.name}</h3>
                            <p className="text-sm text-gray-500">创建于 {test.createdAt}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(test.status)}
                            <Button variant="outline" size="sm">
                              查看详情
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="insights" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUpIcon className="h-5 w-5 text-green-500" />
                      关键发现
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                        <span>首页布局优化测试提升了12%的点击率</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                        <span>蓝色按钮比绿色按钮转化率高8%</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                        <span>简化注册流程减少了30%的跳出率</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <LightBulbIcon className="h-5 w-5 text-yellow-500" />
                      优化建议
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2" />
                        <span>建议测试产品页面的图片展示方式</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2" />
                        <span>考虑优化移动端的结账流程</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2" />
                        <span>测试不同价格策略对转化率的影响</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="templates" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CogIcon className="h-5 w-5" />
                    测试模板
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { name: 'UI优化测试', description: '测试不同UI设计对用户行为的影响' },
                      { name: '转化率测试', description: '优化流程以提高转化率' },
                      { name: '内容测试', description: '测试不同内容策略的效果' }
                    ].map((template, index) => (
                      <motion.div
                        key={index}
                        initial={animations.scaleIn(0.2 * index)}
                        animate={animations.scaleIn(0.2 * index)}
                        className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <h3 className="font-medium text-gray-900 mb-2">{template.name}</h3>
                        <p className="text-sm text-gray-500">{template.description}</p>
                        <Button variant="outline" size="sm" className="mt-3">
                          使用模板
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}