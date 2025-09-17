import { NextRequest, NextResponse } from 'next/server'

/**
 * API响应工具
 * 用于统一API的响应格式和错误处理
 */

/**
 * 标准API响应接口
 */
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: string
  }
  timestamp: string
}

/**
 * 标准分页响应接口
 */
export interface PaginatedApiResponse<T = unknown> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

/**
 * 成功响应
 */
export function successResponse<T>(
  data: T,
  status: number = 200
): NextResponse {
  return NextResponse.json({
    success: true,
    data,
    timestamp: new Date().toISOString()
  }, { status })
}

/**
 * 分页成功响应
 */
export function paginatedSuccessResponse<T>(
  data: T[],
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  },
  status: number = 200
): NextResponse {
  return NextResponse.json({
    success: true,
    data,
    pagination,
    timestamp: new Date().toISOString()
  }, { status })
}

/**
 * 错误响应
 */
export function errorResponse(
  code: string,
  message: string,
  status: number = 500,
  details?: string
): NextResponse {
  return NextResponse.json({
    success: false,
    error: {
      code,
      message,
      details
    },
    timestamp: new Date().toISOString()
  }, { status })
}

/**
 * 常见错误代码
 */
export const ErrorCodes = {
  // 通用错误
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  
  // A/B测试相关错误
  TEST_NOT_FOUND: 'TEST_NOT_FOUND',
  INVALID_TEST_STATUS: 'INVALID_TEST_STATUS',
  TEST_ALREADY_ACTIVE: 'TEST_ALREADY_ACTIVE',
  TEST_ALREADY_COMPLETED: 'TEST_ALREADY_COMPLETED',
  INVALID_VARIANT_CONFIG: 'INVALID_VARIANT_CONFIG',
  INVALID_METRIC_CONFIG: 'INVALID_METRIC_CONFIG',
  
  // 用户分配相关错误
  USER_ALREADY_ASSIGNED: 'USER_ALREADY_ASSIGNED',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  VARIANT_NOT_FOUND: 'VARIANT_NOT_FOUND',
  ASSIGNMENT_FAILED: 'ASSIGNMENT_FAILED',
  
  // 批量操作相关错误
  BATCH_OPERATION_FAILED: 'BATCH_OPERATION_FAILED',
  INVALID_BATCH_REQUEST: 'INVALID_BATCH_REQUEST',
  
  // 导出相关错误
  EXPORT_FAILED: 'EXPORT_FAILED',
  INVALID_EXPORT_FORMAT: 'INVALID_EXPORT_FORMAT',
  
  // 模板相关错误
  TEMPLATE_NOT_FOUND: 'TEMPLATE_NOT_FOUND',
  INVALID_TEMPLATE_CONFIG: 'INVALID_TEMPLATE_CONFIG',
  
  // 细分相关错误
  SEGMENT_NOT_FOUND: 'SEGMENT_NOT_FOUND',
  INVALID_SEGMENT_CONFIG: 'INVALID_SEGMENT_CONFIG',
  USER_ALREADY_IN_SEGMENT: 'USER_ALREADY_IN_SEGMENT',
  USER_NOT_IN_SEGMENT: 'USER_NOT_IN_SEGMENT',
  
  // 参数验证错误
  MISSING_REQUIRED_PARAM: 'MISSING_REQUIRED_PARAM',
  INVALID_PARAM_VALUE: 'INVALID_PARAM_VALUE',
  INVALID_PAGINATION: 'INVALID_PAGINATION'
}

/**
 * 常见错误消息
 */
