# 世界杯赛事信息与互动预测平台

FIFA World Cup Match Information & Interactive Prediction Platform

面向 2026 年 FIFA 世界杯足球赛事的信息服务与互动预测平台，覆盖 32 支参赛国家队，
提供从小组赛到决赛的完整赛程浏览、比分预测和赛后讨论的一站式体验。

## 🏗️ 技术架构

```
用户浏览器 :3000 → Next.js 16 (React 19) → /api/* rewrite → Midway.js 4 (Koa) → SQLite
```

| 层级     | 技术                                              |
| -------- | ------------------------------------------------- |
| 前端     | Next.js 16 App Router + React 19 + Tailwind CSS 4 |
| 后端     | Midway.js 4 + Koa + node:sqlite DatabaseSync      |
| API 契约 | OpenAPI 3.1.0                                     |
| 数据库   | SQLite (WAL 模式)                                 |
| 部署     | Docker Compose 多阶段构建 (node:24-alpine)        |

## ✨ 核心功能

### 📅 赛事浏览

- **32 支国家队**，覆盖各大洲足球强国（阿根廷、巴西、法国、德国等）
- **小组赛 + 淘汰赛**共 64 场比赛：8 个小组 × 6 场 + 16 场淘汰赛
- 支持按状态（未开始/进行中/已结束）和阶段（小组赛第1-3轮、1/8决赛、1/4决赛、半决赛、决赛/三四名）筛选
- 已完成比赛显示比分，未开始比赛显示赛程时间
- 积分榜实时计算（胜/平/负/进球/失球/净胜球/积分），按 FIFA 标准排序

### 🔮 比分预测

- 对未开始的比赛提交比分预测（0-20 范围）
- 同用户同场比赛仅可预测一次（`UNIQUE(match_id, user_name)` 约束防重）
- 比赛开始后自动关闭预测通道
- 每场比赛展示预测排行榜，所有用户的预测公开可见
- 支持按用户名查询个人全部预测记录

### 💬 赛后讨论

- 已结束比赛的评论区（仅 finished 状态可用）
- 评论按时间倒序展示
- 评论内容 2-1000 字符，支持中文

### 🤖 WorkBuddy 智能助手

**规则驱动的意图识别引擎**，零外部 API 依赖即可工作：

| 意图               | 触发关键词             | 说明                             |
| ------------------ | ---------------------- | -------------------------------- |
| `standings`        | 排名、积分榜、谁领先   | 返回 TOP 3 积分排名              |
| `team_info`        | 32 支国家队中英文名    | 返回球队详情、最近战绩、即将比赛 |
| `upcoming_matches` | 赛程、接下来、什么时候 | 返回即将开始的 5 场比赛          |
| `match_result`     | 结果、比分、谁赢了     | 返回最近 6 场已结束比赛          |
| `prediction_help`  | 预测、谁会赢           | 返回当前可预测的比赛列表         |
| `greeting`         | 你好、帮助、功能       | 返回欢迎消息和功能列表           |
| `unknown`          | 未匹配                 | 返回帮助提示和推荐问题           |

**可选 LLM 扩展**：设置 `AI_API_KEY` 环境变量后，未匹配意图会回退到 LLM 处理。

## 🏟 世界杯赛事数据

### 32 支参赛球队（按小组）

| 组  | 球队                                           |
| --- | ---------------------------------------------- |
| A   | 🇦🇷 阿根廷、🇩🇰 丹麦、🇳🇬 尼日利亚、🇸🇦 沙特阿拉伯 |
| B   | 🇫🇷 法国、🇺🇾 乌拉圭、🇰🇷 韩国、🇨🇦 加拿大         |
| C   | 🏴 英格兰、🇭🇷 克罗地亚、🇮🇷 伊朗、🇬🇭 加纳       |
| D   | 🇧🇷 巴西、🇨🇭 瑞士、🇵🇱 波兰、🇪🇬 埃及             |
| E   | 🇩🇪 德国、🇸🇳 塞内加尔、🇯🇵 日本、🇹🇳 突尼斯       |
| F   | 🇪🇸 西班牙、🇲🇦 摩洛哥、🇷🇸 塞尔维亚、🇦🇺 澳大利亚 |
| G   | 🇵🇹 葡萄牙、🇮🇹 意大利、🇪🇨 厄瓜多尔、🇺🇸 美国     |
| H   | 🇳🇱 荷兰、🇧🇪 比利时、🇲🇽 墨西哥、🇨🇴 哥伦比亚     |

### 赛程阶段

| matchday | 阶段              | 比赛数 | 状态             |
| -------- | ----------------- | ------ | ---------------- |
| 1        | 小组赛第 1 轮     | 16     | 已结束（有比分） |
| 2        | 小组赛第 2 轮     | 16     | 已结束（有比分） |
| 3        | 小组赛第 3 轮     | 16     | 未开始           |
| 4        | 1/8 决赛          | 8      | 未开始           |
| 5        | 1/4 决赛          | 4      | 未开始           |
| 6        | 半决赛            | 2      | 未开始           |
| 7        | 决赛 / 三四名决赛 | 2      | 未开始           |

## 🗄️ 数据库模型

