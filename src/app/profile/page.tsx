"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Mail, Calendar, Trophy, BarChart3, Settings } from "lucide-react";
import { Navigation } from "@/components/layout/Navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";

export default function Profile() {
  const { user, loading } = useAuth();
  const [userData, setUserData] = useState<{
    name?: string | null;
    username?: string;
    email?: string | null;
    createdAt?: string;
    level?: string;
    streak?: number;
    stats?: {
      totalCards?: number;
      reviewedCards?: number;
      retentionRate?: number;
      todayReviews?: number;
    };
  } | null>(null);

  useEffect(() => {
    if (user) {
      // 这里可以添加获取用户详细数据的逻辑
      setUserData({
        ...user,
        createdAt: new Date().toISOString().split('T')[0], // 模拟注册日期
        level: "记忆大师", // 模拟学习等级
        streak: 30, // 模拟连续学习天数
        stats: {
          totalCards: 128,
          reviewedCards: 86,
          retentionRate: 92,
          todayReviews: 42
        }
      });
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <p>加载中...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center">请先登录查看个人资料</p>
            <Button className="w-full mt-4" onClick={() => window.location.href = "/auth/signin"}>
              前往登录
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 个人资料标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">用户个人资料</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">管理您的个人信息和学习进度</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：用户基本信息卡片 */}
          <div className="lg:col-span-1">
            <Card className="apple-card-hover">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{userData?.name || userData?.username || "用户"}</CardTitle>
                    <CardDescription className="flex items-center">
                      <Mail className="w-4 h-4 mr-1" />
                      {userData?.email || "user@example.com"}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>注册日期</span>
                    </div>
                    <span className="text-gray-900 dark:text-white">{userData?.createdAt || "2025-01-01"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <Trophy className="w-4 h-4 mr-2" />
                      <span>学习等级</span>
                    </div>
                    <span className="text-gray-900 dark:text-white">{userData?.level || "记忆新手"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      <span>连续学习</span>
                    </div>
                    <span className="text-gray-900 dark:text-white">{userData?.streak || 0}天</span>
                  </div>
                </div>
                <Button className="w-full mt-6 btn-animate">
                  <Settings className="w-4 h-4 mr-2" />
                  编辑个人资料
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* 右侧：学习统计和成就 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 学习统计卡片 */}
            <Card className="apple-card-hover">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  学习统计
                </CardTitle>
                <CardDescription>您最近的学习活动数据</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{userData?.stats?.totalCards || 0}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">总记忆卡片</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{userData?.stats?.reviewedCards || 0}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">已复习卡片</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{userData?.stats?.retentionRate || 0}%</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">记忆保持率</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{userData?.stats?.todayReviews || 0}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">今日复习</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 成就卡片 */}
            <Card className="apple-card-hover">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="w-5 h-5 mr-2" />
                  成就徽章
                </CardTitle>
                <CardDescription>您已获得的学习成就</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="flex flex-col items-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mb-2">
                      <Trophy className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">记忆新手</div>
                    <div className="text-xs text-gray-600 dark:text-gray-300">创建第一张卡片</div>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mb-2">
                      <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">坚持不懈</div>
                    <div className="text-xs text-gray-600 dark:text-gray-300">连续学习7天</div>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg">
                    <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mb-2">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">记忆大师</div>
                    <div className="text-xs text-gray-600 dark:text-gray-300">掌握100张卡片</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 最近活动卡片 */}
            <Card className="apple-card-hover">
              <CardHeader>
                <CardTitle>最近活动</CardTitle>
                <CardDescription>您最近的学习记录</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">英语单词复习</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">复习了20张卡片</div>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">2小时前</div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">历史知识学习</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">创建了15张新卡片</div>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">昨天</div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">数学公式记忆</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">完成了10次复习</div>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">2天前</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}