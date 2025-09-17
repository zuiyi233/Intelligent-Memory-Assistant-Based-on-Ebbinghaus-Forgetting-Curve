import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')

    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // 获取新增用户数
    const newUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      }
    })

    // 获取留存用户数（在指定时间段内有活动的用户）
    const retainedUsers = await prisma.$queryRaw`
      SELECT COUNT(DISTINCT userId) as count
      FROM Review
      WHERE reviewTime BETWEEN ${startDate} AND ${endDate}
      AND userId IN (
        SELECT id 
        FROM User 
        WHERE createdAt < ${startDate}
      )
    ` as Array<{ count: number }>

    const retainedUsersCount = retainedUsers[0]?.count || 0

    // 计算留存率
    const totalUsersBeforePeriod = await prisma.user.count({
      where: {
        createdAt: {
          lt: startDate
        }
      }
    })

    const retentionRate = totalUsersBeforePeriod > 0 
      ? retainedUsersCount / totalUsersBeforePeriod 
      : 0

    // 生成群组留存数据
    const cohortData = await generateCohortData(startDate, endDate)

    const result = {
      period: days === 7 ? '7天' : days === 30 ? '30天' : '90天',
      newUsers,
      retainedUsers: retainedUsersCount,
      retentionRate,
      cohortData
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('获取留存率数据失败:', error)
    return NextResponse.json(
      { error: '获取留存率数据失败' },
      { status: 500 }
    )
  }
}

// 生成群组留存数据
async function generateCohortData(startDate: Date, endDate: Date) {
  // 获取最近几个批次的用户群组
  const cohorts = await prisma.$queryRaw`
    SELECT 
      DATE_TRUNC('week', createdAt) as cohort,
      COUNT(*) as userCount
    FROM User
    WHERE createdAt BETWEEN ${new Date(startDate.getTime() - 90 * 24 * 60 * 60 * 1000)} AND ${endDate}
    GROUP BY DATE_TRUNC('week', createdAt)
    ORDER BY cohort DESC
    LIMIT 5
  ` as Array<{ cohort: string; userCount: number }>

  const cohortData = []

  for (const cohort of cohorts) {
    const cohortDate = new Date(cohort.cohort)
    const day7Date = new Date(cohortDate.getTime() + 7 * 24 * 60 * 60 * 1000)
    const day30Date = new Date(cohortDate.getTime() + 30 * 24 * 60 * 60 * 1000)
    const day90Date = new Date(cohortDate.getTime() + 90 * 24 * 60 * 60 * 1000)

    // 计算1日留存率
    const day1Users = await prisma.$queryRaw`
      SELECT COUNT(DISTINCT userId) as count
      FROM Review
      WHERE reviewTime BETWEEN ${cohortDate} AND ${new Date(cohortDate.getTime() + 1 * 24 * 60 * 60 * 1000)}
      AND userId IN (
        SELECT id 
        FROM User 
        WHERE createdAt >= ${cohortDate} 
        AND createdAt < ${new Date(cohortDate.getTime() + 7 * 24 * 60 * 60 * 1000)}
      )
    ` as Array<{ count: number }>

    // 计算7日留存率
    const day7Users = await prisma.$queryRaw`
      SELECT COUNT(DISTINCT userId) as count
      FROM Review
      WHERE reviewTime BETWEEN ${day7Date} AND ${new Date(day7Date.getTime() + 1 * 24 * 60 * 60 * 1000)}
      AND userId IN (
        SELECT id 
        FROM User 
        WHERE createdAt >= ${cohortDate} 
        AND createdAt < ${new Date(cohortDate.getTime() + 7 * 24 * 60 * 60 * 1000)}
      )
    ` as Array<{ count: number }>

    // 计算30日留存率
    const day30Users = await prisma.$queryRaw`
      SELECT COUNT(DISTINCT userId) as count
      FROM Review
      WHERE reviewTime BETWEEN ${day30Date} AND ${new Date(day30Date.getTime() + 1 * 24 * 60 * 60 * 1000)}
      AND userId IN (
        SELECT id 
        FROM User 
        WHERE createdAt >= ${cohortDate} 
        AND createdAt < ${new Date(cohortDate.getTime() + 7 * 24 * 60 * 60 * 1000)}
      )
    ` as Array<{ count: number }>

    // 计算90日留存率
    const day90Users = await prisma.$queryRaw`
      SELECT COUNT(DISTINCT userId) as count
      FROM Review
      WHERE reviewTime BETWEEN ${day90Date} AND ${new Date(day90Date.getTime() + 1 * 24 * 60 * 60 * 1000)}
      AND userId IN (
        SELECT id 
        FROM User 
        WHERE createdAt >= ${cohortDate} 
        AND createdAt < ${new Date(cohortDate.getTime() + 7 * 24 * 60 * 60 * 1000)}
      )
    ` as Array<{ count: number }>

    const day1Retention = cohort.userCount > 0 ? (day1Users[0]?.count || 0) / cohort.userCount : 0
    const day7Retention = cohort.userCount > 0 ? (day7Users[0]?.count || 0) / cohort.userCount : 0
    const day30Retention = cohort.userCount > 0 ? (day30Users[0]?.count || 0) / cohort.userCount : 0
    const day90Retention = cohort.userCount > 0 ? (day90Users[0]?.count || 0) / cohort.userCount : 0

    cohortData.push({
      cohort: cohortDate.toLocaleDateString('zh-CN'),
      day1: parseFloat(day1Retention.toFixed(2)),
      day7: parseFloat(day7Retention.toFixed(2)),
      day30: parseFloat(day30Retention.toFixed(2)),
      day90: parseFloat(day90Retention.toFixed(2))
    })
  }

  return cohortData
}