import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { automationApi } from '@/api/automation.api';
import type { AutomationRule } from '@/types/automation';

export function useAutomationRules(projectId: string) {
  return useQuery({
    queryKey: ['automation', projectId],
    queryFn: () => automationApi.getByProject(projectId),
    enabled: !!projectId,
  });
}

export function useCreateAutomationRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<AutomationRule, 'id' | 'createdAt'>) => automationApi.create(data),
    onSuccess: (rule) => {
      qc.invalidateQueries({ queryKey: ['automation', rule.projectId] });
    },
  });
}

export function useUpdateAutomationRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AutomationRule> }) =>
      automationApi.update(id, data),
    onSuccess: (rule) => {
      qc.invalidateQueries({ queryKey: ['automation', rule.projectId] });
    },
  });
}

export function useDeleteAutomationRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => automationApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['automation'] });
    },
  });
}

export function useToggleAutomationRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      automationApi.toggle(id, enabled),
    onSuccess: (rule) => {
      qc.invalidateQueries({ queryKey: ['automation', rule.projectId] });
    },
  });
}
