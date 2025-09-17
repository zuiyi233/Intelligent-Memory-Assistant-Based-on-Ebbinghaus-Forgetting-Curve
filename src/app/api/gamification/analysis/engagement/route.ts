import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')

    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // 获取每日活跃用户数据
    const dailyActiveUsersData = await prisma.$queryRaw`
      SELECT 
        DATE(reviewTime) as date,
        COUNT(DISTINCT userId) as dailyActiveUsers
      FROM Review
      WHERE reviewTime BETWEEN ${startDate} AND ${endDate}
      GROUP BY DATE(reviewTime)
      ORDER BY date ASC
    ` as Array<{ date: string; dailyActiveUsers: number }>

    // 获取会话时长数据（这里使用模拟数据，因为实际项目中可能需要通过用户行为日志计算）
    const sessionDurationData = dailyActiveUsersData.map(item => ({
      ...item,
      sessionDuration: Math.random() * 30 + 10 // 模拟10-40分钟的会话时长
    }))

    // 获取会话频率数据（这里使用模拟数据）
    const sessionFrequencyData = sessionDurationData.map(item => ({
      ...item,
      sessionFrequency: Math.random() * 3 + 1 // 模拟1-4次的会话频率
    }))

    // 获取功能使用分布数据
    const featureUsageData = await Promise.all([
      // 创建记忆功能使用
      prisma.memoryContent.count({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        }
      }),
      // 复习功能使用
      prisma.review.count({
        where: {
          reviewTime: {
            gte: startDate,
            lte: endDate
          }
        }
      }),
      // 成就系统使用
      prisma.userAchievement.count({
        where: {
          unlockedAt: {
            gte: startDate,
            lte: endDate
          }
        }
      }),
      // 挑战系统使用
      prisma.userChallenge.count({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        }
      }),
      // 奖励系统使用
      prisma.pointTransaction.count({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        }
      })
    ])

    const featureUsage = {
      '创建记忆': featureUsageData[0],
      '复习记忆': featureUsageData[1],
      '成就系统': featureUsageData[2],
      '挑战系统': featureUsageData[3],
      '奖励系统': featureUsageData[4]
    }

    // 组合最终数据
    const result = sessionFrequencyData.map(item => ({
      date: item.date,
      dailyActiveUsers: item.dailyActiveUsers,
      sessionDuration: item.sessionDuration,
      sessionFrequency: item.sessionFrequency,
      featureUsage
    }))

    return NextResponse.json(result)
  } catch (error) {
    console.error('获取用户参与度数据失败:', error)
    return NextResponse.json(
      { error: '获取用户参与度数据失败' },
      { status: 500 }
    )
  }
}