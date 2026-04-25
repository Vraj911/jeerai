import { apiClient } from './client';
import type { Project } from '@/types/project';
interface CreateProjectPayload {
  name: string;
  key: string;
  description: string;
  workspaceId: string;
}
export const projectApi = {
  getAll: async (): Promise<Project[]> => {
    const { data } = await apiClient.get<Project[]>('/projects');
    return data;
  },
  create: async (payload: CreateProjectPayload): Promise<Project> => {
    const { data } = await apiClient.post<Project>('/projects', payload);
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
