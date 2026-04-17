# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## 项目概述

**每日规划（Daily Planner）** 是一款轻量、简洁、高效的个人每日计划管理 Web 应用，支持多用户和管理员后台。

- **产品定位**：轻量、简洁、高效的个人每日计划管理工具
- **技术栈**：
  - 前端：Vue 3 + Vite + TypeScript + Pinia + Vue Router + Element Plus
  - 后端：Node.js + Express + TypeScript + SQLite (sql.js)
  - 认证：JWT + bcrypt-ts

---

## 项目结构

```
daily-planner/
├── frontend/              # 前端项目
│   ├── src/
│   │   ├── api/          # API 请求模块
│   │   ├── views/        # 页面视图
│   │   │   ├── auth/    # 认证页面
│   │   │   └── home/    # 用户端页面
│   │   ├── admin/        # 管理后台模块
│   │   ├── router/       # 路由配置
│   │   ├── stores/       # Pinia 状态管理
│   │   └── utils/        # 工具函数
│   └── package.json
├── backend/               # 后端项目
│   ├── src/
│   │   ├── controllers/  # 控制器
│   │   ├── routes/       # 路由
│   │   ├── middleware/   # 中间件
│   │   ├── config/       # 配置
│   │   ├── utils/        # 工具函数
│   │   └── app.ts        # 应用入口
│   ├── data/             # 数据库文件
│   └── package.json
├── 产品需求文档.md       # PRD 文档
└── 开发计划.md          # 开发任务清单
```

---

## 常用命令

### 后端开发

| 命令 | 描述 |
|------|------|
| `cd backend && npm install` | 安装后端依赖 |
| `cd backend && npm run dev` | 启动后端开发服务器（端口 3000） |
| `cd backend && npm run build` | 构建后端项目 |

### 前端开发

| 命令 | 描述 |
|------|------|
| `cd frontend && npm install` | 安装前端依赖 |
| `cd frontend && npm run dev` | 启动前端开发服务器 |
| `cd frontend && npm run build` | 构建前端项目 |

---

## 数据库设计

### users 表
- id, username, password, role, nickname, avatar, theme, status, last_login_at, created_at, updated_at

### plans 表
- id, user_id, content, plan_date, reminder_time, is_completed, reminder_enabled, created_at, updated_at

### operation_logs 表
- id, user_id, username, action, target_type, target_id, details, ip_address, created_at

---

## API 接口概览

### 认证模块
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/logout` - 用户登出
- `GET /api/auth/me` - 获取当前用户信息

### 计划模块
- `GET /api/plans` - 获取当日计划列表
- `POST /api/plans` - 创建计划
- `PUT /api/plans/:id` - 更新计划
- `PATCH /api/plans/:id/complete` - 标记完成/未完成
- `DELETE /api/plans/:id` - 删除计划

### 管理后台（需 admin 角色）
- `GET /api/admin/dashboard` - 仪表盘数据
- `GET /api/admin/users` - 用户列表
- `GET /api/admin/statistics` - 全局统计
- `GET /api/admin/logs` - 操作日志

---

## 关键文件

| 文件路径 | 描述 |
|---------|------|
| [backend/src/app.ts](backend/src/app.ts) | 后端应用入口 |
| [backend/src/config/database.ts](backend/src/config/database.ts) | 数据库配置 |
| [backend/src/middleware/auth.ts](backend/src/middleware/auth.ts) | JWT 认证中间件 |
| [backend/src/middleware/role.ts](backend/src/middleware/role.ts) | 角色验证中间件 |
| [frontend/src/router/index.ts](frontend/src/router/index.ts) | 前端路由配置 |
| [frontend/src/stores/auth.ts](frontend/src/stores/auth.ts) | 认证状态管理 |
| [产品需求文档.md](产品需求文档.md) | 产品需求文档 |
| [开发计划.md](开发计划.md) | 开发任务清单 |

---

## 开发注意事项

1. **第一个注册的用户自动成为 admin**
2. **所有密码使用 bcrypt 加密存储**
3. **JWT Token 有效期 24 小时**
4. **用户数据隔离**：确保普通用户无法访问他人数据
5. **管理后台 API** 需额外验证 admin 角色权限
