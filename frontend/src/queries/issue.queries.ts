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
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: ['issues'] });
      const prev = qc.getQueriesData({ queryKey: ['issues'] });
      qc.setQueriesData({ queryKey: ['issues'] }, (old: Issue[] | undefined) =>
        old?.map((i) => (i.id === id ? { ...i, status } : i))
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) {
        (ctx.prev as [unknown, unknown][]).forEach(([queryKey, data]) =>
          qc.setQueryData(queryKey as string[], data)
        );
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['issues'] });
    },
  });
}
export function useAddComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      issueId,
      content,
      authorId,
    }: {
      issueId: string;
      content: string;
      authorId: string;
    }) => issueApi.addComment(issueId, content, authorId),
    onSuccess: (comment) => {
      qc.invalidateQueries({ queryKey: ['issue-comments', comment.issueId] });
      qc.invalidateQueries({ queryKey: ['issue', comment.issueId] });
    },
  });
}
