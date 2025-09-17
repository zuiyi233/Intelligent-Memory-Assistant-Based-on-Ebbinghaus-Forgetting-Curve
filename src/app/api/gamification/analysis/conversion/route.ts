import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')

    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // 获取总用户数
    const totalUsers = await prisma.user.count({
      where: {
        createdAt: {
          lte: endDate
        }
      }
    })

    // 获取转化用户数（完成至少一个挑战或解锁至少一个成就的用户）
    const convertedUsers = await prisma.$queryRaw`
      SELECT COUNT(DISTINCT u.id) as count
      FROM User u
      WHERE EXISTS (
        SELECT 1 FROM UserAchievement ua WHERE ua.userId = u.id AND ua.unlockedAt <= ${endDate}
      ) OR EXISTS (
        SELECT 1 FROM UserChallenge uc WHERE uc.userId = u.id AND uc.completed = true AND uc.completedAt <= ${endDate}
      )
    ` as Array<{ count: number }>

    const convertedUsersCount = convertedUsers[0]?.count || 0

    // 计算转化率
    const conversionRate = totalUsers > 0 ? convertedUsersCount / totalUsers : 0

    // 生成转化漏斗数据
    const funnelData = await generateFunnelData(startDate, endDate)

    // 生成功能转化数据
    const featureConversion = await generateFeatureConversionData(startDate, endDate)

    const result = {
      period: days === 7 ? '7天' : days === 30 ? '30天' : '90天',
      totalUsers,
      convertedUsers: convertedUsersCount,
      conversionRate,
      funnelData,
      featureConversion
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('获取转化率数据失败:', error)
    return NextResponse.json(
      { error: '获取转化率数据失败' },
      { status: 500 }
    )
  }
}

// 生成转化漏斗数据
async function generateFunnelData(startDate: Date, endDate: Date) {
  // 获取注册用户数
  const registeredUsers = await prisma.user.count({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    }
  })

  // 获取活跃用户数（至少有一次复习记录）
  const activeUsers = await prisma.$queryRaw`
    SELECT COUNT(DISTINCT userId) as count
    FROM Review
    WHERE reviewTime BETWEEN ${startDate} AND ${endDate}
  ` as Array<{ count: number }>

  // 获取完成复习的用户数
  const completedReviewUsers = await prisma.$queryRaw`
    SELECT COUNT(DISTINCT userId) as count
    FROM Review
    WHERE reviewTime BETWEEN ${startDate} AND ${endDate}
    AND reviewScore >= 3
  ` as Array<{ count: number }>

  // 获取解锁成就的用户数
  const achievementUsers = await prisma.$queryRaw`
    SELECT COUNT(DISTINCT userId) as count
    FROM UserAchievement
    WHERE unlockedAt BETWEEN ${startDate} AND ${endDate}
  ` as Array<{ count: number }>

  // 获取完成挑战的用户数
  const challengeUsers = await prisma.$queryRaw`
    SELECT COUNT(DISTINCT userId) as count
    FROM UserChallenge
    WHERE completed = true
    AND completedAt BETWEEN ${startDate} AND ${endDate}
  ` as Array<{ count: number }>

  return [
    {
      stage: '注册用户',
      users: registeredUsers,
      conversion: 100
    },
    {
      stage: '活跃用户',
      users: activeUsers[0]?.count || 0,
      conversion: registeredUsers > 0 ? ((activeUsers[0]?.count || 0) / registeredUsers) * 100 : 0
    },
    {
      stage: '完成复习',
      users: completedReviewUsers[0]?.count || 0,
      conversion: (activeUsers[0]?.count || 0) > 0 ? ((completedReviewUsers[0]?.count || 0) / (activeUsers[0]?.count || 0)) * 100 : 0
    },
    {
      stage: '解锁成就',
      users: achievementUsers[0]?.count || 0,
      conversion: (completedReviewUsers[0]?.count || 0) > 0 ? ((achievementUsers[0]?.count || 0) / (completedReviewUsers[0]?.count || 0)) * 100 : 0
    },
    {
      stage: '完成挑战',
      users: challengeUsers[0]?.count || 0,
      conversion: (achievementUsers[0]?.count || 0) > 0 ? ((challengeUsers[0]?.count || 0) / (achievementUsers[0]?.count || 0)) * 100 : 0
    }
  ]
}

// 生成功能转化数据
async function generateFeatureConversionData(startDate: Date, endDate: Date) {
  // 获取创建记忆的转化数据
  const memoryImpressions = await prisma.user.count({
    where: {
      createdAt: {
        lte: endDate
      }
    }
  })

  const memoryActions = await prisma.memoryContent.count({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    }
  })

  // 获取复习记忆的转化数据
  const reviewImpressions = await prisma.memoryContent.count({
    where: {
      createdAt: {
        lte: endDate
      }
    }
  })

  const reviewActions = await prisma.review.count({
    where: {
      reviewTime: {
        gte: startDate,
        lte: endDate
      }
    }
  })

  // 获取成就系统的转化数据
  const achievementImpressions = await prisma.user.count({
    where: {
      createdAt: {
        lte: endDate
      }
    }
  })

  const achievementActions = await prisma.userAchievement.count({
    where: {
      unlockedAt: {
        gte: startDate,
        lte: endDate
      }
    }
  })

  // 获取挑战系统的转化数据
  const challengeImpressions = await prisma.user.count({
    where: {
      createdAt: {
        lte: endDate
      }
    }
  })

  const challengeActions = await prisma.userChallenge.count({
    where: {
      completed: true,
      completedAt: {
        gte: startDate,
        lte: endDate
      }
    }
  })

  // 获取奖励系统的转化数据
  const rewardImpressions = await prisma.user.count({
    where: {
      createdAt: {
        lte: endDate
      }
    }
  })

  const rewardActions = await prisma.pointTransaction.count({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    }
  })

  return [
    {
      feature: '创建记忆',
      impressions: memoryImpressions,
      actions: memoryActions,
      conversion: memoryImpressions > 0 ? memoryActions / memoryImpressions : 0
    },
    {
      feature: '复习记忆',
      impressions: reviewImpressions,
      actions: reviewActions,
      conversion: reviewImpressions > 0 ? reviewActions / reviewImpressions : 0
    },
    {
      feature: '成就系统',
      impressions: achievementImpressions,
      actions: achievementActions,
      conversion: achievementImpressions > 0 ? achievementActions / achievementImpressions : 0
    },
    {
      feature: '挑战系统',
      impressions: challengeImpressions,
      actions: challengeActions,
      conversion: challengeImpressions > 0 ? challengeActions / challengeImpressions : 0
    },
    {
      feature: '奖励系统',
      impressions: rewardImpressions,
      actions: rewardActions,
      conversion: rewardImpressions > 0 ? rewardActions / rewardImpressions : 0
    }
  ].sort((a, b) => b.conversion - a.conversion)
}