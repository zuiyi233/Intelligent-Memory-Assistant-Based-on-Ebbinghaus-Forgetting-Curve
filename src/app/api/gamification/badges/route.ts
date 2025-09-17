import { NextRequest, NextResponse } from 'next/server'
import { prisma, isPrismaInitialized } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { AchievementType, Achievement, UserAchievement } from '@prisma/client'
import { gamificationService } from '@/services/gamification.service'

// 获取用户的所有徽章数据
export async function GET(request: NextRequest) {
  try {
    // 检查 Prisma 客户端是否已正确初始化
    if (!isPrismaInitialized()) {
      console.error('Prisma client is not properly initialized')
      return NextResponse.json({
        error: '数据库连接未初始化，请检查数据库配置'
      }, { status: 500 })
    }
    
    const session = await getServerSession(authOptions)
    
    console.log('调试 - Session 信息:', JSON.stringify(session, null, 2))
    
    if (!session?.user?.id) {
      console.error('调试 - 未授权: session 或 session.user 或 session.user.id 为空')
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }
    
    const userId = session.user.id
    console.log('调试 - 用户 ID:', userId)
    
    // 获取所有可用的成就
    const achievements = await prisma.achievement.findMany({
      orderBy: [
        { points: 'desc' }
      ]
    })
    
    // 获取用户的成就进度
    const userAchievements = await prisma.userAchievement.findMany({
      where: {
        userId
      },
      include: {
        achievement: true
      }
    })
    
    // 合并数据，为每个成就添加用户进度信息
    const badgesWithProgress = achievements.map((achievement: Achievement) => {
      const userAchievement = userAchievements.find((ua: UserAchievement) => ua.achievementId === achievement.id)
      
      // 根据积分确定稀有度
      let rarity = 'COMMON'
      if (achievement.points >= 500) rarity = 'LEGENDARY'
      else if (achievement.points >= 300) rarity = 'EPIC'
      else if (achievement.points >= 100) rarity = 'RARE'
      
      // 确定徽章状态
      let status = 'LOCKED'
      if (userAchievement) {
        status = userAchievement.progress >= 100 ? 'UNLOCKED' : 'IN_PROGRESS'
      }
      
      return {
        ...achievement,
        userAchievement,
        rarity,
        status,
        progress: userAchievement?.progress || 0
      }
    })
    
    // 按类别分组徽章
    const badgesByCategory = {
      ALL: badgesWithProgress,
      REVIEW: badgesWithProgress.filter((badge) => badge.category === 'REVIEW'),
      STREAK: badgesWithProgress.filter((badge) => badge.category === 'STREAK'),
      LEVEL: badgesWithProgress.filter((badge) => badge.category === 'LEVEL'),
      POINTS: badgesWithProgress.filter((badge) => badge.category === 'POINTS'),
      CHALLENGE: badgesWithProgress.filter((badge) => badge.category === 'CHALLENGE' || badge.type === AchievementType.SPECIAL)
    }
    
    // 统计数据
    const stats = {
      totalBadges: achievements.length,
      unlockedBadges: badgesWithProgress.filter((badge) => badge.status === 'UNLOCKED').length,
      inProgressBadges: badgesWithProgress.filter((badge) => badge.status === 'IN_PROGRESS').length,
      lockedBadges: badgesWithProgress.filter((badge) => badge.status === 'LOCKED').length,
      totalPoints: badgesWithProgress
        .filter((badge) => badge.status === 'UNLOCKED')
        .reduce((sum: number, badge) => sum + badge.points, 0),
      rareBadges: badgesWithProgress.filter((badge) => badge.status === 'UNLOCKED' && badge.rarity === 'RARE').length,
      epicBadges: badgesWithProgress.filter((badge) => badge.status === 'UNLOCKED' && badge.rarity === 'EPIC').length,
      legendaryBadges: badgesWithProgress.filter((badge) => badge.status === 'UNLOCKED' && badge.rarity === 'LEGENDARY').length
    }
    
    return NextResponse.json({
      badges: badgesWithProgress,
      badgesByCategory,
      stats
    })
  } catch (error) {
    console.error('获取徽章数据失败:', error)
    
    // 提供更详细的错误信息
    let errorMessage = '服务器错误'
    if (error instanceof Error) {
      if (error.message.includes('DATABASE_URL environment variable is not defined')) {
        errorMessage = '数据库连接配置错误：未找到数据库连接字符串'
      } else if (error.message.includes('Failed to initialize Prisma client')) {
        errorMessage = '数据库连接失败：请检查数据库服务是否正常运行'
      } else if (error.message.includes('connection')) {
        errorMessage = '数据库连接失败：请检查数据库服务是否正常运行'
      }
    }
    
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}