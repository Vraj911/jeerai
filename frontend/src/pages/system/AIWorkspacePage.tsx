import { useEffect, useRef, useState } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Bot, User as UserIcon, Check, X } from 'lucide-react';
import type { AIMessage, AiMessageResponse, AiSuggestion } from '@/types/ai';
import { useToast } from '@/hooks/use-toast';
import { useIssues } from '@/queries/issue.queries';
import { useProjects } from '@/queries/project.queries';
import { useSessionStore } from '@/store/session.store';
import { aiApi } from '@/api/ai.api';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const SECTIONS = [
  {
    id: 'generate' as const,
    title: 'Generate Issues',
    prompt: 'Generate issue drafts for...',
    placeholder: 'e.g. user authentication feature',
  },
  {
    id: 'summary' as const,
    title: 'Backlog Summary',
    prompt: 'Summarize project status',
    placeholder: 'e.g. JEERA project',
  },
  {
    id: 'priorities' as const,
    title: 'Priority Suggestions',
    prompt: 'Suggest backlog priorities',
    placeholder: 'What should we work on next?',
  },
];

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

function suggestionPreview(s: AiSuggestion): string {
  if (s.type === 'issue_draft') {
    return [s.title, s.description, s.priority, s.rationale].filter(Boolean).join(' — ');
  }
  if (s.type === 'priority_suggestion') {
    return [s.title, s.rationale].filter(Boolean).join(' — ');
  }
  return [s.title, s.description].filter(Boolean).join(' — ');
}

export default function AIWorkspacePage() {
  const currentWorkspace = useSessionStore((s) => s.currentWorkspace);
  const { data: projects = [] } = useProjects();
  const workspaceProjects = projects.filter((p) => p.workspaceId === currentWorkspace?.id);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const { data: issues = [] } = useIssues(selectedProjectId || undefined);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [lastSuggestions, setLastSuggestions] = useState<AiSuggestion[]>([]);
  const [input, setInput] = useState('');
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [streaming, setStreaming] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ type: string; data?: string } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!selectedProjectId && workspaceProjects.length > 0) {
      setSelectedProjectId(workspaceProjects[0].id);
    }
  }, [selectedProjectId, workspaceProjects]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleAiErrorToast = (code: string | null | undefined) => {
    if (!code) return;
    const map: Record<string, string> = {
      PROVIDER_UNAVAILABLE: 'AI provider unavailable, try again later',
      PARSE_FAILED: 'AI returned an unexpected format',
      ACCESS_DENIED: 'You do not have access to this project',
      INVALID_MODE: 'Invalid request',
      MISSING_CONFIG: 'AI is not configured',
    };
    toast({
      title: 'AI',
      description: map[code] ?? code,
      variant: code === 'ACCESS_DENIED' || code === 'MISSING_CONFIG' ? 'destructive' : 'default',
    });
  };

  const handleSend = async (sectionId?: string) => {
    const mode = (sectionId ?? activeSection ?? 'generate') as 'generate' | 'summary' | 'priorities';
    const prompt = (input.trim() || SECTIONS.find((s) => s.id === mode)?.prompt) ?? '';
    if (!prompt && !sectionId) return;
    if (!currentWorkspace?.id || !selectedProjectId) {
      toast({ title: 'Select a project', description: 'Choose a workspace project for AI context.', variant: 'destructive' });
      return;
    }

    const userMsg: AIMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: prompt || 'Show me',
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setStreaming(true);
    setLastSuggestions([]);

    try {
      const res: AiMessageResponse = await aiApi.sendMessage({
        message: prompt || SECTIONS.find((s) => s.id === mode)?.prompt || '',
        mode,
        workspaceId: currentWorkspace.id,
        projectId: selectedProjectId,
      });
      handleAiErrorToast(res.errorCode);

      const fullResponse = res.reply ?? '';
      setLastSuggestions(res.suggestions ?? []);
      let streamedContent = '';
      await streamText(fullResponse, (chunk) => {
        streamedContent += chunk;
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === 'assistant') {
            return prev.slice(0, -1).concat({ ...last, content: streamedContent });
          }
          return [
            ...prev,
            {
              id: `msg-${Date.now() + 1}`,
              role: 'assistant' as const,
              content: streamedContent,
              createdAt: new Date().toISOString(),
            },
          ];
        });
      });

      if (!res.errorCode && res.requiresConfirmation && mode === 'generate') {
        setPendingAction({ type: 'create_issue', data: fullResponse });
      } else {
        setPendingAction(null);
      }
    } catch {
      toast({ title: 'AI request failed', description: 'Network or server error.', variant: 'destructive' });
    } finally {
      setStreaming(false);
    }
  };

  const handleConfirm = () => {
    if (pendingAction?.type === 'create_issue') {
      toast({ title: 'Drafts ready', description: 'Create issues from the backlog when that workflow is enabled.' });
      setPendingAction(null);
    }
  };

  const handleReject = () => {
    setPendingAction(null);
    toast({ title: 'Action cancelled', description: 'No changes were made.' });
  };

  return (
    <PageContainer title="AI Workspace">
      <div className="max-w-2xl mx-auto flex flex-col gap-4" style={{ height: 'calc(100vh - 180px)' }}>
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Project for context</Label>
          <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
            <SelectTrigger className="w-full max-w-md">
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent>
              {workspaceProjects.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.key} — {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-3 gap-2">
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
              Select a section above or type your request. AI suggests only — you confirm issue creation when offered.
            </div>
          )}
          {messages.map((msg) => (
            <div key={msg.id} className="flex items-start gap-3">
              <div className="h-6 w-6 rounded-md bg-muted flex items-center justify-center shrink-0 mt-0.5">
                {msg.role === 'assistant' ? <Bot className="h-3.5 w-3.5" /> : <UserIcon className="h-3.5 w-3.5" />}
              </div>
              <div className="text-sm whitespace-pre-wrap flex-1">{msg.content}</div>
            </div>
          ))}
          {lastSuggestions.length > 0 && (
            <div className="rounded-md border bg-muted/20 p-3 text-xs space-y-2">
              <p className="font-medium text-sm">Suggestions</p>
              <ul className="list-disc pl-4 space-y-1">
                {lastSuggestions.map((s, idx) => (
                  <li key={`${s.type}-${idx}`}>{suggestionPreview(s)}</li>
                ))}
              </ul>
            </div>
          )}
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
          <Button
            size="sm"
            onClick={() => handleSend(activeSection ?? undefined)}
            disabled={streaming || !input.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Open issues in this project: {issues.length}. AI uses live backlog data from the API.
        </p>
      </div>
    </PageContainer>
  );
}
