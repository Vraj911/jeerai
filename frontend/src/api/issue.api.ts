import { apiClient } from './client';
import type { Issue, IssuePriority, IssueStatus, Comment } from '@/types/issue';
export const issueApi = {
  getAll: async (projectId?: string): Promise<Issue[]> => {
    const { data } = await apiClient.get<Issue[]>('/issues', {
      params: projectId ? { projectId } : undefined,
    });
    return data;
  },
  getById: async (id: string): Promise<Issue | undefined> => {
    const { data } = await apiClient.get<Issue>(`/issues/${id}`);
    return data;
  },
  create: async (payload: Partial<Issue>): Promise<Issue> => {
    const { data } = await apiClient.post<Issue>('/issues', payload);
    return data;
  },
  update: async (id: string, payload: Partial<Issue>): Promise<Issue> => {
    const { data } = await apiClient.patch<Issue>(`/issues/${id}`, payload);
    return data;
  },
  updateStatus: async (id: string, status: IssueStatus): Promise<Issue> => {
    const { data } = await apiClient.patch<Issue>(`/issues/${id}/status`, { status });
    return data;
  },
  getComments: async (issueId: string): Promise<Comment[]> => {
    const { data } = await apiClient.get<Comment[]>(`/issues/${issueId}/comments`);
    return data;
  },
  addComment: async (issueId: string, content: string, authorId: string): Promise<Comment> => {
    const { data } = await apiClient.post<Comment>(`/issues/${issueId}/comments`, { content, authorId });
    return data;
  },
  setPriority: async (id: string, priority: IssuePriority): Promise<Issue> => {
    return issueApi.update(id, { priority });
  },
  simulateRandomUpdate: async (randomValue: number): Promise<Issue | null> => {
    const { data } = await apiClient.post<Issue | null>('/issues/simulate-random-update', { randomValue });
    return data;
  },
};
