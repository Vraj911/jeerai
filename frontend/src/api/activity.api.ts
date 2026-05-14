import { apiClient } from './client';
import type { Activity, ActivityPageResponse } from '@/types/activity';
import type { Issue } from '@/types/issue';
export const activityApi = {
  getPage: async (page = 0, size = 20, projectId?: string): Promise<ActivityPageResponse> => {
    const { data } = await apiClient.get<ActivityPageResponse>('/activities', {
      params: { page, size, projectId },
    });
    return data;
  },
  getAll: async (): Promise<Activity[]> => {
    const data = await activityApi.getPage(0, 100);
    return data.content;
  },
  getByProject: async (projectId: string): Promise<Activity[]> => {
    const data = await activityApi.getPage(0, 100, projectId);
    return data.content;
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
