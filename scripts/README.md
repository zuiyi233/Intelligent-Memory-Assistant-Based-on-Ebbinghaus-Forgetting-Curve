# 数据库连接设置指南

## 问题概述

当连接PostgreSQL数据库时，需要在Windows PowerShell中设置环境变量`$env:PGPASSWORD = "123456"`来确保认证成功。

## 解决方案

### 1. 手动设置环境变量

在Windows PowerShell中运行以下命令：

```powershell
$env:PGPASSWORD = "123456"
```

### 2. 使用自动化脚本

我们提供了自动化脚本来设置环境变量并测试数据库连接：

```powershell
.\scripts\setup-and-test-db.ps1
```

此脚本将：
- 设置PGPASSWORD环境变量
- 检查并更新.env文件中的DATABASE_URL
- 生成Prisma客户端
- 测试数据库连接

### 3. 环境变量配置

确保您的`.env`文件包含以下配置：

```
DATABASE_URL="postgresql://postgres:123456@localhost:4090/memory_assistant"
```

### 4. 测试数据库连接

您可以单独运行测试脚本：

```powershell
node scripts/test-db-connection.js
```

## 故障排除

如果数据库连接仍然失败，请检查：

1. PostgreSQL服务器是否在localhost:4090上运行
2. 数据库"memory_assistant"是否存在
3. 用户名和密码是否正确
4. 确保在PowerShell中设置了PGPASSWORD环境变量

## 代码更改

我们已经修改了`src/lib/db.ts`文件，以：
- 显式处理环境变量
- 添加数据库连接错误处理
- 添加日志记录功能

这些更改将帮助您更好地诊断数据库连接问题。