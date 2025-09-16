import React from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface GamificationSkeletonProps {
  className?: string
  lines?: number
}

export function GamificationSkeleton({ className, lines = 3 }: GamificationSkeletonProps) {
  return (
    <div className={cn("animate-pulse", className)}>
      <div className="space-y-3">
        {[...Array(lines)].map((_, i) => (
          <div key={i} className="flex items-center space-x-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function GamificationCardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn("apple-card overflow-hidden", className)}>
      <CardHeader className="pb-3">
        <div className="h-6 bg-gray-200 rounded w-1/3"></div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-4/6"></div>
        </div>
      </CardContent>
    </Card>
  )
}

export function GamificationOverviewSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {[...Array(3)].map((_, i) => (
        <GamificationCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function GamificationStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      {[...Array(4)].map((_, i) => (
        <GamificationCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function GamificationProfileSkeleton() {
  return (
    <div className="space-y-3 md:space-y-4">
      <div className="flex justify-end">
        <div className="h-4 bg-gray-200 rounded w-12"></div>
      </div>
      <div>
        <div className="h-4 bg-gray-200 rounded w-20 mb-2 md:mb-3"></div>
        <div className="space-y-2 md:space-y-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-lg p-2 md:p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-4 w-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
              <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function GamificationChallengesSkeleton() {
  return (
    <div className="space-y-3 md:space-y-4">
      <div className="bg-white rounded-lg p-2 md:p-3 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-2 md:mb-3">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 bg-gray-200 rounded w-8"></div>
            <div className="h-4 bg-gray-200 rounded w-10"></div>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2"></div>
      </div>
      
      <div className="space-y-2 md:space-y-3 max-h-60 md:max-h-80 overflow-y-auto">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg p-2 md:p-3 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
              <div className="h-6 bg-gray-200 rounded w-16"></div>
            </div>
            <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
            <div className="w-full bg-gray-200 rounded-full h-1.5"></div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function GamificationLeaderboardSkeleton() {
  return (
    <div className="space-y-3 md:space-y-4">
      <div className="bg-white rounded-lg p-2 md:p-3 shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-16"></div>
          </div>
        </div>
        <div className="flex flex-wrap gap-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-6 bg-gray-200 rounded w-16"></div>
          ))}
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden max-h-60 md:max-h-80">
        <div className="space-y-0">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-2 md:p-3 border-t border-gray-100">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="h-6 w-6 md:h-8 md:w-8 bg-gray-200 rounded-full"></div>
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 md:h-8 md:w-8 bg-gray-200 rounded-full"></div>
                  <div>
                    <div className="h-3 bg-gray-200 rounded w-20 mb-1"></div>
                    <div className="h-2 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-12"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}