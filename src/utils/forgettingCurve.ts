import { addMinutes } from "date-fns";
import { MemoryItem, ReviewInterval } from "@/types";

/**
 * 艾宾浩斯遗忘曲线参数
 * R(t) = e^(-t/S)，其中 t 是时间(分钟)，S 是强度因子
 */
const FORGETTING_CURVE_PARAMS = {
  initialStrength: 0.29, // 初始记忆强度因子
  easyMultiplier: 1.2,   // 简单内容的强度倍数
  mediumMultiplier: 1.0, // 中等内容的强度倍数
  hardMultiplier: 0.8,   // 困难内容的强度倍数
};

/**
 * 标准复习间隔（分钟）
 */
export const REVIEW_INTERVALS = [
  20,     // 20分钟
  60,     // 1小时
  540,    // 9小时
  1440,   // 1天
  2880,   // 2天
  8640,   // 6天
  44640,  // 31天
];

/**
 * 计算给定时间的记忆保持率
 * @param elapsedMinutes 经过的分钟数
 * @param difficulty 内容难度级别
 * @returns 记忆保持率 (0-100)
 */
export function calculateRetentionRate(
  elapsedMinutes: number,
  difficulty: "easy" | "medium" | "hard" = "medium"
): number {
  let strengthFactor = FORGETTING_CURVE_PARAMS.initialStrength;
  
  // 根据难度调整强度因子
  switch (difficulty) {
    case "easy":
      strengthFactor *= FORGETTING_CURVE_PARAMS.easyMultiplier;
      break;
    case "medium":
      strengthFactor *= FORGETTING_CURVE_PARAMS.mediumMultiplier;
      break;
    case "hard":
      strengthFactor *= FORGETTING_CURVE_PARAMS.hardMultiplier;
      break;
  }
  
  // 使用指数衰减模型计算保持率
  const retentionRate = Math.exp(-elapsedMinutes / (strengthFactor * 60)) * 100;
  
  // 确保返回合理的范围值
  return Math.max(0, Math.min(100, retentionRate));
}

/**
 * 判断内容是否被遗忘（基于20分钟后的保持率阈值）
 * @param retentionRate 当前的保持率
 * @returns true 如果内容被认为已遗忘
 */
export function isForgotten(retentionRate: number): boolean {
  // 20分钟后保持率低于41.8%被认为是遗忘内容
  return retentionRate < 41.8;
}

/**
 * 获取下一个复习时间点
 * @param currentIntervalIndex 当前复习间隔索引
 * @param lastReviewTime 上次复习时间
 * @returns 下次复习时间
 */
export function getNextReviewTime(
  currentIntervalIndex: number,
  lastReviewTime: Date
): Date {
  if (currentIntervalIndex >= REVIEW_INTERVALS.length - 1) {
    // 如果已经完成所有间隔，使用扩展间隔
    const extendedInterval = REVIEW_INTERVALS[REVIEW_INTERVALS.length - 1] * 2;
    return addMinutes(lastReviewTime, extendedInterval);
  }
  
  const nextInterval = REVIEW_INTERVALS[currentIntervalIndex + 1];
  return addMinutes(lastReviewTime, nextInterval);
}

/**
 * 根据复习表现调整间隔
 * @param successRate 成功率 (0-1)
 * @param difficulty 内容难度
 * @returns 调整后的间隔乘数
 */
export function adjustIntervalByPerformance(
  successRate: number,
  difficulty: "easy" | "medium" | "hard"
): number {
  let multiplier = 1.0;
  
  // 根据成功率调整
  if (successRate >= 0.95) {
    multiplier = 1.3; // 高成功率，延长间隔
  } else if (successRate >= 0.85) {
    multiplier = 1.1; // 良好成功率，轻微延长
  } else if (successRate <= 0.5) {
    multiplier = 0.7; // 低成功率，缩短间隔
  } else if (successRate <= 0.65) {
    multiplier = 0.8; // 较差成功率，适当缩短
  }
  
  // 根据难度进一步调整
  switch (difficulty) {
    case "easy":
      multiplier *= 1.1;
      break;
    case "hard":
      multiplier *= 0.9;
      break;
    case "medium":
    default:
      break;
  }
  
  return Math.max(0.5, Math.min(2.0, multiplier));
}

/**
 * 生成复习计划
 * @param item 记忆项
 * @returns 复习计划数组
 */
export function generateReviewSchedule(item: MemoryItem): ReviewInterval[] {
  const schedule: ReviewInterval[] = [];
  let currentTime = item.createdAt;
  
  for (let i = 0; i < REVIEW_INTERVALS.length; i++) {
    const interval = REVIEW_INTERVALS[i];
    const scheduledTime = addMinutes(currentTime, interval);
    
    schedule.push({
      interval,
      scheduledTime,
      success: false,
      retentionBefore: calculateRetentionRate(interval, item.difficulty),
      retentionAfter: 100, // 假设复习后恢复100%
    });
  }
  
  return schedule;
}

/**
 * 预测未来某个时间点的保持率
 * @param item 记忆项
 * @param targetDate 目标日期
 * @returns 预测的保持率
 */
export function predictFutureRetention(
  item: MemoryItem,
  targetDate: Date
): number {
  const now = new Date();
  const elapsedMinutes = (targetDate.getTime() - now.getTime()) / (1000 * 60);
  
  if (item.lastReviewedAt) {
    const sinceLastReview = (targetDate.getTime() - item.lastReviewedAt.getTime()) / (1000 * 60);
    return calculateRetentionRate(sinceLastReview, item.difficulty);
  }
  
  const sinceCreation = (targetDate.getTime() - item.createdAt.getTime()) / (1000 * 60);
  return calculateRetentionRate(sinceCreation, item.difficulty);
}
