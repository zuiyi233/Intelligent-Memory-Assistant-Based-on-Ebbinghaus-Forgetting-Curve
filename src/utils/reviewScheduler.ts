import { MemoryItem, ReviewInterval } from "@/types";
import {
  calculateRetentionRate,
  adjustIntervalByPerformance,
  generateReviewSchedule
} from "./forgettingCurve";
import { addMinutes } from "date-fns";

/**
 * 智能复习调度器
 */
export class SmartReviewScheduler {
  /**
   * 处理复习结果并更新下一次复习时间
   * @param item 记忆项
   * @param success 是否成功回忆
   * @param responseTime 反应时间（秒）
   * @returns 更新后的记忆项
   */
  processReviewResult(
    item: MemoryItem,
    success: boolean,
    responseTime?: number
  ): MemoryItem {
    const now = new Date();
    
    // 更新复习计数
    item.reviewCount++;
    
    // 计算本次复习的表现评分
    const performanceScore = this.calculatePerformanceScore(success, responseTime);
    
    // 更新保持率（基于复习结果）
    const newRetentionRate = success ? 100 : Math.max(0, item.retentionRate - 20);
    item.retentionRate = newRetentionRate;
    
    // 更新最后复习时间
    item.lastReviewedAt = now;
    
    // 确定下一个复习间隔
    const nextInterval = this.determineNextInterval(item, performanceScore);
    item.nextReviewAt = addMinutes(now, nextInterval);
    
    // 更新复习历史
    this.updateReviewHistory(item, success, performanceScore);
    
    return item;
  }

  /**
   * 计算复习表现评分
   */
  private calculatePerformanceScore(success: boolean, responseTime?: number): number {
    let score = success ? 1.0 : 0.0;
    
    // 根据反应时间调整分数
    if (success && responseTime) {
      if (responseTime < 3) {
        score = 1.0; // 快速正确回答
      } else if (responseTime < 10) {
        score = 0.9; // 正常速度回答
      } else {
        score = 0.7; // 较慢但正确回答
      }
    }
    
    return score;
  }

  /**
   * 确定下一个复习间隔
   */
  private determineNextInterval(item: MemoryItem, performanceScore: number): number {
    const baseIntervals = [20, 60, 540, 1440, 2880, 8640, 44640]; // 分钟
    
    // 找到合适的基准间隔
    let baseInterval = 20; // 默认最小间隔
    
    if (item.intervals && item.intervals.length > 0) {
      const lastCompletedInterval = item.intervals.find(i => i.success);
      if (lastCompletedInterval) {
        const index = baseIntervals.indexOf(lastCompletedInterval.interval);
        if (index !== -1 && index < baseIntervals.length - 1) {
          baseInterval = baseIntervals[index + 1];
        } else {
          // 已完成所有标准间隔，使用扩展间隔
          baseInterval = baseIntervals[baseIntervals.length - 1] * 2;
        }
      }
    }
    
    // 根据表现调整间隔
    const adjustedInterval = baseInterval * adjustIntervalByPerformance(
      performanceScore,
      item.difficulty
    );
    
    return Math.round(adjustedInterval);
  }

  /**
   * 更新复习历史
   */
  private updateReviewHistory(
    item: MemoryItem,
    success: boolean,
    performanceScore: number
  ) {
    const now = new Date();
    
    // 计算复习前的保持率
    const elapsedMinutes = (now.getTime() - (item.lastReviewedAt?.getTime() || item.createdAt.getTime())) / (1000 * 60);
    const retentionBefore = calculateRetentionRate(elapsedMinutes, item.difficulty);
    
    // 添加到复习历史
    const reviewEntry: ReviewInterval = {
      interval: Math.round(elapsedMinutes),
      scheduledTime: item.nextReviewAt,
      actualTime: now,
      success,
      retentionBefore,
      retentionAfter: success ? 100 : Math.max(0, retentionBefore - 20),
    };
    
    if (!item.intervals) {
      item.intervals = [];
    }
    
    item.intervals.push(reviewEntry);
  }

  /**
   * 批量调度复习任务
   */
  batchScheduleReviews(items: MemoryItem[]): MemoryItem[] {
    const now = new Date();
    
    return items.map(item => {
      // 如果是新项目，生成初始复习计划
      if (!item.intervals || item.intervals.length === 0) {
        item.intervals = generateReviewSchedule(item);
        item.nextReviewAt = item.intervals[0]?.scheduledTime || addMinutes(now, 20);
      }
      
      // 检查是否需要重新调度
      if (item.nextReviewAt <= now && !this.hasActiveReview(item)) {
        const lastInterval = item.intervals[item.intervals.length - 1];
        if (lastInterval && !lastInterval.success) {
          // 上次复习失败，缩短间隔
          item.nextReviewAt = addMinutes(now, 10); // 10分钟后重试
        }
      }
      
      return item;
    });
  }

