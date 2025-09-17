'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ABTest, ABTestCreateForm, ABTestVariant, ABTestMetric } from '@/types'

interface ABTestFormProps {
  test?: ABTest | null
  onTestCreated: () => void
  onTestUpdated: () => void
  onCancel: () => void
}

export const ABTestForm: React.FC<ABTestFormProps> = ({
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

  useEffect(() => {
    if (test) {
      setFormData({
        name: test.name,
        description: test.description,
        targetAudience: test.targetAudience,
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

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleTargetAudienceChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      targetAudience: {
        ...prev.targetAudience,
        [field]: value
      }
    }))
  }

  const handleVariantChange = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map((variant, i) => 
        i === index ? { ...variant, [field]: value } : variant
      )
    }))
  }

  const handleMetricChange = (index: number, field: string, value: any) => {
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
      
      if (test) {
        onTestUpdated()
      } else {
        onTestCreated()
      }
    } catch (err) {
      console.error('保存A/B测试失败:', err)
      setError(err instanceof Error ? err.message : '保存A/B测试失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{test ? '编辑A/B测试' : '创建A/B测试'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 p-4 rounded-md text-red-700">
              {error}
            </div>
          )}
          
          {/* 基本信息 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">基本信息</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                测试名称
              </label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="输入测试名称"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                测试描述
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="输入测试描述"
              />
            </div>
          </div>
          
          {/* 目标受众 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">目标受众</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                流量分配百分比
              </label>
              <Input
                type="number"
                min="1"
                max="100"
                value={formData.targetAudience.percentage}
                onChange={(e) => handleTargetAudienceChange('percentage', parseInt(e.target.value) || 0)}
                placeholder="输入流量分配百分比"
              />
            </div>
          </div>
          
          {/* 测试变体 */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">测试变体</h3>
              <Button type="button" variant="outline" onClick={addVariant}>
                添加变体
              </Button>
            </div>
            
            {formData.variants.map((variant, index) => (
              <div key={index} className="border border-gray-200 rounded-md p-4">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-medium">变体 {index + 1}</h4>
                  {formData.variants.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeVariant(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      删除
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      变体名称
                    </label>
                    <Input
                      type="text"
                      value={variant.name}
                      onChange={(e) => handleVariantChange(index, 'name', e.target.value)}
                      placeholder="输入变体名称"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      流量分配 (%)
                    </label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={variant.trafficPercentage}
                      onChange={(e) => handleVariantChange(index, 'trafficPercentage', parseFloat(e.target.value) || 0)}
                      placeholder="输入流量分配百分比"
                    />
                  </div>
                </div>
                
                <div className="mt-3">
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
              </div>
            ))}
          </div>
          
          {/* 测试指标 */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">测试指标</h3>
              <Button type="button" variant="outline" onClick={addMetric}>
                添加指标
              </Button>
            </div>
            
            {formData.metrics.map((metric, index) => (
              <div key={index} className="border border-gray-200 rounded-md p-4">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-medium">指标 {index + 1}</h4>
                  {formData.metrics.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeMetric(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      删除
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      指标名称
                    </label>
                    <Input
                      type="text"
                      value={metric.name}
                      onChange={(e) => handleMetricChange(index, 'name', e.target.value)}
                      placeholder="输入指标名称"
                    />
                  </div>
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
                </div>
                
                <div className="mt-3">
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
              </div>
            ))}
          </div>
          
          {/* 操作按钮 */}
          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={onCancel}>
              取消
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? '保存中...' : test ? '更新测试' : '创建测试'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}