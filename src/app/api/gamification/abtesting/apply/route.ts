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

export const POST = withErrorHandler(async (request: NextRequest) => {
  const { userId, testId } = await request.json()
  
  // 验证必需参数
  const validation = validateRequiredParams({ userId, testId }, ['userId', 'testId'])
  if (!validation.valid) {
    return validation.error!
  }

  const config = await abTestingService.applyTestVariant(userId, testId)
  
  if (!config) {
    return errorResponse(
      ErrorCodes.ASSIGNMENT_FAILED,
      '应用测试变体配置失败',
      400
    )
  }

  return successResponse(config)
})