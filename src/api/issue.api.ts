import { mockIssues as initialIssues, mockComments, mockUsers } from '@/lib/mockAdapter';
import type { Issue, IssueStatus, Comment } from '@/types/issue';

let issues = [...initialIssues];

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const issueApi = {
  getAll: async (projectId?: string): Promise<Issue[]> => {
    await delay(200);
    return projectId ? issues.filter((i) => i.projectId === projectId) : [...issues];
  },

  getById: async (id: string): Promise<Issue | undefined> => {
    await delay(100);
    return issues.find((i) => i.id === id);
  },

  create: async (data: Partial<Issue>): Promise<Issue> => {
    await delay(200);
    const newIssue: Issue = {
      id: `issue-${Date.now()}`,
      key: `JEERA-${100 + issues.length}`,
      title: data.title ?? '',
      status: data.status ?? 'todo',
      priority: data.priority ?? 'medium',
      assignee: data.assignee ?? null,
      reporter: data.reporter ?? mockUsers[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      description: data.description ?? '',
      labels: data.labels ?? [],
      projectId: data.projectId ?? 'proj-1',
    };
    issues = [newIssue, ...issues];
    return newIssue;
  },

  update: async (id: string, data: Partial<Issue>): Promise<Issue> => {
    await delay(150);
    issues = issues.map((i) =>
      i.id === id ? { ...i, ...data, updatedAt: new Date().toISOString() } : i
    );
    const updated = issues.find((i) => i.id === id);
    if (!updated) throw new Error('Issue not found');
    return updated;
  },

  updateStatus: async (id: string, status: IssueStatus): Promise<Issue> => {
    return issueApi.update(id, { status });
  },

  getComments: async (issueId: string): Promise<Comment[]> => {
    await delay(100);
    return mockComments.filter((c) => c.issueId === issueId);
  },
};
