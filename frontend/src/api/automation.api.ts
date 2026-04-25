import { apiClient } from './client';
import type { AutomationRule } from '@/types/automation';
export const automationApi = {
  getByProject: async (projectId: string): Promise<AutomationRule[]> => {
    const { data } = await apiClient.get<AutomationRule[]>('/automation-rules', { params: { projectId } });
    return data;
  },
  create: async (payload: Omit<AutomationRule, 'id' | 'createdAt'>): Promise<AutomationRule> => {
    const { data } = await apiClient.post<AutomationRule>('/automation-rules', payload);
    return data;
  },
  update: async (id: string, payload: Partial<AutomationRule>): Promise<AutomationRule> => {
    const { data } = await apiClient.patch<AutomationRule>(`/automation-rules/${id}`, payload);
    return data;
  },
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/automation-rules/${id}`);
  },
  toggle: async (id: string, enabled: boolean): Promise<AutomationRule> => {
    const { data } = await apiClient.patch<AutomationRule>(`/automation-rules/${id}/toggle`, null, {
      params: { enabled },
    });
    return data;
  },
};
