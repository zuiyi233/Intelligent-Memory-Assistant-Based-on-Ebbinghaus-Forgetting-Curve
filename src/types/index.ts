import {
  User,
  MemoryContent,
  Review,
  ActivationCode,
  GamificationProfile,
  Achievement,
  UserAchievement,
  PointTransaction,
  DailyChallenge,
  UserDailyChallenge,
  Leaderboard,
  LeaderboardEntry,
  PointTransactionType,
  ChallengeType,
  LeaderboardType,
  LeaderboardPeriod,
  AchievementType
} from "@prisma/client"

// 扩展用户类型
export type UserWithAuth = User & {
  isPremium: boolean
}

// 扩展会话类型
export type SessionUser = {
  id: string
  email: string
  name?: string | null
  username: string
  avatar?: string | null
  isPremium: boolean
}

// 记忆内容扩展类型
export type MemoryContentWithReviews = MemoryContent & {
  reviews: Review[]
  _count?: {
    reviews: number
  }
}

// 复习时间点类型
export interface ReviewTimePoint {
  cycleNumber: number
  name: string
  time: Date
  isCompleted: boolean
  reviewScore?: number
}

// 艾宾浩斯遗忘曲线数据
export interface EbbinghausData {
  id: string
  title: string
  content: string
  category: string
  startTime: Date
  reviewTimes: ReviewTimePoint[]
  progress: number
  difficulty: number
  priority: number
}

// 激活码类型
export type ActivationCodeWithUser = ActivationCode & {
  user?: User | null
}

// 统计数据类型
export interface MemoryStats {
  totalContents: number
  completedContents: number
  activeContents: number
  totalReviews: number
  completedReviews: number
  averageScore: number
  categoryStats: {
    category: string
    count: number
    completed: number
  }[]
}

// 图表数据类型
export interface ChartData {
  name: string
  value: number
  date?: string
}

// 进度追踪数据
export interface ProgressData {
  dailyReviews: ChartData[]
  weeklyProgress: ChartData[]
  categoryDistribution: ChartData[]
  retentionRate: ChartData[]
}

// API响应类型
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// 分页参数
export interface PaginationParams {
  page: number
  limit: number
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

// 分页响应
export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// 搜索参数
export interface SearchParams {
  query?: string
  category?: string
  difficulty?: number
  priority?: number
  status?: string
  dateFrom?: string
  dateTo?: string
}

// 表单验证类型
export interface LoginForm {
  email: string
  password: string
}

export interface RegisterForm {
  email: string
  username: string
  password: string
  confirmPassword: string
  name?: string
}

export interface MemoryContentForm {
  title: string
  content: string
  category: string
  tags: string[]
  difficulty: number
  priority: number
}

export interface ActivationCodeForm {
  code: string
}

// 通知类型
export interface Notification {
  id: string
  type: "success" | "error" | "warning" | "info"
  title: string
  message: string
  timestamp: Date
  read: boolean
}

// 主题类型
export type Theme = "light" | "dark" | "system"

// 语言类型
export type Language = "zh-CN" | "en-US" | "ja-JP"

// 游戏化相关类型
export type GamificationProfileWithDetails = GamificationProfile & {
  user: User
  achievements: (UserAchievement & {
    achievement: Achievement
  })[]
  pointTransactions: PointTransaction[]
  dailyChallenges: (UserDailyChallenge & {
    challenge: DailyChallenge
  })[]
}

export type DailyChallengeWithDetails = DailyChallenge & {
  userChallenges: UserDailyChallenge[]
}

export type UserDailyChallengeWithDetails = UserDailyChallenge & {
  user: User
  challenge: DailyChallenge
  profile: GamificationProfile
}

export type LeaderboardEntryWithDetails = LeaderboardEntry & {
  leaderboard: Leaderboard
  user: User
  profile: GamificationProfile
}

export type LeaderboardWithDetails = Leaderboard & {
  entries: LeaderboardEntryWithDetails[]
}

export type AchievementWithDetails = Achievement & {
  userAchievements: UserAchievement[]
}

export type UserAchievementWithDetails = UserAchievement & {
  user: User
  achievement: Achievement
  profile: GamificationProfile
}

// 游戏化数据统计类型
export interface GamificationStats {
  totalUsers: number
  totalPoints: number
  averageLevel: number
  averageStreak: number
  topUsers: {
    userId: string
    username: string
    points: number
    level: number
  }[]
}

// 游戏化配置类型
export interface GamificationConfig {
  pointsPerReview: number
  pointsPerMemory: number
  streakBonusMultiplier: number
  levelUpBonus: number
  achievementBonus: number
  challengeCompletionBonus: number
}

// 游戏化事件类型
export interface GamificationEvent {
  type: 'REVIEW_COMPLETED' | 'MEMORY_CREATED' | 'STREAK_UPDATED' | 'LEVEL_UP' | 'ACHIEVEMENT_UNLOCKED' | 'CHALLENGE_COMPLETED' | 'POINTS_EARNED'
  userId: string
  data?: Record<string, unknown>
  timestamp: Date
}

// 游戏化通知类型
export interface GamificationNotification {
  id: string
  type: 'ACHIEVEMENT_UNLOCKED' | 'LEVEL_UP' | 'CHALLENGE_COMPLETED' | 'STREAK_BONUS' | 'POINTS_EARNED'
  title: string
  message: string
  data?: Record<string, unknown>
  read: boolean
  createdAt: Date
}

// 成就类型扩展
export type AchievementWithType = Achievement & {
  type: AchievementType
}

// 记忆项类型定义
export interface MemoryItem {
  id: string
  content: string
  category: string
  difficulty: "easy" | "medium" | "hard"
  createdAt: Date
  lastReviewedAt?: Date
  nextReviewAt: Date
  retentionRate: number
  reviewCount: number
  intervals: ReviewInterval[]
}

// 复习间隔类型定义
export interface ReviewInterval {
  interval: number
  scheduledTime: Date
  actualTime?: Date
  success: boolean
  retentionBefore: number
  retentionAfter: number
}

// 分类类型定义
export interface Category {
  id: string
  name: string
  color?: string
  itemCount: number
  averageRetention: number
}

// 难度级别类型定义
export type DifficultyLevel = "easy" | "medium" | "hard"

// A/B测试相关类型定义
export interface ABTest {
  id: string
  name: string
  description: string
  status: "DRAFT" | "ACTIVE" | "PAUSED" | "COMPLETED" | "CANCELLED"
  startDate?: Date
  endDate?: Date
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

// A/B测试创建表单类型
export interface ABTestCreateForm {
  name: string
  description: string
  targetAudience: ExtendedTargetAudience
  variants: Omit<ABTestVariant, 'id' | 'testId' | 'createdAt'>[]
  metrics: Omit<ABTestMetric, 'id' | 'testId' | 'createdAt'>[]
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

// A/B测试统计接口参数类型
export interface ABTestStatsParams {
  testId: string
  startDate?: Date
  endDate?: Date
  segment?: string
  metricIds?: string[]
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

// A/B测试模板相关类型定义
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

// A/B测试用户细分相关类型定义
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