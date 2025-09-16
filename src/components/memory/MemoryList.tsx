import React, { useState } from "react";
import { Trash2, Clock, Tag, AlertCircle } from "lucide-react";
import { MemoryItem } from "@/types";
import { storageManager } from "@/utils/storage";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";

interface MemoryListProps {
  items: MemoryItem[];
  onUpdate: () => void;
  filterCategory?: string;
  searchQuery?: string;
}

export function MemoryList({ items, onUpdate, filterCategory, searchQuery }: MemoryListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这个记忆项吗？")) return;
    
    setDeletingId(id);
    try {
      await storageManager.deleteItem(id);
      onUpdate();
    } catch (error) {
      console.error("删除失败:", error);
    } finally {
      setDeletingId(null);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "text-green-600 bg-green-50";
      case "medium": return "text-yellow-600 bg-yellow-50";
      case "hard": return "text-red-600 bg-red-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "简单";
      case "medium": return "中等";
      case "hard": return "困难";
      default: return "未知";
    }
  };

  const filteredItems = items.filter(item => {
    if (filterCategory && filterCategory !== "all" && item.category !== filterCategory) {
      return false;
    }
    
    if (searchQuery && !item.content.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    // 按下次复习时间升序排列
    return a.nextReviewAt.getTime() - b.nextReviewAt.getTime();
  });

  if (sortedItems.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-500">
          {searchQuery || filterCategory ? "没有找到匹配的记忆内容" : "还没有添加任何记忆内容"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sortedItems.map((item) => (
        <div
          key={item.id}
          className={`bg-white rounded-lg shadow-sm border p-4 transition-all ${
            deletingId === item.id ? "opacity-50" : ""
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-gray-800 mb-2 whitespace-pre-wrap">{item.content}</p>
              
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Tag className="w-4 h-4" />
                  {item.category}
                </span>
                
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(item.difficulty)}`}>
                  {getDifficultyLabel(item.difficulty)}
                </span>
                
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatDistanceToNow(item.nextReviewAt, { locale: zhCN, addSuffix: true })}
                </span>
                
                <span className="flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  保持率: {item.retentionRate.toFixed(1)}%
                </span>
                
                <span className="text-gray-500">
                  复习 {item.reviewCount} 次
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 ml-4">
              <button
                onClick={() => handleDelete(item.id)}
                disabled={deletingId === item.id}
                className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                title="删除"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* 显示复习历史 */}
          {item.intervals && item.intervals.length > 0 && (
            <div className="mt-3 pt-3 border-t">
              <p className="text-xs text-gray-500 mb-1">最近复习记录:</p>
              <div className="flex gap-2 flex-wrap">
                {item.intervals.slice(-3).map((interval, index) => (
                  <span
                    key={index}
                    className={`text-xs px-2 py-1 rounded ${
                      interval.success ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}
                  >
                    {interval.interval}分钟 - {interval.success ? "成功" : "失败"}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
