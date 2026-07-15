============================================================
  世界杯赛事信息与互动预测平台 — 交付说明
  FIFA World Cup Match Information & Interactive Prediction Platform
============================================================

【仓库地址】
  https://github.com/Mako800/worldcup-hub

【镜像启动方式】
  1. 确保已安装 Docker Desktop（Windows/macOS）或 Docker Engine（Linux）
  2. 进入项目根目录，执行：
     docker compose -f infra/compose.yaml up --build
  3. 等待前端和后端容器启动完成（健康检查通过）
  4. 浏览器访问 http://localhost:3000
  5. 停止服务：
     docker compose -f infra/compose.yaml down

  环境变量（可选，已内置默认值）：
  - FRONTEND_PORT=3000     前端端口
  - BACKEND_PORT=7001      后端端口
  - DATABASE_PATH=./data/worldcup-platform.sqlite  数据库路径
  - AI_API_KEY=（可选）启用 WorkBuddy LLM 扩展

【课程印象最深内容】
  1. 契约先行（OpenAPI First）
     OpenAPI 3.1.0 作为前后端"单一事实来源"，所有接口定义、请求参数、
     响应格式、错误处理都在 contracts/openapi.yaml 中声明。前端 fetch、
     后端路由、测试断言都以此为准，避免了"前后端各自理解接口"的经典问题。

  2. 四态组件模式（Loading / Error / Empty / Success）
     每个数据驱动的组件都覆盖四种状态：加载骨架屏（animate-pulse）、
     错误横幅（可重试）、空结果提示、正常数据展示。这看似简单，却是
     前端可靠性的基础——用户在任何网络条件下都能理解当前发生了什么。

  3. 并发安全设计
     预测提交使用 UNIQUE(match_id, user_name) 数据库约束 + 比赛截止时间
     检查的双重保护，从根源上防止重复提交和过期预测。这让我认识到：
     并发控制不能只靠前端按钮 disable，必须在后端有硬约束。

【Docker 镜像下载】
  百度网盘：https://pan.baidu.com/s/12hAXFp2huN594YPMaayICA?pwd=ufwq
  提取码：ufwq
  文件：worldcup-platform-amd64.tar（341MB）
  使用方式：docker load -i worldcup-platform-amd64.tar

  4. 渐进增强的 Agent 架构
     WorkBuddy 从基于关键词的规则引擎起步（7 种意图、零外部 API 依赖），
     同时预留了 LLM 扩展点（设置 AI_API_KEY 即可启用）。这种"先跑起来
     再增强"的思路比一开始就接入大模型更务实，也更容易调试和测试。

============================================================
