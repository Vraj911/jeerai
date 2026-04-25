import { apiClient } from './client';
import type { DashboardAccess, OnboardingStatus, Workspace, WorkspaceMember } from '@/types/workspace';
interface CreateWorkspacePayload {
  name: string;
  ownerUserId?: string;
  ownerName?: string;
  ownerEmail?: string;
}
export const workspaceApi = {
  getAll: async (userId: string): Promise<Workspace[]> => {
    const { data } = await apiClient.get<Workspace[]>('/workspaces', {
      params: { userId },
    });
    return data;
  },
  getOnboardingStatus: async (userId: string): Promise<OnboardingStatus> => {
    const { data } = await apiClient.get<OnboardingStatus>('/workspaces/onboarding', {
      params: { userId },
    });
    return data;
  },
  create: async (payload: CreateWorkspacePayload): Promise<Workspace> => {
    const { data } = await apiClient.post<Workspace>('/workspaces', payload);
    return data;
  },
  getMembers: async (workspaceId: string, userId: string): Promise<WorkspaceMember[]> => {
    const { data } = await apiClient.get<WorkspaceMember[]>(`/workspaces/${workspaceId}/members`, {
      params: { userId },
    });
    return data;
  },
  getDashboardAccess: async (workspaceId: string, userId: string): Promise<DashboardAccess> => {
    const { data } = await apiClient.get<DashboardAccess>(`/workspaces/${workspaceId}/dashboard-access`, {
      params: { userId },
    });
    return data;
  },
};
