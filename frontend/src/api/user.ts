import request from './request';

export interface UserStats {
  totalPlans: number;
  completedPlans: number;
  useDays: number;
  completionRate: number;
  todayTotal: number;
  todayCompleted: number;
}

export function getProfile() {
  return request('/user/profile');
}

export function updateProfile(data: { nickname?: string; avatar?: string }) {
  return request('/user/profile', {
    method: 'PUT',
    data
  });
}

export function updateTheme(theme: string) {
  return request('/user/theme', {
    method: 'PUT',
    data: { theme }
  });
}

export function getStats() {
  return request<{ stats: UserStats }>('/user/stats');
}

export function changePassword(oldPassword: string, newPassword: string) {
  return request('/user/password', {
    method: 'PUT',
    data: { oldPassword, newPassword }
  });
}