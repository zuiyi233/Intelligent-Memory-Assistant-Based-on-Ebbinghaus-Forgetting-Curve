'use client'

import React, { useState, useEffect } from 'react'
import { BadgeWall } from '@/components/gamification/BadgeWall'
import { Navigation } from '@/components/layout/Navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, Shield, Trophy } from 'lucide-react'

export default function BadgesPage() {
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
          
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 md:mb-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                徽章展示墙
              </span>
            </h1>
            <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto px-4">
              展示您已解锁的所有成就徽章，分享您的成就，激励自己继续前行
            </p>
          </div>
        </div>

        {/* 徽章展示墙组件 */}
        <BadgeWall />

        {/* 页面底部说明 */}
        <Card className="apple-card mt-8">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center justify-center gap-2">
                <Shield className="h-5 w-5 text-purple-500" />
                徽章系统说明
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-600">
                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="font-medium text-purple-700 mb-1">获取徽章</p>
                  <p>完成各类学习任务和挑战，解锁不同类别的成就徽章</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="font-medium text-blue-700 mb-1">徽章分类</p>
                  <p>徽章按类别分为复习、连续学习、等级、积分和挑战等多种类型</p>
                </div>
                <div className="p-3 bg-pink-50 rounded-lg">
                  <p className="font-medium text-pink-700 mb-1">分享成就</p>
                  <p>将自己的徽章成就分享给朋友，展示您的学习成果</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}