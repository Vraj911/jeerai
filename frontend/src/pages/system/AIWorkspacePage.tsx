import { useEffect, useRef, useState } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Bot, User as UserIcon, Check, X } from 'lucide-react';
import type { AIMessage, AiChatMessage, AiMessageResponse, AiSuggestion } from '@/types/ai';
import { useToast } from '@/hooks/use-toast';
import { useIssues } from '@/queries/issue.queries';
import { useProjects } from '@/queries/project.queries';
import { useCreateIssue } from '@/queries/issue.queries';
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
import { Badge } from '@/components/ui/badge';

const SECTIONS = [
  {
    id: 'generate' as const,
    title: 'Generate Issues',
    prompt: 'Generate issue drafts for this project',
    placeholder: 'e.g. user authentication feature',
  },
  {
    id: 'summary' as const,
    title: 'Backlog Summary',
    prompt: 'Summarize the current project status and backlog',
    placeholder: 'e.g. what is the current project health?',
  },
  {
    id: 'priorities' as const,
    title: 'Priority Suggestions',
    prompt: 'Suggest what we should prioritize in the backlog',
    placeholder: 'What should we work on next?',
  },
];

// FIX: improved streaming — splits on sentence boundaries AND newlines
// so single-sentence responses also animate character by character
function streamText(text: string, onChunk: (chunk: string) => void): Promise<void> {
  // Split by sentence endings, newlines, or every ~60 chars for long runs
  const chunks: string[] = [];
  const sentences = text.split(/(?<=[.!?])\s+|(?<=\n)/g).filter(Boolean);

  for (const sentence of sentences) {
    if (sentence.length <= 80) {
      chunks.push(sentence);
    } else {
      // Break long sentences into word groups
      const words = sentence.split(' ');
      let current = '';
      for (const word of words) {
        current += (current ? ' ' : '') + word;
        if (current.length >= 60) {
          chunks.push(current);
          current = '';
        }
      }
      if (current) chunks.push(current);
    }
  }

  let i = 0;
  return new Promise((resolve) => {
    const next = () => {
      if (i >= chunks.length) {
        resolve();
        return;
      }
      onChunk(chunks[i]);
      i++;
      setTimeout(next, 60 + Math.random() * 80);
    };
    next();
  });
}

function suggestionPreview(s: AiSuggestion): string {
  if (s.type === 'issue_draft') {
    const parts = [s.title, s.priority ? `[${s.priority}]` : null, s.rationale]
      .filter(Boolean)
      .join(' — ');
    return parts;
  }
  if (s.type === 'priority_suggestion') {
    return `#${s.rank} ${s.title} — ${s.rationale}`;
  }
  return [s.title, s.description].filter(Boolean).join(' — ');
}

