import { NextRequest, NextResponse } from 'next/server'
import { abTestingService } from '@/services/abTesting.service'

/**
 * 批量分配用户到测试变体
 * 接受一个用户ID和测试ID的数组，并为这些用户分配测试变体
 */
export async function POST(request: NextRequest) {
  try {
    const batchAssignments = await request.json() as Array<{
      userId: string
      testId: string
    }>
    
    if (!Array.isArray(batchAssignments) || batchAssignments.length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: '请求体必须是非空的用户分配数组'
          },
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      )
    }

    // 验证每个分配请求
    const validationErrors: string[] = []
    batchAssignments.forEach((assignment, index) => {
      if (!assignment.userId || !assignment.testId) {
        validationErrors.push(`分配请求 ${index + 1}: 缺少用户ID或测试ID`)
      }
    })

    if (validationErrors.length > 0) {
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '分配请求验证失败',
            details: validationErrors
          },
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      )
    }

    // 批量分配用户
    const successfulAssignments: Array<{
      userId: string
      testId: string
      variantId: string
    }> = []
    const failedAssignments: Array<{
      index: number
      userId: string
      testId: string
      error: string
    }> = []

    for (let i = 0; i < batchAssignments.length; i++) {
      const { userId, testId } = batchAssignments[i]
      try {
        const variantId = await abTestingService.assignUserToTestVariant(userId, testId)
        if (variantId) {
          successfulAssignments.push({ userId, testId, variantId })
        } else {
          failedAssignments.push({
            index: i + 1,
            userId,
            testId,
            error: '分配失败，可能用户不符合测试条件或测试未激活'
          })
        }
      } catch (error) {
        console.error(`分配用户 ${userId} 到测试 ${testId} 失败:`, error)
        failedAssignments.push({
          index: i + 1,
          userId,
          testId,
          error: error instanceof Error ? error.message : '未知错误'
        })
      }
    }

    // 返回分配结果
    return NextResponse.json({
      success: true,
      data: {
        successfulAssignments,
        failedAssignments,
        totalRequested: batchAssignments.length,
        totalSuccessful: successfulAssignments.length,
        totalFailed: failedAssignments.length
      },
      message: `批量分配用户完成，成功分配 ${successfulAssignments.length} 个用户`,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('批量分配用户失败:', error)
    return NextResponse.json(
      { 
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '批量分配用户失败',
          details: error instanceof Error ? error.message : '未知错误'
        },
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

/**
 * 批量获取用户的测试分配情况
 * 接受一个用户ID数组，返回这些用户的所有测试分配情况
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userIdsParam = searchParams.get('userIds')
    
    if (!userIdsParam) {
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: '缺少用户ID参数'
          },
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      )
    }

    const userIds = userIdsParam.split(',')
    
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: '用户ID参数必须是非空的数组'
          },
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      )
    }

    // 批量获取用户分配情况
    const userAssignments: Array<{
      userId: string
      assignments: Record<string, string>
    }> = []
    const failedUsers: Array<{
      userId: string
      error: string
    }> = []

    for (const userId of userIds) {
      try {
        const assignments = await abTestingService.getUserTestAssignments(userId)
        userAssignments.push({ userId, assignments })
      } catch (error) {
        console.error(`获取用户 ${userId} 的分配情况失败:`, error)
        failedUsers.push({
          userId,
          error: error instanceof Error ? error.message : '未知错误'
        })
      }
    }

    // 返回获取结果
    return NextResponse.json({
      success: true,
      data: {
        userAssignments,
        failedUsers,
        totalRequested: userIds.length,
        totalSuccessful: userAssignments.length,
        totalFailed: failedUsers.length
      },
      message: `批量获取用户分配情况完成，成功获取 ${userAssignments.length} 个用户的分配信息`,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('批量获取用户分配情况失败:', error)
    return NextResponse.json(
      { 
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: '批量获取用户分配情况失败',
          details: error instanceof Error ? error.message : '未知错误'
        },
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}