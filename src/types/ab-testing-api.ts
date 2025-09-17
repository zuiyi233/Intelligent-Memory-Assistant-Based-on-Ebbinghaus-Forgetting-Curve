/**
 * A/B测试API相关的类型定义
 */

// 基础API响应类型
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

// 分页响应类型
export interface PaginatedApiResponse<T = unknown> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// A/B测试相关类型
export interface ABTest {
  id: string
  name: string
  description: string
  status: "DRAFT" | "ACTIVE" | "PAUSED" | "COMPLETED" | "CANCELLED"
  startDate?: Date | null
  endDate?: Date | null
  targetAudience?: ExtendedTargetAudience
  createdAt: Date
  updatedAt: Date
  variants: ABTestVariant[]
  metrics: ABTestMetric[]
  results: ABTestResult[]
}

export interface ABTestVariant {
  id: string
  testId: string
  name: string
  description: string
  config: Record<string, unknown>
  trafficPercentage: number
  isControl: boolean
  createdAt: Date
}

export interface ABTestMetric {
  id: string
  testId: string
  name: string
  description: string
  type: "ENGAGEMENT" | "RETENTION" | "CONVERSION" | "REVENUE" | "SATISFACTION" | "PERFORMANCE" | "CUSTOM"
  formula?: string
  unit?: string
  isActive: boolean
  createdAt: Date
}

export interface ABTestResult {
  id: string
  testId: string
  variantId: string
  metricId: string
  value: number
  change: number
  changePercentage: number
  confidence: number
  significance: boolean
  sampleSize: number
  createdAt: Date
  updatedAt: Date
}

export interface ABTestUserAssignment {
  id: string
  testId: string
  userId: string
  variantId: string
  assignedAt: Date
}

// A/B测试报告类型
export interface ABTestReport {
  test: ABTest
  results: ABTestResult[]
  winner?: {
    variantId: string
    confidence: number
  }
  recommendations: string[]
  summary: {
    totalUsers: number
    testDuration: number
    keyFindings: string[]
  }
}

// A/B测试创建表单类型
export interface ABTestCreateForm {
  name: string
  description: string
  targetAudience: ExtendedTargetAudience
  variants: Omit<ABTestVariant, 'id' | 'testId' | 'createdAt'>[]
  metrics: Omit<ABTestMetric, 'id' | 'testId' | 'createdAt'>[]
}

