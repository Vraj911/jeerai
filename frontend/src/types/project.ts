import type { User } from './user';
import type { WorkspaceRole } from './workspace';
export interface Project {
  id: string;
  key: string;
  name: string;
  description: string;
  lead: User;
  members: User[];
  createdAt: string;
  updatedAt: string;
  workspaceId?: string;
}
export interface Sprint {
  id: string;
  name: string;
  projectId: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}
export type ProjectPermissionKey = 'CREATE_ISSUES' | 'EDIT_ISSUES' | 'DELETE_ISSUES' | 'MANAGE_PROJECT' | 'VIEW_ANALYTICS';
export interface ProjectPermissions {
  projectId: string;
  permissions: Record<WorkspaceRole, Record<ProjectPermissionKey, boolean>>;
}
