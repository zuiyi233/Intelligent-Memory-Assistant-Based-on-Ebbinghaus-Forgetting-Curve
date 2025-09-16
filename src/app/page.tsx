"use client";

import Link from "next/link";
import { Brain, BookOpen, BarChart3, Users, Star } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              基于
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                艾宾浩斯遗忘曲线
              </span>
              的智能记忆助手
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              科学记忆，高效复习。让每一次学习都事半功倍，让知识真正成为你的财富。
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/auth/signup"
                className="apple-card px-8 py-3 text-lg font-medium text-gray-900 dark:text-white hover:scale-105 transition-transform"
              >
                开始免费试用
              </Link>
              <Link
                href="#features"
                className="glass px-8 py-3 text-lg font-medium text-gray-900 dark:text-white hover:scale-105 transition-transform"
              >
                了解更多
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white/50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              核心功能
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              为您提供全方位的记忆管理解决方案
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="apple-card p-6 text-center hover:scale-105 transition-transform">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Brain className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                智能算法
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                基于艾宾浩斯遗忘曲线，科学计算最佳复习时间点
              </p>
            </div>

            {/* Feature 2 */}
            <div className="apple-card p-6 text-center hover:scale-105 transition-transform">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                内容管理
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                支持分类整理、标签管理，让记忆内容井井有条
              </p>
            </div>

            {/* Feature 3 */}
            <div className="apple-card p-6 text-center hover:scale-105 transition-transform">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                数据可视化
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                直观展示学习进度和记忆效果，让进步看得见
              </p>
            </div>

            {/* Feature 4 */}
            <div className="apple-card p-6 text-center hover:scale-105 transition-transform">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                多端同步
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                跨设备数据同步，随时随地学习复习
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Ebbinghaus Curve Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass p-8 rounded-2xl">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                  艾宾浩斯遗忘曲线
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                  德国心理学家艾宾浩斯研究发现：遗忘在学习之后立即开始，而且遗忘的进程不是均匀的。
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-700 dark:text-gray-300">5分钟后遗忘50%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-700 dark:text-gray-300">1天后遗忘70%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-gray-700 dark:text-gray-300">1个月后遗忘80%</span>
                  </div>
                </div>
              </div>
              <div className="apple-card p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  科学复习时间点
                </h3>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  {["5分钟", "30分钟", "2小时", "1天", "2天", "4天", "7天", "15天", "1个月"].map((time, index) => (
                    <div key={index} className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="font-medium text-gray-900 dark:text-white">{time}</div>
                      <div className="text-gray-500 dark:text-gray-400">第{index + 1}次</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            开始您的科学记忆之旅
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            立即注册，享受7天免费试用体验
          </p>
          <div className="flex gap-4 justify-center items-center">
            <Link
              href="/auth/signup"
              className="apple-card px-8 py-3 text-lg font-medium text-gray-900 hover:scale-105 transition-transform"
            >
              免费注册
            </Link>
            <div className="flex items-center gap-2 text-white">
              <Star className="w-5 h-5 fill-current" />
              <span>无需信用卡</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-300">
              © 2025 记忆助手. 基于艾宾浩斯遗忘曲线的智能记忆辅助工具
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
