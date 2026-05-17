# DeepSeek API Token 用量可视化平台

一个全栈 API Token 用量追踪与可视化平台，支持多模型提供商配置，提供仪表盘、用量明细和设置管理功能。

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | Vue 3 + TypeScript + Vite |
| 状态管理 | Pinia |
| 路由 | Vue Router 4 |
| UI 组件库 | Element Plus |
| 图表库 | ECharts (vue-echarts) |
| HTTP 客户端 | Axios |
| 后端框架 | Express + TypeScript |
| 数据存储 | JSON 文件存储 |

## 快速开始

```bash
# 安装依赖
npm install && cd server && npm install && cd ..

# 同时启动前后端
npm run dev:all

# 或分别启动
npm run dev          # 前端 → http://localhost:5173
npm run dev:server   # 后端 → http://localhost:8081
```

## 项目结构

```
api-plamate/
├── index.html
├── package.json              # 前端 + 根脚本
├── vite.config.ts            # Vite 配置（含 @ 别名 + API 代理）
├── tsconfig.json
├── server/
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── index.ts          # Express 入口，监听 8081
│   │   ├── db.ts             # JSON 文件数据库 + CRUD
│   │   ├── sync.ts           # 多提供商通用同步服务
│   │   └── routes/
│   │       ├── usage.ts      # 用量相关 API
│   │       └── settings.ts   # 提供商配置 API
│   └── data/                 # 数据文件存放 (db.json)
└── src/                      # Vue 3 前端
    ├── main.ts               # 入口
    ├── App.vue               # 布局（侧边栏 + 主内容区）
    ├── router/index.ts       # 路由配置
    ├── stores/
    │   ├── usage.ts          # 用量数据 Store
    │   └── settings.ts       # 提供商配置 Store
    ├── api/index.ts          # Axios 实例
    ├── types/index.ts        # TypeScript 类型定义
    ├── pages/
    │   ├── Dashboard.vue     # 仪表盘
    │   ├── UsageDetail.vue   # 用量明细
    │   └── Settings.vue      # 设置
    └── components/
        ├── StatCard.vue      # 统计卡片
        ├── TokenTrend.vue    # Token 趋势折线图
        ├── ModelBreakdown.vue # 模型用量饼图
        └── UsageTable.vue    # 用量明细表格
```

## 页面功能

### 仪表盘 (`/`)

- 4 个统计卡片：总 Token、Prompt Token、Completion Token、API 请求数
- 日期范围筛选器
- Token 消耗趋势折线图（近 30 天）
- 模型用量分布饼图

### 用量明细 (`/usage`)

- 按模型筛选（下拉选择已配置的模型）
- 每日 Token 用量柱状图
- 分页明细表格（日期、模型、Prompt/Completion/总 Token、请求数）

### 设置 (`/settings`)

- **模型 & API Key 配置**：管理多个模型提供商（名称、API Key、Base URL、模型列表）
- **从提供商同步数据**：一键从所有已配置的提供商拉取用量
- **手动录入**：手动添加用量记录
- **数据库统计**：记录总数、提供商数、数据范围

## 后端 API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/usage/summary` | 用量总览统计 |
| GET | `/api/usage/trend` | 按日聚合趋势 |
| GET | `/api/usage/by-model` | 按模型聚合 |
| GET | `/api/usage/records` | 分页明细 |
| GET | `/api/usage/models` | 获取所有已配置模型 |
| POST | `/api/usage/record` | 手动添加记录 |
| POST | `/api/usage/sync` | 从提供商同步用量 |
| GET | `/api/settings` | 获取所有提供商配置 |
| POST | `/api/settings/provider` | 添加提供商 |
| PUT | `/api/settings/provider/:id` | 更新提供商 |
| DELETE | `/api/settings/provider/:id` | 删除提供商 |

## 数据模型

### UsageRecord

```typescript
{
  id: number
  date: string           // YYYY-MM-DD
  model: string          // 模型名称
  prompt_tokens: number
  completion_tokens: number
  total_tokens: number
  request_count: number
  created_at: string
}
```

### ProviderConfig

```typescript
{
  id: number
  name: string           // 提供商名称，如 DeepSeek、OpenAI
  apiKey: string         // API Key
  baseUrl: string        // API 地址，如 https://api.deepseek.com
  models: string[]       // 模型列表，如 ["deepseek-chat", "deepseek-coder"]
}
```
