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
  AchievementType,
  LearningStyleType,
  LearningContentType,
  ChallengeType as PrismaChallengeType
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

// 难度级别类型定义 (已移至下方枚举定义)

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

// 奖励商店相关类型定义
export interface RewardItem {
  id: string
  name: string
  description: string
  icon?: string
  category: RewardCategory
  type: RewardType
  price: number
  stock: number
  isActive: boolean
  expiresAt?: Date
  metadata?: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

export interface UserReward {
  id: string
  userId: string
  rewardItemId: string
  status: RewardStatus
  claimedAt?: Date
  expiresAt?: Date
  metadata?: Record<string, unknown>
  createdAt: Date
  user?: User
  rewardItem?: RewardItem
}

export interface RewardItemWithDetails extends RewardItem {
  userRewards?: UserReward[]
}

export interface UserRewardWithDetails extends UserReward {
  user: User
  rewardItem: RewardItem
}

// 奖励商店统计类型
export interface RewardStoreStats {
  totalItems: number
  activeItems: number
  totalRewardsClaimed: number
  mostPopularRewards: {
    itemId: string
    name: string
    claimCount: number
  }[]
}

// 奖励商店查询参数
export interface RewardStoreQueryParams {
  category?: RewardCategory
  type?: RewardType
  isActive?: boolean
  minPrice?: number
  maxPrice?: number
  search?: string
  sortBy?: 'price' | 'name' | 'createdAt' | 'popularity'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

// 奖励兑换请求类型
export interface RewardClaimRequest {
  rewardItemId: string
  quantity?: number
}

// 奖励兑换响应类型
export interface RewardClaimResponse {
  success: boolean
  userReward?: UserReward
  message?: string
  error?: string
}

// 奖励类别枚举
export enum RewardCategory {
  VIRTUAL_GOODS = 'VIRTUAL_GOODS',
  PHYSICAL_GOODS = 'PHYSICAL_GOODS',
  DISCOUNT = 'DISCOUNT',
  PREMIUM_FEATURE = 'PREMIUM_FEATURE',
  CUSTOMIZATION = 'CUSTOMIZATION',
  BADGE = 'BADGE',
  EXPERIENCE = 'EXPERIENCE'
}

// 奖励类型枚举
export enum RewardType {
  ONE_TIME = 'ONE_TIME',
  RECURRING = 'RECURRING',
  PERMANENT = 'PERMANENT',
  LIMITED = 'LIMITED'
}

// 奖励状态枚举
export enum RewardStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED'
}

// 个性化配置相关类型定义
export interface PersonalizedConfig {
  id: string
  userId: string
  difficulty?: DifficultyConfig
  notifications?: NotificationConfig
  theme?: ThemeConfig
  preferences?: UserPreferences
  learningStyleAdaptation?: LearningStyleAdaptationConfig
  lastUpdatedAt: Date
  createdAt: Date
}

// 难度配置类型
export interface DifficultyConfig {
  level: DifficultyLevel
  adaptiveMode: boolean
  autoAdjust: boolean
  baseDifficulty: number // 1-5
  contentDifficultyAdjustment: {
    text: number
    image: number
    audio: number
    video: number
    interactive: number
    quiz: number
  }
  challengeProgression: {
    easy: number
    medium: number
    hard: number
  }
}

// 通知配置类型
export interface NotificationConfig {
  enabled: boolean
  methods: NotificationMethod[]
  types: NotificationType[]
  frequency: {
    reminders: 'immediate' | 'daily' | 'weekly'
    achievements: 'immediate' | 'daily' | 'weekly'
    challenges: 'immediate' | 'daily' | 'weekly'
    reports: 'daily' | 'weekly' | 'monthly'
  }
  quietHours: {
    enabled: boolean
    start: string // HH:mm format
    end: string // HH:mm format
  }
  learningStylePreferences: {
    visual: boolean
    auditory: boolean
    kinesthetic: boolean
    reading: boolean
  }
}

// 主题配置类型
export interface ThemeConfig {
  style: ThemeStyle
  primaryColor: string
  secondaryColor: string
  accentColor: string
  backgroundColor: string
  textColor: string
  fontSize: 'small' | 'medium' | 'large' | 'extra-large'
  fontFamily: string
  borderRadius: 'none' | 'small' | 'medium' | 'large' | 'rounded'
  animations: {
    enabled: boolean
    duration: number // in milliseconds
    easing: string
  }
  customTheme?: {
    cssVariables: Record<string, string>
    backgroundImage?: string
    customCSS?: string
  }
}

// 用户偏好设置类型
export interface UserPreferences {
  language: 'zh-CN' | 'en-US' | 'ja-JP'
  timezone: string
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD'
  timeFormat: '12h' | '24h'
  firstDayOfWeek: 0 | 1 // 0 = Sunday, 1 = Monday
  accessibility: {
    highContrast: boolean
    reducedMotion: boolean
    screenReader: boolean
    fontSize: 'small' | 'medium' | 'large' | 'extra-large'
  }
  privacy: {
    shareProgress: boolean
    shareAchievements: boolean
    analyticsEnabled: boolean
    personalizedAds: boolean
  }
}

// 学习风格适配配置类型
export interface LearningStyleAdaptationConfig {
  strategy: LearningStyleAdaptationStrategy
  primaryStyle: LearningStyleType
  secondaryStyle?: LearningStyleType
  adaptationSettings: {
    visualWeight: number // 0-1
    auditoryWeight: number // 0-1
    kinestheticWeight: number // 0-1
    readingWeight: number // 0-1
  }
  contentPreferences: {
    preferredContentTypes: LearningContentType[]
    preferredChallengeTypes: ChallengeType[]
    preferredInteractionModes: string[]
  }
  performanceTracking: {
    enabled: boolean
    adaptationFrequency: 'daily' | 'weekly' | 'monthly'
    feedbackSensitivity: number // 0-1
  }
}

// 难度级别枚举
export enum DifficultyLevel {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
  ADAPTIVE = 'ADAPTIVE'
}

// 通知类型枚举
export enum NotificationType {
  REMINDER = 'REMINDER',
  ACHIEVEMENT = 'ACHIEVEMENT',
  CHALLENGE = 'CHALLENGE',
  STREAK = 'STREAK',
  LEVEL_UP = 'LEVEL_UP',
  POINTS_EARNED = 'POINTS_EARNED',
  DAILY_SUMMARY = 'DAILY_SUMMARY',
  WEEKLY_REPORT = 'WEEKLY_REPORT'
}

// 通知方式枚举
export enum NotificationMethod {
  IN_APP = 'IN_APP',
  EMAIL = 'EMAIL',
  PUSH = 'PUSH',
  SMS = 'SMS'
}

// 主题风格枚举
export enum ThemeStyle {
  LIGHT = 'LIGHT',
  DARK = 'DARK',
  AUTO = 'AUTO',
  CUSTOM = 'CUSTOM'
}

// 学习风格适配策略枚举
export enum LearningStyleAdaptationStrategy {
  VISUAL_FOCUS = 'VISUAL_FOCUS',
  AUDITORY_FOCUS = 'AUDITORY_FOCUS',
  KINESTHETIC_FOCUS = 'KINESTHETIC_FOCUS',
  READING_FOCUS = 'READING_FOCUS',
  BALANCED = 'BALANCED'
}

// 个性化配置表单类型
export interface PersonalizedConfigForm {
  difficulty: Partial<DifficultyConfig>
  notifications: Partial<NotificationConfig>
  theme: Partial<ThemeConfig>
  preferences: Partial<UserPreferences>
  learningStyleAdaptation: Partial<LearningStyleAdaptationConfig>
}

// 个性化配置推荐类型
export interface PersonalizedConfigRecommendation {
  id: string
  userId: string
  learningStyle: LearningStyleType
  recommendations: {
    difficulty: DifficultyConfig
    notifications: NotificationConfig
    theme: ThemeConfig
    preferences: UserPreferences
    learningStyleAdaptation: LearningStyleAdaptationConfig
  }
  confidence: number // 0-1
  reasoning: string[]
  createdAt: Date
}

// 个性化配置API响应类型
export interface PersonalizedConfigResponse {
  success: boolean
  data?: PersonalizedConfig
  error?: string
  message?: string
}

// 个性化配置推荐API响应类型
export interface PersonalizedConfigRecommendationResponse {
  success: boolean
  data?: PersonalizedConfigRecommendation
  error?: string
  message?: string
}

// 新手引导相关类型定义
export interface TutorialStep {
  id: string
  title: string
  content: string
  type: 'INFO' | 'INTERACTION' | 'NAVIGATION' | 'DEMO'
  target?: string // CSS选择器，用于高亮目标元素
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center'
  image?: string // 步骤配图
  video?: string // 步骤视频
  actions?: TutorialAction[]
  nextStepId?: string
  prevStepId?: string
  order: number
  isRequired: boolean
  points?: number // 完成此步骤获得的积分
}

export interface TutorialAction {
  id: string
  type: 'CLICK' | 'INPUT' | 'SCROLL' | 'WAIT' | 'NAVIGATE'
  selector?: string // 用于定位要操作的元素
  value?: string // 输入值或导航路径
  timeout?: number // 超时时间(毫秒)
  instruction: string // 操作说明
}

export interface Tutorial {
  id: string
  name: string
  description: string
  category: 'BASICS' | 'ADVANCED' | 'FEATURES' | 'ACHIEVEMENTS' | 'REWARDS' | 'CHALLENGES'
  audience: 'NEW_USER' | 'RETURNING_USER' | 'POWER_USER'
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
  estimatedTime: number // 预估完成时间(分钟)
  steps: TutorialStep[]
  isActive: boolean
  points: number // 完成整个教程获得的积分
  prerequisites?: string[] // 前置教程ID
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

export interface UserTutorialProgress {
  id: string
  userId: string
  tutorialId: string
  currentStepId: string
  completedStepIds: string[]
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED'
  progress: number // 0-100
  startedAt?: Date
  completedAt?: Date
  lastAccessedAt: Date
  timeSpent: number // 已花费时间(秒)
  skipReason?: string
  metadata?: Record<string, unknown>
}

export interface TutorialSession {
  id: string
  userId: string
  tutorialId: string
  currentStepId: string
  isActive: boolean
  startedAt: Date
  lastActivityAt: Date
  metadata?: Record<string, unknown>
}

// 引导配置类型
export interface TutorialConfig {
  autoStart: boolean
  showOnFirstLogin: boolean
  allowSkip: boolean
  showProgress: boolean
  highlightTarget: boolean
  overlayOpacity: number
  animationSpeed: 'slow' | 'normal' | 'fast'
  language: 'zh-CN' | 'en-US'
  theme: 'light' | 'dark' | 'auto'
}

// 教程中心筛选参数
export interface TutorialCenterQueryParams {
  category?: Tutorial['category']
  audience?: Tutorial['audience']
  difficulty?: Tutorial['difficulty']
  search?: string
  tags?: string[]
  isActive?: boolean
  sortBy?: 'name' | 'difficulty' | 'estimatedTime' | 'points' | 'popularity'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

// 教程统计类型
export interface TutorialStats {
  totalTutorials: number
  completedTutorials: number
  inProgressTutorials: number
  totalPoints: number
  averageCompletionTime: number
  popularTutorials: Array<{
    tutorialId: string
    name: string
    completionCount: number
  }>
  categoryStats: Record<Tutorial['category'], {
    total: number
    completed: number
  }>
}

// 教程推荐类型
export interface TutorialRecommendation {
  id: string
  userId: string
  tutorialId: string
  reason: string
  confidence: number // 0-1
  createdAt: Date
}

// 教程反馈类型
export interface TutorialFeedback {
  id: string
  userId: string
  tutorialId: string
  stepId?: string
  rating: number // 1-5
  comment?: string
  helpful: boolean
  suggestions?: string
  createdAt: Date
}