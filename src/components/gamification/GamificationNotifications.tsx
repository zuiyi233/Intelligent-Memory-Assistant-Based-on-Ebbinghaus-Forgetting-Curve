"use client";

import React, { useState, useEffect } from "react";
import { Check, Star, Trophy, Zap, Target, Award, TrendingUp } from "lucide-react";

interface GamificationNotification {
  id: string;
  type: "POINTS" | "EXPERIENCE" | "ACHIEVEMENT" | "STREAK" | "LEVEL_UP" | "CHALLENGE_COMPLETED";
  title: string;
  message: string;
  amount?: number;
  timestamp: Date;
  autoClose?: boolean;
  duration?: number;
}

// 全局通知状态管理
let globalNotifications: GamificationNotification[] = [];
let globalListeners: ((notifications: GamificationNotification[]) => void)[] = [];

// 添加全局通知监听器
export const addNotificationListener = (listener: (notifications: GamificationNotification[]) => void) => {
  globalListeners.push(listener);
  return () => {
    globalListeners = globalListeners.filter(l => l !== listener);
  };
};

// 通知所有监听器
const notifyListeners = () => {
  globalListeners.forEach(listener => listener([...globalNotifications]));
};

export function GamificationNotifications() {
  const [notifications, setNotifications] = useState<GamificationNotification[]>([]);
  const [visibleNotifications, setVisibleNotifications] = useState<Set<string>>(new Set());

  // 监听全局通知变化
  useEffect(() => {
    const handleNotificationsChange = (newNotifications: GamificationNotification[]) => {
      setNotifications(newNotifications);
      
      // 自动显示新通知
      const newNotificationIds = newNotifications
        .filter(n => !visibleNotifications.has(n.id))
        .map(n => n.id);
      
      if (newNotificationIds.length > 0) {
        setVisibleNotifications(prev => new Set([...prev, ...newNotificationIds]));
      }
    };

    const unsubscribe = addNotificationListener(handleNotificationsChange);
    return unsubscribe;
  }, [visibleNotifications]);

  // 自动关闭通知
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const notificationsToClose = notifications.filter(notification => {
        if (notification.autoClose !== false) {
          const duration = notification.duration || 5000; // 默认5秒
          return now.getTime() - notification.timestamp.getTime() > duration;
        }
        return false;
      });

      if (notificationsToClose.length > 0) {
        const idsToClose = notificationsToClose.map(n => n.id);
        setVisibleNotifications(prev => {
          const newSet = new Set(prev);
          idsToClose.forEach(id => newSet.delete(id));
          return newSet;
        });

        // 从全局通知中移除
        globalNotifications = globalNotifications.filter(n => !idsToClose.includes(n.id));
        notifyListeners();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [notifications]);

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
        return <TrendingUp className="w-6 h-6 text-green-500" />;
      case "LEVEL_UP":
        return <Award className="w-6 h-6 text-orange-500" />;
      case "CHALLENGE_COMPLETED":
        return <Target className="w-6 h-6 text-red-500" />;
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
      case "CHALLENGE_COMPLETED":
        return "bg-red-50 border-red-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications
        .filter(notification => visibleNotifications.has(notification.id))
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
                onClick={() => {
                  setVisibleNotifications(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(notification.id);
                    return newSet;
                  });
                  globalNotifications = globalNotifications.filter(n => n.id !== notification.id);
                  notifyListeners();
                }}
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

export const initGamificationNotifications = () => {
  // 初始化通知系统
  if (typeof window !== 'undefined' && Notification.permission === 'default') {
    Notification.requestPermission();
  }
};

export const showGamificationNotification = (notification: Omit<GamificationNotification, "id" | "timestamp">) => {
  const newNotification: GamificationNotification = {
    ...notification,
    id: `notification-${Date.now()}-${Math.random()}`,
    timestamp: new Date(),
    autoClose: notification.autoClose ?? true,
    duration: notification.duration ?? 5000
  };

  // 添加到全局通知列表
  globalNotifications = [...globalNotifications, newNotification];
  notifyListeners();

  // 如果浏览器通知权限已授予，显示浏览器通知
  if (typeof window !== 'undefined' && Notification.permission === "granted") {
    new Notification(notification.title, {
      body: notification.message,
      icon: "/favicon.ico"
    });
  }
};