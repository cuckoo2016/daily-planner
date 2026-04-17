import request from './request';

export interface Plan {
  id: number;
  user_id: number;
  content: string;
  plan_date: string;
  reminder_time: string | null;
  is_completed: number;
  reminder_enabled: number;
  created_at: string;
  updated_at: string;
}

export interface PlanFormData {
  content: string;
  plan_date?: string;
  reminder_time?: string;
  reminder_enabled?: boolean;
}

export function getPlans(date?: string) {
  return request<{ plans: Plan[] }>('/plans', {
    params: { date }
  });
}

export function getHistoryPlans(params: {
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}) {
  return request<{ plans: any[]; total: number }>('/plans/history', { params });
}

export function getPlanById(id: number) {
  return request<{ plan: Plan }>(`/plans/${id}`);
}

export function createPlan(data: PlanFormData) {
  return request<{ plan: Plan }>('/plans', {
    method: 'POST',
    data
  });
}

export function updatePlan(id: number, data: Partial<PlanFormData>) {
  return request<{ plan: Plan }>(`/plans/${id}`, {
    method: 'PUT',
    data
  });
}

export function toggleComplete(id: number, is_completed: boolean) {
  return request<{ plan: Plan }>(`/plans/${id}/complete`, {
    method: 'PATCH',
    data: { is_completed }
  });
}

export function deletePlan(id: number) {
  return request(`/plans/${id}`, {
    method: 'DELETE'
  });
}

export function searchPlans(keyword: string, page = 1, pageSize = 10) {
  return request<{ plans: Plan[]; total: number }>('/plans/search', {
    params: { keyword, page, pageSize }
  });
}