```
teams
├── id          INTEGER PRIMARY KEY
├── name        TEXT (英文名, UNIQUE)
├── name_zh     TEXT (中文名)
├── short_name  TEXT (三字母缩写, UNIQUE)
├── stadium     TEXT (主场球场)
├── founded     INTEGER (成立年份)
├── logo_color  TEXT (主题色 #hex)
└── created_at  TEXT

matches
├── id            INTEGER PRIMARY KEY
├── home_team_id  INTEGER → teams(id)
├── away_team_id  INTEGER → teams(id)
├── match_date    TEXT (ISO 日期)
├── matchday      INTEGER (1-7, 代表赛程阶段)
├── status        TEXT (scheduled | live | finished)
├── home_score    INTEGER (nullable)
├── away_score    INTEGER (nullable)
├── venue         TEXT (nullable)
└── created_at    TEXT

predictions
├── id          INTEGER PRIMARY KEY
├── match_id    INTEGER → matches(id)
├── user_name   TEXT
├── home_score  INTEGER
├── away_score  INTEGER
├── created_at  TEXT
├── updated_at  TEXT
└── UNIQUE(match_id, user_name)

comments
├── id          INTEGER PRIMARY KEY
├── match_id    INTEGER → matches(id)
├── user_name   TEXT
├── content     TEXT
└── created_at  TEXT

standings_view (VIEW)
  — 基于 teams + matches (finished) 实时计算
  — 排序：积分 DESC → 净胜球 DESC → 进球 DESC
```

## 🚀 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器（前后端同时启动）
npm run dev

# 访问 http://localhost:3000
```

### Docker 部署

```bash
# 构建并启动（一条命令）
docker compose -f infra/compose.yaml up --build

# 访问 http://localhost:3000
```

服务包含健康检查，后端就绪后前端容器自动启动。

### 项目检查

```bash
npm run check          # lint → test → build 全流程
npm run format:check   # 代码格式检查
```

## 📡 API 端点

| 方法  | 路径                             | 说明                                         |
| ----- | -------------------------------- | -------------------------------------------- |
| GET   | `/api/health`                    | 健康检查                                     |
| GET   | `/api/teams`                     | 获取 32 支球队列表                           |
| GET   | `/api/teams/:id`                 | 球队详情                                     |
| GET   | `/api/matches`                   | 比赛列表（支持 status/matchday/teamId 筛选） |
| GET   | `/api/matches/upcoming`          | 即将开始的比赛                               |
| GET   | `/api/matches/:id`               | 比赛详情（含主客队信息）                     |
| GET   | `/api/standings`                 | 积分榜                                       |
| POST  | `/api/predictions`               | 创建预测（需未开始比赛）                     |
| GET   | `/api/predictions`               | 查询预测（支持 matchId/userName）            |
| PATCH | `/api/predictions/:id`           | 更新预测（仅本人、未开始比赛）               |
| GET   | `/api/matches/:matchId/comments` | 比赛评论                                     |
| POST  | `/api/matches/:matchId/comments` | 发表评论（仅已结束比赛）                     |
| POST  | `/api/agent/chat`                | WorkBuddy 自然语言对话                       |
| GET   | `/api/agent/suggestions`         | 推荐问题列表                                 |

完整 OpenAPI 3.1.0 定义见 `contracts/openapi.yaml`。

## 📂 项目结构

```
├── frontend/              # Next.js 16 前端
│   └── src/
│       ├── app/           # App Router 页面 (9 routes)
│       └── components/    # React 组件 (按功能域划分)
├── backend/               # Midway.js 4 后端
│   └── src/
│       ├── controller/    # 5 个 API 控制器
│       ├── service/       # 5 个业务服务 + 数据库初始化
│       └── utils/         # 4 个输入校验模块
├── contracts/             # OpenAPI 3.1 契约
├── specs/                 # 6 份功能规格 (AC + 验证)
├── infra/                 # Dockerfile + Compose
└── docs/                  # 架构文档
```

## 🔧 环境变量

| 变量                   | 默认值                            | 说明                          |
| ---------------------- | --------------------------------- | ----------------------------- |
| `NODE_ENV`             | `local`                           | 运行环境                      |
| `FRONTEND_PORT`        | `3000`                            | 前端端口                      |
| `BACKEND_PORT`         | `7001`                            | 后端端口                      |
| `BACKEND_INTERNAL_URL` | `http://localhost:7001`           | 后端内部地址                  |
| `DATABASE_PATH`        | `./data/worldcup-platform.sqlite` | 数据库路径                    |
| `AI_API_KEY`           | (空)                              | 可选，启用 WorkBuddy LLM 扩展 |

## 🛡️ 并发安全

- **预测去重**：`UNIQUE(match_id, user_name)` 数据库约束，同一用户对同一比赛仅能预测一次
- **时间窗口**：写入前检查比赛状态，已开始的比赛拒绝预测
- **HTTP 语义**：201 Created / 409 Conflict / 400 Bad Request 精确区分不同结果
- **输入校验**：所有外部输入经 util 层校验（类型、范围、长度）

## 🎯 课程印象最深内容

1. **契约先行**：OpenAPI 作为前后端的「单一事实来源」，让接口设计与实现始终保持一致
2. **四态组件**：每个数据组件覆盖加载中、错误、空结果、成功四种状态，是前端可靠性的基础
3. **并发控制**：预测提交的 UNIQUE 约束和比赛截止时间检查，体现了后端并发安全的设计思维
4. **渐进增强**：WorkBuddy 从规则引擎起步，预留 LLM 扩展点，展示了务实的架构演进思路