  /**
   * 检查是否有活跃的复习任务
   */
  private hasActiveReview(item: MemoryItem): boolean {
    if (!item.intervals) return false;
    
    const now = new Date();
    return item.intervals.some(interval => 
      !interval.actualTime && 
      interval.scheduledTime > now &&
      interval.scheduledTime <= addMinutes(now, 5) // 5分钟内即将开始的复习
    );
  }

  /**
   * 获取紧急复习项目
   */
  getUrgentReviews(items: MemoryItem[]): MemoryItem[] {
    const now = new Date();
    const urgentThreshold = addMinutes(now, 60); // 1小时内
    
    return items.filter(item => 
      item.nextReviewAt <= urgentThreshold &&
      item.retentionRate < 50 // 保持率较低
    ).sort((a, b) => a.nextReviewAt.getTime() - b.nextReviewAt.getTime());
  }

  /**
   * 生成每日复习计划
   */
  generateDailyPlan(items: MemoryItem[], maxItemsPerDay: number = 20): MemoryItem[] {
    const now = new Date();
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);
    
    // 获取今天到期的项目
    const dueToday = items.filter(item => 
      item.nextReviewAt >= now && 
      item.nextReviewAt <= todayEnd
    );
    
    // 如果没有足够的项目，添加一些即将到期的项目
    let selectedItems = [...dueToday];
    
    if (selectedItems.length < maxItemsPerDay) {
      const upcomingItems = items
        .filter(item => item.nextReviewAt > todayEnd)
        .sort((a, b) => a.nextReviewAt.getTime() - b.nextReviewAt.getTime())
        .slice(0, maxItemsPerDay - selectedItems.length);
      
      selectedItems = [...selectedItems, ...upcomingItems];
    }
    
    // 限制数量并按优先级排序
    return selectedItems
      .slice(0, maxItemsPerDay)
      .sort((a, b) => {
        // 先按到期时间，再按保持率
        if (Math.abs(a.nextReviewAt.getTime() - b.nextReviewAt.getTime()) < 60000) {
          return a.retentionRate - b.retentionRate;
        }
        return a.nextReviewAt.getTime() - b.nextReviewAt.getTime();
      });
  }

  /**
   * 预测长期记忆效果
   */
  predictLongTermRetention(
    items: MemoryItem[],
    daysAhead: number = 30
  ): { date: Date; predictedRetention: number }[] {
    const predictions: { date: Date; predictedRetention: number }[] = [];
    const now = new Date();
    
    for (let i = 1; i <= daysAhead; i++) {
      const targetDate = new Date(now);
      targetDate.setDate(targetDate.getDate() + i);
      
      let totalPredictedRetention = 0;
      let count = 0;
      
      items.forEach(item => {
        const elapsedMinutes = (targetDate.getTime() - (item.lastReviewedAt?.getTime() || item.createdAt.getTime())) / (1000 * 60);
        const predicted = calculateRetentionRate(elapsedMinutes, item.difficulty);
        
        if (predicted > 0) {
          totalPredictedRetention += predicted;
          count++;
        }
      });
      
      predictions.push({
        date: targetDate,
        predictedRetention: count > 0 ? totalPredictedRetention / count : 0,
      });
    }
    
    return predictions;
  }
}

/**
 * 复习提醒服务
 */
export class ReviewReminderService {
  private reminderCallbacks: Array<(items: MemoryItem[]) => void> = [];
  
  /**
   * 注册提醒回调
   */
  registerReminder(callback: (items: MemoryItem[]) => void) {
    this.reminderCallbacks.push(callback);
  }

  /**
   * 检查并发送提醒
   */
  checkAndRemind(items: MemoryItem[]) {
    const now = new Date();
    const reminderWindow = addMinutes(now, 15); // 提前15分钟提醒
    
    const itemsToRemind = items.filter(item => 
      item.nextReviewAt >= now && 
      item.nextReviewAt <= reminderWindow
    );
    
    if (itemsToRemind.length > 0) {
      this.reminderCallbacks.forEach(callback => callback(itemsToRemind));
    }
  }

  /**
   * 设置定期提醒检查
   */
  startPeriodicChecks(items: MemoryItem[], intervalMs: number = 60000) {
    setInterval(() => {
      this.checkAndRemind(items);
    }, intervalMs);
  }
}
