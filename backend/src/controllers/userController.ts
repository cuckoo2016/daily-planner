import { Response } from 'express';
import { hashSync, compareSync } from 'bcrypt-ts';
import db from '../config/database.js';
import { logOperation } from '../utils/logger.js';
import { User } from '../types.js';
import { AuthRequest } from '../middleware/auth.js';

export function getProfile(req: AuthRequest, res: Response): void {
  try {
    const user = db.prepare(`
      SELECT id, username, role, nickname, avatar, theme, status, last_login_at, created_at
      FROM users WHERE id = ?
    `).get(req.user?.id) as User | undefined;

    if (!user) {
      res.status(404).json({ message: '用户不存在' });
      return;
    }

    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
}

export function updateProfile(req: AuthRequest, res: Response): void {
  try {
    const { nickname, avatar } = req.body;
    const userId = req.user?.id;

    // Get current user data
    const currentUser = db.prepare('SELECT nickname, avatar FROM users WHERE id = ?').get(userId) as User | undefined;

    if (!currentUser) {
      res.status(404).json({ message: '用户不存在' });
      return;
    }

    const newNickname = nickname !== undefined ? nickname : currentUser.nickname;
    const newAvatar = avatar !== undefined ? avatar : currentUser.avatar;

    db.prepare(`
      UPDATE users SET nickname = ?, avatar = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(newNickname, newAvatar, userId);

    logOperation({
      userId,
      username: req.user?.username,
      action: 'update_profile',
      targetType: 'user',
      targetId: userId,
      details: { nickname, avatar },
      ipAddress: req.ip || undefined,
      userAgent: req.headers['user-agent']
    });

    const user = db.prepare(`
      SELECT id, username, role, nickname, avatar, theme, status, last_login_at, created_at
      FROM users WHERE id = ?
    `).get(userId) as User;

    res.json({ user, message: '资料更新成功' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
}

export function updateTheme(req: AuthRequest, res: Response): void {
  try {
    const { theme } = req.body;
    const userId = req.user?.id;

    db.prepare('UPDATE users SET theme = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(theme, userId);

    res.json({ message: '主题更新成功', theme });
  } catch (error) {
    console.error('Update theme error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
}

export function getStats(req: AuthRequest, res: Response): void {
  try {
    const userId = req.user?.id;

    // Total plans
    const totalPlans = db.prepare('SELECT COUNT(*) as count FROM plans WHERE user_id = ?')
      .get(userId).count as number;

    // Completed plans
    const completedPlans = db.prepare('SELECT COUNT(*) as count FROM plans WHERE user_id = ? AND is_completed = 1')
      .get(userId).count as number;

    // Use days
    const useDays = db.prepare(`
      SELECT COUNT(DISTINCT plan_date) as count FROM plans WHERE user_id = ?
    `).get(userId).count as number;

    // Completion rate
    const completionRate = totalPlans > 0 ? Math.round((completedPlans / totalPlans) * 100) : 0;

    // Today's stats
    const today = new Date().toISOString().split('T')[0];
    const todayPlans = db.prepare(`
      SELECT COUNT(*) as total, SUM(is_completed) as completed
      FROM plans WHERE user_id = ? AND plan_date = ?
    `).get(userId, today) as { total: number; completed: number };

    res.json({
      stats: {
        totalPlans,
        completedPlans,
        useDays,
        completionRate,
        todayTotal: todayPlans.total || 0,
        todayCompleted: todayPlans.completed || 0
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
}

export function changePassword(req: AuthRequest, res: Response): void {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user?.id;

    if (!oldPassword || !newPassword) {
      res.status(400).json({ message: '旧密码和新密码不能为空' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ message: '新密码长度至少6位' });
      return;
    }

    const user = db.prepare('SELECT password FROM users WHERE id = ?').get(userId) as User;

    const validPassword = compareSync(oldPassword, user.password);
    if (!validPassword) {
      res.status(400).json({ message: '旧密码错误' });
      return;
    }

    const hashedPassword = hashSync(newPassword, 10);
    db.prepare('UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(hashedPassword, userId);

    logOperation({
      userId,
      username: req.user?.username,
      action: 'change_password',
      targetType: 'user',
      targetId: userId,
      ipAddress: req.ip || undefined,
      userAgent: req.headers['user-agent']
    });

    res.json({ message: '密码修改成功' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
}