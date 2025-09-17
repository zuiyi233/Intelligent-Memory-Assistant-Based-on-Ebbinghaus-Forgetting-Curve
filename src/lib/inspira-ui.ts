import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type ObjectValues<T> = T[keyof T]

// Inspira UI 动画工具函数
export const animations = {
  // 淡入动画
  fadeIn: (duration: number = 300) => ({
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration }
  }),
  
  // 滑入动画
  slideIn: (direction: 'up' | 'down' | 'left' | 'right' = 'up', duration: number = 300) => {
    const directions = {
      up: { y: 20 },
      down: { y: -20 },
      left: { x: 20 },
      right: { x: -20 }
    }
    
    return {
      initial: { opacity: 0, ...directions[direction] },
      animate: { opacity: 1, x: 0, y: 0 },
      transition: { duration }
    }
  },
  
  // 缩放动画
  scaleIn: (duration: number = 300) => ({
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration }
  }),
  
  // 弹跳动画
  bounce: (duration: number = 500) => ({
    initial: { scale: 0 },
    animate: {
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10,
        duration
      }
    }
  }),
  
  // 脉冲动画
  pulse: (duration: number = 1000) => ({
    animate: {
      scale: [1, 1.05, 1],
      transition: {
        duration,
        repeat: Infinity,
        repeatType: "reverse" as const
      }
    }
  }),
  
  // 旋转动画
  spin: (duration: number = 1000) => ({
    animate: {
      rotate: 360,
      transition: {
        duration,
        repeat: Infinity,
        ease: "linear"
      }
    }
  })
}

// Inspira UI 卡片效果
export const cardEffects = {
  // 光泽效果
  shimmer: (enabled: boolean = true) => ({
    position: "relative" as const,
    overflow: "hidden" as const,
    ...(enabled && {
      "&::before": {
        content: '""',
        position: "absolute" as const,
        top: 0,
        left: -100,
        width: 50,
        height: "100%",
        background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
        animation: "shimmer 2s infinite"
      }
    })
  }),
  
  // 悬停效果
  hover: {
    transition: "all 0.3s ease",
    "&:hover": {
      transform: "translateY(-5px)",
      boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)"
    }
  },
  
  // 玻璃效果
  glass: {
    background: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 255, 255, 0.2)"
  },
  
  // 3D卡片效果
  "3d": {
    perspective: "1000px",
    "&:hover": {
      transform: "rotateY(5deg) rotateX(5deg)"
    }
  },
  
  // 发光边框效果
  glowBorder: (color: string = "rgba(59, 130, 246, 0.5)") => ({
    position: "relative" as const,
    "&::after": {
      content: '""',
      position: "absolute" as const,
      top: -2,
      left: -2,
      right: -2,
      bottom: -2,
      background: `linear-gradient(45deg, ${color}, transparent, ${color})`,
      borderRadius: "inherit",
      opacity: 0,
      transition: "opacity 0.3s ease",
      zIndex: -1
    },
    "&:hover::after": {
      opacity: 1
    }
  })
}

// Inspira UI 文本效果
export const textEffects = {
  // 渐变文本
  gradient: (colors: string[] = ["var(--primary)", "var(--accent)", "var(--secondary)"]) => ({
    backgroundImage: `linear-gradient(45deg, ${colors.join(", ")})`,
    backgroundSize: "200% 200%",
    WebkitBackgroundClip: "text" as const,
    WebkitTextFillColor: "transparent",
    animation: "gradient-shift 3s ease infinite"
  }),
  
  // 打字机效果
  typewriter: {
    overflow: "hidden" as const,
    whiteSpace: "nowrap" as const,
    animation: "typewriter 3s steps(40, end)"
  },
  
  // 3D文本效果
  "3d": {
    textShadow: `
      0 1px 0 rgba(255, 255, 255, 0.5),
      0 2px 0 rgba(0, 0, 0, 0.1),
      0 3px 0 rgba(0, 0, 0, 0.1),
      0 4px 0 rgba(0, 0, 0, 0.1),
      0 5px 0 rgba(0, 0, 0, 0.1)
    `
  },
  
  // 霓虹文本效果
  neon: (color: string = "var(--primary)") => ({
    color,
    textShadow: `
      0 0 5px ${color},
      0 0 10px ${color},
      0 0 15px ${color},
      0 0 20px ${color}
    `
  })
}

