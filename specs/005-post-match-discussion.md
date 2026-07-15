# 005：赛后讨论

> 状态：已验收

## 目标

用户可以在已结束比赛的详情页发表和查看评论，参与赛后讨论。

## 用户故事

作为一名球迷，我希望在比赛结束后能与其他球迷交流看法，分享对比赛的点评。

## 范围

- 对 finished 状态的比赛发表评论
- 查看某场比赛的所有评论（按时间倒序）
- 评论内容 2-1000 字符

## 非目标

- 评论回复/嵌套
- 评论点赞
- 评论审核

## 业务规则

- BR-01：只有 `status = 'finished'` 的比赛可以发表评论
- BR-02：对非 finished 比赛发表评论返回 400
- BR-03：评论按 created_at 降序排列
- BR-04：评论内容 2-1000 字符，用户名 2-30 字符

## Contract 影响

- 新增：`GET /api/matches/:matchId/comments`、`POST /api/matches/:matchId/comments`
- OpenAPI operation：`listComments`、`createComment`

## 验收标准

- AC-01：对 finished 比赛发表评论返回 201
- AC-02：对 scheduled 比赛发表评论返回 400
- AC-03：获取比赛评论列表按时间倒序
- AC-04：finished 比赛详情页显示评论区
- AC-05：scheduled 比赛详情页不显示评论区

## 验证映射

| AC       | 验证方式 | 命令或步骤                 | 结果    |
| -------- | -------- | -------------------------- | ------- |
| AC-01-03 | API Test | Postman/curl 测试评论端点  | ✅ 通过 |
| AC-04-05 | 人工验收 | 浏览器查看不同状态比赛详情 | ✅ 通过 |
