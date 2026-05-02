import { apiClient } from './client';
import type { Project, ProjectPermissions } from '@/types/project';
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
  getPermissions: async (id: string): Promise<ProjectPermissions> => {
    const { data } = await apiClient.get<ProjectPermissions>(`/projects/${id}/permissions`);
    return data;
  },
  updatePermissions: async (id: string, payload: ProjectPermissions): Promise<ProjectPermissions> => {
    const { data } = await apiClient.patch<ProjectPermissions>(`/projects/${id}/permissions`, payload);
    return data;
  },
};