// Inspira UI 背景效果
export const backgroundEffects = {
  // 粒子背景
  particles: {
    position: "fixed" as const,
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    pointerEvents: "none" as const,
    zIndex: -1
  },
  
  // 网格背景
  grid: {
    backgroundImage: `
      linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
    `,
    backgroundSize: "50px 50px"
  },
  
  // 渐变背景
  gradient: (colors: string[] = ["var(--primary)", "var(--accent)"]) => ({
    backgroundImage: `linear-gradient(135deg, ${colors.join(", ")})`,
    backgroundSize: "200% 200%",
    animation: "gradient-shift 15s ease infinite"
  }),
  
  // 动态波浪背景
  waves: (color: string = "var(--primary)") => ({
    backgroundImage: `
      radial-gradient(circle at 20% 50%, ${color} 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, ${color} 0%, transparent 50%),
      radial-gradient(circle at 40% 20%, ${color} 0%, transparent 50%)
    `,
    backgroundSize: "200% 200%",
    animation: "gradient-shift 20s ease infinite"
  })
}

// Inspira UI 光标效果
export const cursorEffects = {
  // 光点跟随
  glow: (color: string = "rgba(59, 130, 246, 0.5)") => ({
    cursor: "none",
    "&::before": {
      content: '""',
      position: "fixed" as const,
      width: 20,
      height: 20,
      borderRadius: "50%",
      background: color,
      pointerEvents: "none" as const,
      zIndex: 9999,
      transform: "translate(-50%, -50%)",
      transition: "all 0.1s ease"
    }
  }),
  
  // 轨迹效果
  trail: (color: string = "rgba(59, 130, 246, 0.3)") => ({
    cursor: "none",
    "&::before": {
      content: '""',
      position: "fixed" as const,
      width: 20,
      height: 20,
      borderRadius: "50%",
      background: color,
      pointerEvents: "none" as const,
      zIndex: 9999,
      transform: "translate(-50%, -50%)",
      transition: "all 0.5s ease"
    }
  })
}

// Inspira UI 按钮效果
export const buttonEffects = {
  // 波纹效果
  ripple: "relative overflow-hidden before:absolute before:top-1/2 before:left-1/2 before:w-0 before:h-0 before:rounded-full before:bg-white/30 before:transform before:-translate-x-1/2 before:-translate-y-1/2 before:transition-all before:duration-600 active:before:w-[300px] active:before:h-[300px]",
  
  // 发光边框
  glowBorder: (color: string = "var(--primary)") => ({
    position: "relative" as const,
    "&::after": {
      content: '""',
      position: "absolute" as const,
      top: -2,
      left: -2,
      right: -2,
      bottom: -2,
      background: `linear-gradient(45deg, ${color}, transparent, ${color})`,
      borderRadius: "inherit",
      opacity: 0,
      transition: "opacity 0.3s ease",
      zIndex: -1
    },
    "&:hover::after": {
      opacity: 1
    }
  }),
  
  // 渐变按钮
  gradient: (colors: string[] = ["var(--primary)", "var(--accent)"]) => ({
    backgroundImage: `linear-gradient(45deg, ${colors.join(", ")})`,
    backgroundSize: "200% 200%",
    transition: "all 0.3s ease",
    "&:hover": {
      backgroundPosition: "100% 0"
    }
  })
}

