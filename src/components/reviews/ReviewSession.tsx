import React, { useState, useEffect, useCallback } from "react";
import { RotateCcw, Check, X, Clock, Brain } from "lucide-react";
import { MemoryItem } from "@/types";
import { storageManager } from "@/utils/storage";
import { SmartReviewScheduler } from "@/utils/reviewScheduler";
import { gamificationService } from "@/services/gamification.service";
import { showGamificationNotification } from "@/components/gamification/GamificationNotifications";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";

interface ReviewSessionProps {
  onComplete: () => void;
  onSkip: () => void;
}

export function ReviewSession({ onComplete, onSkip }: ReviewSessionProps) {
  const [items, setItems] = useState<MemoryItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [sessionStats, setSessionStats] = useState({
    total: 0,
    correct: 0,
    incorrect: 0,
    skipped: 0,
  });

  const scheduler = new SmartReviewScheduler();

  const loadReviewItems = useCallback(async () => {
    try {
      const allItems = await storageManager.getItems();
      const now = new Date();
      
      // 获取需要复习的项目
      const reviewItems = allItems
        .filter(item => item.nextReviewAt <= now)
        .sort((a, b) => {
          // 按优先级排序：过期时间 > 保持率 > 难度
          const scoreA = calculatePriorityScore(a, now);
          const scoreB = calculatePriorityScore(b, now);
          return scoreB - scoreA;
        })
        .slice(0, 20); // 最多20个项目

      setItems(reviewItems);
      setSessionStats(prev => ({ ...prev, total: reviewItems.length }));
      
      if (reviewItems.length > 0) {
        setStartTime(new Date());
      }
    } catch (error) {
      console.error("加载复习项目失败:", error);
    }
  }, []);

  useEffect(() => {
    loadReviewItems();
  }, [loadReviewItems]);


  const calculatePriorityScore = (item: MemoryItem, now: Date): number => {
    let score = 0;
    
    // 过期时间权重最高
    const overdueHours = Math.max(0, (now.getTime() - item.nextReviewAt.getTime()) / (1000 * 60 * 60));
    score += overdueHours * 3;
    
    // 保持率低的优先
    score += (100 - item.retentionRate) * 0.5;
    
    // 难度高的优先
    const difficultyWeight: Record<"easy" | "medium" | "hard", number> = { easy: 1, medium: 1.5, hard: 2 };
    score *= difficultyWeight[item.difficulty];
    
    // 复习次数少的优先
    score += (5 - Math.min(item.reviewCount, 5)) * 5;
    
    return score;
  };

  const handleResponse = async (correct: boolean) => {
    if (!startTime || currentIndex >= items.length) return;

    const responseTime = (new Date().getTime() - startTime.getTime()) / 1000;
    const currentItem = items[currentIndex];

    try {
      // 处理复习结果
      const updatedItem = scheduler.processReviewResult(
        currentItem,
        correct,
        responseTime
      );

      await storageManager.saveItem(updatedItem);

      // 更新统计
      setSessionStats(prev => ({
        ...prev,
        [correct ? "correct" : "incorrect"]: prev[correct ? "correct" : "incorrect"] + 1,
      }));

      // 调用游戏化服务
      try {
        // 添加积分和经验值
        await gamificationService.handleReviewCompleted("user-id", { isCompleted: correct });
        
        // 显示游戏化通知
        showGamificationNotification({
          type: "POINTS",
          title: "复习完成",
          message: correct ? "太棒了！你正确回忆了这个内容" : "继续努力，下次一定可以记住",
          amount: correct ? 10 : 5
        });
        
        showGamificationNotification({
          type: "EXPERIENCE",
          title: "经验值增加",
          message: "你获得了经验值",
          amount: correct ? 20 : 10
        });
      } catch (gamificationError) {
        console.error("游戏化服务调用失败:", gamificationError);
        // 不影响主流程，只记录错误
      }

      // 进入下一题
      if (currentIndex < items.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setShowAnswer(false);
        setStartTime(new Date());
      } else {
        onComplete();
      }
    } catch (error) {
      console.error("处理复习结果失败:", error);
    }
  };

  const handleSkip = () => {
    setSessionStats(prev => ({ ...prev, skipped: prev.skipped + 1 }));
    
    if (currentIndex < items.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowAnswer(false);
      setStartTime(new Date());
    } else {
      onSkip();
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <Brain className="w-16 h-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">太棒了！</h3>
        <p className="text-gray-600">目前没有需要复习的内容，继续保持良好的学习习惯！</p>
      </div>
    );
  }

  const currentItem = items[currentIndex];
  const progress = ((currentIndex + 1) / items.length) * 100;

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* 进度条 */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">
            题目 {currentIndex + 1} / {items.length}
          </span>
          <span className="text-sm text-gray-600">
            剩余 {items.length - currentIndex - 1} 题
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600">{sessionStats.total}</div>
          <div className="text-sm text-blue-600">总计</div>
        </div>
        <div className="bg-green-50 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600">{sessionStats.correct}</div>
          <div className="text-sm text-green-600">正确</div>
        </div>
        <div className="bg-red-50 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-red-600">{sessionStats.incorrect}</div>
          <div className="text-sm text-red-600">错误</div>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-gray-600">{sessionStats.skipped}</div>
          <div className="text-sm text-gray-600">跳过</div>
        </div>
      </div>

      {/* 复习卡片 */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              currentItem.difficulty === "easy" ? "bg-green-100 text-green-700" :
              currentItem.difficulty === "medium" ? "bg-yellow-100 text-yellow-700" :
              "bg-red-100 text-red-700"
            }`}>
              {currentItem.difficulty === "easy" ? "简单" : 
               currentItem.difficulty === "medium" ? "中等" : "困难"}
            </span>
            <span className="text-sm text-gray-600">{currentItem.category}</span>
          </div>
          <div className="text-sm text-gray-600">
            <Clock className="inline-block w-4 h-4 mr-1" />
            {formatDistanceToNow(currentItem.nextReviewAt, { locale: zhCN, addSuffix: true })}
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {currentItem.content}
          </h2>

          {!showAnswer ? (
            <button
              onClick={() => setShowAnswer(true)}
              className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              显示答案
            </button>
          ) : (
            <div className="space-y-4">
              <p className="text-lg text-gray-600 mb-6">
                你还记得这个内容吗？
              </p>
              
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => handleResponse(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <Check className="w-5 h-5" />
                  记住了
                </button>
                
                <button
                  onClick={() => handleResponse(false)}
                  className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                  忘记了
                </button>
                
                <button
                  onClick={handleSkip}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <RotateCcw className="w-5 h-5" />
                  跳过
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 提示信息 */}
      <div className="text-center text-sm text-gray-600">
        {showAnswer ? (
          <p>请诚实回答，这将帮助系统为你制定更好的复习计划。</p>
        ) : (
          <p>点击&ldquo;显示答案&rdquo;后开始计时，尽量回忆内容。</p>
        )}
      </div>
    </div>
  );
}
