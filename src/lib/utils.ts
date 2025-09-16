import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 艾宾浩斯遗忘曲线时间间隔定义
export const EBBINGHAUS_INTERVALS = [
  { name: "5分钟", value: 5, unit: "minutes" },
  { name: "30分钟", value: 30, unit: "minutes" },
  { name: "2小时", value: 2, unit: "hours" },
  { name: "1天", value: 1, unit: "days" },
  { name: "2天", value: 2, unit: "days" },
  { name: "4天", value: 4, unit: "days" },
  { name: "7天", value: 7, unit: "days" },
  { name: "15天", value: 15, unit: "days" },
  { name: "1个月", value: 1, unit: "months" },
]

// 计算艾宾浩斯遗忘曲线的复习时间
export function calculateReviewTimes(startTime: Date): Date[] {
  const reviewTimes: Date[] = []
  
  EBBINGHAUS_INTERVALS.forEach((interval) => {
    const reviewTime = new Date(startTime)
    
    switch (interval.unit) {
      case "minutes":
        reviewTime.setMinutes(reviewTime.getMinutes() + interval.value)
        break
      case "hours":
        reviewTime.setHours(reviewTime.getHours() + interval.value)
        break
      case "days":
        reviewTime.setDate(reviewTime.getDate() + interval.value)
        break
      case "months":
        reviewTime.setMonth(reviewTime.getMonth() + interval.value)
        break
    }
    
    reviewTimes.push(reviewTime)
  })
  
  return reviewTimes
}

// 格式化日期时间
export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

// 格式化相对时间
export function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diff = date.getTime() - now.getTime()
  const absDiff = Math.abs(diff)
  
  const rtf = new Intl.RelativeTimeFormat("zh-CN", { numeric: "auto" })
  
  if (absDiff < 60000) { // 小于1分钟
    return rtf.format(Math.floor(diff / 1000), "second")
  } else if (absDiff < 3600000) { // 小于1小时
    return rtf.format(Math.floor(diff / 60000), "minute")
  } else if (absDiff < 86400000) { // 小于1天
    return rtf.format(Math.floor(diff / 3600000), "hour")
  } else if (absDiff < 2592000000) { // 小于30天
    return rtf.format(Math.floor(diff / 86400000), "day")
  } else {
    return rtf.format(Math.floor(diff / 2592000000), "month")
  }
}

// 生成随机激活码
export function generateActivationCode(length: number = 12): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let result = ""
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// 验证激活码格式
export function validateActivationCode(code: string): boolean {
  return /^[A-Z0-9]{12}$/.test(code)
}

// 计算记忆进度百分比
export function calculateMemoryProgress(completedReviews: number, totalReviews: number = 9): number {
  return Math.round((completedReviews / totalReviews) * 100)
}

// 获取难度等级文本
export function getDifficultyText(difficulty: number): string {
  const difficulties = ["简单", "较易", "中等", "较难", "困难"]
  return difficulties[difficulty - 1] || "未知"
}

// 获取优先级文本
export function getPriorityText(priority: number): string {
  const priorities = ["低", "较低", "中等", "较高", "高"]
  return priorities[priority - 1] || "未知"
}