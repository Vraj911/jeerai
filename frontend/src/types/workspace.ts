import type { User } from '@/types/user';

export type WorkspaceRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'REVOKED';

export interface Workspace {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
}

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  user: User;
  role: WorkspaceRole;
  joinedAt: string;
}

export interface Invitation {
  id: string;
  workspaceId: string;
  email: string;
  role: WorkspaceRole;
  status: InvitationStatus;
  token: string;
  inviteLink: string;
  expiresAt: string;
  createdAt: string;
}

export interface OnboardingStatus {
  userId: string;
  onboardingRequired: boolean;
  workspaceCount: number;
  workspaces: Workspace[];
}

export interface DashboardAccess {
  workspaceId: string;
  userId: string;
  hasWorkspace: boolean;
  accessible: boolean;
  onboardingRequired: boolean;
  reason: string;
}
