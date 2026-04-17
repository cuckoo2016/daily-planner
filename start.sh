#!/bin/zsh

echo "========================================"
echo "   每日规划应用 - 服务启动工具"
echo "========================================"
echo ""

BACKEND_PORT=3000
FRONTEND_PORT=5173
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

# 停止占用端口的进程
kill_port() {
    local port=$1
    if lsof -ti:$port > /dev/null 2>&1; then
        echo "端口 $port 被占用，正在释放..."
        lsof -ti:$port | xargs kill -9 2>/dev/null
        sleep 0.5
    fi
}

echo "检查后端端口..."
kill_port $BACKEND_PORT

echo "检查前端端口..."
kill_port $FRONTEND_PORT

echo ""
echo "开始启动服务..."
echo ""

# 启动后端服务
echo "启动后端服务..."
cd "$PROJECT_DIR/backend"
npm run dev &
BACKEND_PID=$!

# 等待后端启动
sleep 2

# 启动前端服务
echo "启动前端服务..."
cd "$PROJECT_DIR/frontend"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "========================================"
echo "   服务启动完成！"
echo "========================================"
echo "   后端 API: http://localhost:$BACKEND_PORT"
echo "   前端应用: http://localhost:$FRONTEND_PORT"
echo "========================================"
echo ""
echo "按 Ctrl+C 停止所有服务"
echo ""

# 捕获退出信号
trap '
echo ""
echo "正在停止服务..."
kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
exit 0
' INT TERM

# 保持脚本运行
wait
