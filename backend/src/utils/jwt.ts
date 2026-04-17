import jwt, { JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';
import { randomBytes } from 'crypto';
import { JWTPayload } from '../types.js';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'daily-planner-secret-key';
const ACCESS_TOKEN_EXPIRES_IN = '15m';
const REFRESH_TOKEN_EXPIRES_DAYS = 7;

// Generate short-lived Access Token
export function generateAccessToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES_IN });
}

// Generate long-lived Refresh Token (random string)
export function generateRefreshToken(): string {
  return randomBytes(40).toString('hex');
}

// Verify Access Token
export function verifyAccessToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

// Get Refresh Token expiration date
export function getRefreshTokenExpiresAt(): Date {
  const expires = new Date();
  expires.setDate(expires.getDate() + REFRESH_TOKEN_EXPIRES_DAYS);
  return expires;
}

export function decodeToken(token: string): string | JwtPayload | null {
  return jwt.decode(token);
}

export {
  JWT_SECRET,
  ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_DAYS
};
