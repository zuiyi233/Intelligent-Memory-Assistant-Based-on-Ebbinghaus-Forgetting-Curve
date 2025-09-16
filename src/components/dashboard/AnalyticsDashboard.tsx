"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import { MemoryItem, Category } from "@/types";
import { format, subDays, startOfDay, endOfDay } from "date-fns";

interface DashboardProps {
  items: MemoryItem[];
  categories: Category[];
}

interface ChartDataPoint {
  date: string;
  retention: number;
  items: number;
  reviews: number;
}

interface CategoryStats {
  name: string;
  count: number;
  averageRetention: number;
  color: string | undefined;
}

export function AnalyticsDashboard({ items, categories }: DashboardProps) {
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("week");
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState({
    totalItems: 0,
    averageRetention: 0,
    itemsToReview: 0,
    completedToday: 0,
    streakDays: 0,
  });

  const calculatePerformanceMetrics = useCallback(() => {
    const totalItems = items.length;
    const averageRetention =
      totalItems > 0
        ? items.reduce((sum, item) => sum + item.retentionRate, 0) / totalItems
        : 0;

    const itemsToReview = items.filter(
      item => item.nextReviewAt <= new Date()
    ).length;

    const today = new Date();
    const todayStart = startOfDay(today);
    const completedToday = items.filter(
      item =>
        item.lastReviewedAt &&
        item.lastReviewedAt >= todayStart &&
        item.lastReviewedAt <= new Date()
    ).length;

    // 简化的连续天数计算
    const streakDays = items.filter(
      item =>
        item.lastReviewedAt &&
        item.lastReviewedAt >= subDays(new Date(), 1)
    ).length > 0
      ? 1
      : 0;

    setPerformanceMetrics({
      totalItems,
      averageRetention: Math.round(averageRetention),
      itemsToReview,
      completedToday,
      streakDays,
    });
  }, [items]);

  const generateChartData = useCallback(() => {
    const days = timeRange === "week" ? 7 : timeRange === "month" ? 30 : 365;
    const data: ChartDataPoint[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);

      // 过滤当天的数据
      const dayItems = items.filter(item => {
        const created = new Date(item.createdAt);
        return created >= dayStart && created <= dayEnd;
      });

      const reviewedItems = items.filter(item =>
        item.lastReviewedAt &&
        item.lastReviewedAt >= dayStart &&
        item.lastReviewedAt <= dayEnd
      );

      const avgRetention =
        dayItems.length > 0
          ? dayItems.reduce((sum, item) => sum + item.retentionRate, 0) /
            dayItems.length
          : 0;

      data.push({
        date: format(date, "MM/dd"),
        retention: Math.round(avgRetention),
        items: dayItems.length,
        reviews: reviewedItems.length,
      });
    }

    setChartData(data);
  }, [items, timeRange]);

  const generateCategoryStats = useCallback(() => {
    const stats: CategoryStats[] = categories.map(category => ({
      name: category.name,
      count: category.itemCount,
      averageRetention: Math.round(category.averageRetention),
      color: category.color,
    }));

    setCategoryStats(stats);
  }, [categories]);

  useEffect(() => {
    generateChartData();
    generateCategoryStats();
    calculatePerformanceMetrics();
  }, [generateChartData, generateCategoryStats, calculatePerformanceMetrics]);


  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

  return (
    <div className="space-y-6">
      {/* 关键指标卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">总记忆内容</p>
              <p className="text-3xl font-bold text-blue-600">
                {performanceMetrics.totalItems}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 text-xl">📚</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">平均保持率</p>
              <p className="text-3xl font-bold text-green-600">
                {performanceMetrics.averageRetention}%
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-green-600 text-xl">📈</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">待复习</p>
              <p className="text-3xl font-bold text-orange-600">
                {performanceMetrics.itemsToReview}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <span className="text-orange-600 text-xl">⏰</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">今日完成</p>
              <p className="text-3xl font-bold text-purple-600">
                {performanceMetrics.completedToday}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-purple-600 text-xl">✅</span>
            </div>
          </div>
        </div>
      </div>

      {/* 时间范围选择器 */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">学习趋势分析</h3>
          <div className="flex gap-2">
            {(["week", "month", "year"] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  timeRange === range
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {range === "week" ? "近7天" : range === "month" ? "近30天" : "近一年"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 学习趋势图 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">记忆保持率趋势</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 100]} />
              <Tooltip formatter={(value) => [`${value}%`, "保持率"]} />
              <Area
                type="monotone"
                dataKey="retention"
                stroke="#3B82F6"
                fill="#93C5FD"
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">每日学习活动</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="items" fill="#10B981" name="新增内容" />
              <Bar dataKey="reviews" fill="#F59E0B" name="复习次数" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 分类统计 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">分类分布</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryStats}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {categoryStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                ))}
                <LabelList dataKey="name" position="outside" />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">分类表现</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryStats} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 100]} />
              <YAxis dataKey="name" type="category" width={80} />
              <Tooltip formatter={(value) => [`${value}%`, "平均保持率"]} />
              <Bar dataKey="averageRetention" fill="#8B5CF6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 详细统计表格 */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">详细统计</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4 font-medium">分类</th>
                <th className="text-right p-4 font-medium">项目数</th>
                <th className="text-right p-4 font-medium">平均保持率</th>
                <th className="text-right p-4 font-medium">待复习</th>
              </tr>
            </thead>
            <tbody>
              {categoryStats.map((stat) => {
                const pendingReviews = items.filter(
                  (item) =>
                    item.category === stat.name &&
                    item.nextReviewAt <= new Date()
                ).length;

                return (
                  <tr key={stat.name} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: stat.color }}
                        />
                        <span>{stat.name}</span>
                      </div>
                    </td>
                    <td className="text-right p-4">{stat.count}</td>
                    <td className="text-right p-4">{stat.averageRetention}%</td>
                    <td className="text-right p-4">
                      <span
                        className={`${
                          pendingReviews > 0 ? "text-orange-600" : "text-green-600"
                        }`}
                      >
                        {pendingReviews}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
