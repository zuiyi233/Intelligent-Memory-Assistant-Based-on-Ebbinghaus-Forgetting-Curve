import { MemoryItem, Category } from "@/types";
import { SmartReviewScheduler } from "./reviewScheduler";
import { ContentClassificationSystem } from "./contentManagement";

/**
 * 本地存储管理器
 */
export class LocalStorageManager {
  private readonly STORAGE_KEYS = {
    ITEMS: "memory_items",
    CATEGORIES: "memory_categories",
    SETTINGS: "memory_settings",
  };

  private scheduler = new SmartReviewScheduler();
  private classificationSystem = new ContentClassificationSystem();

  /**
   * 保存记忆项到本地存储
   */
  async saveItem(item: MemoryItem): Promise<void> {
    try {
      const items = await this.getItems();
      const existingIndex = items.findIndex(i => i.id === item.id);
      
      if (existingIndex >= 0) {
        items[existingIndex] = item;
      } else {
        items.push(item);
      }
      
      localStorage.setItem(this.STORAGE_KEYS.ITEMS, JSON.stringify(items));
      
      // 更新相关分类的统计信息
      await this.updateCategoryStats(item.category);
    } catch (error) {
      console.error("保存记忆项失败:", error);
      throw error;
    }
  }

  /**
   * 从本地存储获取所有记忆项
   */
  async getItems(): Promise<MemoryItem[]> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.ITEMS);
      if (!stored) return [];

      const parsed = JSON.parse(stored);
      return parsed.map((item: MemoryItem & { createdAt: string; lastReviewedAt?: string; nextReviewAt: string; intervals?: Array<{ scheduledTime: string; actualTime?: string }> }) => ({
        ...item,
        createdAt: new Date(item.createdAt),
        lastReviewedAt: item.lastReviewedAt ? new Date(item.lastReviewedAt) : undefined,
        nextReviewAt: new Date(item.nextReviewAt),
        intervals: item.intervals?.map((interval: { scheduledTime: string; actualTime?: string }) => ({
          ...interval,
          scheduledTime: new Date(interval.scheduledTime),
          actualTime: interval.actualTime ? new Date(interval.actualTime) : undefined,
        })) || [],
      }));
    } catch (error) {
      console.error("获取记忆项失败:", error);
      return [];
    }
  }

  /**
   * 删除记忆项
   */
  async deleteItem(id: string): Promise<void> {
    try {
      const items = await this.getItems();
      const itemToDelete = items.find(item => item.id === id);
      
      if (!itemToDelete) return;

      const filteredItems = items.filter(item => item.id !== id);
      localStorage.setItem(this.STORAGE_KEYS.ITEMS, JSON.stringify(filteredItems));
      
      // 更新相关分类的统计信息
      await this.updateCategoryStats(itemToDelete.category);
    } catch (error) {
      console.error("删除记忆项失败:", error);
      throw error;
    }
  }

  /**
   * 保存分类到本地存储
   */
  async saveCategory(category: Category): Promise<void> {
    try {
      const categories = await this.getCategories();
      const existingIndex = categories.findIndex(c => c.id === category.id);
      
      if (existingIndex >= 0) {
        categories[existingIndex] = category;
      } else {
        categories.push(category);
      }
      
      localStorage.setItem(this.STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    } catch (error) {
      console.error("保存分类失败:", error);
      throw error;
    }
  }

  /**
   * 获取所有分类
   */
  async getCategories(): Promise<Category[]> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEYS.CATEGORIES);
      if (!stored) {
        // 初始化默认分类
        const defaultCategories: Category[] = [
          { id: "vocab", name: "词汇", color: "#3B82F6", itemCount: 0, averageRetention: 0 },
          { id: "concept", name: "概念", color: "#EF4444", itemCount: 0, averageRetention: 0 },
          { id: "formula", name: "公式", color: "#10B981", itemCount: 0, averageRetention: 0 },
        ];
        
        localStorage.setItem(this.STORAGE_KEYS.CATEGORIES, JSON.stringify(defaultCategories));
        return defaultCategories;
      }

      return JSON.parse(stored);
    } catch (error) {
      console.error("获取分类失败:", error);
      return [];
    }
  }

  /**
   * 删除分类
   */
  async deleteCategory(id: string): Promise<void> {
    try {
      const categories = await this.getCategories();
      const filteredCategories = categories.filter(category => category.id !== id);
      
      localStorage.setItem(this.STORAGE_KEYS.CATEGORIES, JSON.stringify(filteredCategories));
      
      // 将该分类下的所有项目移动到未分类
      const items = await this.getItems();
      const updatedItems = items.map(item => 
        item.category === id ? { ...item, category: "uncategorized" } : item
      );
      
      localStorage.setItem(this.STORAGE_KEYS.ITEMS, JSON.stringify(updatedItems));
    } catch (error) {
      console.error("删除分类失败:", error);
      throw error;
    }
  }

  /**
   * 更新分类统计信息
   */
  async updateCategoryStats(categoryId: string): Promise<void> {
    try {
      const items = await this.getItems();
      const categories = await this.getCategories();
      
      const categoryIndex = categories.findIndex(c => c.id === categoryId);
      if (categoryIndex === -1) return;

      const categoryItems = items.filter(item => item.category === categoryId);
      categories[categoryIndex].itemCount = categoryItems.length;
      
      if (categoryItems.length > 0) {
        const totalRetention = categoryItems.reduce((sum, item) => sum + item.retentionRate, 0);
        categories[categoryIndex].averageRetention = totalRetention / categoryItems.length;
      } else {
        categories[categoryIndex].averageRetention = 0;
      }
      
      localStorage.setItem(this.STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    } catch (error) {
      console.error("更新分类统计失败:", error);
    }
  }

  /**
   * 搜索记忆项
   */
  async searchItems(query: string, category?: string): Promise<MemoryItem[]> {
    try {
      const items = await this.getItems();
      let filtered = items;

      if (category && category !== "all") {
        filtered = filtered.filter(item => item.category === category);
      }

      if (query.trim()) {
        const searchLower = query.toLowerCase();
        filtered = filtered.filter(item => 
          item.content.toLowerCase().includes(searchLower) ||
          item.category.toLowerCase().includes(searchLower)
        );
      }

      return filtered;
    } catch (error) {
      console.error("搜索记忆项失败:", error);
      return [];
    }
  }

  /**
   * 获取需要复习的项目
   */
  async getItemsToReview(): Promise<MemoryItem[]> {
    try {
      const items = await this.getItems();
      const now = new Date();
      
      return items.filter(item => item.nextReviewAt <= now);
    } catch (error) {
      console.error("获取待复习项目失败:", error);
      return [];
    }
  }

  /**
   * 获取今日学习计划
   */
  async getTodayPlan(maxItems: number = 20): Promise<MemoryItem[]> {
    try {
      const items = await this.getItems();
      const scheduler = new SmartReviewScheduler();
      return scheduler.generateDailyPlan(items, maxItems);
    } catch (error) {
      console.error("获取今日计划失败:", error);
      return [];
    }
  }

  /**
   * 备份数据
   */
  async exportData(): Promise<string> {
    try {
      const items = await this.getItems();
      const categories = await this.getCategories();
      
      const backupData = {
        items,
        categories,
        exportedAt: new Date().toISOString(),
        version: "1.0.0"
      };
      
      return JSON.stringify(backupData, null, 2);
    } catch (error) {
      console.error("导出数据失败:", error);
      throw error;
    }
  }

  /**
   * 导入数据
   */
  async importData(jsonData: string): Promise<void> {
    try {
      const backupData = JSON.parse(jsonData);
      
      if (backupData.items) {
        localStorage.setItem(this.STORAGE_KEYS.ITEMS, JSON.stringify(backupData.items));
      }
      
      if (backupData.categories) {
        localStorage.setItem(this.STORAGE_KEYS.CATEGORIES, JSON.stringify(backupData.categories));
      }
      
      console.log("数据导入成功");
    } catch (error) {
      console.error("导入数据失败:", error);
      throw error;
    }
  }

  /**
   * 清空所有数据
   */
  async clearAllData(): Promise<void> {
    try {
      localStorage.removeItem(this.STORAGE_KEYS.ITEMS);
      localStorage.removeItem(this.STORAGE_KEYS.CATEGORIES);
      localStorage.removeItem(this.STORAGE_KEYS.SETTINGS);
    } catch (error) {
      console.error("清空数据失败:", error);
      throw error;
    }
  }
}

// 单例实例
export const storageManager = new LocalStorageManager();
