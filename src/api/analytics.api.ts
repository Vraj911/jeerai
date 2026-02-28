import { mockIssues } from '@/lib/mockAdapter';
import type { IssueStatus } from '@/types/issue';

export interface AnalyticsData {
  issuesByStatus: Array<{ status: string; count: number }>;
  velocityData: Array<{ sprint: string; completed: number; added: number }>;
  workloadData: Array<{ name: string; issues: number }>;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const analyticsApi = {
  getProjectAnalytics: async (projectId: string): Promise<AnalyticsData> => {
    await delay(300);
    const projectIssues = mockIssues.filter((i) => i.projectId === projectId);
    const statusCounts = (['todo', 'in-progress', 'review', 'done'] as IssueStatus[]).map(
      (status) => ({
        status,
        count: projectIssues.filter((i) => i.status === status).length,
      })
    );
    return {
      issuesByStatus: statusCounts,
      velocityData: [
        { sprint: 'Sprint 10', completed: 8, added: 12 },
        { sprint: 'Sprint 11', completed: 11, added: 9 },
        { sprint: 'Sprint 12', completed: 5, added: 7 },
      ],
      workloadData: [
        { name: 'John Doe', issues: 4 },
        { name: 'Jane Smith', issues: 3 },
        { name: 'Alex Chen', issues: 3 },
        { name: 'Sarah Wilson', issues: 2 },
      ],
    };
  },
};
