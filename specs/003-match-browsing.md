# 003：赛事浏览

> 状态：已验收

## 目标

用户可以浏览世界杯小组赛和淘汰赛全部赛程，按状态和阶段筛选，查看比赛详情和积分榜。

## 用户故事

作为一名球迷，我希望浏览世界杯赛程和积分榜，以便了解比赛安排和小组排名情况。

## 范围

- 比赛列表页面支持按状态（未开始/进行中/已结束）和阶段筛选
- 比赛详情页面展示主客队信息、比分、预测入口和评论入口
- 积分榜页面展示完整的小组排名
- 首页展示即将开始的比赛和积分榜 TOP 5

## 非目标

- 实时比分推送
- 比赛视频回放

## 业务规则

- BR-01：比赛按 match_date 升序排列
- BR-02：积分榜按 积分 → 净胜球 → 进球数 降序排列
- BR-03：种子数据包含小组赛前 2 轮已完成比赛（有比分）和小组赛第 3 轮及淘汰赛计划中比赛
- BR-04：每个数据组件覆盖加载中、错误、空结果、成功四种状态

## Contract 影响

- 新增：`GET /api/matches`、`GET /api/matches/upcoming`、`GET /api/matches/:id`、`GET /api/standings`
- OpenAPI operation：`listMatches`、`listUpcomingMatches`、`getMatch`、`getStandings`

## 验收标准

- AC-01：请求 `GET /api/matches` 返回所有比赛，按日期升序
- AC-02：请求 `GET /api/matches?status=scheduled` 仅返回未开始比赛
- AC-03：请求 `GET /api/matches?matchday=1` 仅返回小组赛第 1 轮比赛
- AC-04：请求 `GET /api/matches?teamId=1` 返回阿根廷的所有比赛
- AC-05：请求 `GET /api/standings` 返回按积分排序的 32 支球队排名
- AC-06：比赛列表页面展示加载骨架、错误横幅、空结果提示和比赛卡片

## 验证映射

| AC       | 验证方式 | 命令或步骤                           | 结果    |
| -------- | -------- | ------------------------------------ | ------- |
| AC-01-05 | API Test | 手动 curl 验证各端点                 | ✅ 通过 |
| AC-06    | 人工验收 | 浏览器访问 `/matches` 并切换筛选条件 | ✅ 通过 |
