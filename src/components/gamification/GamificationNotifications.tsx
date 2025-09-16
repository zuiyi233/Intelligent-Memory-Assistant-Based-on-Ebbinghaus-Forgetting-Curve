import React, { useState, useEffect } from "react";
import { Check, Star, Trophy, Zap } from "lucide-react";

interface GamificationNotification {
  id: string;
  type: "POINTS" | "EXPERIENCE" | "ACHIEVEMENT" | "STREAK" | "LEVEL_UP";
  title: string;
  message: string;
  amount?: number;
  timestamp: Date;
}

export function GamificationNotifications() {
  const [notifications, setNotifications] = useState<GamificationNotification[]>([]);
  const [visibleNotifications, setVisibleNotifications] = useState<string[]>([]);

  // 添加新通知
  const addNotification = (notification: Omit<GamificationNotification, "id" | "timestamp">) => {
    const newNotification: GamificationNotification = {
      ...notification,
      id: crypto.randomUUID(),
      timestamp: new Date()
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    setVisibleNotifications(prev => [...prev, newNotification.id]);
    
    // 5秒后自动隐藏
    setTimeout(() => {
      setVisibleNotifications(prev => prev.filter(id => id !== newNotification.id));
    }, 5000);
  };

  // 监听游戏化事件
  useEffect(() => {
    // 这里可以添加事件监听器，或者通过全局状态管理接收游戏化事件
    // 为了演示，我们暂时不添加实际的事件监听
    
    return () => {
      // 清理事件监听器
    };
  }, []);

  // 获取通知图标
  const getNotificationIcon = (type: GamificationNotification["type"]) => {
    switch (type) {
      case "POINTS":
        return <Star className="w-6 h-6 text-yellow-500" />;
      case "EXPERIENCE":
        return <Zap className="w-6 h-6 text-blue-500" />;
      case "ACHIEVEMENT":
        return <Trophy className="w-6 h-6 text-purple-500" />;
      case "STREAK":
        return <Check className="w-6 h-6 text-green-500" />;
      case "LEVEL_UP":
        return <Trophy className="w-6 h-6 text-orange-500" />;
      default:
        return <Star className="w-6 h-6 text-yellow-500" />;
    }
  };

  // 获取通知背景色
  const getNotificationBg = (type: GamificationNotification["type"]) => {
    switch (type) {
      case "POINTS":
        return "bg-yellow-50 border-yellow-200";
      case "EXPERIENCE":
        return "bg-blue-50 border-blue-200";
      case "ACHIEVEMENT":
        return "bg-purple-50 border-purple-200";
      case "STREAK":
        return "bg-green-50 border-green-200";
      case "LEVEL_UP":
        return "bg-orange-50 border-orange-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications
        .filter(notification => visibleNotifications.includes(notification.id))
        .map(notification => (
          <div
            key={notification.id}
            className={`${getNotificationBg(notification.type)} border rounded-lg p-4 shadow-lg transform transition-all duration-300 animate-in slide-in-from-right-5`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{notification.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                {notification.amount && (
                  <p className="text-lg font-bold mt-1">+{notification.amount}</p>
                )}
              </div>
              <button
                onClick={() => setVisibleNotifications(prev => prev.filter(id => id !== notification.id))}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        ))}
    </div>
  );
}

// 导出单例实例和通知函数
const notificationInstance: {
  addNotification: (notification: Omit<GamificationNotification, "id" | "timestamp">) => void;
} | null = null;

export const initGamificationNotifications = () => {
  // 在实际应用中，这里可以初始化通知系统
  // 为了简化，我们只提供一个简单的全局函数
};

export const showGamificationNotification = (notification: Omit<GamificationNotification, "id" | "timestamp">) => {
  // 在实际应用中，这里可以通过事件总线或状态管理来触发通知
  // 为了简化，我们使用浏览器的通知API作为备选方案
  if (Notification.permission === "granted") {
    new Notification(notification.title, {
      body: notification.message,
      icon: "/favicon.ico"
    });
  } else {
    console.log("游戏化通知:", notification);
  }
};