export default function AIWorkspacePage() {
  const currentWorkspace = useSessionStore((s) => s.currentWorkspace);
  const { data: projects = [] } = useProjects();
  const workspaceProjects = projects.filter((p) => p.workspaceId === currentWorkspace?.id);

  // FIX: default activeSection to 'generate' instead of null
  // Previously null caused first Enter-key send to fire as 'generate'
  // silently with no visual indication of which mode was active
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [activeSection, setActiveSection] = useState<'generate' | 'summary' | 'priorities'>('generate');

  const { data: issues = [] } = useIssues(selectedProjectId || undefined);
  const createIssue = useCreateIssue();

  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [lastSuggestions, setLastSuggestions] = useState<AiSuggestion[]>([]);
  const [input, setInput] = useState(SECTIONS[0].prompt);
  const [streaming, setStreaming] = useState(false);
  const [pendingDrafts, setPendingDrafts] = useState<AiSuggestion[]>([]);
  const [creatingIssues, setCreatingIssues] = useState(false);

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
      MISSING_CONFIG: 'AI is not configured — contact your admin',
    };
    toast({
      title: 'AI Notice',
      description: map[code] ?? code,
      variant:
        code === 'ACCESS_DENIED' || code === 'MISSING_CONFIG' ? 'destructive' : 'default',
    });
  };

  // FIX: build history from current messages for multi-turn context
  const buildHistory = (): AiChatMessage[] => {
    return messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));
  };

  const handleSend = async (sectionId?: 'generate' | 'summary' | 'priorities') => {
    const mode = sectionId ?? activeSection;
    const prompt = input.trim() || SECTIONS.find((s) => s.id === mode)?.prompt || '';

    if (!currentWorkspace?.id || !selectedProjectId) {
      toast({
        title: 'Select a project',
        description: 'Choose a project to give AI context.',
        variant: 'destructive',
      });
      return;
    }

    const userMsg: AIMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: prompt,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setStreaming(true);
    setLastSuggestions([]);
    setPendingDrafts([]);

    try {
      const res: AiMessageResponse = await aiApi.sendMessage({
        message: prompt,
        mode,
        workspaceId: currentWorkspace.id,
        projectId: selectedProjectId,
        // FIX: send conversation history for multi-turn memory
        history: buildHistory(),
      });

      handleAiErrorToast(res.errorCode);

      const fullResponse = res.reply ?? '';
      const suggestions = res.suggestions ?? [];
      setLastSuggestions(suggestions);

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

      // FIX: store issue drafts for actual creation on confirm
      // Previously requiresConfirmation was true but handleConfirm just showed a toast
      if (!res.errorCode && res.requiresConfirmation && mode === 'generate') {
        const drafts = suggestions.filter((s) => s.type === 'issue_draft');
        setPendingDrafts(drafts);
      }
    } catch {
      toast({
        title: 'AI request failed',
        description: 'Network or server error. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setStreaming(false);
    }
  };

  // FIX: handleConfirm now actually creates issues from the AI drafts
  // Previously it just showed a toast with no actual side effect
  const handleConfirm = async () => {
    if (pendingDrafts.length === 0 || !selectedProjectId) return;

    setCreatingIssues(true);
    let created = 0;
    let failed = 0;

    for (const draft of pendingDrafts) {
      try {
        await createIssue.mutateAsync({
          title: draft.title ?? 'Untitled Issue',
          description: draft.description ?? '',
          priority: draft.priority ?? 'medium',
          labels: draft.labels ?? [],
          projectId: selectedProjectId,
          status: 'todo',
        });
        created++;
      } catch {
        failed++;
      }
    }

    setCreatingIssues(false);
    setPendingDrafts([]);

    toast({
      title: `${created} issue${created !== 1 ? 's' : ''} created`,
      description:
        failed > 0
          ? `${failed} draft${failed !== 1 ? 's' : ''} failed to create.`
          : 'All AI-suggested issues added to your backlog.',
    });

    // Add confirmation message to chat
    setMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        role: 'assistant' as const,
        content: `✓ Created ${created} issue${created !== 1 ? 's' : ''} in your backlog.${
          failed > 0 ? ` ${failed} failed.` : ''
        }`,
        createdAt: new Date().toISOString(),
      },
    ]);
  };

  const handleReject = () => {
    setPendingDrafts([]);
    setMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        role: 'assistant' as const,
        content: 'Understood — no issues were created. Let me know if you want to refine the suggestions.',
        createdAt: new Date().toISOString(),
      },
    ]);
  };

  const handleSectionChange = (sectionId: 'generate' | 'summary' | 'priorities') => {
    setActiveSection(sectionId);
    setInput(SECTIONS.find((s) => s.id === sectionId)?.prompt ?? '');
  };

  const handleClearChat = () => {
    setMessages([]);
    setLastSuggestions([]);
    setPendingDrafts([]);
    setInput(SECTIONS.find((s) => s.id === activeSection)?.prompt ?? '');
  };

  return (
    <PageContainer title="AI Workspace">
      <div className="max-w-2xl mx-auto flex flex-col gap-4" style={{ height: 'calc(100vh - 180px)' }}>

        {/* Project selector */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Project for AI context</Label>
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

        {/* Mode selector */}
        <div className="grid grid-cols-3 gap-2">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => handleSectionChange(s.id)}
              className={`rounded-md border p-3 text-left text-sm transition-colors ${
                activeSection === s.id
                  ? 'border-primary bg-primary/5 font-medium'
                  : 'hover:bg-accent/50'
              }`}
            >
              {s.title}
            </button>
          ))}
        </div>

        {/* Chat messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 mb-2 min-h-[200px]">
          {messages.length === 0 && (
            <div className="text-sm text-muted-foreground py-8 text-center space-y-1">
              <p>Select a mode above and send a message.</p>
              <p className="text-xs">
                AI uses your live project data — {issues.length} open issue
                {issues.length !== 1 ? 's' : ''} loaded.
              </p>
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
              <div className="text-sm whitespace-pre-wrap flex-1 leading-relaxed">
                {msg.content}
              </div>
            </div>
          ))}

          {/* Suggestions panel */}
          {lastSuggestions.length > 0 && (
            <div className="rounded-md border bg-muted/20 p-3 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-medium text-sm">
                  {activeSection === 'generate'
                    ? `${lastSuggestions.filter((s) => s.type === 'issue_draft').length} Issue Drafts`
                    : activeSection === 'priorities'
                    ? 'Priority Suggestions'
                    : 'Analysis'}
                </p>
                <Badge variant="secondary" className="text-xs">
                  {activeSection}
                </Badge>
              </div>
              <ul className="space-y-1.5">
                {lastSuggestions.map((s, idx) => (
                  <li
                    key={`${s.type}-${idx}`}
                    className="text-muted-foreground leading-relaxed border-l-2 border-border pl-2"
                  >
                    {suggestionPreview(s)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* FIX: Confirm panel now shows draft count and actually creates issues */}
        {pendingDrafts.length > 0 && (
          <div className="flex items-center gap-2 p-3 rounded-md border bg-muted/30">
            <Button
              size="sm"
              onClick={handleConfirm}
              disabled={creatingIssues}
            >
              <Check className="h-3.5 w-3.5 mr-1" />
              {creatingIssues
                ? 'Creating...'
                : `Create ${pendingDrafts.length} Issue${pendingDrafts.length !== 1 ? 's' : ''}`}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleReject}
              disabled={creatingIssues}
            >
              <X className="h-3.5 w-3.5 mr-1" />
              Discard
            </Button>
            <span className="text-xs text-muted-foreground ml-1">
              Approve to add AI drafts to your backlog
            </span>
          </div>
        )}

        {/* Input */}
        <div className="flex gap-2 border-t pt-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && !streaming) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={
              SECTIONS.find((s) => s.id === activeSection)?.placeholder ?? 'Ask AI for help...'
            }
            className="flex-1"
            disabled={streaming}
            aria-label="AI prompt input"
          />
          <Button
            size="sm"
            onClick={() => handleSend()}
            disabled={streaming || !input.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
          {messages.length > 0 && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleClearChat}
              disabled={streaming}
              title="Clear chat"
            >
              Clear
            </Button>
          )}
        </div>

        <p className="text-[11px] text-muted-foreground">
          AI reads your live backlog · {issues.length} issue{issues.length !== 1 ? 's' : ''} in context · Suggestions only — you approve changes
        </p>
      </div>
    </PageContainer>
  );
}