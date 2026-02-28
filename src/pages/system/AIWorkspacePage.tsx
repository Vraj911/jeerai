import { useState } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Bot, User as UserIcon } from 'lucide-react';
import type { AIMessage } from '@/types/ai';

const initialMessages: AIMessage[] = [
  {
    id: '1',
    role: 'assistant',
    content:
      'Hello! I can help you with project management tasks. Try asking me to:\n\n• Generate issue drafts\n• Summarize project status\n• Suggest backlog priorities',
    createdAt: new Date().toISOString(),
  },
];

function getAIResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes('issue') || lower.includes('create') || lower.includes('draft')) {
    return "Here's a suggested issue draft:\n\n**Title:** Implement user feedback collection\n**Priority:** Medium\n**Description:** Add a feedback mechanism for users to submit feature requests and bug reports.\n\nWould you like me to create this issue? (This would require your confirmation)";
  }
  if (lower.includes('status') || lower.includes('summary') || lower.includes('project')) {
    return 'Project Status Summary:\n\n• **To Do:** 3 issues\n• **In Progress:** 3 issues\n• **Review:** 2 issues\n• **Done:** 3 issues\n\nThe team is making steady progress. JEERA-104 (Kanban board) is the highest priority item currently in progress.';
  }
  if (lower.includes('priority') || lower.includes('backlog')) {
    return 'Backlog Priority Suggestions:\n\n1. **JEERA-101** (Set up CI/CD) — High impact on team velocity\n2. **JEERA-102** (Keyboard shortcuts) — Improves daily workflow\n3. **JEERA-103** (Design token audit) — Can be deferred\n\nI recommend focusing on CI/CD setup first as it will benefit the entire team.';
  }
  return 'I can help you with:\n\n• **Issue drafts** — "Generate an issue for..."\n• **Project summaries** — "What\'s the project status?"\n• **Priority suggestions** — "What should we work on next?"\n\nWhat would you like to know?';
}

export default function AIWorkspacePage() {
  const [messages, setMessages] = useState<AIMessage[]>(initialMessages);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: AIMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    setTimeout(() => {
      const response: AIMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: getAIResponse(input),
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, response]);
    }, 800);
  };

  return (
    <PageContainer title="AI Workspace">
      <div className="max-w-2xl mx-auto flex flex-col" style={{ height: 'calc(100vh - 180px)' }}>
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {messages.map((msg) => (
            <div key={msg.id} className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-md bg-muted flex items-center justify-center shrink-0 mt-0.5">
                {msg.role === 'assistant' ? (
                  <Bot className="h-3.5 w-3.5" />
                ) : (
                  <UserIcon className="h-3.5 w-3.5" />
                )}
              </div>
              <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
            </div>
          ))}
        </div>
        <div className="flex gap-2 border-t pt-4">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask AI for help..."
            className="flex-1"
          />
          <Button size="sm" onClick={handleSend} disabled={!input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}
