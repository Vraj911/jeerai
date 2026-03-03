import { apiClient } from './client';
import type { Project } from '@/types/project';

export const projectApi = {
  getAll: async (): Promise<Project[]> => {
    const { data } = await apiClient.get<Project[]>('/projects');
    return data;
  },

  getById: async (id: string): Promise<Project | undefined> => {
    const { data } = await apiClient.get<Project>(`/projects/${id}`);
    return data;
  },

  update: async (id: string, payload: Partial<Pick<Project, 'name' | 'description'>>): Promise<Project> => {
    const { data } = await apiClient.patch<Project>(`/projects/${id}`, payload);
    return data;
  },
};
