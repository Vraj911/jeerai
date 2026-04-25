import type { User } from './user';
export type IssueStatus = 'todo' | 'in-progress' | 'review' | 'done';
export type IssuePriority = 'highest' | 'high' | 'medium' | 'low' | 'lowest';
export interface Issue {
  id: string;
  key: string;
  title: string;
  status: IssueStatus;
  priority: IssuePriority;
  assignee: User | null;
  reporter: User;
  createdAt: string;
  updatedAt: string;
  description: string;
  labels: string[];
  projectId: string;
  sprintId?: string;
}

export interface Comment {
  id: string;
  issueId: string;
  author: User;
  content: string;
  createdAt: string;
}
