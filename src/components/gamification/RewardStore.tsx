'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  RewardItem,
  RewardCategory,
  RewardType,
  RewardStatus,
  UserReward
} from '@/types'
import {
  cn,
  animations,
  cardEffects,
  buttonEffects,
  textEffects,
  gamificationUtils
} from '@/lib/inspira-ui'
import {
  Gift,
  Search,
  Filter,
  Star,
  Clock,
  TrendingUp,
  Sparkles,
  Award,
  Coins,
  Check,
  Calendar,
  Wallet
} from 'lucide-react'

interface RewardStoreProps {
  userId?: string
}

export default function RewardStore({ userId }: RewardStoreProps) {
  const { data: session } = useSession()
  const [rewardItems, setRewardItems] = useState<RewardItem[]>([])
  const [userRewards, setUserRewards] = useState<UserReward[]>([])
  const [userPoints, setUserPoints] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [claiming, setClaiming] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    category: '',
    type: '',
    search: '',
    sortBy: 'createdAt' as 'createdAt' | 'price' | 'name',
    sortOrder: 'desc' as 'asc' | 'desc',
    page: 1,
    limit: 12
  })
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    page: 1,
    limit: 12
  })

  // 获取奖励物品列表
  const fetchRewardItems = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      if (filters.category) params.append('category', filters.category)
      if (filters.type) params.append('type', filters.type)
      if (filters.search) params.append('search', filters.search)
      params.append('sortBy', filters.sortBy)
      params.append('sortOrder', filters.sortOrder)
      params.append('page', filters.page.toString())
      params.append('limit', filters.limit.toString())

      const response = await fetch(`/api/gamification/rewards?${params}`)
      const data = await response.json()

      if (data.success) {
        setRewardItems(data.data.items)
        setPagination({
          total: data.data.total,
          totalPages: data.data.totalPages,
          page: data.data.page,
          limit: data.data.limit
        })
      } else {
        setError(data.error || '获取奖励物品列表失败')
      }
    } catch (err) {
      setError('获取奖励物品列表失败')
      console.error('获取奖励物品列表失败:', err)
    } finally {
      setLoading(false)
    }
  }

  // 获取用户奖励列表
  const fetchUserRewards = async () => {
    if (!session?.user?.id && !userId) return

    try {
      const response = await fetch(`/api/gamification/user/rewards`)
      const data = await response.json()

      if (data.success) {
        setUserRewards(data.data)
      } else {
        console.error('获取用户奖励列表失败:', data.error)
      }
    } catch (err) {
      console.error('获取用户奖励列表失败:', err)
    }
  }

  // 获取用户积分
  const fetchUserPoints = async () => {
    if (!session?.user?.id && !userId) return

    try {
      const response = await fetch(`/api/gamification/profile`)
      const data = await response.json()

      if (data.success) {
        setUserPoints(data.data.points)
      } else {
        console.error('获取用户积分失败:', data.error)
      }
    } catch (err) {
      console.error('获取用户积分失败:', err)
    }
  }

  // 兑换奖励
  const claimReward = async (rewardItemId: string) => {
    if (!session?.user?.id && !userId) {
      setError('请先登录')
      return
    }

    try {
      setClaiming(rewardItemId)
      setError(null)
      setSuccess(null)

      const response = await fetch('/api/gamification/rewards/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rewardItemId })
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(data.data.message)
        // 重新获取数据
        await fetchRewardItems()
        await fetchUserRewards()
        await fetchUserPoints() // 更新用户积分
      } else {
        setError(data.error || '兑换奖励失败')
      }
    } catch (err) {
      setError('兑换奖励失败')
      console.error('兑换奖励失败:', err)
    } finally {
      setClaiming(null)
    }
  }

  // 检查用户是否已经兑换了某个奖励
  const hasClaimedReward = (rewardItemId: string) => {
    return userRewards.some(
      reward => 
        reward.rewardItemId === rewardItemId && 
        reward.status !== RewardStatus.CANCELLED
    )
  }

  // 获取奖励类别显示名称
  const getCategoryDisplayName = (category: RewardCategory) => {
    const categoryNames = {
      [RewardCategory.VIRTUAL_GOODS]: '虚拟商品',
      [RewardCategory.PHYSICAL_GOODS]: '实物商品',
      [RewardCategory.DISCOUNT]: '折扣券',
      [RewardCategory.PREMIUM_FEATURE]: '高级功能',
      [RewardCategory.CUSTOMIZATION]: '自定义选项',
      [RewardCategory.BADGE]: '徽章',
      [RewardCategory.EXPERIENCE]: '经验值加成'
    }
    return categoryNames[category] || category
  }

  // 获取奖励类型显示名称
  const getTypeDisplayName = (type: RewardType) => {
    const typeNames = {
      [RewardType.ONE_TIME]: '一次性',
      [RewardType.RECURRING]: '定期',
      [RewardType.PERMANENT]: '永久',
      [RewardType.LIMITED]: '限时'
    }
    return typeNames[type] || type
  }

  // 初始化加载数据
  useEffect(() => {
    fetchRewardItems()
    if (session?.user?.id || userId) {
      fetchUserRewards()
      fetchUserPoints()
    }
  }, [filters, session, userId])

  // 处理筛选条件变化
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // 重置页码
    }))
  }

  // 处理分页
  const handlePageChange = (page: number) => {
    setFilters(prev => ({
      ...prev,
      page
    }))
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        className="mb-8 text-center"
        {...animations.fadeIn(500)}
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2" style={textEffects.gradient(['#3B82F6', '#8B5CF6'])}>
          奖励商店
        </h1>
        <p className="text-gray-600">使用您的积分兑换各种奖励</p>
      </motion.div>

      {/* 用户积分显示 */}
      {(session?.user?.id || userId) && (
        <motion.div
          className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border border-yellow-200"
          {...animations.slideIn('up', 400)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Wallet className="h-5 w-5 text-yellow-600 mr-2" />
              <span className="text-sm font-medium text-gray-700">我的积分</span>
            </div>
            <div className="flex items-center">
              <Coins className="h-5 w-5 text-yellow-500 mr-1" />
              <span className="text-xl font-bold text-yellow-600">{userPoints}</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* 错误和成功消息 */}
      {error && (
        <motion.div
          className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg"
          {...animations.slideIn('up', 300)}
        >
          {error}
        </motion.div>
      )}
      {success && (
        <motion.div
          className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg"
          {...animations.slideIn('up', 300)}
        >
          {success}
        </motion.div>
      )}

      {/* 筛选栏 */}
      <motion.div
        className="mb-6 p-4 bg-gray-50 rounded-lg"
        {...animations.slideIn('up', 400)}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              奖励类别
            </label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md"
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <option value="">全部类别</option>
              {Object.values(RewardCategory).map(category => (
                <option key={category} value={category}>
                  {getCategoryDisplayName(category)}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              奖励类型
            </label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md"
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
            >
              <option value="">全部类型</option>
              {Object.values(RewardType).map(type => (
                <option key={type} value={type}>
                  {getTypeDisplayName(type)}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              搜索
            </label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="搜索奖励..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              排序
            </label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md"
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-')
                handleFilterChange('sortBy', sortBy)
                handleFilterChange('sortOrder', sortOrder)
              }}
            >
              <option value="createdAt-desc">最新发布</option>
              <option value="createdAt-asc">最早发布</option>
              <option value="price-asc">价格从低到高</option>
              <option value="price-desc">价格从高到低</option>
              <option value="name-asc">名称 A-Z</option>
              <option value="name-desc">名称 Z-A</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* 奖励物品列表 */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">加载中...</p>
        </div>
      ) : (
        <>
          {rewardItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">暂无奖励物品</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {rewardItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  className={cn(
                    "bg-white rounded-lg shadow-md overflow-hidden border border-gray-200",
                    cardEffects.hover,
                    cardEffects.glowBorder("#3B82F6")
                  )}
                  {...animations.slideIn('up', 500 + index * 100)}
                  whileHover={{
                    y: -5,
                    transition: { duration: 0.2 }
                  }}
                >
                  <div className="p-4">
                    {item.icon && (
                      <div className="flex justify-center mb-4">
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Image
                            src={item.icon}
                            alt={item.name}
                            width={64}
                            height={64}
                            className="rounded-lg"
                          />
                        </motion.div>
                      </div>
                    )}
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {item.name}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {item.description}
                    </p>
                    
                    <div className="flex justify-between items-center mb-4">
                      <span className={cn(
                        "text-xs px-2 py-1 rounded",
                        item.category === RewardCategory.VIRTUAL_GOODS ? "bg-blue-100 text-blue-800" :
                        item.category === RewardCategory.PHYSICAL_GOODS ? "bg-green-100 text-green-800" :
                        item.category === RewardCategory.DISCOUNT ? "bg-yellow-100 text-yellow-800" :
                        item.category === RewardCategory.PREMIUM_FEATURE ? "bg-purple-100 text-purple-800" :
                        item.category === RewardCategory.CUSTOMIZATION ? "bg-pink-100 text-pink-800" :
                        item.category === RewardCategory.BADGE ? "bg-indigo-100 text-indigo-800" :
                        "bg-orange-100 text-orange-800"
                      )}>
                        {getCategoryDisplayName(item.category)}
                      </span>
                      <span className={cn(
                        "text-xs px-2 py-1 rounded",
                        item.type === RewardType.ONE_TIME ? "bg-gray-100 text-gray-800" :
                        item.type === RewardType.RECURRING ? "bg-blue-100 text-blue-800" :
                        item.type === RewardType.PERMANENT ? "bg-green-100 text-green-800" :
                        "bg-red-100 text-red-800"
                      )}>
                        {getTypeDisplayName(item.type)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center">
                        <Coins className="h-4 w-4 text-yellow-500 mr-1" />
                        <span className={cn(
                          "text-lg font-bold",
                          userPoints < item.price ? "text-red-600" : "text-blue-600"
                        )}>
                          {item.price}
                        </span>
                      </div>
                      
                      <motion.button
                        onClick={() => claimReward(item.id)}
                        disabled={claiming === item.id || hasClaimedReward(item.id) || userPoints < item.price}
                        className={cn(
                          "px-4 py-2 rounded-md text-sm font-medium",
                          claiming === item.id || hasClaimedReward(item.id) || userPoints < item.price
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : buttonEffects.gradient(["#3B82F6", "#8B5CF6"])
                        )}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {claiming === item.id ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                            兑换中...
                          </div>
                        ) : hasClaimedReward(item.id) ? (
                          <div className="flex items-center">
                            <Check className="h-3 w-3 mr-1" />
                            已兑换
                          </div>
                        ) : userPoints < item.price ? (
                          <div className="flex items-center">
                            <Coins className="h-3 w-3 mr-1" />
                            积分不足
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <Gift className="h-3 w-3 mr-1" />
                            兑换
                          </div>
                        )}
                      </motion.button>
                    </div>
                    
                    {item.stock > 0 && item.stock < 10 && (
                      <motion.div
                        className="flex items-center text-xs text-orange-600 mt-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <Clock className="h-3 w-3 mr-1" />
                        仅剩 {item.stock} 件
                      </motion.div>
                    )}
                    
                    {item.expiresAt && (
                      <motion.div
                        className="flex items-center text-xs text-gray-500 mt-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <Calendar className="h-3 w-3 mr-1" />
                        有效期至: {new Date(item.expiresAt).toLocaleDateString()}
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}

      {/* 分页 */}
      {pagination.totalPages > 1 && (
        <motion.div
          className="mt-8 flex justify-center"
          {...animations.slideIn('up', 600)}
        >
          <div className="flex space-x-2">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page, index) => (
              <motion.button
                key={page}
                onClick={() => handlePageChange(page)}
                className={cn(
                  "px-3 py-1 rounded-md",
                  page === pagination.page
                    ? buttonEffects.gradient(["#3B82F6", "#8B5CF6"]) + " text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                )}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                {...animations.slideIn('up', 700 + index * 50)}
              >
                {page}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}