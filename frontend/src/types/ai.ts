export type AIMessageRole = 'user' | 'assistant';

export interface AIMessage {
  id: string;
  role: AIMessageRole;
  content: string;
  createdAt: string;
}

export interface AiChatMessage {
  role: string;
  content: string;
}

export interface AiSuggestion {
  type: 'issue_draft' | 'priority_suggestion' | 'summary';
  title?: string;
  description?: string;
  priority?: string;
  labels?: string[];
  rationale?: string;
  issueId?: string;
  rank?: number;
}

export interface AiMessageRequest {
  message: string;
  mode: 'generate' | 'summary' | 'priorities';
  workspaceId: string;
  projectId: string;
  history?: AiChatMessage[];
}

export interface AiMessageResponse {
  reply: string;
  mode: string;
  requiresConfirmation: boolean;
  suggestions: AiSuggestion[];
  errorCode?: string | null;
}

export interface AISuggestion {
  id: string;
  type: 'issue_draft' | 'priority_suggestion' | 'summary';
  content: string;
  metadata?: Record<string, string>;
}
