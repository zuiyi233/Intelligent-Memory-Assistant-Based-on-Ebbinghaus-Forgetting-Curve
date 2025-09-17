import { NextRequest, NextResponse } from 'next/server'
import { gamificationService } from '@/services/gamification.service'
import { RewardCategory, RewardType } from '@/types'

/**
 * 获取奖励物品列表
 * GET /api/gamification/rewards
 */
export async function GET(request: NextRequest) {
  try {
    // 获取查询参数
    const searchParams = request.nextUrl.searchParams
    
    const category = searchParams.get('category') as RewardCategory | undefined
    const type = searchParams.get('type') as RewardType | undefined
    const isActive = searchParams.get('isActive') === 'false' ? false : true
    const minPrice = searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')!) : undefined
    const maxPrice = searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : undefined
    const search = searchParams.get('search') || undefined
    const sortBy = (searchParams.get('sortBy') as 'createdAt' | 'price' | 'name') || 'createdAt'
    const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // 调用服务获取奖励物品列表
    const result = await gamificationService.getRewardItems({
      category,
      type,
      isActive,
      minPrice,
      maxPrice,
      search,
      sortBy,
      sortOrder,
      page,
      limit
    })

    return NextResponse.json({
      success: true,
      data: result
    })
  } catch (error) {
    console.error('获取奖励物品列表失败:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '获取奖励物品列表失败'
      },
      { status: 500 }
    )
  }
}