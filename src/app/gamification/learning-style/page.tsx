'use client'

import React from 'react'
import { LearningStyleGamificationAnalysis } from '@/components/gamification/LearningStyleGamificationAnalysis'
import { Navigation } from '@/components/layout/Navigation'
import { GamificationErrorBoundary } from '@/components/gamification/GamificationErrorBoundary'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Brain, BookOpen, Target, Trophy, Lightbulb, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function LearningStyleAnalysisPage() {
  // 临时使用固定用户ID，实际应该从会话中获取
  const userId = "temp-user-id"

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navigation />
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* 页面标题 */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/gamification">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                返回游戏化中心
              </Button>
            </Link>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 md:mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              学习风格分析与游戏化建议
            </span>
          </h1>
          <p className="text-base md:text-lg text-gray-600 max-w-3xl">
            通过分析您的学习风格，我们为您提供个性化的游戏化建议，帮助您更有效地学习和记忆
          </p>
        </div>

        {/* 主要内容区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 左侧：学习风格分析组件 */}
          <div className="lg:col-span-3">
            <GamificationErrorBoundary>
              <LearningStyleGamificationAnalysis userId={userId} />
            </GamificationErrorBoundary>
          </div>

          {/* 右侧：补充信息 */}
          <div className="lg:col-span-1 space-y-6">
            {/* 学习风格说明卡片 */}
            <Card className="apple-card">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                  <Brain className="h-5 w-5 text-blue-500" />
                  学习风格类型
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-700 mb-1">视觉型</h4>
                    <p className="text-sm text-gray-600">通过图像、图表和视觉材料学习效果最佳</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-700 mb-1">听觉型</h4>
                    <p className="text-sm text-gray-600">通过听讲、讨论和音频材料学习效果最佳</p>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <h4 className="font-medium text-yellow-700 mb-1">动觉型</h4>
                    <p className="text-sm text-gray-600">通过实践、动手操作和身体活动学习效果最佳</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <h4 className="font-medium text-purple-700 mb-1">阅读型</h4>
                    <p className="text-sm text-gray-600">通过阅读文本材料和写作学习效果最佳</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-700 mb-1">混合型</h4>
                    <p className="text-sm text-gray-600">结合多种学习方式，适应性强</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 游戏化元素说明卡片 */}
            <Card className="apple-card">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-600">
                  <Target className="h-5 w-5 text-green-500" />
                  游戏化元素
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-700 mb-1">积分系统</h4>
                    <p className="text-sm text-gray-600">通过完成学习任务获得积分</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-700 mb-1">成就系统</h4>
                    <p className="text-sm text-gray-600">解锁学习成就，展示学习进度</p>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <h4 className="font-medium text-yellow-700 mb-1">挑战系统</h4>
                    <p className="text-sm text-gray-600">完成学习挑战，提升技能</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <h4 className="font-medium text-purple-700 mb-1">排行榜</h4>
                    <p className="text-sm text-gray-600">与其他学习者比较进度</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 使用提示卡片 */}
            <Card className="apple-card">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-600 to-amber-600">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  使用提示
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-gray-600">
                  <p>• 定期完成学习任务以获得更准确的学习风格分析</p>
                  <p>• 尝试不同类型的学习内容，发现最适合自己的学习方式</p>
                  <p>• 根据游戏化建议调整学习策略，提高学习效率</p>
                  <p>• 结合多种学习方式，获得更全面的学习体验</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 底部说明 */}
        <Card className="apple-card mt-6 md:mt-8">
          <CardContent className="p-4 md:p-6">
            <div className="text-center">
              <h3 className="font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-500" />
                学习风格分析与游戏化建议
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 text-sm text-gray-600 mt-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="font-medium text-blue-700 mb-1">个性化学习</p>
                  <p>根据您的学习风格提供个性化的学习建议和游戏化元素</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="font-medium text-green-700 mb-1">提高效率</p>
                  <p>通过最适合您的学习方式，提高学习和记忆效率</p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <p className="font-medium text-yellow-700 mb-1">增强动力</p>
                  <p>通过个性化的游戏化元素，增强学习动力和兴趣</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}