import { apiClient } from './client';
import type { Invitation, WorkspaceRole } from '@/types/workspace';
interface CreateInvitationPayload {
  workspaceId: string;
  actorUserId: string;
  email: string;
  role: WorkspaceRole;
}
interface AcceptInvitationPayload {
  token: string;
  userId?: string;
  name?: string;
}
export const invitationApi = {
  create: async ({ workspaceId, ...payload }: CreateInvitationPayload): Promise<Invitation> => {
    const { data } = await apiClient.post<Invitation>(`/workspaces/${workspaceId}/invitations`, payload);
    return data;
  },
  getByToken: async (token: string): Promise<Invitation> => {
    const { data } = await apiClient.get<Invitation>(`/invitations/${token}`);
    return data;
  },
  accept: async ({ token, ...payload }: AcceptInvitationPayload): Promise<Invitation> => {
    const { data } = await apiClient.post<Invitation>(`/invitations/${token}/accept`, payload);
    return data;
  },
  getWorkspaceInvitations: async (workspaceId: string, userId: string): Promise<Invitation[]> => {
    const { data } = await apiClient.get<Invitation[]>(`/workspaces/${workspaceId}/invitations`, {
      params: { userId },
    });
    return data;
  },
};
