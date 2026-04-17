#!/usr/bin/env node
import { spawn } from 'child_process';
import { createServer } from 'net';

/**
 * 检查端口是否被占用
 */
function isPortInUse(port) {
  return new Promise((resolve) => {
    const server = createServer();
    server.once('error', () => resolve(true));
    server.once('listening', () => {
      server.close();
      resolve(false);
    });
    server.listen(port);
  });
}

/**
 * 杀掉占用指定端口的进程
 */
async function killPort(port) {
  const { exec } = await import('child_process');
  const { promisify } = await import('util');
  const execAsync = promisify(exec);

  try {
    if (process.platform === 'darwin' || process.platform === 'linux') {
      await execAsync(`lsof -ti:${port} | xargs kill -9 2>/dev/null || true`);
    } else if (process.platform === 'win32') {
      await execAsync(`for /f "tokens=5" %a in ('netstat -aon ^| findstr :${port}') do taskkill /F /PID %a`);
    }
    console.log(`✓ 已释放端口 ${port}`);
  } catch (error) {
    // 忽略错误，可能没有进程占用
  }
}

/**
 * 启动服务
 */
function startService(name, cwd, command, args) {
  return new Promise((resolve, reject) => {
    const process = spawn(command, args, {
      cwd,
      shell: true,
      stdio: 'inherit'
    });

    process.on('error', (err) => {
      console.error(`✗ ${name} 启动失败:`, err);
      reject(err);
    });

    process.on('exit', (code) => {
      if (code !== 0) {
        console.log(`✗ ${name} 已退出 (code: ${code})`);
      }
    });

    // 给一点启动时间
    setTimeout(() => resolve(process), 1000);
  });
}

/**
 * 主函数
 */
async function main() {
  console.log('========================================');
  console.log('   每日规划应用 - 服务启动工具');
  console.log('========================================\n');

  const BACKEND_PORT = 3000;
  const FRONTEND_PORT = 5173;

  // 检查并释放后端端口
  console.log('检查后端端口...');
  const backendInUse = await isPortInUse(BACKEND_PORT);
  if (backendInUse) {
    console.log(`端口 ${BACKEND_PORT} 被占用，正在释放...`);
    await killPort(BACKEND_PORT);
    // 等待一下确保端口释放
    await new Promise(r => setTimeout(r, 500));
  }

  // 检查并释放前端端口
  console.log('检查前端端口...');
  const frontendInUse = await isPortInUse(FRONTEND_PORT);
  if (frontendInUse) {
    console.log(`端口 ${FRONTEND_PORT} 被占用，正在释放...`);
    await killPort(FRONTEND_PORT);
    await new Promise(r => setTimeout(r, 500));
  }

  console.log('\n开始启动服务...\n');

  try {
    // 启动后端
    console.log('启动后端服务...');
    await startService('后端', 'backend', 'npm', ['run', 'dev']);

    // 启动前端
    console.log('启动前端服务...');
    await startService('前端', 'frontend', 'npm', ['run', 'dev']);

    console.log('\n========================================');
    console.log('   服务启动完成！');
    console.log('========================================');
    console.log('   后端 API: http://localhost:3000');
    console.log('   前端应用: http://localhost:5173');
    console.log('========================================\n');
    console.log('按 Ctrl+C 停止所有服务\n');

  } catch (error) {
    console.error('启动失败:', error);
    process.exit(1);
  }
}

// 处理退出信号
process.on('SIGINT', () => {
  console.log('\n\n正在停止服务...');
  process.exit(0);
});

main();
