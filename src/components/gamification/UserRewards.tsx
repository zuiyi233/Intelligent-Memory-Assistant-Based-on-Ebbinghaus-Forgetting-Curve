'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import {
  UserReward,
  RewardStatus
} from '@/types'

interface UserRewardsProps {
  userId?: string
}

export default function UserRewards({ userId }: UserRewardsProps) {
  const { data: session } = useSession()
  const [userRewards, setUserRewards] = useState<UserReward[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<RewardStatus | 'all'>('all')

  // 获取用户奖励列表
  const fetchUserRewards = async () => {
    if (!session?.user?.id && !userId) return

    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      if (filter !== 'all') {
        params.append('status', filter)
      }

      const response = await fetch(`/api/gamification/user/rewards?${params}`)
      const data = await response.json()

      if (data.success) {
        setUserRewards(data.data)
      } else {
        setError(data.error || '获取用户奖励列表失败')
      }
    } catch (err) {
      setError('获取用户奖励列表失败')
      console.error('获取用户奖励列表失败:', err)
    } finally {
      setLoading(false)
    }
  }

  // 获取奖励状态显示名称
  const getStatusDisplayName = (status: RewardStatus) => {
    const statusNames = {
      [RewardStatus.PENDING]: '待处理',
      [RewardStatus.COMPLETED]: '已完成',
      [RewardStatus.EXPIRED]: '已过期',
      [RewardStatus.CANCELLED]: '已取消'
    }
    return statusNames[status] || status
  }

  // 获取奖励状态颜色
  const getStatusColor = (status: RewardStatus) => {
    const statusColors = {
      [RewardStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
      [RewardStatus.COMPLETED]: 'bg-green-100 text-green-800',
      [RewardStatus.EXPIRED]: 'bg-red-100 text-red-800',
      [RewardStatus.CANCELLED]: 'bg-gray-100 text-gray-800'
    }
    return statusColors[status] || 'bg-gray-100 text-gray-800'
  }

  // 初始化加载数据
  useEffect(() => {
    if (session?.user?.id || userId) {
      fetchUserRewards()
    }
  }, [filter, session, userId])

  // 处理筛选条件变化
  const handleFilterChange = (status: RewardStatus | 'all') => {
    setFilter(status)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">我的奖励</h1>
        <p className="text-gray-600">查看您已经兑换的奖励</p>
      </div>

      {/* 错误消息 */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* 筛选栏 */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleFilterChange('all')}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            全部
          </button>
          <button
            onClick={() => handleFilterChange(RewardStatus.PENDING)}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              filter === RewardStatus.PENDING
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            待处理
          </button>
          <button
            onClick={() => handleFilterChange(RewardStatus.COMPLETED)}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              filter === RewardStatus.COMPLETED
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            已完成
          </button>
          <button
            onClick={() => handleFilterChange(RewardStatus.EXPIRED)}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              filter === RewardStatus.EXPIRED
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            已过期
          </button>
          <button
            onClick={() => handleFilterChange(RewardStatus.CANCELLED)}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              filter === RewardStatus.CANCELLED
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            已取消
          </button>
        </div>
      </div>

      {/* 用户奖励列表 */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">加载中...</p>
        </div>
      ) : (
        <>
          {userRewards.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">暂无奖励记录</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userRewards.map(userReward => (
                <div key={userReward.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                  <div className="p-4">
                    {userReward.rewardItem?.icon && (
                      <div className="flex justify-center mb-4">
                        <Image
                          src={userReward.rewardItem.icon}
                          alt={userReward.rewardItem.name || '奖励'}
                          width={64}
                          height={64}
                          className="rounded-lg"
                        />
                      </div>
                    )}
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {userReward.rewardItem?.name || '未知奖励'}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {userReward.rewardItem?.description || '暂无描述'}
                    </p>
                    
                    <div className="flex justify-between items-center mb-4">
                      <span className={`text-xs px-2 py-1 rounded ${getStatusColor(userReward.status)}`}>
                        {getStatusDisplayName(userReward.status)}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(userReward.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    {userReward.rewardItem && (
                      <div className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">兑换积分:</span> {userReward.rewardItem.price}
                      </div>
                    )}
                    
                    {userReward.metadata && typeof userReward.metadata === 'object' && 'quantity' in userReward.metadata && (
                      <div className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">数量:</span> {userReward.metadata.quantity as number}
                      </div>
                    )}
                    
                    {userReward.claimedAt && (
                      <div className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">领取时间:</span> {new Date(userReward.claimedAt).toLocaleString()}
                      </div>
                    )}
                    
                    {userReward.expiresAt && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">过期时间:</span> {new Date(userReward.expiresAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}