'use client'

import { EnhancedUserBehaviorAnalysis } from '@/components/analytics/EnhancedUserBehaviorAnalysis'
import { useAuth } from '@/contexts/AuthContext'

export default function AnalyticsPage() {
  const { user } = useAuth()

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600">请先登录以查看用户行为分析</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">用户行为分析</h1>
        <p className="text-gray-600">深入了解您的学习模式和行为洞察</p>
      </div>
      
      <EnhancedUserBehaviorAnalysis
        userId="temp-user-id"
        days={30}
        className="w-full"
      />
    </div>
  )
}