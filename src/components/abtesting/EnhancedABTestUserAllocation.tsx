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
  UserGroupIcon,
  UsersIcon,
  ChartBarIcon,
  ArrowsRightLeftIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  FunnelIcon,
  DocumentArrowDownIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline'
import { ABTest, ABTestUserAssignment, ABTestVariant } from '@/types'

interface EnhancedABTestUserAllocationProps {
  test: ABTest
  onBack: () => void
}

// 模拟用户分配数据
const mockUserAssignments: ABTestUserAssignment[] = [
  { id: '1', testId: 'test1', userId: 'user1', variantId: 'variant1', assignedAt: new Date('2023-10-01') },
  { id: '2', testId: 'test1', userId: 'user2', variantId: 'variant2', assignedAt: new Date('2023-10-01') },
  { id: '3', testId: 'test1', userId: 'user3', variantId: 'variant1', assignedAt: new Date('2023-10-02') },
  { id: '4', testId: 'test1', userId: 'user4', variantId: 'variant2', assignedAt: new Date('2023-10-02') },
  { id: '5', testId: 'test1', userId: 'user5', variantId: 'variant1', assignedAt: new Date('2023-10-03') },
  { id: '6', testId: 'test1', userId: 'user6', variantId: 'variant2', assignedAt: new Date('2023-10-03') },
  { id: '7', testId: 'test1', userId: 'user7', variantId: 'variant1', assignedAt: new Date('2023-10-04') },
  { id: '8', testId: 'test1', userId: 'user8', variantId: 'variant2', assignedAt: new Date('2023-10-04') },
  { id: '9', testId: 'test1', userId: 'user9', variantId: 'variant1', assignedAt: new Date('2023-10-05') },
  { id: '10', testId: 'test1', userId: 'user10', variantId: 'variant2', assignedAt: new Date('2023-10-05') }
]

// 模拟用户数据
const mockUsers = [
  { id: 'user1', name: '张三', email: 'zhangsan@example.com', avatar: '', isPremium: true, joinDate: new Date('2023-01-15') },
  { id: 'user2', name: '李四', email: 'lisi@example.com', avatar: '', isPremium: false, joinDate: new Date('2023-02-20') },
  { id: 'user3', name: '王五', email: 'wangwu@example.com', avatar: '', isPremium: true, joinDate: new Date('2023-03-10') },
  { id: 'user4', name: '赵六', email: 'zhaoliu@example.com', avatar: '', isPremium: false, joinDate: new Date('2023-04-05') },
  { id: 'user5', name: '钱七', email: 'qianqi@example.com', avatar: '', isPremium: true, joinDate: new Date('2023-05-12') },
  { id: 'user6', name: '孙八', email: 'sunba@example.com', avatar: '', isPremium: false, joinDate: new Date('2023-06-18') },
  { id: 'user7', name: '周九', email: 'zhoujiu@example.com', avatar: '', isPremium: true, joinDate: new Date('2023-07-22') },
  { id: 'user8', name: '吴十', email: 'wushi@example.com', avatar: '', isPremium: false, joinDate: new Date('2023-08-30') },
  { id: 'user9', name: '郑十一', email: 'zhengshiyi@example.com', avatar: '', isPremium: true, joinDate: new Date('2023-09-05') },
  { id: 'user10', name: '王十二', email: 'wangshier@example.com', avatar: '', isPremium: false, joinDate: new Date('2023-09-15') }
]

// 模拟分配统计数据
const mockAllocationStats = {
  totalUsers: 10000,
  assignedUsers: 5000,
  unassignedUsers: 5000,
  variantDistribution: [
    { variantId: 'variant1', variantName: '变体A', count: 2500, percentage: 50 },
    { variantId: 'variant2', variantName: '变体B', count: 2500, percentage: 50 }
  ],
  dailyAssignments: [
    { date: '2023-10-01', count: 200 },
    { date: '2023-10-02', count: 350 },
    { date: '2023-10-03', count: 500 },
    { date: '2023-10-04', count: 700 },
    { date: '2023-10-05', count: 900 },
    { date: '2023-10-06', count: 1200 },
    { date: '2023-10-07', count: 1500 },
    { date: '2023-10-08', count: 1800 },
    { date: '2023-10-09', count: 2100 },
    { date: '2023-10-10', count: 2500 }
  ]
}

