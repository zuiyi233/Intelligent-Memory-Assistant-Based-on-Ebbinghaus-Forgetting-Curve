'use client'

import React, { useState, useEffect } from 'react'
import { AchievementSystem } from './AchievementSystem'
import { GamificationABTestingService } from '@/services/gamificationABTesting.service'
import { Beaker, Info, Settings } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

// A/B测试变体配置类型
interface ABTestVariantConfig {
  id: string
  name: string
  config: {
    animationType?: 'default' | 'enhanced' | 'minimal'
    notificationSound?: boolean
    celebrationEffect?: boolean
    showProgress?: boolean
    rewardMultiplier?: number
    achievementThreshold?: number
  }
}

interface AchievementSystemWithABTestingProps {
  userId: string
  className?: string
}

export function AchievementSystemWithABTesting({ userId, className }: AchievementSystemWithABTestingProps) {
  const [currentVariant, setCurrentVariant] = useState<ABTestVariantConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [showVariantInfo, setShowVariantInfo] = useState(false)
  
  const abTestingService = new GamificationABTestingService()

  useEffect(() => {
    // 获取用户的A/B测试变体配置
    const fetchUserVariant = async () => {
      try {
        setLoading(true)
        
        // 简化实现，使用模拟数据
        // 实际应用中应该从A/B测试服务获取用户所属的变体
        const mockVariants: ABTestVariantConfig[] = [
          {
            id: 'control',
            name: '标准成就系统',
            config: {
              animationType: 'default',
              notificationSound: true,
              celebrationEffect: false,
              showProgress: true,
              rewardMultiplier: 1,
              achievementThreshold: 100
            }
          },
          {
            id: 'enhanced',
            name: '增强成就系统',
            config: {
              animationType: 'enhanced',
              notificationSound: true,
              celebrationEffect: true,
              showProgress: true,
              rewardMultiplier: 1.2,
              achievementThreshold: 80
            }
          },
          {
            id: 'minimal',
            name: '简化成就系统',
            config: {
              animationType: 'minimal',
              notificationSound: false,
              celebrationEffect: false,
              showProgress: false,
              rewardMultiplier: 0.8,
              achievementThreshold: 120
            }
          }
        ]
        
        // 简单的变体分配逻辑（实际应用中应该使用更复杂的算法）
        const userIdHash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
        const variantIndex = userIdHash % mockVariants.length
        const selectedVariant = mockVariants[variantIndex]
        
        setCurrentVariant(selectedVariant)
      } catch (error) {
        console.error('获取A/B测试变体配置失败:', error)
        // 出错时使用默认配置
        setCurrentVariant({
          id: 'control',
          name: '标准成就系统',
          config: {
            animationType: 'default',
            notificationSound: true,
            celebrationEffect: false,
            showProgress: true,
            rewardMultiplier: 1,
            achievementThreshold: 100
          }
        })
      } finally {
        setLoading(false)
      }
    }

    fetchUserVariant()
  }, [userId])

  if (loading) {
    return (
      <div className={`flex justify-center items-center h-32 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!currentVariant) {
    return (
      <div className={`text-center ${className}`}>
        <p className="text-gray-500">无法加载成就系统</p>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* A/B测试变体信息 */}
      <Card className="border-blue-200 bg-blue-50/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Beaker className="h-4 w-4 text-blue-600" />
              <span className="text-blue-800">A/B测试变体</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowVariantInfo(!showVariantInfo)}
              className="h-6 w-6 p-0"
            >
              <Settings className="h-3 w-3" />
            </Button>
          </CardTitle>
        </CardHeader>
        {showVariantInfo && (
          <CardContent className="pt-0">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-700">当前变体</span>
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                  {currentVariant.name}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="text-xs">
                  <span className="text-gray-600">动画效果</span>
                  <p className="font-medium">
                    {currentVariant.config.animationType === 'default' && '标准'}
                    {currentVariant.config.animationType === 'enhanced' && '增强'}
                    {currentVariant.config.animationType === 'minimal' && '简化'}
                  </p>
                </div>
                <div className="text-xs">
                  <span className="text-gray-600">通知音效</span>
                  <p className="font-medium">
                    {currentVariant.config.notificationSound ? '开启' : '关闭'}
                  </p>
                </div>
                <div className="text-xs">
                  <span className="text-gray-600">庆祝效果</span>
                  <p className="font-medium">
                    {currentVariant.config.celebrationEffect ? '开启' : '关闭'}
                  </p>
                </div>
                <div className="text-xs">
                  <span className="text-gray-600">进度显示</span>
                  <p className="font-medium">
                    {currentVariant.config.showProgress ? '显示' : '隐藏'}
                  </p>
                </div>
                <div className="text-xs">
                  <span className="text-gray-600">奖励倍数</span>
                  <p className="font-medium">
                    {currentVariant.config.rewardMultiplier}x
                  </p>
                </div>
                <div className="text-xs">
                  <span className="text-gray-600">成就阈值</span>
                  <p className="font-medium">
                    {currentVariant.config.achievementThreshold}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-1 mt-2 p-2 bg-blue-100/50 rounded-lg">
                <Info className="h-3 w-3 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-700">
                  您正在参与成就系统的A/B测试，当前变体为"{currentVariant.name}"。
                  这将帮助我们优化用户体验和成就系统的效果。
                </p>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* 根据变体配置渲染成就系统 */}
      <AchievementSystem userId={userId} />
    </div>
  )
}