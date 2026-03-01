import type { User } from './user';

export type ActivityType =
  | 'issue_created'
  | 'status_changed'
  | 'assigned'
  | 'commented'
  | 'priority_changed';

export interface Activity {
  id: string;
  type: ActivityType;
  actor: User;
  targetId: string;
  targetKey: string;
  targetTitle: string;
  detail: string;
  createdAt: string;
  projectId: string;
}
