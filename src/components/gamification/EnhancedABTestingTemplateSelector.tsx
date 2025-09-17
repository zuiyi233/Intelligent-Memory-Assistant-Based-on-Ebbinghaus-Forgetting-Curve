'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { InspiraBackground } from '@/components/ui/inspira-background'
import { InspiraCard, InspiraCardHeader, InspiraCardTitle, InspiraCardContent } from '@/components/ui/inspira-card'
import { InspiraButton } from '@/components/ui/inspira-button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
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
  Settings,
  Sparkles,
  Zap
} from 'lucide-react'
import { GamificationABTestingTemplates, ABTestTemplate } from '@/services/gamificationABTestingTemplates.service'
import { cn } from '@/lib/utils'
import { animations, textEffects, cardEffects } from '@/lib/inspira-ui'

interface EnhancedABTestingTemplateSelectorProps {
  onSelectTemplate?: (template: ABTestTemplate) => void
  onCreateTest?: (template: ABTestTemplate) => void
  userId: string
  isAdmin?: boolean
}

export function EnhancedABTestingTemplateSelector({ 
  onSelectTemplate, 
  onCreateTest, 
  userId,
  isAdmin = false 
}: EnhancedABTestingTemplateSelectorProps) {
  const [templates, setTemplates] = useState<ABTestTemplate[]>([])
  const [filteredTemplates, setFilteredTemplates] = useState<ABTestTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<ABTestTemplate | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all')
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<string>('all')
  const [showValidation, setShowValidation] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  
  const templateService = useMemo(() => new GamificationABTestingTemplates(), [])

  useEffect(() => {
    fetchTemplates()
  }, [templateService])

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
  const handleCreateTest = async () => {
    if (selectedTemplate && onCreateTest) {
      setIsCreating(true)
      try {
        await new Promise(resolve => setTimeout(resolve, 500)) // 模拟API调用
        onCreateTest(selectedTemplate)
      } catch (error) {
        console.error('创建测试失败:', error)
      } finally {
        setIsCreating(false)
      }
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

  // 获取类别颜色
  const getCategoryColor = (category: ABTestTemplate['category']) => {
    switch (category) {
      case 'achievements':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'points':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'leaderboard':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'challenges':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'notifications':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'comprehensive':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
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

  // 渲染模板卡片
  const renderTemplateCard = (template: ABTestTemplate) => (
    <InspiraCard 
      key={template.id} 
      variant="hover"
      className={cn(
        "cursor-pointer transition-all duration-300",
        selectedTemplate?.id === template.id && "ring-2 ring-blue-500 ring-offset-2"
      )}
      onClick={() => handleTemplateSelect(template)}
    >
      <InspiraCardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <InspiraCardTitle className="text-lg flex items-center gap-2">
            {template.name}
            {selectedTemplate?.id === template.id && (
              <CheckCircle className="h-5 w-5 text-blue-600 animate-pulse" />
            )}
          </InspiraCardTitle>
          <Badge variant="outline" className={getCategoryColor(template.category)}>
            {getCategoryLabel(template.category)}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">{template.description}</p>
      </InspiraCardHeader>
      <InspiraCardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            {getDifficultyBadge(template.difficulty)}
            {getRiskLevelBadge(template.riskLevel)}
          </div>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
          
          <div className="text-xs text-muted-foreground">
            {template.variants.length}个变体 · {template.targetMetrics.length}个指标
          </div>
        </div>
      </InspiraCardContent>
    </InspiraCard>
  )

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen">
      <InspiraBackground type="aurora" colors={['var(--primary)', 'var(--accent)']} />
      
      <div className="relative z-10 space-y-6 p-6">
        {/* 标题区域 */}
        <div className="text-center space-y-2 mb-8">
          <h1 className={cn(
            "text-4xl font-bold tracking-tight",
            textEffects.gradient(['var(--primary)', 'var(--accent)', 'var(--secondary)'])
          )}>
            A/B测试模板库
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            选择预定义模板快速创建游戏化A/B测试，提升用户体验和参与度
          </p>
        </div>

        <div className="w-full">
          <Tabs defaultValue="browse">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="browse" className="text-sm">
                <Search className="h-4 w-4 mr-2" />
                浏览模板
              </TabsTrigger>
              <TabsTrigger value="detail" className="text-sm">
                <Eye className="h-4 w-4 mr-2" />
                模板详情
              </TabsTrigger>
            </TabsList>

          <TabsContent value="browse" className="space-y-6">
            {/* 搜索和过滤 */}
            <InspiraCard variant="glass" className="backdrop-blur-lg">
              <InspiraCardContent className="p-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      type="text"
                      placeholder="搜索模板..."
                      className="w-full pl-10 pr-4"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  <select
                    className="w-full px-4 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
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
                    className="w-full px-4 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                  >
                    <option value="all">所有难度</option>
                    <option value="easy">简单</option>
                    <option value="medium">中等</option>
                    <option value="hard">困难</option>
                  </select>
                  
                  <select
                    className="w-full px-4 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    value={selectedRiskLevel}
                    onChange={(e) => setSelectedRiskLevel(e.target.value)}
                  >
                    <option value="all">所有风险</option>
                    <option value="low">低风险</option>
                    <option value="medium">中风险</option>
                    <option value="high">高风险</option>
                  </select>
                </div>
              </InspiraCardContent>
            </InspiraCard>

            {/* 模板列表 */}
            {filteredTemplates.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredTemplates.map((template) => (
                  <div key={template.id} className="animate-fade-in-up">
                    {renderTemplateCard(template)}
                  </div>
                ))}
              </div>
            ) : (
              <InspiraCard variant="glass" className="backdrop-blur-lg">
                <InspiraCardContent className="flex flex-col items-center justify-center py-12">
                  <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">未找到匹配的模板</h3>
                  <p className="text-muted-foreground mb-4">请尝试调整搜索条件或过滤器</p>
                  <InspiraButton 
                    variant="outline" 
                    onClick={() => {
                      setSearchQuery('')
                      setSelectedCategory('all')
                      setSelectedDifficulty('all')
                      setSelectedRiskLevel('all')
                    }}
                  >
                    清除过滤器
                  </InspiraButton>
                </InspiraCardContent>
              </InspiraCard>
            )}
          </TabsContent>

          <TabsContent value="detail" className="space-y-6">
            {selectedTemplate ? (
              <div className="space-y-6 animate-fade-in">
                {/* 模板基本信息 */}
                <InspiraCard variant="glass" className="backdrop-blur-lg">
                  <InspiraCardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <InspiraCardTitle className="text-xl flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-yellow-500" />
                          {selectedTemplate.name}
                          <Badge variant="outline" className={getCategoryColor(selectedTemplate.category)}>
                            {getCategoryLabel(selectedTemplate.category)}
                          </Badge>
                        </InspiraCardTitle>
                        <p className="text-muted-foreground mt-2">{selectedTemplate.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <InspiraButton 
                          variant="outline" 
                          size="sm" 
                          onClick={handleDuplicateTemplate}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          复制
                        </InspiraButton>
                        {isAdmin && (
                          <InspiraButton 
                            variant="gradient" 
                            size="sm" 
                            onClick={handleCreateTest}
                            disabled={isCreating}
                          >
                            <Zap className="h-4 w-4 mr-2" />
                            {isCreating ? '创建中...' : '创建测试'}
                          </InspiraButton>
                        )}
                      </div>
                    </div>
                  </InspiraCardHeader>
                  <InspiraCardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">预估持续时间</p>
                        <p className="font-medium">{selectedTemplate.estimatedDuration}天</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">推荐样本量</p>
                        <p className="font-medium">{selectedTemplate.recommendedSampleSize.toLocaleString()}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">难度等级</p>
                        <div>{getDifficultyBadge(selectedTemplate.difficulty)}</div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">风险等级</p>
                        <div>{getRiskLevelBadge(selectedTemplate.riskLevel)}</div>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground mb-2">标签</p>
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
                        <p className="text-sm text-muted-foreground mb-2">前置条件</p>
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
                  </InspiraCardContent>
                </InspiraCard>

                {/* 测试变体 */}
                <InspiraCard variant="glass" className="backdrop-blur-lg">
                  <InspiraCardHeader>
                    <InspiraCardTitle className="flex items-center gap-2">
                      <Beaker className="h-5 w-5" />
                      测试变体 ({selectedTemplate.variants.length})
                    </InspiraCardTitle>
                  </InspiraCardHeader>
                  <InspiraCardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      {selectedTemplate.variants.map((variant) => (
                        <div key={variant.id} className="border rounded-lg p-4 bg-card">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium flex items-center gap-2">
                              {variant.name}
                              {variant.isControl && (
                                <Badge variant="outline" className="text-xs">对照组</Badge>
                              )}
                            </h3>
                            <Badge className="text-xs">{variant.trafficAllocation}%</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{variant.description}</p>
                          <div className="text-xs">
                            <p className="font-medium mb-1">配置参数:</p>
                            <div className="space-y-1">
                              {Object.entries(variant.config).map(([key, value]) => (
                                <div key={key} className="flex gap-2">
                                  <span className="text-muted-foreground">{key}:</span>
                                  <span>{String(value)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </InspiraCardContent>
                </InspiraCard>

                {/* 目标指标 */}
                <InspiraCard variant="glass" className="backdrop-blur-lg">
                  <InspiraCardHeader>
                    <InspiraCardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      目标指标 ({selectedTemplate.targetMetrics.length})
                    </InspiraCardTitle>
                  </InspiraCardHeader>
                  <InspiraCardContent>
                    <div className="space-y-2">
                      {selectedTemplate.targetMetrics.map((metric, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-card">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{metric.name}</h3>
                              {metric.primary && (
                                <Badge className="text-xs bg-blue-100 text-blue-800">主要指标</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{metric.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">单位: {metric.unit}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </InspiraCardContent>
                </InspiraCard>

                {/* 模板验证 */}
                <InspiraCard variant="glass" className="backdrop-blur-lg">
                  <InspiraCardHeader>
                    <InspiraCardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      模板验证
                    </InspiraCardTitle>
                  </InspiraCardHeader>
                  <InspiraCardContent>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">验证模板配置是否正确</p>
                      <InspiraButton variant="outline" onClick={validateTemplate}>
                        验证模板
                      </InspiraButton>
                    </div>
                    
                    {showValidation && (
                      <div className="mt-4 p-4 border rounded-lg bg-card">
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
                  </InspiraCardContent>
                </InspiraCard>
              </div>
            ) : (
              <InspiraCard variant="glass" className="backdrop-blur-lg">
                <InspiraCardContent className="flex flex-col items-center justify-center py-12">
                  <Info className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">未选择模板</h3>
                  <p className="text-muted-foreground mb-4">请从模板列表中选择一个模板查看详情</p>
                  <InspiraButton onClick={() => setSelectedTemplate(null)}>
                    返回浏览
                  </InspiraButton>
                </InspiraCardContent>
              </InspiraCard>
            )}
          </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}