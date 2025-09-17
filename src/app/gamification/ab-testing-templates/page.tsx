'use client'

import React from 'react'
import { Navigation } from '@/components/layout/Navigation'
import { EnhancedABTestingTemplateSelector } from '@/components/gamification/EnhancedABTestingTemplateSelector'
import { ABTestTemplate } from '@/services/gamificationABTestingTemplates.service'

export default function ABTestingTemplatesPage() {
  const handleSelectTemplate = (template: ABTestTemplate) => {
    console.log('Selected template:', template)
    // 这里可以添加选择模板后的处理逻辑
  }

  const handleCreateTest = (template: ABTestTemplate) => {
    console.log('Creating test from template:', template)
    // 这里可以添加创建测试后的处理逻辑，例如跳转到测试创建页面
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      <EnhancedABTestingTemplateSelector
        userId="user-123" // 这里可以替换为实际的用户ID
        isAdmin={true} // 这里可以根据用户角色动态设置
        onSelectTemplate={handleSelectTemplate}
        onCreateTest={handleCreateTest}
      />
    </div>
  )
}