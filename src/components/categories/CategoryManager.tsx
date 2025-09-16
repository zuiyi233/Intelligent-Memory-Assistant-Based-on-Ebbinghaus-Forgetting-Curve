import React, { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, Edit3 } from "lucide-react";
import { Category } from "@/types";
import { storageManager } from "@/utils/storage";

interface CategoryManagerProps {
  onCategoriesChange: (categories: Category[]) => void;
}

export function CategoryManager({ onCategoriesChange }: CategoryManagerProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: "", color: "#3B82F6" });

  const loadCategories = useCallback(async () => {
    try {
      const cats = await storageManager.getCategories();
      setCategories(cats);
      onCategoriesChange(cats);
    } catch (error) {
      console.error("加载分类失败:", error);
    }
  }, [onCategoriesChange]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      if (editingCategory) {
        // 编辑现有分类
        const updatedCategory: Category = {
          ...editingCategory,
          name: formData.name,
          color: formData.color,
        };
        await storageManager.saveCategory(updatedCategory);
      } else {
        // 添加新分类
        const newCategory: Category = {
          id: crypto.randomUUID(),
          name: formData.name,
          color: formData.color,
          itemCount: 0,
          averageRetention: 0,
        };
        await storageManager.saveCategory(newCategory);
      }

      resetForm();
      await loadCategories();
    } catch (error) {
      console.error("保存分类失败:", error);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, color: category.color || "#3B82F6" });
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这个分类吗？该分类下的内容将移至未分类。")) return;

    try {
      await storageManager.deleteCategory(id);
      await loadCategories();
    } catch (error) {
      console.error("删除分类失败:", error);
    }
  };

  const resetForm = () => {
    setShowAddForm(false);
    setEditingCategory(null);
    setFormData({ name: "", color: "#3B82F6" });
  };

  const presetColors = [
    "#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6",
    "#EC4899", "#14B8A6", "#F97316", "#6366F1", "#84CC16"
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">内容分类管理</h3>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            <Plus className="w-4 h-4" />
            添加分类
          </button>
        )}
      </div>

      {showAddForm && (
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <h4 className="font-medium mb-3">
            {editingCategory ? "编辑分类" : "新建分类"}
          </h4>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">名称</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="例如：英语单词、数学公式..."
                className="w-full px-3 py-2 border rounded-md"
                maxLength={20}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">颜色</label>
              <div className="grid grid-cols-5 gap-2">
                {presetColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData({ ...formData, color })}
                    className={`w-full h-8 rounded-md border-2 transition-all ${
                      formData.color === color ? "border-gray-800 scale-110" : "border-transparent"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
              >
                {editingCategory ? "更新" : "创建"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border rounded-md hover:bg-gray-50"
              >
                取消
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-3">
        {categories.map((category) => (
          <div
            key={category.id}
            className="bg-white rounded-lg shadow-sm border p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: category.color }}
              />
              <div>
                <h4 className="font-medium">{category.name}</h4>
                <p className="text-sm text-gray-600">
                  {category.itemCount} 个项目 · 平均保持率 {category.averageRetention.toFixed(1)}%
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleEdit(category)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                title="编辑"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              {category.id !== "vocab" && category.id !== "concept" && category.id !== "formula" && (
                <button
                  onClick={() => handleDelete(category.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                  title="删除"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
