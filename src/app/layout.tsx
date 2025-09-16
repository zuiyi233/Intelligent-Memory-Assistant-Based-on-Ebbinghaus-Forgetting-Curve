import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "记忆助手 - 基于艾宾浩斯遗忘曲线的智能记忆工具",
  description: "科学记忆，高效复习。基于艾宾浩斯遗忘曲线算法的智能记忆辅助工具，帮助您更好地管理和记忆知识。",
  keywords: "记忆助手,艾宾浩斯遗忘曲线,记忆方法,学习工具,复习提醒",
  authors: [{ name: "记忆助手团队" }],
  openGraph: {
    title: "记忆助手 - 智能记忆辅助工具",
    description: "基于艾宾浩斯遗忘曲线的科学记忆工具，让学习更高效",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "记忆助手 - 智能记忆辅助工具",
    description: "基于艾宾浩斯遗忘曲线的科学记忆工具",
  },
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <div className="min-h-screen bg-background">
          {children}
        </div>
      </body>
    </html>
  );
}
