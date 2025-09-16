import type { Metadata } from "next";
import Link from "next/link";
import { Navigation } from "@/components/layout/Navigation";

export const metadata: Metadata = {
  title: "页面未找到 - 记忆助手",
  description: "抱歉，您访问的页面不存在。请检查URL或返回首页。",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-6xl md:text-8xl font-bold text-gray-900 dark:text-white mb-4">
            4<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">0</span>4
          </h1>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">
            页面未找到
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            抱歉，您访问的页面不存在。可能是URL输入错误，或者该页面已被移除。
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/"
              className="apple-card px-8 py-3 text-lg font-medium text-gray-900 dark:text-white hover:scale-105 transition-transform"
            >
              返回首页
            </Link>
            <Link
              href="/gamification"
              className="glass px-8 py-3 text-lg font-medium text-gray-900 dark:text-white hover:scale-105 transition-transform"
            >
              游戏化中心
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}