import { NextRequest, NextResponse } from 'next/server'
import { abTestingService } from '@/services/abTesting.service'
import { ABTestCreateForm } from '@/types'
import {
  successResponse,
  errorResponse,
  ErrorCodes,
  ErrorMessages,
  withErrorHandler
} from '@/lib/apiResponse'

// 获取所有A/B测试
export const GET = withErrorHandler(async (request: NextRequest) => {
  const tests = await abTestingService.getAllABTests()
  return successResponse(tests)
})

// 创建新的A/B测试
export const POST = withErrorHandler(async (request: NextRequest) => {
  const testData = await request.json() as ABTestCreateForm
  
  const newTest = await abTestingService.createABTest(testData)
  return successResponse(newTest, 201)
})