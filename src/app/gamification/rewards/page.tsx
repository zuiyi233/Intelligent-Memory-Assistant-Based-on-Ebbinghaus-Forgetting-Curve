'use client'

import { useState } from 'react'
import RewardStore from '@/components/gamification/RewardStore'
import UserRewards from '@/components/gamification/UserRewards'
import { useSession } from 'next-auth/react'

export default function RewardsPage() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState<'store' | 'my-rewards'>('store')

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('store')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'store'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              奖励商店
            </button>
            <button
              onClick={() => setActiveTab('my-rewards')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'my-rewards'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              我的奖励
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {activeTab === 'store' && (
          <RewardStore userId={session?.user?.id} />
        )}
        {activeTab === 'my-rewards' && (
          <UserRewards userId={session?.user?.id} />
        )}
      </div>
    </div>
  )
}