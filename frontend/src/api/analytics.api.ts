import { mockIssues } from '@/lib/mockAdapter';
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
    const assigneeCounts = new Map<
      string,
      { todo: number; inProgress: number; review: number; done: number }
    >();
    projectIssues.forEach((issue) => {
      const name = issue.assignee?.name ?? 'Unassigned';
      if (!assigneeCounts.has(name)) {
        assigneeCounts.set(name, { todo: 0, inProgress: 0, review: 0, done: 0 });
      }
      const c = assigneeCounts.get(name)!;
      if (issue.status === 'todo') c.todo++;
      else if (issue.status === 'in-progress') c.inProgress++;
      else if (issue.status === 'review') c.review++;
      else c.done++;
    });
    const workloadData = Array.from(assigneeCounts.entries()).map(([name, counts]) => ({
      name,
      ...counts,
    }));

    return {
      issuesByStatus: statusCounts,
      completionData: [
        { week: 'Week 1', completed: 3 },
        { week: 'Week 2', completed: 5 },
        { week: 'Week 3', completed: 4 },
        { week: 'Week 4', completed: 6 },
      ],
      velocityData: [
        { sprint: 'Sprint 10', completed: 8 },
        { sprint: 'Sprint 11', completed: 11 },
        { sprint: 'Sprint 12', completed: 5 },
      ],
      workloadData,
    };
  },
};
