import { apiClient } from './client';
import type {
  ConnectUrlResponse,
  IntegrationProvider,
  IntegrationSubscription,
  IntegrationSummary,
} from '@/types/integration';

export const integrationApi = {
  list: async (projectId: string): Promise<IntegrationSummary[]> => {
    const { data } = await apiClient.get<IntegrationSummary[]>(`/projects/${projectId}/integrations`);
    return data;
  },

  disconnect: async (projectId: string, provider: IntegrationProvider): Promise<void> => {
    await apiClient.post(`/projects/${projectId}/integrations/${provider.toLowerCase()}/disconnect`);
  },

  getSubscriptions: async (projectId: string, provider: IntegrationProvider): Promise<IntegrationSubscription[]> => {
    const { data } = await apiClient.get<IntegrationSubscription[]>(
      `/projects/${projectId}/integrations/${provider.toLowerCase()}/subscriptions`
    );
    return data;
  },

  patchSubscriptions: async (
    projectId: string,
    provider: IntegrationProvider,
    subscriptions: Array<{ channelKey: string; eventType: string; enabled: boolean }>
  ): Promise<IntegrationSubscription[]> => {
    const { data } = await apiClient.patch<IntegrationSubscription[]>(
      `/projects/${projectId}/integrations/${provider.toLowerCase()}/subscriptions`,
      { subscriptions }
    );
    return data;
  },
};
