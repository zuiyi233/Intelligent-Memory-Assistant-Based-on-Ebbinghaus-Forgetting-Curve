'use client'

import React from 'react'
import { DataEffectAnalysis } from '@/components/gamification/analysis/DataEffectAnalysis'

export default function DataAnalysisPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">数据效果分析</h1>
        <p className="text-gray-600">
          通过可视化图表展示游戏化功能的效果分析数据，包括用户参与度、留存率、转化率等关键指标
        </p>
      </div>
      
      <DataEffectAnalysis className="w-full" />
    </div>
  )
}