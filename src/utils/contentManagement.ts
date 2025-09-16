import { MemoryItem, Category } from "@/types";
import { calculateRetentionRate, isForgotten } from "./forgettingCurve";

/**
 * 内容分类管理系统
 */
export class ContentClassificationSystem {
  private categories: Map<string, Category>;
  
  constructor() {
    this.categories = new Map();
  }

  /**
   * 添加新分类
   */
  addCategory(name: string, color: string): Category {
    const id = crypto.randomUUID();
    const category: Category = {
      id,
      name,
      color,
      itemCount: 0,
      averageRetention: 0,
    };
    
    this.categories.set(id, category);
    return category;
  }

  /**
   * 更新分类统计数据
   */
  updateCategoryStats(categoryId: string, items: MemoryItem[]): void {
    const category = this.categories.get(categoryId);
    if (!category) return;

    const categoryItems = items.filter(item => item.category === categoryId);
    category.itemCount = categoryItems.length;
    
    if (categoryItems.length > 0) {
      const totalRetention = categoryItems.reduce((sum, item) => sum + item.retentionRate, 0);
      category.averageRetention = totalRetention / categoryItems.length;
    }
  }

  /**
   * 获取所有分类
   */
  getCategories(): Category[] {
    return Array.from(this.categories.values());
  }

  /**
   * 按分类获取项目
   */
  getItemsByCategory(items: MemoryItem[], categoryId: string): MemoryItem[] {
    return items.filter(item => item.category === categoryId);
  }
}

/**
 * 遗忘内容识别器
 */
export class ForgottenContentIdentifier {
  /**
   * 识别需要复习的内容
   * @param items 所有记忆项
   * @returns 需要复习的项目列表
   */
  identifyForgottenContent(items: MemoryItem[]): MemoryItem[] {
    const now = new Date();
    
    return items.filter(item => {
      // 检查是否需要复习
      if (item.nextReviewAt <= now) {
        return true;
      }
      
      // 检查当前保持率是否过低
      const elapsedMinutes = (now.getTime() - item.lastReviewedAt?.getTime() || item.createdAt.getTime()) / (1000 * 60);
      const currentRetention = calculateRetentionRate(elapsedMinutes, item.difficulty);
      
      return isForgotten(currentRetention);
    });
  }

  /**
   * 按优先级排序需要复习的内容
   * @param items 需要复习的项目
   * @returns 按优先级排序的项目
   */
  sortByPriority(items: MemoryItem[]): MemoryItem[] {
    const now = new Date();
    
    return [...items].sort((a, b) => {
      // 优先级的权重因素
      const scoreA = this.calculatePriorityScore(a, now);
      const scoreB = this.calculatePriorityScore(b, now);
      
      return scoreB - scoreA; // 降序排列
    });
  }

  /**
   * 计算项目的优先级分数
   */
  private calculatePriorityScore(item: MemoryItem, now: Date): number {
    let score = 0;
    
    // 1. 过期时间越长，优先级越高
    const overdueHours = Math.max(0, (now.getTime() - item.nextReviewAt.getTime()) / (1000 * 60 * 60));
    score += overdueHours * 2;
    
    // 2. 当前保持率越低，优先级越高
    const elapsedMinutes = (now.getTime() - item.lastReviewedAt?.getTime() || item.createdAt.getTime()) / (1000 * 60);
    const currentRetention = calculateRetentionRate(elapsedMinutes, item.difficulty);
    score += (100 - currentRetention) * 0.5;
    
    // 3. 难度越高的内容，优先级越高
    const difficultyWeight = {
      easy: 1,
      medium: 1.5,
      hard: 2,
    };
    score *= difficultyWeight[item.difficulty];
    
    // 4. 复习次数越少，优先级越高
    score += (5 - Math.min(item.reviewCount, 5)) * 10;
    
    return score;
  }

  /**
   * 获取今日待复习内容
   */
  getTodayReviews(items: MemoryItem[]): MemoryItem[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return items.filter(item => 
      item.nextReviewAt >= today && 
      item.nextReviewAt < tomorrow
    );
  }

  /**
   * 获取本周学习统计
   */
  getWeeklyStats(items: MemoryItem[]) {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const recentItems = items.filter(item => item.createdAt >= weekAgo);
    
    const stats = {
      learned: recentItems.length,
      reviewed: recentItems.filter(item => item.reviewCount > 0).length,
      averageRetention: 0,
      forgottenCount: 0,
    };
    
    if (recentItems.length > 0) {
      const totalRetention = recentItems.reduce((sum, item) => sum + item.retentionRate, 0);
      stats.averageRetention = totalRetention / recentItems.length;
      
      const now = new Date();
      stats.forgottenCount = recentItems.filter(item => {
        const elapsedMinutes = (now.getTime() - item.lastReviewedAt?.getTime() || item.createdAt.getTime()) / (1000 * 60);
        const retention = calculateRetentionRate(elapsedMinutes, item.difficulty);
        return isForgotten(retention);
      }).length;
    }
    
    return stats;
  }
}

/**
 * 记忆内容分析器
 */
export class MemoryAnalyzer {
  /**
   * 分析记忆模式
   */
  analyzePatterns(items: MemoryItem[]) {
    const patterns = {
      mostDifficultCategory: "",
      easiestCategory: "",
      averageRetentionByDifficulty: {} as Record<string, number>,
      optimalReviewTimes: [] as number[],
      commonMistakes: [] as string[],
    };
    
    // 按难度分组分析
    const byDifficulty = items.reduce((acc, item) => {
      if (!acc[item.difficulty]) acc[item.difficulty] = [];
      acc[item.difficulty].push(item);
      return acc;
    }, {} as Record<string, MemoryItem[]>);
    
    // 计算各难度的平均保持率
    Object.entries(byDifficulty).forEach(([difficulty, items]) => {
      if (items.length > 0) {
        const avg = items.reduce((sum, item) => sum + item.retentionRate, 0) / items.length;
        patterns.averageRetentionByDifficulty[difficulty] = avg;
      }
    });
    
    return patterns;
  }

  /**
   * 生成个性化建议
   */
  generateRecommendations(items: MemoryItem[]) {
    const recommendations = {
      focusAreas: [] as string[],
      suggestedIntervals: [] as number[],
      studyTips: [] as string[],
    };
    
    // 找出需要重点关注的领域
    const lowRetentionItems = items.filter(item => item.retentionRate < 60);
    if (lowRetentionItems.length > 0) {
      const categoryCounts = lowRetentionItems.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      recommendations.focusAreas = Object.entries(categoryCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([category]) => category);
    }
    
    return recommendations;
  }
}
