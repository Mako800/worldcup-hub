# 006：WorkBuddy 智能助手

> 状态：已验收

## 目标

用户可以通过自然语言与 WorkBuddy 助手交互，快速查询赛事信息、球队数据和比赛结果。

## 用户故事

作为一名球迷，我希望有一个智能助手能快速回答我的赛事相关问题，而不需要手动浏览多个页面。

## 范围

- 基于关键词的意图识别（7 种意图）
- 支持中文自然语言查询
- 对话式聊天界面
- 推荐问题快捷入口
- 可选 LLM 扩展

## 非目标

- 完整的大语言模型集成（默认使用规则引擎）
- 语音输入

## 业务规则

- BR-01：消息长度 1-500 字符
- BR-02：识别 7 种意图：standings、team_info、upcoming_matches、match_result、prediction_help、greeting、unknown
- BR-03：unknown 意图返回帮助提示和推荐问题
- BR-04：设置 `AI_API_KEY` 环境变量可启用 LLM 扩展

## Contract 影响

- 新增：`POST /api/agent/chat`、`GET /api/agent/suggestions`
- OpenAPI operation：`agentChat`、`agentSuggestions`

## 验收标准

- AC-01：发送"积分榜排名"返回 standings 意图和 TOP 数据
- AC-02：发送"阿根廷怎么样"返回 team_info 意图和球队数据
- AC-03：发送"接下来有什么比赛"返回 upcoming_matches 意图
- AC-04：发送随机文字返回 unknown 意图和帮助提示
- AC-05：WorkBuddy 页面显示聊天界面和推荐问题
- AC-06：消息气泡区分用户和助手角色

## 验证映射

| AC | 验证方式 | 命令或步骤 | 结果 |
|----|---------|-----------|------|
| AC-01-04 | API Test | Postman POST `/api/agent/chat` | ✅ 通过 |
| AC-05-06 | 人工验收 | 浏览器访问 `/workbuddy` | ✅ 通过 |
