export type AIMessageRole = 'user' | 'assistant';
export interface AIMessage {
  id: string;
  role: AIMessageRole;
  content: string;
  createdAt: string;
}
export interface AISuggestion {
  id: string;
  type: 'issue_draft' | 'priority_suggestion' | 'summary';
  content: string;
  metadata?: Record<string, string>;
}
