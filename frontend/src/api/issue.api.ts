import {
  mockIssues,
  mockComments,
  mockUsers,
  mockProjects,
} from '@/lib/mockAdapter';
import type { Issue, IssueStatus, Comment, IssuePriority } from '@/types/issue';

const issues = mockIssues;
const comments = mockComments;
const statusFlow: IssueStatus[] = ['todo', 'in-progress', 'review', 'done'];
const priorityFlow: IssuePriority[] = ['highest', 'high', 'medium', 'low', 'lowest'];

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const issueApi = {
  getAll: async (projectId?: string): Promise<Issue[]> => {
    await delay(200);
    return projectId ? issues.filter((i) => i.projectId === projectId) : issues.slice();
  },

  getById: async (id: string): Promise<Issue | undefined> => {
    await delay(100);
    return issues.find((i) => i.id === id);
  },

  create: async (data: Partial<Issue>): Promise<Issue> => {
    await delay(200);
    const projectId = data.projectId ?? 'proj-1';
    const project = mockProjects.find((p) => p.id === projectId);
    const projectKey = project?.key ?? 'JEERA';
    const count = issues.filter((i) => i.projectId === projectId).length;
    const newIssue: Issue = {
      id: `issue-${Date.now()}`,
      key: `${projectKey}-${100 + count + 1}`,
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
    issues.unshift(newIssue);
    return newIssue;
  },

  update: async (id: string, data: Partial<Issue>): Promise<Issue> => {
    await delay(150);
    const index = issues.findIndex((i) => i.id === id);
    if (index === -1) throw new Error('Issue not found');
    const updated = {
      ...issues[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    issues[index] = updated;
    return updated;
  },

  updateStatus: async (id: string, status: IssueStatus): Promise<Issue> => {
    return issueApi.update(id, { status });
  },

  getComments: async (issueId: string): Promise<Comment[]> => {
    await delay(100);
    return comments.filter((c) => c.issueId === issueId).slice();
  },

  addComment: async (issueId: string, content: string, authorId: string): Promise<Comment> => {
    await delay(150);
    const author = mockUsers.find((u) => u.id === authorId) ?? mockUsers[0];
    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      issueId,
      author,
      content,
      createdAt: new Date().toISOString(),
    };
    comments.unshift(newComment);
    return newComment;
  },

  assignToMe: async (id: string): Promise<Issue> => {
    return issueApi.update(id, { assignee: mockUsers[0] });
  },

  setPriority: async (id: string, priority: IssuePriority): Promise<Issue> => {
    return issueApi.update(id, { priority });
  },

  simulateRandomUpdate: async (randomValue: number): Promise<Issue> => {
    const issueIndex = Math.floor(randomValue * issues.length) % Math.max(issues.length, 1);
    const issue = issues[issueIndex];
    if (!issue) {
      throw new Error('No issues found');
    }

    const statusIndex = statusFlow.indexOf(issue.status);
    const priorityIndex = priorityFlow.indexOf(issue.priority);
    const flipPriority = randomValue > 0.6;

    const nextStatus = statusFlow[(statusIndex + 1) % statusFlow.length];
    const nextPriority = priorityFlow[(priorityIndex + 1) % priorityFlow.length];

    return issueApi.update(issue.id, {
      status: flipPriority ? issue.status : nextStatus,
      priority: flipPriority ? nextPriority : issue.priority,
    });
  },
};
