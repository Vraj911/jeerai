import { apiClient } from './client';
import type { Sprint } from '@/types/project';
export const sprintApi = {
  getAll: async (projectId?: string): Promise<Sprint[]> => {
    const { data } = await apiClient.get<Sprint[]>('/sprints', {
      params: projectId ? { projectId } : undefined,
    });
    return data;
  },
};
