import type { NextConfig } from "next";
import { loadEnvConfig } from '@next/env';

// 加载环境变量
loadEnvConfig(process.cwd());

const nextConfig: NextConfig = {
  env: {
    // 从 .env 文件中读取环境变量
    DATABASE_URL: process.env.DATABASE_URL,
    PGPASSWORD: process.env.PGPASSWORD,
  },
};

export default nextConfig;
