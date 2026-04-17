import request from './request';

export interface DashboardData {
  totalUsers: number;
  activeUsers: number;
  todayPlans: number;
  todayCompleted: number;
  totalPlans: number;
  overallRate: number;
  trend: { date: string; total: number; completed: number }[];
  recentUsers: any[];
  recentPlans: any[];
}

export interface AdminUser {
  id: number;
  username: string;
  role: string;
  nickname: string;
  avatar: string;
  status: number;
  last_login_at: string;
  created_at: string;
}

export function getDashboard() {
  return request<{ dashboard: DashboardData }>('/admin/dashboard');
}

export function getUsers(params: {
  role?: string;
  status?: number;
  keyword?: string;
  page?: number;
  pageSize?: number;
}) {
  return request<{ users: AdminUser[]; total: number }>('/admin/users', { params });
}

export function getUserById(id: number) {
  return request(`/admin/users/${id}`);
}

export function updateUser(id: number, data: { nickname?: string; role?: string; status?: number }) {
  return request(`/admin/users/${id}`, {
    method: 'PUT',
    data
  });
}

export function toggleUserStatus(id: number, status: number) {
  return request(`/admin/users/${id}/status`, {
    method: 'PATCH',
    data: { status }
  });
}

export function deleteUser(id: number) {
  return request(`/admin/users/${id}`, {
    method: 'DELETE'
  });
}

export function getStatistics(params?: { startDate?: string; endDate?: string }) {
  return request<{ statistics: any }>('/admin/statistics', { params });
}

export function getLogs(params: {
  userId?: number;
  action?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}) {
  return request<{ logs: any[]; total: number }>('/admin/logs', { params });
}

export function getSettings() {
  return request<{ settings: Record<string, string> }>('/admin/settings');
}

export function updateSettings(data: Record<string, string>) {
  return request('/admin/settings', {
    method: 'PUT',
    data
  });
}