"use client";

import React from "react";
import { AnalyticsDashboard } from "@/components/dashboard/AnalyticsDashboard";
import { MemoryItem } from "@/types";
import { storageManager } from "@/utils/storage";
import { useEffect, useState } from "react";
import { Navigation } from "@/components/layout/Navigation";

// 简单的Category类型定义
interface Category {
  id: string;
  name: string;
  color?: string;
}

export default function StatsPage() {
  const [items, setItems] = useState<MemoryItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [loadedItems, loadedCategories] = await Promise.all([
        storageManager.getItems(),
        storageManager.getCategories()
      ]);
      setItems(loadedItems);
      setCategories(loadedCategories);
    } catch (error) {
      console.error("加载数据失败:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">学习数据分析</h1>
          <p className="text-gray-600">深入了解您的记忆效果和进步轨迹</p>
        </div>
        
        <AnalyticsDashboard items={items} categories={categories} />
      </div>
    </div>
  );
}
