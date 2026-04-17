#!/usr/bin/env node

/**
 * 停止前后端服务脚本
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

const BACKEND_PORT = 3000;
const FRONTEND_PORT = 5173;

async function killPort(port) {
  try {
    if (process.platform === 'darwin' || process.platform === 'linux') {
      await execAsync(`lsof -ti:${port} | xargs kill -9 2>/dev/null || true`);
    } else if (process.platform === 'win32') {
      await execAsync(`for /f "tokens=5" %a in ('netstat -aon ^| findstr :${port}') do taskkill /F /PID %a`);
    }
    console.log(`✓ 已停止端口 ${port} 上的服务`);
  } catch (error) {
    console.log(`端口 ${port} 没有服务运行`);
  }
}

async function main() {
  console.log('========================================');
  console.log('   每日规划应用 - 停止服务');
  console.log('========================================\n');

  await killPort(BACKEND_PORT);
  await killPort(FRONTEND_PORT);
  // 也可能前端在其他端口运行
  await killPort(5174);
  await killPort(5175);

  console.log('\n✓ 所有服务已停止\n');
}

main();
