import { Response } from 'express';
import db from '../config/database.js';
import { logOperation } from '../utils/logger.js';
import { Plan } from '../types.js';
import { AuthRequest } from '../middleware/auth.js';

export function getPlans(req: AuthRequest, res: Response): void {
  try {
    const { date } = req.query;
    const userId = req.user?.id;
    const targetDate = date || new Date().toISOString().split('T')[0];

    const plans = db.prepare(`
      SELECT * FROM plans
      WHERE user_id = ? AND plan_date = ?
      ORDER BY
        CASE WHEN reminder_time IS NULL THEN 1 ELSE 0 END,
        reminder_time ASC
    `).all(userId, targetDate) as Plan[];

    res.json({ plans });
  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
}

export function getHistoryPlans(req: AuthRequest, res: Response): void {
  try {
    const { startDate, endDate, page = 1, pageSize = 10 } = req.query;
    const userId = req.user?.id;

    let sql = 'SELECT plan_date, COUNT(*) as total, SUM(is_completed) as completed FROM plans WHERE user_id = ?';
    const params: any[] = [userId];

    if (startDate) {
      sql += ' AND plan_date >= ?';
      params.push(startDate);
    }

    if (endDate) {
      sql += ' AND plan_date <= ?';
      params.push(endDate);
    }

    sql += ' GROUP BY plan_date ORDER BY plan_date DESC LIMIT ? OFFSET ?';
    params.push(Number(pageSize), (Number(page) - 1) * Number(pageSize));

    const plans = db.prepare(sql).all(...params);

    // Get total count
    let countSql = 'SELECT COUNT(DISTINCT plan_date) as total FROM plans WHERE user_id = ?';
    const countParams: any[] = [userId];
    if (startDate) {
      countSql += ' AND plan_date >= ?';
      countParams.push(startDate);
    }
    if (endDate) {
      countSql += ' AND plan_date <= ?';
      countParams.push(endDate);
    }
    const total = db.prepare(countSql).get(...countParams).total;

    res.json({ plans, total });
  } catch (error) {
    console.error('Get history plans error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
}

export function getPlanById(req: AuthRequest, res: Response): void {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const plan = db.prepare('SELECT * FROM plans WHERE id = ? AND user_id = ?').get(id, userId) as Plan | undefined;

    if (!plan) {
      res.status(404).json({ message: '计划不存在' });
      return;
    }

    res.json({ plan });
  } catch (error) {
    console.error('Get plan error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
}

export function createPlan(req: AuthRequest, res: Response): void {
  try {
    const { content, plan_date, reminder_time, reminder_enabled } = req.body;
    const userId = req.user?.id;

    if (!content) {
      res.status(400).json({ message: '计划内容不能为空' });
      return;
    }

    const result = db.prepare(`
      INSERT INTO plans (user_id, content, plan_date, reminder_time, reminder_enabled)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      userId,
      content,
      plan_date || new Date().toISOString().split('T')[0],
      reminder_time || null,
      reminder_enabled !== undefined ? (reminder_enabled ? 1 : 0) : 1
    );

    logOperation({
      userId,
      username: req.user?.username,
      action: 'create_plan',
      targetType: 'plan',
      targetId: result.lastInsertRowid as number,
      details: { content, plan_date },
      ipAddress: req.ip || undefined,
      userAgent: req.headers['user-agent']
    });

    res.status(201).json({
      message: '计划创建成功',
      plan: {
        id: result.lastInsertRowid,
        content,
        plan_date: plan_date || new Date().toISOString().split('T')[0],
        reminder_time,
        reminder_enabled: reminder_enabled !== undefined ? reminder_enabled : true,
        is_completed: 0
      }
    });
  } catch (error) {
    console.error('Create plan error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
}

export function updatePlan(req: AuthRequest, res: Response): void {
  try {
    const { id } = req.params;
    const { content, reminder_time, reminder_enabled } = req.body;
    const userId = req.user?.id;

    // Check ownership
    const existingPlan = db.prepare('SELECT * FROM plans WHERE id = ? AND user_id = ?').get(id, userId) as Plan | undefined;
    if (!existingPlan) {
      res.status(404).json({ message: '计划不存在' });
      return;
    }

    db.prepare(`
      UPDATE plans
      SET content = ?, reminder_time = ?, reminder_enabled = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `).run(
      content ?? existingPlan.content,
      reminder_time !== undefined ? reminder_time : existingPlan.reminder_time,
      reminder_enabled !== undefined ? (reminder_enabled ? 1 : 0) : existingPlan.reminder_enabled,
      id,
      userId
    );

    logOperation({
      userId,
      username: req.user?.username,
      action: 'update_plan',
      targetType: 'plan',
      targetId: Number(id),
      details: { content, reminder_time, reminder_enabled },
      ipAddress: req.ip || undefined,
      userAgent: req.headers['user-agent']
    });

    const updatedPlan = db.prepare('SELECT * FROM plans WHERE id = ?').get(id) as Plan;
    res.json({ plan: updatedPlan, message: '计划更新成功' });
  } catch (error) {
    console.error('Update plan error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
}

export function toggleComplete(req: AuthRequest, res: Response): void {
  try {
    const { id } = req.params;
    const { is_completed } = req.body;
    const userId = req.user?.id;

    // Check ownership
    const existingPlan = db.prepare('SELECT * FROM plans WHERE id = ? AND user_id = ?').get(id, userId) as Plan | undefined;
    if (!existingPlan) {
      res.status(404).json({ message: '计划不存在' });
      return;
    }

    const newStatus = is_completed !== undefined ? (is_completed ? 1 : 0) : (existingPlan.is_completed === 0 ? 1 : 0);

    db.prepare(`
      UPDATE plans
      SET is_completed = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `).run(newStatus, id, userId);

    logOperation({
      userId,
      username: req.user?.username,
      action: newStatus === 1 ? 'complete_plan' : 'uncomplete_plan',
      targetType: 'plan',
      targetId: Number(id),
      ipAddress: req.ip || undefined,
      userAgent: req.headers['user-agent']
    });

    const updatedPlan = db.prepare('SELECT * FROM plans WHERE id = ?').get(id) as Plan;
    res.json({ plan: updatedPlan });
  } catch (error) {
    console.error('Toggle complete error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
}

export function deletePlan(req: AuthRequest, res: Response): void {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    // Check ownership
    const existingPlan = db.prepare('SELECT * FROM plans WHERE id = ? AND user_id = ?').get(id, userId) as Plan | undefined;
    if (!existingPlan) {
      res.status(404).json({ message: '计划不存在' });
      return;
    }

    db.prepare('DELETE FROM plans WHERE id = ? AND user_id = ?').run(id, userId);

    logOperation({
      userId,
      username: req.user?.username,
      action: 'delete_plan',
      targetType: 'plan',
      targetId: Number(id),
      details: { content: existingPlan.content },
      ipAddress: req.ip || undefined,
      userAgent: req.headers['user-agent']
    });

    res.json({ message: '计划删除成功' });
  } catch (error) {
    console.error('Delete plan error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
}

export function searchPlans(req: AuthRequest, res: Response): void {
  try {
    const { keyword, page = 1, pageSize = 10 } = req.query;
    const userId = req.user?.id;

    if (!keyword) {
      res.json({ plans: [], total: 0 });
      return;
    }

    const plans = db.prepare(`
      SELECT * FROM plans
      WHERE user_id = ? AND content LIKE ?
      ORDER BY plan_date DESC, created_at DESC
      LIMIT ? OFFSET ?
    `).all(userId, `%${keyword}%`, Number(pageSize), (Number(page) - 1) * Number(pageSize)) as Plan[];

    const total = db.prepare('SELECT COUNT(*) as total FROM plans WHERE user_id = ? AND content LIKE ?')
      .get(userId, `%${keyword}%`).total;

    res.json({ plans, total });
  } catch (error) {
    console.error('Search plans error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
}