import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.js';

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): void | Response {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: '权限不足，需要管理员权限' });
  }
  next();
}

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void | Response => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: '权限不足' });
    }
    next();
  };
}