export const EnhancedABTestUserAllocation: React.FC<EnhancedABTestUserAllocationProps> = ({
  test,
  onBack
}) => {
  const [loading, setLoading] = useState(true)
  const [userAssignments, setUserAssignments] = useState<ABTestUserAssignment[]>([])
  const [allocationStats, setAllocationStats] = useState(mockAllocationStats)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedVariant, setSelectedVariant] = useState<string>('all')
  const [sortField, setSortField] = useState<'assignedAt' | 'userId'>('assignedAt')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    // 模拟API请求获取用户分配数据
    const fetchUserAssignments = async () => {
      setLoading(true)
      try {
        // 在实际应用中，这里会调用API获取真实数据
        // const response = await fetch(`/api/gamification/abtesting/${test.id}/user-assignments`)
        // const data = await response.json()
        
        // 使用模拟数据
        setTimeout(() => {
          setUserAssignments(mockUserAssignments)
          setAllocationStats(mockAllocationStats)
          setLoading(false)
        }, 1000)
      } catch (error) {
        console.error('获取A/B测试用户分配数据失败:', error)
        setLoading(false)
      }
    }

    fetchUserAssignments()
  }, [test.id])

  // 过滤和排序用户分配
  const filteredAssignments = userAssignments
    .filter(assignment => {
      const user = mockUsers.find(u => u.id === assignment.userId)
      if (!user) return false
      
      // 搜索过滤
      if (searchTerm && !user.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !user.email.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }
      
      // 变体过滤
      if (selectedVariant !== 'all' && assignment.variantId !== selectedVariant) {
        return false
      }
      
      return true
    })
    .sort((a, b) => {
      let valueA, valueB
      
      if (sortField === 'assignedAt') {
        valueA = new Date(a.assignedAt).getTime()
        valueB = new Date(b.assignedAt).getTime()
      } else {
        valueA = a.userId
        valueB = b.userId
      }
      
      if (sortDirection === 'asc') {
        return valueA > valueB ? 1 : -1
      } else {
        return valueA < valueB ? 1 : -1
      }
    })

  // 手动分配用户到变体
  const assignUserToVariant = (userId: string, variantId: string) => {
    // 在实际应用中，这里会调用API
    const newAssignment: ABTestUserAssignment = {
      id: `assign-${Date.now()}`,
      testId: test.id,
      userId,
      variantId,
      assignedAt: new Date()
    }
    
    setUserAssignments([...userAssignments, newAssignment])
    
    // 更新统计
    setAllocationStats({
      ...allocationStats,
      assignedUsers: allocationStats.assignedUsers + 1,
      unassignedUsers: allocationStats.unassignedUsers - 1,
      variantDistribution: allocationStats.variantDistribution.map(v => 
        v.variantId === variantId 
          ? { ...v, count: v.count + 1 } 
          : v
      )
    })
  }

  // 移除用户的分配
  const removeUserAssignment = (assignmentId: string, variantId: string) => {
    const assignment = userAssignments.find(a => a.id === assignmentId)
    if (!assignment) return
    
    setUserAssignments(userAssignments.filter(a => a.id !== assignmentId))
    
    // 更新统计
    setAllocationStats({
      ...allocationStats,
      assignedUsers: allocationStats.assignedUsers - 1,
      unassignedUsers: allocationStats.unassignedUsers + 1,
      variantDistribution: allocationStats.variantDistribution.map(v => 
        v.variantId === variantId 
          ? { ...v, count: v.count - 1 } 
          : v
      )
    })
  }

  // 批量分配用户
  const batchAssignUsers = (userIds: string[], variantId: string) => {
    const newAssignments = userIds.map(userId => ({
      id: `assign-${Date.now()}-${userId}`,
      testId: test.id,
      userId,
      variantId,
      assignedAt: new Date()
    }))
    
    setUserAssignments([...userAssignments, ...newAssignments])
    
    // 更新统计
    setAllocationStats({
      ...allocationStats,
      assignedUsers: allocationStats.assignedUsers + userIds.length,
      unassignedUsers: allocationStats.unassignedUsers - userIds.length,
      variantDistribution: allocationStats.variantDistribution.map(v => 
        v.variantId === variantId 
          ? { ...v, count: v.count + userIds.length } 
          : v
      )
    })
  }

  const StatCard = ({ 
    title, 
    value, 
    description, 
    icon: Icon 
  }: {
    title: string
    value: string | number
    description?: string
    icon: React.ElementType
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
        </CardContent>
      </Card>
    </motion.div>
  )

  const VariantDistributionChart = ({ data }: { data: { variantName: string; count: number; percentage: number }[] }) => (
    <div className="h-64 w-full">
      <div className="relative h-full">
        <div className="flex items-end justify-center h-full gap-4 px-4">
          {data.map((item, index) => (
            <div key={index} className="flex flex-col items-center flex-1">
              <div 
                className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-md flex items-end justify-center text-white font-medium pb-2"
                style={{ height: `${item.percentage}%` }}
              >
                {item.percentage}%
              </div>
              <div className="text-sm font-medium text-gray-700 mt-2 text-center">{item.variantName}</div>
              <div className="text-xs text-gray-500 mt-1">{item.count} 用户</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const DailyAssignmentChart = ({ data }: { data: { date: string; count: number }[] }) => {
    const maxCount = Math.max(...data.map(d => d.count))
    
    return (
      <div className="h-64 w-full">
        <div className="relative h-full">
          {/* Y轴标签 */}
          <div className="absolute left-0 top-0 bottom-0 w-8 flex flex-col justify-between text-xs text-gray-500">
            <span>{maxCount}</span>
            <span>{Math.floor(maxCount * 0.75)}</span>
            <span>{Math.floor(maxCount * 0.5)}</span>
            <span>{Math.floor(maxCount * 0.25)}</span>
            <span>0</span>
          </div>
          
          {/* 图表区域 */}
          <div className="ml-10 h-full border-l border-b border-gray-200">
            {/* 网格线 */}
            <div className="absolute top-0 left-10 right-0 bottom-8 flex flex-col justify-between">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="border-t border-gray-100 w-full"></div>
              ))}
            </div>
            
            {/* 柱状图 */}
            <div className="absolute top-0 left-10 right-0 bottom-8 flex items-end justify-around px-4">
              {data.map((item, i) => (
                <div key={i} className="flex flex-col items-center flex-1">
                  <div 
                    className="w-6 bg-gradient-to-t from-purple-500 to-purple-400 rounded-t-md"
                    style={{ height: `${(item.count / maxCount) * 80}%` }}
                  ></div>
                  <span className="text-xs text-gray-500 mt-1 rotate-45 origin-left transform">
                    {item.date.substring(5)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">正在加载用户分配数据...</p>
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{test.name} - 用户分配</h1>
              <p className="text-gray-600">管理和监控A/B测试的用户分配情况</p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline">
                <ArrowPathIcon className="h-4 w-4 mr-2" />
                刷新数据
              </Button>
              <Button className="flex items-center gap-2">
                <DocumentArrowDownIcon className="h-4 w-4" />
                导出数据
              </Button>
            </div>
          </div>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <ChartBarIcon className="h-4 w-4" />
              <span>分配概览</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <UsersIcon className="h-4 w-4" />
              <span>用户管理</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <AdjustmentsHorizontalIcon className="h-4 w-4" />
              <span>分配设置</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* 统计卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatCard
                title="总用户数"
                value={allocationStats.totalUsers.toLocaleString()}
                description="系统中的总用户数"
                icon={UserGroupIcon}
              />
              <StatCard
                title="已分配用户"
                value={allocationStats.assignedUsers.toLocaleString()}
                description={`${((allocationStats.assignedUsers / allocationStats.totalUsers) * 100).toFixed(1)}% 分配率`}
                icon={UsersIcon}
              />
              <StatCard
                title="未分配用户"
                value={allocationStats.unassignedUsers.toLocaleString()}
                description="可分配的用户数"
                icon={UserGroupIcon}
              />
              <StatCard
                title="分配变体数"
                value={test.variants.length}
                description="当前测试的变体数量"
                icon={ArrowsRightLeftIcon}
              />
            </div>

            {/* 变体分布图表 */}
            <Card className="transition-all duration-300 hover:translate-y-[-5px] hover:shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FunnelIcon className="h-5 w-5" />
                  变体分布
                </CardTitle>
              </CardHeader>
              <CardContent>
                <VariantDistributionChart data={allocationStats.variantDistribution} />
              </CardContent>
            </Card>

            {/* 每日分配图表 */}
            <Card className="transition-all duration-300 hover:translate-y-[-5px] hover:shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChartBarIcon className="h-5 w-5" />
                  每日分配趋势
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DailyAssignmentChart data={allocationStats.dailyAssignments} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            {/* 搜索和筛选 */}
            <Card className="transition-all duration-300 hover:translate-y-[-5px] hover:shadow-xl">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="搜索用户名或邮箱..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="w-full md:w-48">
                    <select
                      value={selectedVariant}
                      onChange={(e) => setSelectedVariant(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">所有变体</option>
                      {test.variants.map(variant => (
                        <option key={variant.id} value={variant.id}>
                          {variant.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="w-full md:w-48">
                    <select
                      value={`${sortField}-${sortDirection}`}
                      onChange={(e) => {
                        const [field, direction] = e.target.value.split('-')
                        setSortField(field as 'assignedAt' | 'userId')
                        setSortDirection(direction as 'asc' | 'desc')
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="assignedAt-desc">分配时间 (最新)</option>
                      <option value="assignedAt-asc">分配时间 (最早)</option>
                      <option value="userId-asc">用户ID (升序)</option>
                      <option value="userId-desc">用户ID (降序)</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 用户列表 */}
            <Card className="transition-all duration-300 hover:translate-y-[-5px] hover:shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UsersIcon className="h-5 w-5" />
                    用户分配列表
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">
                    {filteredAssignments.length} 个用户
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredAssignments.map(assignment => {
                    const user = mockUsers.find(u => u.id === assignment.userId)
                    const variant = test.variants.find(v => v.id === assignment.variantId)
                    
                    if (!user || !variant) return null
                    
                    return (
                      <motion.div
                        key={assignment.id}
                        initial={animations.slideIn('up', 0.05)}
                        animate={animations.slideIn('up', 0.05)}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <Badge className={variant.isControl ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"}>
                            {variant.name}
                          </Badge>
                          <div className="text-sm text-gray-500">
                            {new Date(assignment.assignedAt).toLocaleDateString()}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeUserAssignment(assignment.id, variant.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            移除
                          </Button>
                        </div>
                      </motion.div>
                    )
                  })}
                  
                  {filteredAssignments.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      没有找到匹配的用户分配记录
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            {/* 分配设置 */}
            <Card className="transition-all duration-300 hover:translate-y-[-5px] hover:shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AdjustmentsHorizontalIcon className="h-5 w-5" />
                  分配设置
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">自动分配设置</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">启用自动分配</div>
                        <div className="text-sm text-gray-500">新用户将自动分配到测试变体</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">分配策略</div>
                        <div className="text-sm text-gray-500">选择用户分配到变体的策略</div>
                      </div>
                      <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="random">随机分配</option>
                        <option value="hash">哈希分配</option>
                        <option value="round-robin">轮询分配</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">批量分配</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="font-medium text-gray-900 mb-2">选择用户范围</div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option value="all">所有用户</option>
                          <option value="new">新用户</option>
                          <option value="active">活跃用户</option>
                          <option value="premium">付费用户</option>
                        </select>
                        
                        <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option value="100">100 用户</option>
                          <option value="500">500 用户</option>
                          <option value="1000">1000 用户</option>
                          <option value="custom">自定义数量</option>
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <div className="font-medium text-gray-900 mb-2">分配到变体</div>
                      <div className="flex flex-wrap gap-2">
                        {test.variants.map(variant => (
                          <Badge 
                            key={variant.id} 
                            className={cn(
                              "cursor-pointer",
                              variant.isControl ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"
                            )}
                          >
                            {variant.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button onClick={() => batchAssignUsers(
                        mockUsers.slice(0, 100).map(u => u.id), 
                        test.variants[0].id
                      )}>
                        批量分配
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}