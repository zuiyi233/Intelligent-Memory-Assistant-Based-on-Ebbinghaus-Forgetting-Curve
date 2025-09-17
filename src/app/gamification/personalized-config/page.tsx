'use client'

import React, { useState, useEffect } from 'react'
import PersonalizedConfigComponent from '@/components/gamification/PersonalizedConfig'
import { PersonalizedConfig as PersonalizedConfigType } from '@/types'

/**
 * 个性化配置页面
 */
export default function PersonalizedConfigPage() {
  const [userId, setUserId] = useState<string>('')
  const [initialConfig, setInitialConfig] = useState<PersonalizedConfigType | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 在实际应用中，这里应该从认证系统获取用户ID
    // 这里使用一个模拟的用户ID
    const mockUserId = 'user_123456'
    setUserId(mockUserId)

    // 获取用户的初始配置
    const fetchInitialConfig = async () => {
      try {
        const response = await fetch(`/api/gamification/personalized-config?userId=${mockUserId}`)
        if (response.ok) {
          const result = await response.json()
          if (result.success) {
            setInitialConfig(result.data)
          }
        }
      } catch (error) {
        console.error('获取初始配置失败:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchInitialConfig()
  }, [])

  const handleConfigSave = (config: PersonalizedConfigType) => {
    console.log('配置已保存:', config)
    // 可以在这里添加保存成功后的处理逻辑
  }

  const handleConfigChange = (config: Partial<PersonalizedConfigType>) => {
    console.log('配置已变更:', config)
    // 可以在这里添加配置变更的处理逻辑
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <PersonalizedConfigComponent
          userId={userId}
          initialConfig={initialConfig || undefined}
          onConfigSave={handleConfigSave}
          onConfigChange={handleConfigChange}
        />
      </div>
    </div>
  )
}