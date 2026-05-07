import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { integrationApi } from '@/api/integration.api';
import type { IntegrationProvider } from '@/types/integration';

export function useProjectIntegrations(projectId: string | undefined) {
  return useQuery({
    queryKey: ['integrations', projectId],
    queryFn: () => integrationApi.list(projectId!),
    enabled: !!projectId,
  });
}

export function useIntegrationSubscriptions(projectId: string | undefined, provider: IntegrationProvider | undefined) {
  return useQuery({
    queryKey: ['integration-subscriptions', projectId, provider],
    queryFn: () => integrationApi.getSubscriptions(projectId!, provider!),
    enabled: !!projectId && !!provider,
  });
}

export function useDisconnectIntegration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, provider }: { projectId: string; provider: IntegrationProvider }) =>
      integrationApi.disconnect(projectId, provider),
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ['integrations', v.projectId] });
      qc.invalidateQueries({ queryKey: ['integration-subscriptions', v.projectId] });
    },
  });
}

export function usePatchIntegrationSubscriptions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      projectId,
      provider,
      subscriptions,
    }: {
      projectId: string;
      provider: IntegrationProvider;
      subscriptions: Array<{ channelKey: string; eventType: string; enabled: boolean }>;
    }) => integrationApi.patchSubscriptions(projectId, provider, subscriptions),
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ['integration-subscriptions', v.projectId, v.provider] });
    },
  });
}