export const ErrorMessages = {
  // 通用错误
  [ErrorCodes.INTERNAL_ERROR]: '内部服务器错误',
  [ErrorCodes.VALIDATION_ERROR]: '数据验证失败',
  [ErrorCodes.NOT_FOUND]: '资源不存在',
  [ErrorCodes.UNAUTHORIZED]: '未授权访问',
  [ErrorCodes.FORBIDDEN]: '禁止访问',
  
  // A/B测试相关错误
  [ErrorCodes.TEST_NOT_FOUND]: 'A/B测试不存在',
  [ErrorCodes.INVALID_TEST_STATUS]: '无效的测试状态',
  [ErrorCodes.TEST_ALREADY_ACTIVE]: '测试已处于激活状态',
  [ErrorCodes.TEST_ALREADY_COMPLETED]: '测试已完成，无法修改',
  [ErrorCodes.INVALID_VARIANT_CONFIG]: '无效的变体配置',
  [ErrorCodes.INVALID_METRIC_CONFIG]: '无效的指标配置',
  
  // 用户分配相关错误
  [ErrorCodes.USER_ALREADY_ASSIGNED]: '用户已分配到该测试',
  [ErrorCodes.USER_NOT_FOUND]: '用户不存在',
  [ErrorCodes.VARIANT_NOT_FOUND]: '变体不存在',
  [ErrorCodes.ASSIGNMENT_FAILED]: '用户分配失败',
  
  // 批量操作相关错误
  [ErrorCodes.BATCH_OPERATION_FAILED]: '批量操作失败',
  [ErrorCodes.INVALID_BATCH_REQUEST]: '无效的批量操作请求',
  
  // 导出相关错误
  [ErrorCodes.EXPORT_FAILED]: '导出失败',
  [ErrorCodes.INVALID_EXPORT_FORMAT]: '无效的导出格式',
  
  // 模板相关错误
  [ErrorCodes.TEMPLATE_NOT_FOUND]: '测试模板不存在',
  [ErrorCodes.INVALID_TEMPLATE_CONFIG]: '无效的模板配置',
  
  // 细分相关错误
  [ErrorCodes.SEGMENT_NOT_FOUND]: '用户细分不存在',
  [ErrorCodes.INVALID_SEGMENT_CONFIG]: '无效的细分配置',
  [ErrorCodes.USER_ALREADY_IN_SEGMENT]: '用户已在细分中',
  [ErrorCodes.USER_NOT_IN_SEGMENT]: '用户不在细分中',
  
  // 参数验证错误
  [ErrorCodes.MISSING_REQUIRED_PARAM]: '缺少必需参数',
  [ErrorCodes.INVALID_PARAM_VALUE]: '参数值无效',
  [ErrorCodes.INVALID_PAGINATION]: '分页参数无效'
}

/**
 * 包装API处理函数，提供统一的错误处理
 */
export function withErrorHandler<T = unknown>(
  handler: (request: NextRequest, context?: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, context?: T): Promise<NextResponse> => {
    try {
      return await handler(request, context)
    } catch (error) {
      console.error('API请求处理失败:', error)
      
      if (error instanceof Error) {
        return errorResponse(
          ErrorCodes.INTERNAL_ERROR,
          ErrorMessages[ErrorCodes.INTERNAL_ERROR],
          500,
          error.message
        )
      }
      
      return errorResponse(
        ErrorCodes.INTERNAL_ERROR,
        ErrorMessages[ErrorCodes.INTERNAL_ERROR],
        500
      )
    }
  }
}

/**
 * 验证分页参数
 */
export function validatePaginationParams(
  page: number,
  limit: number,
  maxLimit: number = 100
): { valid: boolean; error?: NextResponse } {
  if (page < 1 || limit < 1 || limit > maxLimit) {
    return {
      valid: false,
      error: errorResponse(
        ErrorCodes.INVALID_PAGINATION,
        `分页参数无效，页码必须大于0，每页数量必须在1-${maxLimit}之间`,
        400
      )
    }
  }
  
  return { valid: true }
}

/**
 * 验证必需参数
 */
export function validateRequiredParams(
  params: Record<string, unknown>,
  required: string[]
): { valid: boolean; error?: NextResponse; missing?: string } {
  for (const param of required) {
    if (!params[param]) {
      return {
        valid: false,
        error: errorResponse(
          ErrorCodes.MISSING_REQUIRED_PARAM,
          `缺少必需参数: ${param}`,
          400
        ),
        missing: param
      }
    }
  }
  
  return { valid: true }
}