// A/B测试模板相关类型
export interface ABTestTemplate {
  id: string
  name: string
  description: string
  category: string
  variants: Omit<ABTestVariant, 'id' | 'testId' | 'createdAt'>[]
  metrics: Omit<ABTestMetric, 'id' | 'testId' | 'createdAt'>[]
  targetAudience?: ExtendedTargetAudience
  isActive: boolean
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

// A/B测试模板创建表单类型
export interface ABTestTemplateCreateForm {
  name: string
  description: string
  category: string
  variants: Omit<ABTestVariant, 'id' | 'testId' | 'createdAt'>[]
  metrics: Omit<ABTestMetric, 'id' | 'testId' | 'createdAt'>[]
  targetAudience?: ExtendedTargetAudience
}

// A/B测试模板更新表单类型
export interface ABTestTemplateUpdateForm {
  name?: string
  description?: string
  category?: string
  variants?: Omit<ABTestVariant, 'id' | 'testId' | 'createdAt'>[]
  metrics?: Omit<ABTestMetric, 'id' | 'testId' | 'createdAt'>[]
  targetAudience?: ExtendedTargetAudience
  isActive?: boolean
}

// A/B测试用户细分相关类型
export interface ABSegment {
  id: string
  name: string
  description: string
  criteria: Record<string, unknown>
  isActive: boolean
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

// A/B测试细分创建表单类型
export interface ABSegmentCreateForm {
  name: string
  description: string
  criteria: Record<string, unknown>
}

// A/B测试细分更新表单类型
export interface ABSegmentUpdateForm {
  name?: string
  description?: string
  criteria?: Record<string, unknown>
  isActive?: boolean
}

// A/B测试细分用户类型
export interface ABSegmentUser {
  id: string
  segmentId: string
  userId: string
  addedAt: Date
}

// 用户目标受众条件类型
export interface TargetAudienceCriteria {
  isPremium?: boolean
  minLevel?: number
  maxLevel?: number
  minPoints?: number
  maxPoints?: number
  minStreak?: number
  learningStyle?: {
    primary?: string
  }
  minAccountAgeDays?: number
  maxAccountAgeDays?: number
}

// 用户分配策略类型
export interface AllocationStrategy {
  type: 'RANDOM' | 'FEATURE_BASED' | 'COHORT_BASED' | 'HASH_BASED'
  featureRules?: FeatureRule[]
  cohortRules?: CohortRule[]
}

// 特征规则类型
export interface FeatureRule {
  feature: string
  operator: 'equals' | 'greater_than' | 'less_than' | 'in'
  value: string | number | boolean | string[] | number[]
  variantId: string
}

// 分组规则类型
export interface CohortRule {
  conditions: FeatureRule[]
  cohortName: string
}

// 扩展目标受众类型
export interface ExtendedTargetAudience {
  userSegments: string[]
  percentage: number
  criteria?: TargetAudienceCriteria
  allocationStrategy?: AllocationStrategy
}

// 批量创建A/B测试请求类型
export interface BatchCreateABTestsRequest {
  tests: ABTestCreateForm[]
}

// 批量创建A/B测试响应类型
export interface BatchCreateABTestsResponse {
  created: Partial<ABTest>[]
  failed: {
    index: number
    error: string
  }[]
  summary: {
    total: number
    created: number
    failed: number
  }
}

// 批量分配用户请求类型
export interface BatchAssignUsersRequest {
  assignments: {
    userId: string
    testId: string
  }[]
}

// 批量分配用户响应类型
export interface BatchAssignUsersResponse {
  results: {
    userId: string
    testId: string
    variantId?: string
    success: boolean
    error?: string
  }[]
  summary: {
    total: number
    success: number
    failed: number
  }
}

// 使用模板创建测试请求类型
export interface UseTemplateRequest {
  name: string
  description: string
  overrides?: {
    targetAudience?: ExtendedTargetAudience
    variants?: Omit<ABTestVariant, 'id' | 'testId' | 'createdAt'>[]
    metrics?: Omit<ABTestMetric, 'id' | 'testId' | 'createdAt'>[]
  }
}

// 添加用户到细分请求类型
export interface AddUsersToSegmentRequest {
  userIds: string[]
}

// 添加用户到细分响应类型
export interface AddUsersToSegmentResponse {
  added: ABSegmentUser[]
  failed: {
    userId: string
    error: string
  }[]
  summary: {
    total: number
    added: number
    failed: number
  }
}

// 高级统计请求类型
export interface AdvancedStatsRequest {
  testId: string
  timeRange?: {
    startDate?: string | Date
    endDate?: string | Date
  }
  segments?: {
    primarySegment?: string
  }
  metrics?: string[]
  includeUserBreakdown?: boolean
}

// 高级统计响应类型
export interface AdvancedStatsResponse {
  basicStats: Record<string, unknown>
  advancedStats: {
    overallPerformance: {
      totalSampleSize: number
      overallAverage: number
    }
    variantComparison: Record<string, {
      averageValue: number
      sampleSize: number
      relativePerformance: number
      contribution: number
    }>
    statisticalSignificance: Record<string, unknown>
    confidenceIntervals: Record<string, unknown>
    effectSizes: Record<string, unknown>
  }
  userBreakdown?: unknown
  trends?: unknown[]
  insights: {
    summary: string[]
    recommendations: string[]
    warnings: string[]
    opportunities: string[]
  }
  report: unknown
}