'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn, animations, cardEffects } from '@/lib/inspira-ui'
import { 
  PlusIcon,
  TrashIcon,
  ArrowLeftIcon,
  DocumentArrowDownIcon,
  LightBulbIcon,
  UserGroupIcon,
  ChartBarIcon,
  CogIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { ABTest, ABTestCreateForm, ABTestVariant, ABTestMetric } from '@/types'

interface EnhancedABTestFormProps {
  test?: ABTest | null
  onTestCreated: () => void
  onTestUpdated: () => void
  onCancel: () => void
}

export const EnhancedABTestForm: React.FC<EnhancedABTestFormProps> = ({
  test,
  onTestCreated,
  onTestUpdated,
  onCancel
}) => {
  const [formData, setFormData] = useState<ABTestCreateForm>({
    name: '',
    description: '',
    targetAudience: {
      userSegments: [],
      percentage: 100
    },
    variants: [
      {
        name: '对照组',
        description: '默认配置',
        config: {},
        trafficPercentage: 50,
        isControl: true
      },
      {
        name: '实验组',
        description: '新配置',
        config: {},
        trafficPercentage: 50,
        isControl: false
      }
    ],
    metrics: [
      {
        name: '参与度',
        description: '用户参与度指标',
        type: 'ENGAGEMENT',
        isActive: true
      }
    ]
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('basic')
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    if (test) {
      setFormData({
        name: test.name,
        description: test.description,
        targetAudience: test.targetAudience || {
          userSegments: [],
          percentage: 100
        },
        variants: test.variants.map(v => ({
          name: v.name,
          description: v.description,
          config: v.config,
          trafficPercentage: v.trafficPercentage,
          isControl: v.isControl
        })),
        metrics: test.metrics.map(m => ({
          name: m.name,
          description: m.description,
          type: m.type,
          formula: m.formula,
          unit: m.unit,
          isActive: m.isActive
        }))
      })
    }
  }, [test])

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleTargetAudienceChange = (field: string, value: string | number | string[]) => {
    setFormData(prev => ({
      ...prev,
      targetAudience: {
        ...prev.targetAudience,
        [field]: value
      }
    }))
  }

  const handleVariantChange = (index: number, field: string, value: string | number | object) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map((variant, i) => 
        i === index ? { ...variant, [field]: value } : variant
      )
    }))
  }

  const handleMetricChange = (index: number, field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      metrics: prev.metrics.map((metric, i) => 
        i === index ? { ...metric, [field]: value } : metric
      )
    }))
  }

  const addVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          name: `变体 ${prev.variants.length + 1}`,
          description: '新变体描述',
          config: {},
          trafficPercentage: 0,
          isControl: false
        }
      ]
    }))
  }

  const removeVariant = (index: number) => {
    if (formData.variants.length <= 1) {
      alert('至少需要保留一个变体')
      return
    }
    
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }))
  }

  const addMetric = () => {
    setFormData(prev => ({
      ...prev,
      metrics: [
        ...prev.metrics,
        {
          name: `指标 ${prev.metrics.length + 1}`,
          description: '新指标描述',
          type: 'ENGAGEMENT',
          isActive: true
        }
      ]
    }))
  }

  const removeMetric = (index: number) => {
    if (formData.metrics.length <= 1) {
      alert('至少需要保留一个指标')
      return
    }
    
    setFormData(prev => ({
      ...prev,
      metrics: prev.metrics.filter((_, i) => i !== index)
    }))
  }

  const validateForm = (): string | null => {
    if (!formData.name.trim()) {
      return '请输入测试名称'
    }
    
    if (!formData.description.trim()) {
      return '请输入测试描述'
    }
    
    if (formData.variants.length < 2) {
      return '至少需要两个变体才能进行A/B测试'
    }
    
    const totalTrafficPercentage = formData.variants.reduce(
      (sum, variant) => sum + variant.trafficPercentage, 
      0
    )
    
    if (Math.abs(totalTrafficPercentage - 100) > 0.1) {
      return `变体流量分配总和必须为100%，当前为${totalTrafficPercentage}%`
    }
    
    if (formData.metrics.length === 0) {
      return '至少需要一个指标'
    }
    
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const url = test 
        ? `/api/gamification/abtesting/${test.id}`
        : '/api/gamification/abtesting'
      
      const method = test ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      setShowSuccess(true)
      setTimeout(() => {
        setShowSuccess(false)
        if (test) {
          onTestUpdated()
        } else {
          onTestCreated()
        }
      }, 2000)
    } catch (err) {
      console.error('保存A/B测试失败:', err)
      setError(err instanceof Error ? err.message : '保存A/B测试失败')
    } finally {
      setLoading(false)
    }
  }

  const FormSection = ({ 
    title, 
    icon: Icon, 
    children, 
    description 
  }: {
    title: string
    icon: React.ElementType
    children: React.ReactNode
    description?: string
  }) => (
    <motion.div
      initial={animations.slideIn('up', 0.1)}
      animate={animations.slideIn('up', 0.1)}
      className="mb-6"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {description && (
            <p className="text-sm text-gray-600">{description}</p>
          )}
        </div>
      </div>
      <Card className={cn(cardEffects.hover)}>
        <CardContent className="p-6">
          {children}
        </CardContent>
      </Card>
    </motion.div>
  )

  const VariantCard = ({ variant, index }: { variant: Omit<ABTestVariant, 'id' | 'testId' | 'createdAt'>; index: number }) => (
    <motion.div
      key={index}
      initial={animations.scaleIn(0.1 * index)}
      animate={animations.scaleIn(0.1 * index)}
      className="relative"
    >
      <Card className={cn(
        "h-full border-2",
        variant.isControl ? "border-blue-200 bg-blue-50" : "border-gray-200"
      )}>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <Input
                type="text"
                value={variant.name}
                onChange={(e) => handleVariantChange(index, 'name', e.target.value)}
                placeholder="变体名称"
                className="font-semibold"
              />
              {variant.isControl && (
                <Badge className="bg-blue-100 text-blue-800">对照组</Badge>
              )}
            </div>
            {formData.variants.length > 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeVariant(index)}
                className="text-red-600 hover:text-red-700"
              >
                <TrashIcon className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              变体描述
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
              value={variant.description}
              onChange={(e) => handleVariantChange(index, 'description', e.target.value)}
              placeholder="输入变体描述"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              流量分配 (%)
            </label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="0"
                max="100"
                value={variant.trafficPercentage}
                onChange={(e) => handleVariantChange(index, 'trafficPercentage', parseFloat(e.target.value) || 0)}
                placeholder="输入流量分配百分比"
                className="w-32"
              />
              <div className="flex-1">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${variant.trafficPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  const MetricCard = ({ metric, index }: { metric: Omit<ABTestMetric, 'id' | 'testId' | 'createdAt'>; index: number }) => (
    <motion.div
      key={index}
      initial={animations.scaleIn(0.1 * index)}
      animate={animations.scaleIn(0.1 * index)}
    >
      <Card className="h-full">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <Input
              type="text"
              value={metric.name}
              onChange={(e) => handleMetricChange(index, 'name', e.target.value)}
              placeholder="指标名称"
              className="font-semibold"
            />
            {formData.metrics.length > 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeMetric(index)}
                className="text-red-600 hover:text-red-700"
              >
                <TrashIcon className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              指标描述
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
              value={metric.description}
              onChange={(e) => handleMetricChange(index, 'description', e.target.value)}
              placeholder="输入指标描述"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                指标类型
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={metric.type}
                onChange={(e) => handleMetricChange(index, 'type', e.target.value)}
              >
                <option value="ENGAGEMENT">参与度</option>
                <option value="RETENTION">保留率</option>
                <option value="CONVERSION">转化率</option>
                <option value="REVENUE">收入</option>
                <option value="SATISFACTION">满意度</option>
                <option value="PERFORMANCE">性能</option>
                <option value="CUSTOM">自定义</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                单位 (可选)
              </label>
              <Input
                type="text"
                value={metric.unit || ''}
                onChange={(e) => handleMetricChange(index, 'unit', e.target.value)}
                placeholder="如: %, 次, 元"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 md:p-8">
      {/* 背景装饰 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* 页面标题 */}
        <motion.div
          initial={animations.slideIn('down', 0.2)}
          animate={animations.slideIn('down', 0.2)}
          className="mb-8"
        >
          <Button
            variant="outline"
            onClick={onCancel}
            className="mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            返回
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {test ? '编辑A/B测试' : '创建A/B测试'}
          </h1>
          <p className="text-gray-600">
            {test ? '修改测试配置和参数' : '设置新的A/B测试，优化用户体验'}
          </p>
        </motion.div>

        {/* 成功提示 */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={animations.slideIn('down', 0.3)}
              animate={animations.slideIn('down', 0.3)}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6"
            >
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-4 flex items-center gap-3">
                  <CheckCircleIcon className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">
                      {test ? '测试更新成功！' : '测试创建成功！'}
                    </p>
                    <p className="text-sm text-green-600">
                      {test ? '您的测试配置已保存' : '新测试已创建并可以启动'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 错误提示 */}
        {error && (
          <motion.div
            initial={animations.slideIn('down', 0.3)}
            animate={animations.slideIn('down', 0.3)}
            className="mb-6"
          >
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4 flex items-center gap-3">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                <div>
                  <p className="font-medium text-red-800">错误</p>
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="w-full">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="basic" className="flex items-center gap-2">
                <CogIcon className="h-4 w-4" />
                <span>基本信息</span>
              </TabsTrigger>
              <TabsTrigger value="variants" className="flex items-center gap-2">
                <UserGroupIcon className="h-4 w-4" />
                <span>测试变体</span>
              </TabsTrigger>
              <TabsTrigger value="metrics" className="flex items-center gap-2">
                <ChartBarIcon className="h-4 w-4" />
                <span>测试指标</span>
              </TabsTrigger>
              <TabsTrigger value="audience" className="flex items-center gap-2">
                <LightBulbIcon className="h-4 w-4" />
                <span>目标受众</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6">
              <FormSection
                title="基本信息"
                icon={CogIcon}
                description="设置A/B测试的基本信息和目标"
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      测试名称 <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="输入测试名称"
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      测试描述 <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={4}
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="输入测试描述，包括测试目标和预期结果"
                    />
                  </div>
                </div>
              </FormSection>
            </TabsContent>

            <TabsContent value="variants" className="space-y-6">
              <FormSection
                title="测试变体"
                icon={UserGroupIcon}
                description="定义不同的测试变体和流量分配"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600">
                      总流量分配: {formData.variants.reduce((sum, v) => sum + v.trafficPercentage, 0)}%
                      {Math.abs(formData.variants.reduce((sum, v) => sum + v.trafficPercentage, 0) - 100) > 0.1 && (
                        <span className="text-red-500 ml-2">
                          (必须等于100%)
                        </span>
                      )}
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addVariant}
                      className="flex items-center gap-1"
                    >
                      <PlusIcon className="h-4 w-4" />
                      添加变体
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {formData.variants.map((variant, index) => (
                      <VariantCard key={index} variant={variant} index={index} />
                    ))}
                  </div>
                </div>
              </FormSection>
            </TabsContent>

            <TabsContent value="metrics" className="space-y-6">
              <FormSection
                title="测试指标"
                icon={ChartBarIcon}
                description="定义用于衡量测试效果的关键指标"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600">
                      添加关键指标来衡量测试效果
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addMetric}
                      className="flex items-center gap-1"
                    >
                      <PlusIcon className="h-4 w-4" />
                      添加指标
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {formData.metrics.map((metric, index) => (
                      <MetricCard key={index} metric={metric} index={index} />
                    ))}
                  </div>
                </div>
              </FormSection>
            </TabsContent>

            <TabsContent value="audience" className="space-y-6">
              <FormSection
                title="目标受众"
                icon={LightBulbIcon}
                description="设置测试的目标用户群体和流量分配"
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      流量分配百分比 <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-4">
                      <Input
                        type="number"
                        min="1"
                        max="100"
                        value={formData.targetAudience.percentage}
                        onChange={(e) => handleTargetAudienceChange('percentage', parseInt(e.target.value) || 0)}
                        placeholder="输入流量分配百分比"
                        className="w-32"
                      />
                      <div className="flex-1">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${formData.targetAudience.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      参与测试的用户占总用户群的百分比
                    </p>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">高级设置</h4>
                    <p className="text-sm text-blue-700">
                      更复杂的目标受众设置将在后续版本中提供，包括用户细分、行为特征等。
                    </p>
                  </div>
                </div>
              </FormSection>
            </TabsContent>
          </Tabs>
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              取消
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  保存中...
                </>
              ) : (
                <>
                  <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                  {test ? '更新测试' : '创建测试'}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}