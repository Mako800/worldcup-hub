#!/bin/bash
# ============================================================
#  世界杯赛事信息与互动预测平台 — 镜像启动脚本
#  FIFA World Cup Match Information & Interactive Prediction Platform
# ============================================================
#  用法:
#    bash start.sh              # 从 .tar 加载并启动
#    bash start.sh --no-load    # 跳过镜像加载，直接启动
# ============================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
IMAGE_TAR="$SCRIPT_DIR/worldcup-platform-amd64.tar"

# ---------- 1. 加载镜像 ----------
if [ "${1:-}" != "--no-load" ]; then
  if [ -f "$IMAGE_TAR" ]; then
    echo ">>> 加载 Docker 镜像..."
    docker load -i "$IMAGE_TAR"
  else
    echo "!!! 未找到 $IMAGE_TAR ，跳过镜像加载"
    echo "    请确保已先构建镜像或已通过 docker load 加载"
  fi
fi

# ---------- 2. 启动服务 ----------
echo ">>> 启动前端和后端容器..."
cd "$SCRIPT_DIR"
docker compose -f infra/compose.yaml up -d

# ---------- 3. 等待就绪 ----------
echo ">>> 等待后端健康检查通过..."
for i in $(seq 1 30); do
  if curl -sf http://localhost:7001/api/health > /dev/null 2>&1; then
    echo "✓ 后端就绪"
    break
  fi
  if [ "$i" -eq 30 ]; then
    echo "!!! 后端启动超时，请执行 docker compose -f infra/compose.yaml logs 排查"
    exit 1
  fi
  sleep 2
done

echo ">>> 等待前端就绪..."
sleep 3

# ---------- 4. 输出访问信息 ----------
echo ""
echo "============================================================"
echo "  服务已启动"
echo "  浏览器访问:  http://localhost:3000"
echo "  后端 API:    http://localhost:7001/api/health"
echo "  停止服务:    docker compose -f infra/compose.yaml down"
echo "============================================================"
