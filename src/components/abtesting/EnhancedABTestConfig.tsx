'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn, animations, cardEffects } from '@/lib/inspira-ui'
import { 
  PlusIcon,
  TrashIcon,
  ArrowLeftIcon,
  DocumentArrowDownIcon,
  CogIcon,
  UserGroupIcon,
  ChartBarIcon,
  InformationCircleIcon,
  LightBulbIcon,
  SparklesIcon,
  ArrowsRightLeftIcon,
  CalendarIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { ABTest, ABTestVariant, ABTestMetric, ExtendedTargetAudience } from '@/types'

interface EnhancedABTestConfigProps {
  test?: ABTest
  onSave: (test: Partial<ABTest>) => void
  onBack: () => void
}

// 模拟指标选项
const metricOptions = [
  { id: 'CONVERSION', name: '转化率', description: '用户完成目标行动的比例' },
  { id: 'ENGAGEMENT', name: '参与度', description: '用户与产品互动的程度' },
  { id: 'RETENTION', name: '留存率', description: '用户在一段时间后继续使用产品的比例' },
  { id: 'REVENUE', name: '收入', description: '每个用户带来的平均收入' },
  { id: 'SATISFACTION', name: '满意度', description: '用户对产品的满意程度' },
  { id: 'PERFORMANCE', name: '性能', description: '系统或功能的性能指标' },
  { id: 'CUSTOM', name: '自定义', description: '自定义指标' }
]

// 模拟受众群体选项
const audienceOptions = [
  { id: 'all_users', name: '所有用户', description: '包括所有注册用户' },
  { id: 'new_users', name: '新用户', description: '注册时间少于30天的用户' },
  { id: 'active_users', name: '活跃用户', description: '过去30天内活跃的用户' },
  { id: 'returning_users', name: '回访用户', description: '过去7天内回访的用户' },
  { id: 'premium_users', name: '付费用户', description: '已订阅付费计划的用户' },
  { id: 'free_users', name: '免费用户', description: '使用免费计划的用户' },
  { id: 'desktop_users', name: '桌面用户', description: '主要在桌面设备上访问的用户' },
  { id: 'mobile_users', name: '移动用户', description: '主要在移动设备上访问的用户' }
]

export const EnhancedABTestConfig: React.FC<EnhancedABTestConfigProps> = ({
  test,
  onSave,
  onBack
}) => {
  // 基本信息状态
  const [name, setName] = useState(test?.name || '')
  const [description, setDescription] = useState(test?.description || '')
  const [status, setStatus] = useState(test?.status || 'DRAFT')
  const [startDate, setStartDate] = useState(test?.startDate ? new Date(test.startDate).toISOString().split('T')[0] : '')
  const [endDate, setEndDate] = useState(test?.endDate ? new Date(test.endDate).toISOString().split('T')[0] : '')
  
  // 变体状态
  const [variants, setVariants] = useState<Omit<ABTestVariant, 'id' | 'testId' | 'createdAt'>[]>(test?.variants || [
    { name: '变体A', description: '实验版本', config: {}, trafficPercentage: 50, isControl: true },
    { name: '变体B', description: '对照版本', config: {}, trafficPercentage: 50, isControl: false }
  ])
  
  // 指标状态
  const [metrics, setMetrics] = useState<Omit<ABTestMetric, 'id' | 'testId' | 'createdAt'>[]>(test?.metrics || [
    { name: '转化率', description: '用户完成目标行动的比例', type: 'CONVERSION', formula: '', unit: '%', isActive: true }
  ])
  
  // 受众状态
  const [targetAudience, setTargetAudience] = useState<ExtendedTargetAudience>(test?.targetAudience || {
    userSegments: ['all_users'],
    percentage: 100,
    criteria: {},
    allocationStrategy: { type: 'RANDOM' }
  })
  
  // 高级设置
  const [duration, setDuration] = useState(14)
  
  // 添加新变体
  const addVariant = () => {
    const newVariant: Omit<ABTestVariant, 'id' | 'testId' | 'createdAt'> = {
      name: `变体${String.fromCharCode(65 + variants.length)}`,
      description: '',
      config: {},
      trafficPercentage: Math.floor(100 / (variants.length + 1)),
      isControl: false
    }
    
    // 重新分配流量
    const updatedVariants = [...variants, newVariant]
    const equalPercentage = Math.floor(100 / updatedVariants.length)
    const remainder = 100 % updatedVariants.length
    
    updatedVariants.forEach((variant, index) => {
      variant.trafficPercentage = equalPercentage + (index < remainder ? 1 : 0)
    })
    
    setVariants(updatedVariants)
  }
  
  // 删除变体
  const removeVariant = (index: number) => {
    if (variants.length <= 2) return // 至少需要保留两个变体
    
    const updatedVariants = variants.filter((_, i) => i !== index)
    
    // 重新分配流量
    const equalPercentage = Math.floor(100 / updatedVariants.length)
    const remainder = 100 % updatedVariants.length
    
    updatedVariants.forEach((variant, i) => {
      variant.trafficPercentage = equalPercentage + (i < remainder ? 1 : 0)
    })
    
    setVariants(updatedVariants)
  }
  
  // 更新变体
  const updateVariant = (index: number, field: keyof Omit<ABTestVariant, 'id' | 'testId' | 'createdAt'>, value: string | number | boolean | Record<string, unknown>) => {
    const updatedVariants = [...variants]
    updatedVariants[index] = { ...updatedVariants[index], [field]: value }
    setVariants(updatedVariants)
  }
  
  // 设置控制变体
  const setControlVariant = (index: number) => {
    setVariants(variants.map((v, i) => ({
      ...v,
      isControl: i === index
    })))
  }
  
  // 添加新指标
  const addMetric = () => {
    const newMetric: Omit<ABTestMetric, 'id' | 'testId' | 'createdAt'> = {
      name: '',
      description: '',
      type: 'CONVERSION',
      formula: '',
      unit: '',
      isActive: true
    }
    setMetrics([...metrics, newMetric])
  }
  
  // 删除指标
  const removeMetric = (index: number) => {
    if (metrics.length <= 1) return // 至少需要保留一个指标
    setMetrics(metrics.filter((_, i) => i !== index))
  }
  
  // 更新指标
  const updateMetric = (index: number, field: keyof Omit<ABTestMetric, 'id' | 'testId' | 'createdAt'>, value: string | boolean) => {
    const updatedMetrics = [...metrics]
    updatedMetrics[index] = { ...updatedMetrics[index], [field]: value }
    setMetrics(updatedMetrics)
  }
  
  // 更新受众
  const updateAudience = (field: keyof ExtendedTargetAudience, value: string | number | string[] | { type: string }) => {
    setTargetAudience({ ...targetAudience, [field]: value })
  }
  
  // 保存配置
  const handleSave = () => {
    const testData: Partial<ABTest> = {
      name,
      description,
      status,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      targetAudience,
      variants: variants.map((v, index) => ({
        ...v,
        id: `variant${index + 1}`,
        testId: test?.id || '',
        createdAt: new Date()
      })),
      metrics: metrics.map((m, index) => ({
        ...m,
        id: `metric${index + 1}`,
        testId: test?.id || '',
        createdAt: new Date()
      }))
    }
    
    onSave(testData)
  }
  
  const VariantsSection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
          <ArrowsRightLeftIcon className="h-5 w-5" />
          测试变体
        </h3>
        <Button onClick={addVariant} className="flex items-center gap-2">
          <PlusIcon className="h-4 w-4" />
          添加变体
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {variants.map((variant, index) => (
          <motion.div
            key={index}
            initial={animations.scaleIn(0.1 * index)}
            animate={animations.scaleIn(0.1 * index)}
            className="relative"
          >
            <Card className={cn(
              "h-full border-2 transition-all duration-300 hover:translate-y-[-5px] hover:shadow-xl",
              variant.isControl ? "border-blue-200 bg-blue-50" : "border-gray-200"
            )}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {variant.isControl && (
                      <Badge className="bg-blue-100 text-blue-800">控制组</Badge>
                    )}
                    <div className="flex items-center gap-2">
                      <Input
                        value={variant.name}
                        onChange={(e) => updateVariant(index, 'name', e.target.value)}
                        className="font-medium"
                        placeholder="变体名称"
                      />
                    </div>
                  </div>
                  {variants.length > 2 && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => removeVariant(index)}
                      className="h-8 w-8 text-red-500 hover:text-red-700"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">变体描述</div>
                  <textarea
                    value={variant.description}
                    onChange={(e) => updateVariant(index, 'description', e.target.value)}
                    placeholder="描述这个变体的特点和目标"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-1">流量分配</div>
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      min="1"
                      max="100"
                      value={variant.trafficPercentage}
                      onChange={(e) => updateVariant(index, 'trafficPercentage', Number(e.target.value))}
                      className="w-20"
                    />
                    <span className="text-sm text-gray-600">%</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={variant.isControl}
                    onChange={() => setControlVariant(index)}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span className="text-sm font-medium text-gray-700">设为控制组</span>
                  <div className="text-xs text-gray-500 ml-2">
                    控制组将作为基准，与其他变体进行比较
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
      
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
        <div className="flex items-start gap-3">
          <InformationCircleIcon className="h-5 w-5 text-blue-500 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-800">变体配置建议</h4>
            <p className="text-sm text-blue-600 mt-1">
              确保每个变体都有明确的差异点，避免微小改动。控制组应该保持当前的设计或功能，
              而实验组应该包含您希望测试的更改。建议每个测试不要超过3-4个变体，以保持结果的可解释性。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
  
  const MetricsSection = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
          <ChartBarIcon className="h-5 w-5" />
          测试指标
        </h3>
        <Button onClick={addMetric} className="flex items-center gap-2">
          <PlusIcon className="h-4 w-4" />
          添加指标
        </Button>
      </div>
      
      <div className="space-y-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={index}
            initial={animations.slideIn('up', 0.1 * index)}
            animate={animations.slideIn('up', 0.1 * index)}
            className="relative"
          >
            <Card className="transition-all duration-300 hover:translate-y-[-5px] hover:shadow-xl">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <select
                        value={metric.type}
                        onChange={(e) => updateMetric(index, 'type', e.target.value as "CONVERSION" | "ENGAGEMENT" | "RETENTION" | "REVENUE" | "SATISFACTION" | "PERFORMANCE" | "CUSTOM")}
                        className="w-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {metricOptions.map(option => (
                          <option key={option.id} value={option.id}>
                            {option.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {metrics.length > 1 && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => removeMetric(index)}
                      className="h-8 w-8 text-red-500 hover:text-red-700"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                <div className="mt-4 space-y-3">
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-1">指标名称</div>
                    <Input
                      value={metric.name}
                      onChange={(e) => updateMetric(index, 'name', e.target.value)}
                      placeholder="显示名称"
                    />
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-1">指标描述</div>
                    <textarea
                      value={metric.description}
                      onChange={(e) => updateMetric(index, 'description', e.target.value)}
                      placeholder="描述这个指标的含义和计算方式"
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  {metric.type && (
                    <div className="text-sm text-gray-600">
                      {metricOptions.find(o => o.id === metric.type)?.description}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={metric.isActive}
                      onChange={(e) => updateMetric(index, 'isActive', e.target.checked)}
                      className="h-4 w-4 text-blue-600"
                    />
                    <span className="text-sm font-medium text-gray-700">启用此指标</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
      
      <div className="bg-green-50 p-4 rounded-lg border border-green-100">
        <div className="flex items-start gap-3">
          <LightBulbIcon className="h-5 w-5 text-green-500 mt-0.5" />
          <div>
            <h4 className="font-medium text-green-800">指标选择建议</h4>
            <p className="text-sm text-green-600 mt-1">
              选择与您测试目标直接相关的指标。主要指标应该是衡量测试成功与否的核心指标。
              辅助指标可以帮助您了解测试对其他方面的影响。避免选择过多指标，以免分散注意力。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
  
  const AudienceSection = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
        <UserGroupIcon className="h-5 w-5" />
        目标受众
      </h3>
      
      <Card className="transition-all duration-300 hover:translate-y-[-5px] hover:shadow-xl">
        <CardContent className="p-6 space-y-6">
          <div>
            <div className="text-sm font-medium text-gray-700 mb-1">受众类型</div>
            <select
              value={targetAudience.userSegments[0]}
              onChange={(e) => updateAudience('userSegments', [e.target.value])}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {audienceOptions.map(option => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
            
            {targetAudience.userSegments[0] && (
              <div className="text-sm text-gray-600 mt-2">
                {audienceOptions.find(o => o.id === targetAudience.userSegments[0])?.description}
              </div>
            )}
          </div>
          
          <div>
            <div className="text-sm font-medium text-gray-700 mb-1">受众规模 (%)</div>
            <div className="flex items-center gap-3 mt-1">
              <Input
                type="number"
                min="1"
                max="100"
                value={targetAudience.percentage}
                onChange={(e) => updateAudience('percentage', Number(e.target.value))}
                className="w-24"
              />
              <span className="text-sm text-gray-600">占总用户数的百分比</span>
            </div>
          </div>
          
          <div>
            <div className="text-sm font-medium text-gray-700 mb-1">分配策略</div>
            <select
              value={targetAudience.allocationStrategy?.type || 'RANDOM'}
              onChange={(e) => updateAudience('allocationStrategy', { type: e.target.value as 'RANDOM' | 'HASH_BASED' | 'FEATURE_BASED' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="RANDOM">随机分配</option>
              <option value="HASH_BASED">哈希分配</option>
              <option value="FEATURE_BASED">基于特征分配</option>
            </select>
          </div>
        </CardContent>
      </Card>
      
      <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
        <div className="flex items-start gap-3">
          <SparklesIcon className="h-5 w-5 text-purple-500 mt-0.5" />
          <div>
            <h4 className="font-medium text-purple-800">受众选择建议</h4>
            <p className="text-sm text-purple-600 mt-1">
              选择与测试目标相关的受众群体。受众规模越大，测试结果越可靠，但也会影响更多用户。
              确保所选受众具有足够的代表性，以便将测试结果推广到更广泛的用户群体。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
  
  const AdvancedSection = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
        <CogIcon className="h-5 w-5" />
        高级设置
      </h3>
      
      <Card className="transition-all duration-300 hover:translate-y-[-5px] hover:shadow-xl">
        <CardContent className="p-6 space-y-6">
          <div>
            <div className="text-sm font-medium text-gray-700 mb-1">测试持续时间 (天)</div>
            <div className="flex items-center gap-3 mt-1">
              <Input
                type="number"
                min="1"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-24"
              />
              <span className="text-sm text-gray-600">
                建议至少运行7-14天以捕捉用户行为的周期性变化
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-gray-700 mb-1">开始日期</div>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            
            <div>
              <div className="text-sm font-medium text-gray-700 mb-1">结束日期</div>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <div className="text-sm font-medium text-gray-700 mb-1">测试状态</div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as "DRAFT" | "ACTIVE" | "PAUSED" | "COMPLETED" | "CANCELLED")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="DRAFT">草稿</option>
              <option value="ACTIVE">进行中</option>
              <option value="PAUSED">已暂停</option>
              <option value="COMPLETED">已完成</option>
              <option value="CANCELLED">已取消</option>
            </select>
          </div>
        </CardContent>
      </Card>
      
      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
        <div className="flex items-start gap-3">
          <ClockIcon className="h-5 w-5 text-yellow-500 mt-0.5" />
          <div>
            <h4 className="font-medium text-yellow-800">测试时长建议</h4>
            <p className="text-sm text-yellow-600 mt-1">
              A/B测试应该运行足够长的时间以获得统计显著的结果，通常至少需要1-2周。
              同时要考虑业务周期性，如周末和节假日可能影响用户行为。
              避免过早结束测试，以免得出错误结论。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
  
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {test ? '编辑A/B测试' : '创建A/B测试'}
              </h1>
              <p className="text-gray-600">
                配置测试变体、指标和目标受众，设置测试参数
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline">
                预览
              </Button>
              <Button onClick={handleSave} className="flex items-center gap-2">
                <DocumentArrowDownIcon className="h-4 w-4" />
                保存配置
              </Button>
            </div>
          </div>
        </motion.div>

        {/* 基本信息 */}
        <motion.div
          initial={animations.slideIn('up', 0.2)}
          animate={animations.slideIn('up', 0.2)}
          className="mb-8"
        >
          <Card className="transition-all duration-300 hover:translate-y-[-5px] hover:shadow-xl">
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">测试名称</div>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="输入测试名称"
                />
              </div>
              
              <div>
                <div className="text-sm font-medium text-gray-700 mb-1">测试描述</div>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="描述测试的目标和背景"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 配置选项卡 */}
        <div className="space-y-6">
          <Tabs defaultValue="variants">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="variants">变体设置</TabsTrigger>
            <TabsTrigger value="metrics">指标定义</TabsTrigger>
            <TabsTrigger value="audience">目标受众</TabsTrigger>
            <TabsTrigger value="advanced">高级设置</TabsTrigger>
          </TabsList>
          
          <TabsContent value="variants">
            <VariantsSection />
          </TabsContent>
          
          <TabsContent value="metrics">
            <MetricsSection />
          </TabsContent>
          
          <TabsContent value="audience">
            <AudienceSection />
          </TabsContent>
          
          <TabsContent value="advanced">
            <AdvancedSection />
          </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}