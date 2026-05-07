/** Integration providers shown in the UI. (Currently treated as roadmap-only.) */
export type IntegrationProvider = 'GITHUB' | 'SLACK';

export interface IntegrationSummary {
  provider: string;
  status: string;
  externalWorkspaceId?: string | null;
  externalWorkspaceName?: string | null;
  lastError?: string | null;
  connectedAt?: string | null;
  updatedAt?: string | null;
}

export interface IntegrationSubscription {
  id: string;
  channelKey: string;
  eventType: string;
  enabled: boolean;
}

export interface ConnectUrlResponse {
  url: string;
}
