import type { User } from './user';
export interface Project {
  id: string;
  key: string;
  name: string;
  description: string;
  lead: User;
  members: User[];
  createdAt: string;
  updatedAt: string;
}
export interface Sprint {
  id: string;
  name: string;
  projectId: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}
