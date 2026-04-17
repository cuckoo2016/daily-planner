import { Request, Response } from 'express';
import { hashSync, compareSync } from 'bcrypt-ts';
import db from '../config/database.js';
import { generateAccessToken, generateRefreshToken, getRefreshTokenExpiresAt, verifyAccessToken } from '../utils/jwt.js';
import { logOperation } from '../utils/logger.js';
import { User } from '../types.js';
import { AuthRequest } from '../middleware/auth.js';

// Helper to store refresh token in DB
function storeRefreshToken(userId: number, token: string, expiresAt: Date, ip?: string, userAgent?: string): void {
  db.prepare(`
    INSERT INTO refresh_tokens (user_id, token, expires_at, ip_address, user_agent)
    VALUES (?, ?, ?, ?, ?)
  `).run(userId, token, expiresAt.toISOString(), ip || null, userAgent || null);
}

// Helper to revoke refresh token
function revokeRefreshToken(token: string): void {
  db.prepare(`
    UPDATE refresh_tokens
    SET revoked_at = CURRENT_TIMESTAMP
    WHERE token = ?
  `).run(token);
}

// Helper to find valid refresh token
function findValidRefreshToken(token: string): any {
  return db.prepare(`
    SELECT * FROM refresh_tokens
    WHERE token = ? AND revoked_at IS NULL AND expires_at > CURRENT_TIMESTAMP
  `).get(token);
}

// Revoke all user's refresh tokens
function revokeAllUserTokens(userId: number): void {
  db.prepare(`
    UPDATE refresh_tokens
    SET revoked_at = CURRENT_TIMESTAMP
    WHERE user_id = ? AND revoked_at IS NULL
  `).run(userId);
}

export function register(req: Request, res: Response): void {
  try {
    const { username, password, nickname } = req.body;

    // Validation
    if (!username || !password) {
      res.status(400).json({ message: '用户名和密码不能为空' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ message: '密码长度至少6位' });
      return;
    }

    // Check if username exists
    const existingUser = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
    if (existingUser) {
      res.status(400).json({ message: '用户名已存在' });
      return;
    }

    // Check if this is the first user (become admin)
    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
    const role = userCount.count === 0 ? 'admin' : 'user';

    // Hash password
    const hashedPassword = hashSync(password, 10);

    // Insert user
    const result = db.prepare(`
      INSERT INTO users (username, password, role, nickname)
      VALUES (?, ?, ?, ?)
    `).run(username, hashedPassword, role, nickname || '规划者');

    const userId = result.lastInsertRowid as number;

    // Generate tokens
    const accessToken = generateAccessToken({ userId, username, role });
    const refreshToken = generateRefreshToken();
    const refreshExpiresAt = getRefreshTokenExpiresAt();

    // Store refresh token
    storeRefreshToken(userId, refreshToken, refreshExpiresAt, req.ip, req.headers['user-agent']);

    // Log operation
    logOperation({
      userId,
      username,
      action: 'register',
      targetType: 'user',
      targetId: userId,
      details: { username },
      ipAddress: req.ip || undefined,
      userAgent: req.headers['user-agent']
    });

    res.status(201).json({
      message: '注册成功',
      accessToken,
      refreshToken,
      user: {
        id: userId,
        username,
        role,
        nickname: nickname || '规划者'
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
}

export function login(req: Request, res: Response): void {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ message: '用户名和密码不能为空' });
      return;
    }

    // Find user
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as User | undefined;
    if (!user) {
      res.status(401).json({ message: '用户名或密码错误' });
      return;
    }

    // Check if user is active
    if (user.status === 0) {
      res.status(401).json({ message: '账号已被禁用，请联系管理员' });
      return;
    }

    // Verify password
    const validPassword = compareSync(password, user.password);
    if (!validPassword) {
      res.status(401).json({ message: '用户名或密码错误' });
      return;
    }

    // Update last login time
    db.prepare('UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?').run(user.id);

    // Generate tokens
    const accessToken = generateAccessToken({ userId: user.id, username: user.username, role: user.role });
    const refreshToken = generateRefreshToken();
    const refreshExpiresAt = getRefreshTokenExpiresAt();

    // Store refresh token
    storeRefreshToken(user.id, refreshToken, refreshExpiresAt, req.ip, req.headers['user-agent']);

    // Log operation
    logOperation({
      userId: user.id,
      username: user.username,
      action: 'login',
      targetType: 'user',
      targetId: user.id,
      ipAddress: req.ip || undefined,
      userAgent: req.headers['user-agent']
    });

    res.json({
      message: '登录成功',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        nickname: user.nickname,
        avatar: user.avatar,
        theme: user.theme
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
}

export function logout(req: AuthRequest, res: Response): void {
  try {
    const { refreshToken } = req.body;

    // Revoke the provided refresh token if present
    if (refreshToken) {
      revokeRefreshToken(refreshToken);
    } else if (req.user?.id) {
      // Alternatively revoke all user's tokens
      revokeAllUserTokens(req.user.id);
    }

    // Log operation
    logOperation({
      userId: req.user?.id,
      username: req.user?.username,
      action: 'logout',
      targetType: 'user',
      targetId: req.user?.id,
      ipAddress: req.ip || undefined,
      userAgent: req.headers['user-agent']
    });

    res.json({ message: '退出登录成功' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
}

export function getCurrentUser(req: AuthRequest, res: Response): void {
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
    console.error('Get current user error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
}

export function refreshAccessToken(req: Request, res: Response): void {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({ message: 'Refresh Token 不能为空' });
      return;
    }

    // Find valid refresh token
    const tokenRecord = findValidRefreshToken(refreshToken);
    if (!tokenRecord) {
      res.status(401).json({ message: 'Refresh Token 已过期或无效，请重新登录' });
      return;
    }

    // Get user
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(tokenRecord.user_id) as User | undefined;
    if (!user || user.status === 0) {
      res.status(401).json({ message: '用户不存在或已被禁用' });
      return;
    }

    // Generate new access token
    const accessToken = generateAccessToken({ userId: user.id, username: user.username, role: user.role });

    // Optional: Generate new refresh token (token rotation)
    const newRefreshToken = generateRefreshToken();
    const refreshExpiresAt = getRefreshTokenExpiresAt();

    // Revoke old refresh token and store new one
    revokeRefreshToken(refreshToken);
    storeRefreshToken(user.id, newRefreshToken, refreshExpiresAt, req.ip, req.headers['user-agent']);

    res.json({
      message: 'Token 刷新成功',
      accessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        nickname: user.nickname,
        avatar: user.avatar,
        theme: user.theme
      }
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ message: '服务器错误' });
  }
}
