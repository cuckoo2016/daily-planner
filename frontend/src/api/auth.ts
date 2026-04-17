import request from './request';

export interface LoginData {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  password: string;
  nickname?: string;
}

export interface User {
  id: number;
  username: string;
  role: string;
  nickname: string;
  avatar: string;
  theme: string;
  status: number;
  last_login_at: string;
  created_at: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
  message?: string;
}

export function login(data: LoginData) {
  return request<AuthResponse>('/auth/login', {
    method: 'POST',
    data
  });
}

export function register(data: RegisterData) {
  return request<AuthResponse>('/auth/register', {
    method: 'POST',
    data
  });
}

export function logout(refreshToken?: string) {
  return request('/auth/logout', {
    method: 'POST',
    data: { refreshToken }
  });
}

export function getCurrentUser() {
  return request<{ user: User }>('/auth/me');
}

export function refreshToken(refreshToken: string) {
  return request<AuthResponse>('/auth/refresh', {
    method: 'POST',
    data: { refreshToken }
  });
}
