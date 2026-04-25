import { apiClient } from './client';
import type { Activity } from '@/types/activity';
import type { Issue } from '@/types/issue';
export const activityApi = {
  getAll: async (): Promise<Activity[]> => {
    const { data } = await apiClient.get<Activity[]>('/activities');
    return data;
  },
  getByProject: async (projectId: string): Promise<Activity[]> => {
    const { data } = await apiClient.get<Activity[]>('/activities', { params: { projectId } });
    return data;
  },
  add: async (activity: Omit<Activity, 'id'>): Promise<Activity> => {
    const { data } = await apiClient.post<Activity>('/activities', activity);
    return data;
  },
  addFromIssueUpdate: async (issue: Issue, randomValue: number): Promise<Activity> => {
    const { data } = await apiClient.post<Activity>('/activities/from-issue-update', {
      issueId: issue.id,
      randomValue,
    });
    return data;
  },
};
