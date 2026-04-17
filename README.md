# 每日规划（Daily Planner）

一款轻量、简洁、高效的个人每日计划管理 Web 应用，支持多用户和管理员后台。

## 功能特点

- **计划管理**：快速创建、编辑、完成和删除每日计划
- **提醒功能**：为计划设置提醒时间，确保不遗漏重要事项
- **历史记录**：查看过往的计划完成情况
- **管理后台**：管理员可管理用户、查看统计和系统日志
- **响应式设计**：支持 PC 和移动端访问

## 技术栈

| 端 | 技术 |
|---|---|
| 前端 | Vue 3 + Vite + TypeScript + Pinia + Vue Router + Element Plus |
| 后端 | Node.js + Express + TypeScript |
| 数据库 | SQLite (sql.js) |
| 认证 | JWT |

## 项目结构

```
daily-planner/
├── frontend/          # 前端项目
├── backend/           # 后端项目
├── start.sh           # 启动服务脚本
├── stop.sh            # 停止服务脚本
├── package.json       # 根目录配置
└── 开发计划.md        # 开发任务清单
```

## 快速开始

### 安装依赖

```bash
npm run install:all
```

### 启动开发服务器

```bash
./start.sh
```

### 停止服务

```bash
./stop.sh
```

### 访问应用

- 用户端：http://localhost:5173
- 后端 API：http://localhost:3000

## 默认账号

| 角色 | 用户名 | 密码 |
|---|---|---|
| 管理员 | admin | admin123 |
| 普通用户 | user | user123 |

## API 接口

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
- `GET /api/admin/logs` - 操作日志
