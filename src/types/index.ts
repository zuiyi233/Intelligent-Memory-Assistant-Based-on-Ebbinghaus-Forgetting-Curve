import { User, MemoryContent, Review, ActivationCode } from "@prisma/client"

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