// Inspira UI 特殊效果
export const specialEffects = {
  // 彩纸效果
  confetti: {
    position: "relative" as const,
    overflow: "hidden" as const,
    "&::before, &::after": {
      content: '""',
      position: "absolute" as const,
      width: 10,
      height: 10,
      backgroundColor: "var(--primary)",
      top: "-10px",
      animation: "confetti-fall 3s linear infinite"
    },
    "&::after": {
      left: "20%",
      animationDelay: "1s",
      backgroundColor: "var(--accent)"
    }
  },
  
  // 光束效果
  beam: (color: string = "var(--primary)") => ({
    position: "relative" as const,
    "&::before": {
      content: '""',
      position: "absolute" as const,
      top: "50%",
      left: "50%",
      width: "100px",
      height: "2px",
      background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
      transform: "translate(-50%, -50%)",
      opacity: 0,
      transition: "opacity 0.3s ease"
    },
    "&:hover::before": {
      opacity: 1
    }
  }),
  
  // 闪光效果
  sparkle: (color: string = "var(--primary)") => ({
    position: "relative" as const,
    "&::before": {
      content: '""',
      position: "absolute" as const,
      width: 4,
      height: 4,
      backgroundColor: color,
      borderRadius: "50%",
      top: "10%",
      left: "10%",
      boxShadow: `
        0 0 10px ${color},
        20px 10px 0 ${color},
        10px 20px 0 ${color}
      `,
      opacity: 0,
      transition: "opacity 0.3s ease"
    },
    "&:hover::before": {
      opacity: 1
    }
  })
}

// Inspira UI 工具类
export const utilityClasses = {
  // 文本对齐
  text: {
    left: "text-left",
    center: "text-center",
    right: "text-right",
    justify: "text-justify"
  },
  
  // 显示
  display: {
    block: "block",
    inline: "inline",
    "inline-block": "inline-block",
    flex: "flex",
    "inline-flex": "inline-flex",
    grid: "grid",
    "inline-grid": "inline-grid",
    hidden: "hidden"
  },
  
  // 定位
  position: {
    static: "static",
    relative: "relative",
    absolute: "absolute",
    fixed: "fixed",
    sticky: "sticky"
  },
  
  // 动画
  animation: {
    none: "animate-none",
    spin: "animate-spin",
    ping: "animate-ping",
    pulse: "animate-pulse",
    bounce: "animate-bounce"
  }
}

// Inspira UI 游戏化特定效果
export const gamificationEffects = {
  // 成就解锁效果
  achievementUnlock: {
    animation: "achievement-unlock 1s ease-out",
    "&::before": {
      content: '""',
      position: "absolute" as const,
      top: "-20px",
      left: "-20px",
      right: "-20px",
      bottom: "-20px",
      background: "radial-gradient(circle, rgba(255,215,0,0.3) 0%, transparent 70%)",
      borderRadius: "50%",
      zIndex: -1,
      animation: "pulse 2s infinite"
    }
  },
  
  // 积分增加效果
  pointsIncrease: {
    animation: "points-increase 0.5s ease-out",
    "&::before": {
      content: '""',
      position: "absolute" as const,
      top: "50%",
      left: "50%",
      width: "100%",
      height: "100%",
      background: "radial-gradient(circle, rgba(255,215,0,0.2) 0%, transparent 70%)",
      transform: "translate(-50%, -50%)",
      borderRadius: "50%",
      zIndex: -1
    }
  },
  
  // 等级提升效果
  levelUp: {
    animation: "level-up 1s ease-out",
    "&::before": {
      content: '""',
      position: "absolute" as const,
      top: "-30px",
      left: "-30px",
      right: "-30px",
      bottom: "-30px",
      background: "conic-gradient(from 0deg, transparent, var(--primary), transparent)",
      borderRadius: "50%",
      zIndex: -1,
      animation: "spin 2s linear infinite"
    }
  },
  
  // 排行榜高亮效果
  leaderboardHighlight: (rank: number) => {
    if (rank === 1) {
      return {
        background: "linear-gradient(135deg, #FFD700, #FFA500)",
        color: "white",
        boxShadow: "0 0 20px rgba(255, 215, 0, 0.5)"
      }
    } else if (rank === 2) {
      return {
        background: "linear-gradient(135deg, #C0C0C0, #808080)",
        color: "white",
        boxShadow: "0 0 20px rgba(192, 192, 192, 0.5)"
      }
    } else if (rank === 3) {
      return {
        background: "linear-gradient(135deg, #CD7F32, #8B4513)",
        color: "white",
        boxShadow: "0 0 20px rgba(205, 127, 50, 0.5)"
      }
    }
    return {}
  },
  
  // 挑战进度条效果
  challengeProgress: (progress: number) => ({
    background: `linear-gradient(90deg, var(--primary) 0%, var(--accent) ${progress}%, transparent ${progress}%)`,
    transition: "background 0.5s ease"
  }),
  
  // 连续学习效果
  streakEffect: (days: number) => {
    if (days >= 30) {
      return {
        background: "linear-gradient(135deg, #FF6B6B, #4ECDC4)",
        color: "white",
        animation: "pulse 2s infinite"
      }
    } else if (days >= 7) {
      return {
        background: "linear-gradient(135deg, #4ECDC4, #44A08D)",
        color: "white"
      }
    }
    return {}
  }
}

