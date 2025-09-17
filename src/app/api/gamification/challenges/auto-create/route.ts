import { NextRequest, NextResponse } from 'next/server'
import { gamificationService } from '@/services/gamification.service'
import { isPrismaInitialized } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    // 检查数据库连接是否已初始化
    if (!isPrismaInitialized()) {
      return NextResponse.json(
        {
          success: false,
          error: '数据库连接失败',
          message: '数据库连接未正确初始化，请稍后重试'
        },
        { status: 500 }
      )
    }

    const { userId, date } = await request.json()
    
    // 验证必需参数
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: '缺少用户ID',
          message: '用户ID是必需的参数'
        },
        { status: 400 }
      )
    }
    
    // 如果没有指定日期，默认为今天
    const targetDate = date ? new Date(date) : new Date()
    
    // 验证日期格式
    if (isNaN(targetDate.getTime())) {
      return NextResponse.json(
        {
          success: false,
          error: '日期格式无效',
          message: '请提供有效的日期格式'
        },
        { status: 400 }
      )
    }
    
    // 创建每日挑战
    let challenges
    try {
      challenges = await gamificationService.createDailyChallenges(targetDate, userId)
    } catch (error) {
      console.error('创建每日挑战失败:', error)
      return NextResponse.json(
        {
          success: false,
          error: '创建每日挑战失败',
          message: error instanceof Error ? error.message : '创建每日挑战时发生未知错误'
        },
        { status: 500 }
      )
    }
    
    // 验证挑战创建结果
    if (!challenges || challenges.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: '挑战创建失败',
          message: '未能创建任何挑战，请检查系统配置'
        },
        { status: 500 }
      )
    }
    
    // 如果提供了用户ID，自动为用户分配挑战
    if (userId) {
      try {
        await gamificationService.assignDailyChallengesToUser(userId, targetDate)
      } catch (assignmentError) {
        console.error('分配挑战给用户失败:', assignmentError)
        // 即使分配失败，也返回创建的挑战，但添加警告信息
        return NextResponse.json({
          success: true,
          challenges,
          message: `成功创建 ${challenges.length} 个每日挑战，但分配给用户时出现问题`,
          date: targetDate,
          warning: '挑战已创建但可能未正确分配给用户'
        })
      }
    }
    
    return NextResponse.json({
      success: true,
      challenges,
      message: `成功创建 ${challenges.length} 个每日挑战`,
      date: targetDate
    })
  } catch (error) {
    console.error('自动创建每日挑战失败:', error)
    
    // 根据错误类型提供更具体的错误信息
    let errorMessage = '自动创建每日挑战失败'
    if (error instanceof Error) {
      errorMessage = error.message
      
      // 检查常见错误并提供更友好的错误信息
      if (errorMessage.includes('database') || errorMessage.includes('prisma')) {
        errorMessage = '数据库连接失败，请稍后重试'
      } else if (errorMessage.includes('validation')) {
        errorMessage = '数据验证失败，请检查输入参数'
      } else if (errorMessage.includes('permission') || errorMessage.includes('unauthorized')) {
        errorMessage = '权限不足，无法执行此操作'
      }
    }
    
    return NextResponse.json(
      {
        success: false,
        error: '自动创建每日挑战失败',
        message: errorMessage
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const dateParam = searchParams.get('date')
    
    // 如果没有指定日期，默认为今天
    const targetDate = dateParam ? new Date(dateParam) : new Date()
    
    // 验证日期格式
    if (isNaN(targetDate.getTime())) {
      return NextResponse.json(
        {
          success: false,
          error: '日期格式无效',
          message: '请提供有效的日期格式'
        },
        { status: 400 }
      )
    }
    
    // 创建每日挑战
    const challenges = await gamificationService.createDailyChallenges(targetDate, userId || undefined)
    
    // 验证挑战创建结果
    if (!challenges || challenges.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: '挑战创建失败',
          message: '未能创建任何挑战，请检查系统配置'
        },
        { status: 500 }
      )
    }
    
    // 如果提供了用户ID，自动为用户分配挑战
    if (userId) {
      try {
        await gamificationService.assignDailyChallengesToUser(userId, targetDate)
      } catch (assignmentError) {
        console.error('分配挑战给用户失败:', assignmentError)
        // 即使分配失败，也返回创建的挑战，但添加警告信息
        return NextResponse.json({
          success: true,
          challenges,
          message: `成功创建 ${challenges.length} 个每日挑战，但分配给用户时出现问题`,
          date: targetDate,
          warning: '挑战已创建但可能未正确分配给用户'
        })
      }
    }
    
    return NextResponse.json({
      success: true,
      challenges,
      message: `成功创建 ${challenges.length} 个每日挑战`,
      date: targetDate
    })
  } catch (error) {
    console.error('自动创建每日挑战失败:', error)
    
    // 根据错误类型提供更具体的错误信息
    let errorMessage = '自动创建每日挑战失败'
    if (error instanceof Error) {
      errorMessage = error.message
      
      // 检查常见错误并提供更友好的错误信息
      if (errorMessage.includes('database') || errorMessage.includes('prisma')) {
        errorMessage = '数据库连接失败，请稍后重试'
      } else if (errorMessage.includes('validation')) {
        errorMessage = '数据验证失败，请检查输入参数'
      } else if (errorMessage.includes('permission') || errorMessage.includes('unauthorized')) {
        errorMessage = '权限不足，无法执行此操作'
      }
    }
    
    return NextResponse.json(
      {
        success: false,
        error: '自动创建每日挑战失败',
        message: errorMessage
      },
      { status: 500 }
    )
  }
}