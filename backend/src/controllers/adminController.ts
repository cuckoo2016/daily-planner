import { Response } from 'express';
import db from '../config/database.js';
import { logOperation, getOperationLogs, countOperationLogs } from '../utils/logger.js';
import { User, Plan } from '../types.js';
import { AuthRequest } from '../middleware/auth.js';

// Dashboard
export function getDashboard(req: AuthRequest, res: Response): void {
  try {
    const today = new Date().toISOString().split('T')[0];
    const last7Days: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      last7Days.push(d.toISOString().split('T')[0]);
    }

    // Total users
    const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get().count as number;

    // Active users (last 7 days)
    const activeUsers = db.prepare(`
      SELECT COUNT(DISTINCT user_id) as count FROM plans
      WHERE plan_date >= ? AND plan_date <= ?
    `).get(last7Days[0], today).count as number;

    // Today's stats
    const todayStats = db.prepare(`
      SELECT
        COUNT(*) as total_plans,
        SUM(is_completed) as completed_plans
      FROM plans WHERE plan_date = ?
    `).get(today) as { total_plans: number; completed_plans: number };

    // Total plans
    const totalPlans = db.prepare('SELECT COUNT(*) as count FROM plans').get().count as number;

    // Overall completion rate
    const completionStats = db.prepare(`
      SELECT
        COUNT(*) as total,
        SUM(is_completed) as completed
      FROM plans
    `).get() as { total: number; completed: number };
    const overallRate = completionStats.total > 0
      ? Math.round((completionStats.completed / completionStats.total) * 100)
      : 0;

    // Last 7 days trend
    const trend = last7Days.map(date => {
      const stats = db.prepare(`
        SELECT COUNT(*) as total, SUM(is_completed) as completed
        FROM plans WHERE plan_date = ?
      `).get(date) as { total: number; completed: number };
      return {
        date,
        total: stats.total || 0,
        completed: stats.completed || 0
      };
    });

    // Recent registrations
    const recentUsers = db.prepare(`
      SELECT id, username, nickname, role, created_at
      FROM users ORDER BY created_at DESC LIMIT 10
    `).all() as User[];

    // Recent plans
    const recentPlans = db.prepare(`
      SELECT p.*, u.username
      FROM plans p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC LIMIT 10
    `).all();

    res.json({
      dashboard: {
        totalUsers,
        activeUsers,
        todayPlans: todayStats.total_plans || 0,
        todayCompleted: todayStats.completed_plans || 0,
        totalPlans,
        overallRate,
        trend,
        recentUsers,
        recentPlans
      }
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
}

// User Management
export function getUsers(req: AuthRequest, res: Response): void {
  try {
    const { role, status, keyword, page = 1, pageSize = 10 } = req.query;

    let sql = 'SELECT id, username, role, nickname, avatar, status, last_login_at, created_at FROM users WHERE 1=1';
    const params: any[] = [];

    if (role) {
      sql += ' AND role = ?';
      params.push(role);
    }

    if (status !== undefined && status !== '') {
      sql += ' AND status = ?';
      params.push(Number(status));
    }

    if (keyword) {
      sql += ' AND (username LIKE ? OR nickname LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(Number(pageSize), (Number(page) - 1) * Number(pageSize));

    const users = db.prepare(sql).all(...params) as User[];

    // Get total count
    let countSql = 'SELECT COUNT(*) as total FROM users WHERE 1=1';
    const countParams: any[] = [];
    if (role) {
      countSql += ' AND role = ?';
      countParams.push(role);
    }
    if (status !== undefined && status !== '') {
      countSql += ' AND status = ?';
      countParams.push(Number(status));
    }
    if (keyword) {
      countSql += ' AND (username LIKE ? OR nickname LIKE ?)';
      countParams.push(`%${keyword}%`, `%${keyword}%`);
    }
    const total = db.prepare(countSql).get(...countParams).total;

    res.json({ users, total });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
}

export function getUserById(req: AuthRequest, res: Response): void {
  try {
    const { id } = req.params;

    const user = db.prepare(`
      SELECT id, username, role, nickname, avatar, status, last_login_at, created_at
      FROM users WHERE id = ?
    `).get(id) as User | undefined;

    if (!user) {
      res.status(404).json({ message: '用户不存在' });
      return;
    }

    // Get user stats
    const stats = db.prepare(`
      SELECT
        COUNT(*) as total_plans,
        SUM(is_completed) as completed_plans
      FROM plans WHERE user_id = ?
    `).get(id) as { total_plans: number; completed_plans: number };

    const completionRate = stats.total_plans > 0
      ? Math.round((stats.completed_plans / stats.total_plans) * 100)
      : 0;

    // Get recent plans
    const recentPlans = db.prepare(`
      SELECT * FROM plans WHERE user_id = ? ORDER BY created_at DESC LIMIT 10
    `).all(id) as Plan[];

    res.json({
      user,
      stats: {
        totalPlans: stats.total_plans || 0,
        completedPlans: stats.completed_plans || 0,
        completionRate
      },
      recentPlans
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
}

export function updateUser(req: AuthRequest, res: Response): void {
  try {
    const { id } = req.params;
    const { nickname, role, status } = req.body;

    const existingUser = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as User | undefined;
    if (!existingUser) {
      res.status(404).json({ message: '用户不存在' });
      return;
    }

    db.prepare(`
      UPDATE users SET nickname = ?, role = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      nickname ?? existingUser.nickname,
      role ?? existingUser.role,
      status !== undefined ? status : existingUser.status,
      id
    );

    logOperation({
      userId: req.user?.id,
      username: req.user?.username,
      action: 'update_user',
      targetType: 'user',
      targetId: Number(id),
      details: { nickname, role, status },
      ipAddress: req.ip || undefined,
      userAgent: req.headers['user-agent']
    });

    const user = db.prepare(`
      SELECT id, username, role, nickname, avatar, status, last_login_at, created_at
      FROM users WHERE id = ?
    `).get(id) as User;

    res.json({ user, message: '用户更新成功' });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
}

export function toggleUserStatus(req: AuthRequest, res: Response): void {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const existingUser = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as User | undefined;
    if (!existingUser) {
      res.status(404).json({ message: '用户不存在' });
      return;
    }

    const newStatus = status !== undefined ? status : (existingUser.status === 1 ? 0 : 1);

    db.prepare('UPDATE users SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(newStatus, id);

    logOperation({
      userId: req.user?.id,
      username: req.user?.username,
      action: newStatus === 1 ? 'enable_user' : 'disable_user',
      targetType: 'user',
      targetId: Number(id),
      ipAddress: req.ip || undefined,
      userAgent: req.headers['user-agent']
    });

    res.json({ message: newStatus === 1 ? '用户已启用' : '用户已禁用' });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
}

export function deleteUser(req: AuthRequest, res: Response): void {
  try {
    const { id } = req.params;

    const existingUser = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as User | undefined;
    if (!existingUser) {
      res.status(404).json({ message: '用户不存在' });
      return;
    }

    // Cannot delete yourself
    if (Number(id) === req.user?.id) {
      res.status(400).json({ message: '不能删除自己的账号' });
      return;
    }

    db.prepare('DELETE FROM users WHERE id = ?').run(id);

    logOperation({
      userId: req.user?.id,
      username: req.user?.username,
      action: 'delete_user',
      targetType: 'user',
      targetId: Number(id),
      details: { username: existingUser.username },
      ipAddress: req.ip || undefined,
      userAgent: req.headers['user-agent']
    });

    res.json({ message: '用户删除成功' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
}

// Statistics
export function getStatistics(req: AuthRequest, res: Response): void {
  try {
    const { startDate, endDate } = req.query;

    // User statistics
    const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get().count as number;
    const adminUsers = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'admin'").get().count as number;
    const activeUsers = db.prepare('SELECT COUNT(*) as count FROM users WHERE status = 1').get().count as number;

    // Plan statistics
    const totalPlans = db.prepare('SELECT COUNT(*) as count FROM plans').get().count as number;
    const completedPlans = db.prepare('SELECT COUNT(*) as count FROM plans WHERE is_completed = 1').get().count as number;
    const completionRate = totalPlans > 0 ? Math.round((completedPlans / totalPlans) * 100) : 0;

    // Daily average
    const avgPlansPerDay = db.prepare(`
      SELECT AVG(daily_count) as avg FROM (
        SELECT COUNT(*) as daily_count FROM plans GROUP BY plan_date
      )
    `).get().avg as number || 0;

    // User registration trend
    let userTrendSql = "SELECT DATE(created_at) as date, COUNT(*) as count FROM users WHERE 1=1";
    const userTrendParams: any[] = [];
    if (startDate) {
      userTrendSql += ' AND created_at >= ?';
      userTrendParams.push(startDate);
    }
    if (endDate) {
      userTrendSql += ' AND created_at <= ?';
      userTrendParams.push(endDate);
    }
    userTrendSql += ' GROUP BY DATE(created_at) ORDER BY date';
    const userTrend = db.prepare(userTrendSql).all(...userTrendParams);

    // Plan creation trend
    let planTrendSql = 'SELECT plan_date as date, COUNT(*) as count FROM plans WHERE 1=1';
    const planTrendParams: any[] = [];
    if (startDate) {
      planTrendSql += ' AND plan_date >= ?';
      planTrendParams.push(startDate);
    }
    if (endDate) {
      planTrendSql += ' AND plan_date <= ?';
      planTrendParams.push(endDate);
    }
    planTrendSql += ' GROUP BY plan_date ORDER BY date';
    const planTrend = db.prepare(planTrendSql).all(...planTrendParams);

    res.json({
      statistics: {
        users: {
          total: totalUsers,
          admins: adminUsers,
          active: activeUsers
        },
        plans: {
          total: totalPlans,
          completed: completedPlans,
          completionRate,
          avgPerDay: Math.round(avgPlansPerDay * 10) / 10
        },
        userTrend,
        planTrend
      }
    });
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
}

// Logs
export function getLogs(req: AuthRequest, res: Response): void {
  try {
    const { userId, action, startDate, endDate, page = 1, pageSize = 10 } = req.query;

    const logs = getOperationLogs({
      userId: userId ? Number(userId) : undefined,
      action: action as string,
      startDate: startDate as string,
      endDate: endDate as string,
      page: Number(page),
      pageSize: Number(pageSize)
    });

    const total = countOperationLogs({
      userId: userId ? Number(userId) : undefined,
      action: action as string,
      startDate: startDate as string,
      endDate: endDate as string
    });

    res.json({ logs, total });
  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
}

// Settings
export function getSettings(req: AuthRequest, res: Response): void {
  try {
    const settings = db.prepare('SELECT * FROM system_settings').all();
    const settingsObj: Record<string, string> = {};
    settings.forEach((s: any) => {
      settingsObj[s.key] = s.value;
    });
    res.json({ settings: settingsObj });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
}

export function updateSettings(req: AuthRequest, res: Response): void {
  try {
    const settings = req.body;

    const stmt = db.prepare('INSERT OR REPLACE INTO system_settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)');
    Object.entries(settings).forEach(([key, value]) => {
      stmt.run(key, String(value));
    });

    logOperation({
      userId: req.user?.id,
      username: req.user?.username,
      action: 'update_settings',
      targetType: 'settings',
      details: Object.keys(settings),
      ipAddress: req.ip || undefined,
      userAgent: req.headers['user-agent']
    });

    res.json({ message: '设置更新成功' });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
}