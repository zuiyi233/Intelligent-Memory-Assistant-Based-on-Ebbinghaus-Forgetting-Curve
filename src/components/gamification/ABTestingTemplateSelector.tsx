'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Beaker, 
  Filter, 
  Search, 
  Star, 
  Clock, 
  Users, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Info,
  Copy,
  Eye,
  Settings
} from 'lucide-react'
import { GamificationABTestingTemplates, ABTestTemplate } from '@/services/gamificationABTestingTemplates.service'

interface ABTestingTemplateSelectorProps {
  onSelectTemplate?: (template: ABTestTemplate) => void
  onCreateTest?: (template: ABTestTemplate) => void
  userId: string
  isAdmin?: boolean
}

export function ABTestingTemplateSelector({ 
  onSelectTemplate, 
  onCreateTest, 
  userId,
  isAdmin = false 
}: ABTestingTemplateSelectorProps) {
  const [templates, setTemplates] = useState<ABTestTemplate[]>([])
  const [filteredTemplates, setFilteredTemplates] = useState<ABTestTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<ABTestTemplate | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all')
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<string>('all')
  const [showValidation, setShowValidation] = useState(false)
  
  const templateService = new GamificationABTestingTemplates()

  useEffect(() => {
    fetchTemplates()
  }, [])

  useEffect(() => {
    filterTemplates()
  }, [templates, searchQuery, selectedCategory, selectedDifficulty, selectedRiskLevel])

  // 获取模板列表
  const fetchTemplates = () => {
    try {
      setLoading(true)
      const allTemplates = templateService.getAllTemplates()
      setTemplates(allTemplates)
      setFilteredTemplates(allTemplates)
    } catch (error) {
      console.error('获取模板列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 过滤模板
  const filterTemplates = () => {
    let result = [...templates]
    
    // 搜索过滤
    if (searchQuery) {
      result = templateService.searchTemplates(searchQuery)
    }
    
    // 类别过滤
    if (selectedCategory !== 'all') {
      result = result.filter(template => template.category === selectedCategory)
    }
    
    // 难度过滤
    if (selectedDifficulty !== 'all') {
      result = result.filter(template => template.difficulty === selectedDifficulty)
    }
    
    // 风险等级过滤
    if (selectedRiskLevel !== 'all') {
      result = result.filter(template => template.riskLevel === selectedRiskLevel)
    }
    
    setFilteredTemplates(result)
  }

  // 处理模板选择
  const handleTemplateSelect = (template: ABTestTemplate) => {
    setSelectedTemplate(template)
    if (onSelectTemplate) {
      onSelectTemplate(template)
    }
  }

  // 处理创建测试
  const handleCreateTest = () => {
    if (selectedTemplate && onCreateTest) {
      onCreateTest(selectedTemplate)
    }
  }

  // 复制模板
  const handleDuplicateTemplate = () => {
    if (selectedTemplate) {
      const customTemplate = templateService.createCustomTemplate(selectedTemplate.id, {
        name: `${selectedTemplate.name} (副本)`,
        description: selectedTemplate.description
      })
      
      if (customTemplate) {
        setSelectedTemplate(customTemplate)
      }
    }
  }

  // 获取类别标签
  const getCategoryLabel = (category: ABTestTemplate['category']) => {
    switch (category) {
      case 'achievements':
        return '成就系统'
      case 'points':
        return '积分系统'
      case 'leaderboard':
        return '排行榜'
      case 'challenges':
        return '挑战任务'
      case 'notifications':
        return '通知系统'
      case 'comprehensive':
        return '综合体验'
      default:
        return '其他'
    }
  }

  // 获取难度标签样式
  const getDifficultyBadge = (difficulty: ABTestTemplate['difficulty']) => {
    switch (difficulty) {
      case 'easy':
        return <Badge className="bg-green-100 text-green-800">简单</Badge>
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">中等</Badge>
      case 'hard':
        return <Badge className="bg-red-100 text-red-800">困难</Badge>
      default:
        return <Badge>未知</Badge>
    }
  }

  // 获取风险等级标签样式
  const getRiskLevelBadge = (riskLevel: ABTestTemplate['riskLevel']) => {
    switch (riskLevel) {
      case 'low':
        return <Badge className="bg-green-100 text-green-800">低风险</Badge>
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">中风险</Badge>
      case 'high':
        return <Badge className="bg-red-100 text-red-800">高风险</Badge>
      default:
        return <Badge>未知</Badge>
    }
  }

  // 验证模板
  const validateTemplate = () => {
    if (selectedTemplate) {
      const validation = templateService.validateTemplate(selectedTemplate)
      setShowValidation(true)
      return validation.isValid
    }
    return false
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Beaker className="h-6 w-6 text-blue-600" />
            A/B测试模板库
          </h1>
          <p className="text-gray-600 mt-1">选择预定义模板快速创建游戏化A/B测试</p>
        </div>
      </div>

      <Tabs defaultValue="browse">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="browse">浏览模板</TabsTrigger>
          <TabsTrigger value="detail">模板详情</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-4">
          {/* 搜索和过滤 */}
          <Card>
            <CardContent className="p-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="搜索模板..."
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <select
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="all">所有类别</option>
                  <option value="achievements">成就系统</option>
                  <option value="points">积分系统</option>
                  <option value="leaderboard">排行榜</option>
                  <option value="challenges">挑战任务</option>
                  <option value="notifications">通知系统</option>
                  <option value="comprehensive">综合体验</option>
                </select>
                
                <select
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                >
                  <option value="all">所有难度</option>
                  <option value="easy">简单</option>
                  <option value="medium">中等</option>
                  <option value="hard">困难</option>
                </select>
                
                <select
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedRiskLevel}
                  onChange={(e) => setSelectedRiskLevel(e.target.value)}
                >
                  <option value="all">所有风险</option>
                  <option value="low">低风险</option>
                  <option value="medium">中风险</option>
                  <option value="high">高风险</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* 模板列表 */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTemplates.map((template) => (
              <Card 
                key={template.id} 
                className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-blue-300"
                onClick={() => handleTemplateSelect(template)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    {selectedTemplate?.id === template.id && (
                      <CheckCircle className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{template.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {getCategoryLabel(template.category)}
                      </Badge>
                      {getDifficultyBadge(template.difficulty)}
                      {getRiskLevelBadge(template.riskLevel)}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{template.estimatedDuration}天</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{template.recommendedSampleSize.toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {template.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {template.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{template.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      {template.variants.length}个变体 · {template.targetMetrics.length}个指标
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <AlertTriangle className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">未找到匹配的模板</h3>
                <p className="text-gray-500 mb-4">请尝试调整搜索条件或过滤器</p>
                <Button variant="outline" onClick={() => {
                  setSearchQuery('')
                  setSelectedCategory('all')
                  setSelectedDifficulty('all')
                  setSelectedRiskLevel('all')
                }}>
                  清除过滤器
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="detail" className="space-y-4">
          {selectedTemplate ? (
            <div className="space-y-6">
              {/* 模板基本信息 */}
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl flex items-center gap-2">
                        {selectedTemplate.name}
                        <Badge variant="outline" className="text-sm">
                          {getCategoryLabel(selectedTemplate.category)}
                        </Badge>
                      </CardTitle>
                      <p className="text-gray-600 mt-2">{selectedTemplate.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={handleDuplicateTemplate}>
                        <Copy className="h-4 w-4 mr-2" />
                        复制
                      </Button>
                      {isAdmin && (
                        <Button size="sm" onClick={handleCreateTest}>
                          <Beaker className="h-4 w-4 mr-2" />
                          创建测试
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">预估持续时间</p>
                      <p className="font-medium">{selectedTemplate.estimatedDuration}天</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">推荐样本量</p>
                      <p className="font-medium">{selectedTemplate.recommendedSampleSize.toLocaleString()}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">难度等级</p>
                      <div>{getDifficultyBadge(selectedTemplate.difficulty)}</div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">风险等级</p>
                      <div>{getRiskLevelBadge(selectedTemplate.riskLevel)}</div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <p className="text-sm text-gray-500 mb-2">标签</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedTemplate.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {selectedTemplate.prerequisites.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-500 mb-2">前置条件</p>
                      <ul className="text-sm space-y-1">
                        {selectedTemplate.prerequisites.map((prerequisite, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            {prerequisite}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 测试变体 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Beaker className="h-5 w-5" />
                    测试变体 ({selectedTemplate.variants.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {selectedTemplate.variants.map((variant) => (
                      <div key={variant.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium flex items-center gap-2">
                            {variant.name}
                            {variant.isControl && (
                              <Badge variant="outline" className="text-xs">对照组</Badge>
                            )}
                          </h3>
                          <Badge className="text-xs">{variant.trafficAllocation}%</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{variant.description}</p>
                        <div className="text-xs">
                          <p className="font-medium mb-1">配置参数:</p>
                          <div className="space-y-1">
                            {Object.entries(variant.config).map(([key, value]) => (
                              <div key={key} className="flex gap-2">
                                <span className="text-gray-500">{key}:</span>
                                <span>{String(value)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 目标指标 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    目标指标 ({selectedTemplate.targetMetrics.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {selectedTemplate.targetMetrics.map((metric, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{metric.name}</h3>
                            {metric.primary && (
                              <Badge className="text-xs bg-blue-100 text-blue-800">主要指标</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{metric.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">单位: {metric.unit}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 模板验证 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    模板验证
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">验证模板配置是否正确</p>
                    <Button variant="outline" onClick={validateTemplate}>
                      验证模板
                    </Button>
                  </div>
                  
                  {showValidation && (
                    <div className="mt-4 p-4 border rounded-lg">
                      {(() => {
                        const validation = templateService.validateTemplate(selectedTemplate)
                        if (validation.isValid) {
                          return (
                            <div className="flex items-center gap-2 text-green-600">
                              <CheckCircle className="h-5 w-5" />
                              <span>模板配置有效</span>
                            </div>
                          )
                        } else {
                          return (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-red-600">
                                <AlertTriangle className="h-5 w-5" />
                                <span>模板配置存在问题</span>
                              </div>
                              <ul className="text-sm text-red-600 space-y-1">
                                {validation.errors.map((error, index) => (
                                  <li key={index} className="flex items-start gap-2">
                                    <span>•</span>
                                    <span>{error}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )
                        }
                      })()}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Info className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">未选择模板</h3>
                <p className="text-gray-500 mb-4">请从模板列表中选择一个模板查看详情</p>
                <Button onClick={() => setSelectedTemplate(null)}>
                  返回浏览
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}