// Inspira UI 游戏化工具函数
export const gamificationUtils = {
  // 格式化积分显示
  formatPoints: (points: number | undefined | null) => {
    if (points === undefined || points === null) {
      return '0'
    }
    
    const numPoints = Number(points)
    if (isNaN(numPoints)) {
      return '0'
    }
    
    if (numPoints >= 1000000) {
      return `${(numPoints / 1000000).toFixed(1)}M`
    } else if (numPoints >= 1000) {
      return `${(numPoints / 1000).toFixed(1)}K`
    }
    return numPoints.toString()
  },
  
  // 计算等级进度
  calculateLevelProgress: (currentLevel: number, currentExp: number) => {
    const expForNextLevel = currentLevel * 100
    const expForCurrentLevel = (currentLevel - 1) * 100
    const progress = ((currentExp - expForCurrentLevel) / (expForNextLevel - expForCurrentLevel)) * 100
    return Math.min(100, Math.max(0, progress))
  },
  
  // 获取成就颜色
  getAchievementColor: (category: string) => {
    const colors: Record<string, string> = {
      review: "text-blue-600",
      streak: "text-green-600",
      level: "text-yellow-600",
      points: "text-orange-600",
      challenge: "text-red-600",
      special: "text-purple-600"
    }
    return colors[category] || "text-gray-600"
  },
  
  // 获取成就背景颜色
  getAchievementBgColor: (category: string) => {
    const colors: Record<string, string> = {
      review: "bg-blue-50 border-blue-200",
      streak: "bg-green-50 border-green-200",
      level: "bg-yellow-50 border-yellow-200",
      points: "bg-orange-50 border-orange-200",
      challenge: "bg-red-50 border-red-200",
      special: "bg-purple-50 border-purple-200"
    }
    return colors[category] || "bg-gray-50 border-gray-200"
  },
  
  // 获取排行榜颜色
  getLeaderboardColor: (rank: number) => {
    if (rank === 1) return "text-yellow-600"
    if (rank === 2) return "text-gray-600"
    if (rank === 3) return "text-amber-600"
    return "text-gray-600"
  },
  
  // 获取排行榜背景颜色
  getLeaderboardBgColor: (rank: number) => {
    if (rank === 1) return "bg-yellow-50 border-yellow-200"
    if (rank === 2) return "bg-gray-50 border-gray-200"
    if (rank === 3) return "bg-amber-50 border-amber-200"
    return "bg-gray-50 border-gray-200"
  }
}

// Inspira UI 响应式工具
export const responsive = {
  // 断点
  breakpoints: {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px"
  },
  
  // 响应式类前缀
  prefixes: {
    sm: "sm:",
    md: "md:",
    lg: "lg:",
    xl: "xl:",
    "2xl": "2xl:"
  }
}