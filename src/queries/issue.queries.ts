import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { issueApi } from '@/api/issue.api';
import type { Issue, IssueStatus } from '@/types/issue';

export function useIssues(projectId?: string) {
  return useQuery({
    queryKey: ['issues', projectId],
    queryFn: () => issueApi.getAll(projectId),
  });
}

export function useIssue(id: string) {
  return useQuery({
    queryKey: ['issue', id],
    queryFn: () => issueApi.getById(id),
    enabled: !!id,
  });
}

export function useIssueComments(issueId: string) {
  return useQuery({
    queryKey: ['issue-comments', issueId],
    queryFn: () => issueApi.getComments(issueId),
    enabled: !!issueId,
  });
}

export function useCreateIssue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Issue>) => issueApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['issues'] });
    },
  });
}

export function useUpdateIssue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Issue> }) =>
      issueApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['issues'] });
      qc.invalidateQueries({ queryKey: ['issue'] });
    },
  });
}

export function useUpdateIssueStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: IssueStatus }) =>
      issueApi.updateStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['issues'] });
    },
  });
}
