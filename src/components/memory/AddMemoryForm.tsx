import React, { useState } from "react";
import { X } from "lucide-react";
import { MemoryItem, DifficultyLevel } from "@/types";
import { storageManager } from "@/utils/storage";
import { useGamificationEventHandler } from "@/services/gamificationEventHandler.service";

interface AddMemoryFormProps {
  onClose: () => void;
  onSuccess: () => void;
  categories: Array<{ id: string; name: string; color: string }>;
}

export function AddMemoryForm({ onClose, onSuccess, categories }: AddMemoryFormProps) {
  const [formData, setFormData] = useState({
    content: "",
    category: categories[0]?.id || "",
    difficulty: "medium" as DifficultyLevel,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { handleMemoryCreated } = useGamificationEventHandler();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.content.trim()) return;

    setIsSubmitting(true);
    try {
      const newItem: Omit<MemoryItem, "id" | "createdAt" | "nextReviewAt" | "retentionRate" | "reviewCount" | "intervals"> = {
        content: formData.content.trim(),
        category: formData.category,
        difficulty: formData.difficulty,
      };

      await storageManager.saveItem({
        ...newItem,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        nextReviewAt: new Date(), // 立即可以复习
        retentionRate: 100,
        reviewCount: 0,
        intervals: [],
      });

      // 调用游戏化事件处理器
      try {
        await handleMemoryCreated({
          category: formData.category,
          difficulty: formData.difficulty
        });
      } catch (gamificationError) {
        console.error("游戏化事件处理失败:", gamificationError);
        // 不影响主流程，只记录错误
      }

      onSuccess();
    } catch (error) {
      console.error("Failed to add memory item:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">添加新记忆内容</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">内容</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="输入要记忆的内容..."
              className="w-full px-3 py-2 border rounded-md resize-none"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">分类</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">难度</label>
            <div className="grid grid-cols-3 gap-2">
              {(["easy", "medium", "hard"] as DifficultyLevel[]).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setFormData({ ...formData, difficulty: level })}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    formData.difficulty === level
                      ? "bg-blue-500 text-white"
                      : "border hover:bg-gray-50"
                  }`}
                >
                  {level === "easy" ? "简单" : level === "medium" ? "中等" : "困难"}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50"
            >
              {isSubmitting ? "保存中..." : "添加"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md hover:bg-gray-50"
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
