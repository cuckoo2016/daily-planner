#!/bin/zsh

echo "========================================"
echo "   每日规划应用 - 停止服务"
echo "========================================"

BACKEND_PORT=3000
FRONTEND_PORT=5173

# 停止后端服务
if lsof -ti:$BACKEND_PORT > /dev/null 2>&1; then
    lsof -ti:$BACKEND_PORT | xargs kill -9 2>/dev/null
    echo "✓ 已停止后端服务 (端口 $BACKEND_PORT)"
fi

# 停止前端服务
if lsof -ti:$FRONTEND_PORT > /dev/null 2>&1; then
    lsof -ti:$FRONTEND_PORT | xargs kill -9 2>/dev/null
    echo "✓ 已停止前端服务 (端口 $FRONTEND_PORT)"
fi

echo ""
echo "✓ 所有服务已停止"
