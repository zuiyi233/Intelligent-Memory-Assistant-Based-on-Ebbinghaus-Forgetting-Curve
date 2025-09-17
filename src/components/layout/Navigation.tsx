"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Brain,
  BarChart3,
  Trophy,
  User,
  Menu,
  X,
  LogOut
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

const navigationItems = [
  {
    name: "首页",
    href: "/",
    icon: Brain,
  },
  {
    name: "游戏化中心",
    href: "/gamification",
    icon: Trophy,
  },
  {
    name: "统计分析",
    href: "/stats",
    icon: BarChart3,
  },
  {
    name: "用户行为分析",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    name: "个人中心",
    href: "/profile",
    icon: User,
  },
];

export function Navigation() {
  const pathname = usePathname();
  const { user, logout, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="glass sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                记忆助手
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-4">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      isActive
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                        : "text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                    )}
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    {item.name}
                  </Link>
                );
              })}
              
              {/* 用户状态和登出按钮 */}
              <div className="flex items-center space-x-3 ml-4">
                {loading ? (
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                ) : user ? (
                  <>
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block">
                        {user.name || "用户"}
                      </span>
                    </div>
                    <button
                      onClick={logout}
                      className="text-gray-600 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="hidden sm:block ml-1">登出</span>
                    </button>
                  </>
                ) : (
                  <Link href="/auth/signin" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 px-3 py-1 rounded-md text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800">
                    登录
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              className="p-2 rounded-md text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-md text-base font-medium",
                    isActive
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                      : "text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
            
            {/* 移动端用户状态和登出按钮 */}
            {loading ? (
              <div className="flex items-center justify-between p-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
                <span className="text-gray-600 dark:text-gray-300">加载中...</span>
              </div>
            ) : user ? (
              <div className="flex flex-col space-y-2 border-t border-gray-200 dark:border-gray-800 pt-3 mt-3">
                <div className="flex items-center space-x-3 p-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {user.name || "用户"}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      {user.email}
                    </div>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center space-x-2 p-3 text-gray-600 hover:text-red-600 dark:text-gray-300 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                >
                  <LogOut className="w-4 h-4" />
                  <span>登出</span>
                </button>
              </div>
            ) : (
              <div className="border-t border-gray-200 dark:border-gray-800 pt-3 mt-3">
                <Link
                  href="/auth/signin"
                  className="flex items-center p-3 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  登录
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}