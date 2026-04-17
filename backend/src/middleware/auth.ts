import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.js';
import db from '../config/database.js';
import { User } from '../types.js';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    role: string;
  };
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void | Response {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: '未授权，请先登录' });
  }

  const token = authHeader.substring(7);
  const decoded = verifyAccessToken(token);

  if (!decoded) {
    return res.status(401).json({ message: 'Token 已过期，请重新登录' });
  }

  // Check if user still exists and is active
  const user = db.prepare('SELECT id, username, role, status FROM users WHERE id = ?').get(decoded.userId) as User | undefined;

  if (!user) {
    return res.status(401).json({ message: '用户不存在' });
  }

  if (user.status === 0) {
    return res.status(401).json({ message: '账号已被禁用，请联系管理员' });
  }

  req.user = {
    id: user.id,
    username: user.username,
    role: user.role
  };

  next();
}