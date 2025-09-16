import React, { useState, useEffect } from "react";
import { Bell, Clock, TrendingUp, Calendar, Zap, Award } from "lucide-react";
import { MemoryItem } from "@/types";
import { storageManager } from "@/utils/storage";
import { SmartReviewScheduler } from "@/utils/reviewScheduler";
import { formatDistanceToNow, format, differenceInMinutes } from "date-fns";
import { zhCN } from "date-fns/locale";

interface NotificationSystemProps {
  onStartReview: () => void;
}

export function NotificationSystem({ onStartReview }: NotificationSystemProps) {
  const [itemsToReview, setItemsToReview] = useState<MemoryItem[]>([]);
  const [urgentItems, setUrgentItems] = useState<MemoryItem[]>([]);
  const [todayPlan, setTodayPlan] = useState<MemoryItem[]>([]);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>("default");
  const [showNotifications, setShowNotifications] = useState(true);
  const [studyStreak, setStudyStreak] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(10);
  const [completedToday, setCompletedToday] = useState(0);

  const scheduler = new SmartReviewScheduler();

  useEffect(() => {
    loadReviewData();
    checkNotificationPermission();
    loadStudyStats();
    
    // 每分钟检查一次
    const interval = setInterval(() => {
      loadReviewData();
      loadStudyStats();
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (showNotifications && notificationPermission === "granted") {
      checkAndNotify();
    }
  }, [itemsToReview]);

  const loadReviewData = async () => {
    try {
      const items = await storageManager.getItems();
      
      // 获取需要复习的项目
      const toReview = items.filter(item => item.nextReviewAt <= new Date());
      setItemsToReview(toReview);
      
      // 获取紧急项目（超过预定时间1小时以上）
      const urgent = toReview.filter(item => 
        differenceInMinutes(new Date(), item.nextReviewAt) > 60
      );
      setUrgentItems(urgent);
      
      // 获取今日计划
      const plan = scheduler.generateDailyPlan(items);
      setTodayPlan(plan);
    } catch (error) {
      console.error("加载复习数据失败:", error);
    }
  };

  const loadStudyStats = async () => {
    try {
      const items = await storageManager.getItems();
      const now = new Date();
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);
      
      // 计算今日完成的复习
      const completed = items.filter(item => 
        item.lastReviewedAt && item.lastReviewedAt >= todayStart
      ).length;
      setCompletedToday(completed);
      
      // 计算连续学习天数（简化版）
      const yesterday = new Date(todayStart);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayCompleted = items.filter(item => 
        item.lastReviewedAt && 
        item.lastReviewedAt >= yesterday && 
        item.lastReviewedAt < todayStart
      ).length;
      
      setStudyStreak(yesterdayCompleted > 0 ? 1 : 0);
    } catch (error) {
      console.error("加载学习统计失败:", error);
    }
  };

  const checkNotificationPermission = async () => {
    if (Notification in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
    }
  };

  const checkAndNotify = () => {
    if (itemsToReview.length > 0 && notificationPermission === "granted") {
      const newNotifications = itemsToReview.filter(item => {
        const now = new Date();
        const diffMinutes = differenceInMinutes(now, item.nextReviewAt);
        return diffMinutes >= 0 && diffMinutes <= 5; // 5分钟内的新提醒
      });

      newNotifications.forEach(item => {
        new Notification("记忆复习提醒", {
          body: `"${item.content.substring(0, 50)}..." 需要复习了`,
          icon: "/favicon.ico",
          tag: `review-${item.id}`,
          badge: "/badge.png",
          vibrate: [200, 100, 200],
          actions: [
            { action: "review", title: "立即复习" },
            { action: "later", title: "稍后提醒" }
          ]
        });
      });
    }
  };

  const requestNotificationPermission = async () => {
    if (Notification in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
    }
  };

  const getMotivationalMessage = () => {
    const progress = dailyGoal > 0 ? (completedToday / dailyGoal) * 100 : 0;
    
    if (progress === 0) return "开始今天的学习之旅吧！";
    if (progress < 25) return "坚持就是胜利！";
    if (progress < 50) return "做得不错，继续努力！";
    if (progress < 75) return "快要完成了，加油！";
    if (progress < 100) return "马上就要达成目标！";
    return "恭喜完成今日目标！";
  };

  const getProgressColor = () => {
    const progress = dailyGoal > 0 ? (completedToday / dailyGoal) * 100 : 0;
    
    if (progress < 25) return "text-red-600";
    if (progress < 50) return "text-orange-600";
    if (progress < 75) return "text-yellow-600";
    if (progress < 100) return "text-blue-600";
    return "text-green-600";
  };

  const getNextReviewTime = (item: MemoryItem) => {
    const diff = differenceInMinutes(new Date(), item.nextReviewAt);
    
    if (diff < 0) {
      return `还有 ${Math.abs(diff)} 分钟`;
    } else if (diff < 60) {
      return `${diff} 分钟前`;
    } else {
      return formatDistanceToNow(item.nextReviewAt, { locale: zhCN, addSuffix: true });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Bell className="w-5 h-5" />
          智能复习提醒
        </h3>
        
        {notificationPermission === "default" && (
          <button
            onClick={requestNotificationPermission}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            启用通知
          </button>
        )}
      </div>

      {/* 激励消息 */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">{getMotivationalMessage()}</p>
            <p className="text-xs text-gray-600 mt-1">
              连续学习 {studyStreak} 天 · 今日目标 {dailyGoal} 项
            </p>
          </div>
          <Award className="w-8 h-8 text-yellow-500" />
        </div>
      </div>

      {/* 进度环 */}
      <div className="mb-6">
        <div className="flex justify-center">
          <div className="relative w-24 h-24">
            <svg className="w-24 h-24 transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="36"
                stroke="#e5e7eb"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="48"
                cy="48"
                r="36"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 36}`}
                strokeDashoffset={`${2 * Math.PI * 36 * (1 - Math.min(completedToday / dailyGoal, 1))}`}
                className={`transition-all duration-500 ${getProgressColor()}`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold">{completedToday}/{dailyGoal}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 概览卡片 */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-blue-50 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600">{itemsToReview.length}</div>
          <div className="text-sm text-blue-600">待复习</div>
        </div>
        
        <div className="bg-orange-50 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-orange-600">{urgentItems.length}</div>
          <div className="text-sm text-orange-600">紧急</div>
        </div>
        
        <div className="bg-green-50 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600">{studyStreak}</div>
          <div className="text-sm text-green-600">连续天数</div>
        </div>
      </div>

      {/* 紧急项目 */}
      {urgentItems.length > 0 && (
        <div className="mb-4">
          <h4 className="font-medium text-red-600 mb-2 flex items-center gap-2">
            <Zap className="w-4 h-4" />
            紧急复习 ⚠️
          </h4>
          <div className="space-y-2">
            {urgentItems.slice(0, 3).map(item => (
              <div key={item.id} className="bg-red-50 border border-red-200 p-3 rounded-lg">
                <p className="text-sm font-medium truncate">{item.content}</p>
                <p className="text-xs text-red-600">
                  已超时 {getNextReviewTime(item)}
                </p>
                <div className="mt-1">
                  <span className={`text-xs px-2 py-1 rounded ${
                    item.difficulty === "easy" ? "bg-green-100 text-green-700" :
                    item.difficulty === "medium" ? "bg-yellow-100 text-yellow-700" :
                    "bg-red-100 text-red-700"
                  }`}>
                    {item.difficulty === "easy" ? "简单" : 
                     item.difficulty === "medium" ? "中等" : "困难"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 今日计划 */}
      {todayPlan.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            今日复习计划
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {todayPlan.map(item => (
              <div key={item.id} className="border-l-4 border-blue-500 pl-3 py-2 bg-gray-50 rounded-r-lg">
                <p className="text-sm font-medium truncate">{item.content}</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-gray-600">
                    {format(item.nextReviewAt, "HH:mm")} • {item.category}
                  </p>
                  <span className={`text-xs px-2 py-1 rounded ${
                    item.retentionRate < 50 ? "bg-red-100 text-red-700" :
                    item.retentionRate < 80 ? "bg-yellow-100 text-yellow-700" :
                    "bg-green-100 text-green-700"
                  }`}>
                    {item.retentionRate.toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 空状态 */}
      {itemsToReview.length === 0 && (
        <div className="text-center py-8">
          <TrendingUp className="w-12 h-12 mx-auto text-gray-400 mb-2" />
          <p className="text-gray-600">太棒了！没有需要复习的内容</p>
          <p className="text-sm text-gray-500 mt-1">继续保持良好的学习习惯</p>
        </div>
      )}

      {/* 开始复习按钮 */}
      {itemsToReview.length > 0 && (
        <button
          onClick={onStartReview}
          className="w-full mt-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 px-4 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <div className="flex items-center justify-center gap-2">
            <Zap className="w-5 h-5" />
            开始复习 ({itemsToReview.length} 项)
          </div>
        </button>
      )}
    </div>
  );
}
