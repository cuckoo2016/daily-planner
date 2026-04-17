import db from '../config/database.js';

interface LogOptions {
  userId?: number;
  username?: string;
  action: string;
  targetType?: string;
  targetId?: number;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
}

interface LogQueryOptions extends Omit<LogOptions, 'action'> {
  action?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

export function logOperation(options: LogOptions): void {
  try {
    const stmt = db.prepare(`
      INSERT INTO operation_logs (user_id, username, action, target_type, target_id, details, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      options.userId || null,
      options.username || null,
      options.action,
      options.targetType || null,
      options.targetId || null,
      options.details ? JSON.stringify(options.details) : null,
      options.ipAddress || null,
      options.userAgent || null
    );
  } catch (error) {
    console.error('Failed to log operation:', error);
  }
}

export function getOperationLogs(options: LogQueryOptions = {}): any[] {
  const { page = 1, pageSize = 10 } = options;

  let sql = 'SELECT * FROM operation_logs WHERE 1=1';
  const params: any[] = [];

  if (options.userId) {
    sql += ' AND user_id = ?';
    params.push(options.userId);
  }

  if (options.action) {
    sql += ' AND action = ?';
    params.push(options.action);
  }

  if (options.startDate) {
    sql += ' AND created_at >= ?';
    params.push(options.startDate);
  }

  if (options.endDate) {
    sql += ' AND created_at <= ?';
    params.push(options.endDate);
  }

  sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(pageSize, (page - 1) * pageSize);

  const stmt = db.prepare(sql);
  return stmt.all(...params);
}

export function countOperationLogs(options: LogQueryOptions = {}): number {
  let sql = 'SELECT COUNT(*) as total FROM operation_logs WHERE 1=1';
  const params: any[] = [];

  if (options.userId) {
    sql += ' AND user_id = ?';
    params.push(options.userId);
  }

  if (options.action) {
    sql += ' AND action = ?';
    params.push(options.action);
  }

  if (options.startDate) {
    sql += ' AND created_at >= ?';
    params.push(options.startDate);
  }

  if (options.endDate) {
    sql += ' AND created_at <= ?';
    params.push(options.endDate);
  }

  const stmt = db.prepare(sql);
  return stmt.get(...params).total as number;
}