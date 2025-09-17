"use client";

import { useEffect } from "react";
import { initGamificationNotifications } from "./GamificationNotifications";

export function GamificationInitializer() {
  useEffect(() => {
    // 初始化游戏化通知系统
    initGamificationNotifications();
  }, []);

  return null;
}