  世界杯赛事信息与互动预测平台 — 交付说明
  FIFA World Cup Match Information & Interactive Prediction Platform

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
  1. Web 架构演进：从静态到 AI 驱动
     课程从 1989 年 Tim Berners-Lee 的 World Wide Web 讲起，梳理了
     Web 1.0（静态文档）→ Web 2.0（AJAX/SPA/API）→ Web 3.0（语义化/
     去中心化）→ AI 驱动的 Web（Agent/MCP/Skills）的完整演进。Server-side
     Rendering 到 Client-side Rendering 再到 BFF（Backend for Frontend），
     每一代架构变化都是在解决上一代的真实痛点，而不是为了技术而技术。

  2. Core Web Vitals 与性能优化实战
     LCP（最大内容绘制）、INP（交互到下次绘制）、CLS（累计布局偏移）
     三个指标构成 Google 的 Web 性能评价体系。课程通过 Chrome DevTools
     Network 面板和 Performance 面板演示了从定位瓶颈到验证优化的完整流程。
     Debounce（防抖）和 Throttle（节流）的区别也不再是死记硬背——
     搜索输入用 debounce 等用户停手再发请求，滚动事件用 throttle 保证
     最低采样频率，各有各的适用场景。

  3. CI/CD 自动化流水线：从 Commit 到部署
     一行 `npm run check` 背后是 lint → typecheck → test → build 的
     完整门禁链。GitHub Actions 监听 push 和 PR 自动触发，通过后才允许
     合并。Build once, configure and run many——同一个 artifact 通过环境
     变量切换 staging 和生产，而不是每个环境重新编译。Docker 多阶段构建
     让最终镜像只包含运行时依赖，把开发和构建的中间产物全部留在 build stage。

  4. AI 时代的 Web 开发者
     AI 不再是"帮写代码的工具"，而是贯穿整个研发流程：IDE 内实时补全、
     CLI Agent 自动执行多步骤任务、PR Review Agent 发现逻辑缺陷、
     Playwright Test Agent 自动生成端到端测试、MCP 协议让 Agent 直接
     调用 Chrome DevTools 调试页面。但课程也强调：AI 生成的是候选实现，
     是否完成要由契约测试、状态码断言和人工审查共同证明——这个判断力
     才是开发者不可替代的核心能力。

【Docker 镜像下载 因过大无法上传github】
  百度网盘：https://pan.baidu.com/s/12hAXFp2huN594YPMaayICA?pwd=ufwq
  提取码：ufwq
  文件：worldcup-platform-amd64.tar（341MB）
  使用方式：docker load -i worldcup-platform-amd64.tar
