import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// 社交平台类型
type SocialPlatform = 'wechat' | 'weibo' | 'qq' | 'twitter' | 'facebook' | 'instagram' | 'linkedin' | 'douyin'

// 分享内容类型
type ShareContentType = 'achievement' | 'badge' | 'profile' | 'progress' | 'leaderboard'

// 分享记录创建请求
interface CreateShareRecordRequest {
  platform: SocialPlatform
  contentType: ShareContentType
  contentId: string
  shareText: string
  shareImage?: string
}

export async function POST(request: NextRequest) {
  try {
    // 获取用户会话
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      )
    }
    
    const userId = session.user.id
    const body: CreateShareRecordRequest = await request.json()
    
    // 验证请求体
    const { platform, contentType, contentId, shareText, shareImage } = body
    
    if (!platform || !contentType || !contentId || !shareText) {
      return NextResponse.json(
        { error: '缺少必要的参数' },
        { status: 400 }
      )
    }
    
    // 创建分享记录
    const shareRecord = await prisma.socialShare.create({
      data: {
        userId,
        platform,
        contentType,
        contentId,
        shareText,
        shareImage,
        sharedAt: new Date()
      }
    })
    
    return NextResponse.json({
      success: true,
      data: shareRecord,
      message: '分享记录已创建'
    })
  } catch (error) {
    console.error('创建分享记录失败:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // 获取用户会话
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '未授权访问' },
        { status: 401 }
      )
    }
    
    const userId = session.user.id
    
    // 获取查询参数
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const contentType = searchParams.get('contentType') as ShareContentType | null
    const platform = searchParams.get('platform') as SocialPlatform | null
    
    // 构建查询条件
    const where: Record<string, unknown> = {
      userId
    }
    
    if (contentType) {
      where.contentType = contentType
    }
    
    if (platform) {
      where.platform = platform
    }
    
    // 计算分页
    const skip = (page - 1) * limit
    
    // 获取分享记录
    const [shares, total] = await Promise.all([
      prisma.socialShare.findMany({
        where,
        orderBy: {
          sharedAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.socialShare.count({ where })
    ])
    
    // 计算统计数据
    const stats = await prisma.socialShare.groupBy({
      by: ['platform'],
      where: { userId },
      _count: {
        platform: true
      }
    })
    
    const contentTypeStats = await prisma.socialShare.groupBy({
      by: ['contentType'],
      where: { userId },
      _count: {
        contentType: true
      }
    })
    
    return NextResponse.json({
      success: true,
      data: {
        shares,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        },
        stats: {
          platformStats: stats.reduce((acc: Record<string, number>, stat: { platform: string; _count: { platform: number } }) => {
            acc[stat.platform] = stat._count.platform
            return acc
          }, {} as Record<string, number>),
          contentTypeStats: contentTypeStats.reduce((acc: Record<string, number>, stat: { contentType: string; _count: { contentType: number } }) => {
            acc[stat.contentType] = stat._count.contentType
            return acc
          }, {} as Record<string, number>)
        }
      }
    })
  } catch (error) {
    console.error('获取分享记录失败:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
}