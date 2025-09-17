import { NextRequest, NextResponse } from 'next/server'
import { abTestingService } from '@/services/abTesting.service'
import {
  successResponse,
  errorResponse,
  ErrorCodes,
  ErrorMessages,
  validateRequiredParams,
  withErrorHandler
} from '@/lib/apiResponse'

// 为用户分配测试变体
export const POST = withErrorHandler(async (request: NextRequest) => {
  const { userId, testId } = await request.json()
  
  // 验证必需参数
  const validation = validateRequiredParams({ userId, testId }, ['userId', 'testId'])
  if (!validation.valid) {
    return validation.error!
  }

  const variantId = await abTestingService.assignUserToTestVariant(userId, testId)
  
  if (!variantId) {
    return errorResponse(
      ErrorCodes.ASSIGNMENT_FAILED,
      ErrorMessages[ErrorCodes.ASSIGNMENT_FAILED],
      400
    )
  }

  return successResponse({ variantId })
})

// 获取用户的测试变体分配
export const GET = withErrorHandler(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  const testId = searchParams.get('testId')
  
  // 验证必需参数
  const validation = validateRequiredParams({ userId }, ['userId'])
  if (!validation.valid) {
    return validation.error!
  }

  if (testId) {
    // 获取指定测试的变体分配
    const variantId = await abTestingService.getUserTestVariant(userId as string, testId)
    return successResponse({ variantId })
  } else {
    // 获取所有测试的变体分配
    const assignments = await abTestingService.getUserTestAssignments(userId as string)
    return successResponse(assignments)
  }
})