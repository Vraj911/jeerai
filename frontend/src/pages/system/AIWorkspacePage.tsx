import { useState, useRef, useEffect } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Bot, User as UserIcon, Check, X } from 'lucide-react';
import type { AIMessage } from '@/types/ai';
import { useToast } from '@/hooks/use-toast';
import { useIssues } from '@/queries/issue.queries';

const SECTIONS = [
  {
    id: 'generate',
    title: 'Generate Issues',
    prompt: 'Generate issue drafts for...',
    placeholder: 'e.g. user authentication feature',
  },
  {
    id: 'summary',
    title: 'Backlog Summary',
    prompt: 'Summarize project status',
    placeholder: 'e.g. JEERA project',
  },
  {
    id: 'priorities',
    title: 'Priority Suggestions',
    prompt: 'Suggest backlog priorities',
    placeholder: 'What should we work on next?',
  },
] as const;

function getAIResponse(
  input: string,
  sectionId: string,
  issues: Array<{ key: string; title: string; status: string; priority: string }>
): string {
  const lower = input.toLowerCase();
  if (sectionId === 'generate' || lower.includes('issue') || lower.includes('create') || lower.includes('draft')) {
    return "Here's a suggested issue draft:\n\n**Title:** Implement user feedback collection\n**Priority:** Medium\n**Description:** Add a feedback mechanism for users to submit feature requests and bug reports.\n\nWould you like me to create this issue? (Requires your confirmation)";
  }
  if (sectionId === 'summary' || lower.includes('status') || lower.includes('summary') || lower.includes('project')) {
    const todo = issues.filter((i) => i.status === 'todo').length;
    const inProgress = issues.filter((i) => i.status === 'in-progress').length;
    const review = issues.filter((i) => i.status === 'review').length;
    const done = issues.filter((i) => i.status === 'done').length;
    return `Project Status Summary:\n\n- **To Do:** ${todo} issues\n- **In Progress:** ${inProgress} issues\n- **Review:** ${review} issues\n- **Done:** ${done} issues\n\nThe team is making steady progress.`;
  }
  if (sectionId === 'priorities' || lower.includes('priority') || lower.includes('backlog')) {
    const top = issues.filter((i) => i.status === 'todo' || i.status === 'in-progress').slice(0, 3);
    return `Backlog Priority Suggestions:\n\n${top.map((i, idx) => `${idx + 1}. **${i.key}** (${i.title}) - ${i.priority} priority`).join('\n')}\n\nI recommend focusing on the highest priority items first. Would you like to create any of these?`;
  }
  return 'I can help you with issue drafts, project summaries, or priority suggestions. What would you like to know?';
}

function streamText(text: string, onChunk: (chunk: string) => void): Promise<void> {
  const sentences = text.split(/(?<=[.!?]\s)/).filter(Boolean);
  let i = 0;
  return new Promise((resolve) => {
    const next = () => {
      if (i >= sentences.length) {
        resolve();
        return;
      }
      onChunk(sentences[i]);
      i++;
      setTimeout(next, 80 + Math.random() * 120);
    };
    next();
  });
}

export default function AIWorkspacePage() {
  const { data: issues = [] } = useIssues();
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState('');
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [streaming, setStreaming] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ type: string; data?: string } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSend = (sectionId?: string) => {
    const prompt = (input.trim() || SECTIONS.find((s) => s.id === sectionId)?.prompt) ?? '';
    if (!prompt && !sectionId) return;

    const userMsg: AIMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: prompt || 'Show me',
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setStreaming(true);

    const fullResponse = getAIResponse(prompt, sectionId ?? 'generate', issues);
    let streamedContent = '';

    streamText(fullResponse, (chunk) => {
      streamedContent += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant') {
          return prev.slice(0, -1).concat({ ...last, content: streamedContent });
        }
        return [...prev, { id: `msg-${Date.now() + 1}`, role: 'assistant' as const, content: streamedContent, createdAt: new Date().toISOString() }];
      });
    }).then(() => {
      setStreaming(false);
      if (fullResponse.toLowerCase().includes('create this issue') || fullResponse.toLowerCase().includes('would you like')) {
        setPendingAction({ type: 'create_issue', data: fullResponse });
      }
    });
  };

  const handleConfirm = () => {
    if (pendingAction?.type === 'create_issue') {
      toast({ title: 'Issue created', description: 'The suggested issue has been added. (Simulated)' });
      setPendingAction(null);
    }
  };

  const handleReject = () => {
    setPendingAction(null);
    toast({ title: 'Action cancelled', description: 'No changes were made.' });
  };

  return (
    <PageContainer title="AI Workspace">
      <div className="max-w-2xl mx-auto flex flex-col" style={{ height: 'calc(100vh - 180px)' }}>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                setActiveSection(s.id);
                setInput(s.prompt);
              }}
              className={`rounded-md border p-3 text-left text-sm transition-colors ${
                activeSection === s.id ? 'border-primary bg-primary/5' : 'hover:bg-accent/50'
              }`}
            >
              <span className="font-medium">{s.title}</span>
            </button>
          ))}
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 mb-4 min-h-[200px]">
          {messages.length === 0 && (
            <div className="text-sm text-muted-foreground py-8 text-center">
              Select a section above or type your request. AI suggests only - you confirm all actions.
            </div>
          )}
          {messages.map((msg) => (
            <div key={msg.id} className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-md bg-muted flex items-center justify-center shrink-0 mt-0.5">
                {msg.role === 'assistant' ? (
                  <Bot className="h-3.5 w-3.5" />
                ) : (
                  <UserIcon className="h-3.5 w-3.5" />
                )}
              </div>
              <div className="text-sm whitespace-pre-wrap flex-1">{msg.content}</div>
            </div>
          ))}
        </div>

        {pendingAction && (
          <div className="flex gap-2 mb-4 p-3 rounded-md border bg-muted/30">
            <Button size="sm" onClick={handleConfirm}>
              <Check className="h-3.5 w-3.5 mr-1" />
              Confirm
            </Button>
            <Button size="sm" variant="outline" onClick={handleReject}>
              <X className="h-3.5 w-3.5 mr-1" />
              Cancel
            </Button>
            <span className="text-xs text-muted-foreground self-center ml-2">User approval required</span>
          </div>
        )}

        <div className="flex gap-2 border-t pt-4">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend(activeSection ?? undefined)}
            placeholder={SECTIONS.find((s) => s.id === activeSection)?.placeholder ?? 'Ask AI for help...'}
            className="flex-1"
            disabled={streaming}
            aria-label="AI prompt input"
          />
          <Button size="sm" onClick={() => handleSend(activeSection ?? undefined)} disabled={streaming || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}
