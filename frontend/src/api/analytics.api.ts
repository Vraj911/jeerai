import { apiClient } from './client';
import type { IssueStatus } from '@/types/issue';
export interface AnalyticsData {
  issuesByStatus: Array<{ status: string; count: number }>;
  completionData: Array<{ week: string; completed: number }>;
  velocityData: Array<{ sprint: string; completed: number }>;
  workloadData: Array<{
    name: string;
    todo: number;
    inProgress: number;
    review: number;
    done: number;
  }>;
}
interface AnalyticsApiResponse {
  issuesByStatus: Array<{ status: IssueStatus; count: number }>;
  completionData: Array<{ week: string; completed: number }>;
  velocityData: Array<{ sprint: string; completed: number }>;
  workloadData: Array<{
    name: string;
    todo: number;
    inProgress: number;
    review: number;
    done: number;
  }>;
}
export const analyticsApi = {
  getProjectAnalytics: async (projectId: string): Promise<AnalyticsData> => {
    const { data } = await apiClient.get<AnalyticsApiResponse>(`/analytics/projects/${projectId}`);
    return data;
  },
};
