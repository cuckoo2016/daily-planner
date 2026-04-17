// Type definitions for the application

export interface User {
  id: number;
  username: string;
  password: string;
  role: 'user' | 'admin';
  nickname: string;
  avatar: string;
  theme: string;
  status: 0 | 1;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Plan {
  id: number;
  user_id: number;
  content: string;
  plan_date: string;
  reminder_time: string | null;
  is_completed: 0 | 1;
  reminder_enabled: 0 | 1;
  created_at: string;
  updated_at: string;
}

export interface OperationLog {
  id: number;
  user_id: number | null;
  username: string | null;
  action: string;
  target_type: string | null;
  target_id: number | null;
  details: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface SystemSetting {
  id: number;
  key: string;
  value: string;
  updated_at: string;
}

export interface JWTPayload {
  userId: number;
  username: string;
  role: 'user' | 'admin';
}

export interface RefreshToken {
  id: number;
  user_id: number;
  token: string;
  expires_at: string;
  revoked_at: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface ApiResponse<T = any> {
  message?: string;
  data?: T;
  user?: T;
  token?: string;
  accessToken?: string;
  refreshToken?: string;
}