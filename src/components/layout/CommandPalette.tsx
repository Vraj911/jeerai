import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCommandStore } from '@/store/command.store';
import { useUIStore } from '@/store/ui.store';
import { ROUTES } from '@/routes/routeConstants';
import { mockIssues } from '@/lib/mockAdapter';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command';
import {
  FolderKanban,
  FileText,
  Plus,
  Activity,
  Bot,
  LayoutDashboard,
  Bell,
  Users,
} from 'lucide-react';

export function CommandPalette() {
  const { open, setOpen } = useCommandStore();
  const { setIssueCreateModalOpen } = useUIStore();
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!open);
      }
    };
    window.addEventListener('keydown', down);
    return () => window.removeEventListener('keydown', down);
  }, [open, setOpen]);

  const runCommand = (fn: () => void) => {
    setOpen(false);
    fn();
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => runCommand(() => navigate(ROUTES.APP.DASHBOARD))}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate(ROUTES.APP.PROJECTS))}>
            <FolderKanban className="mr-2 h-4 w-4" />
            Projects
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate(ROUTES.APP.ACTIVITY))}>
            <Activity className="mr-2 h-4 w-4" />
            Activity
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate(ROUTES.APP.AI))}>
            <Bot className="mr-2 h-4 w-4" />
            AI Workspace
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate(ROUTES.APP.NOTIFICATIONS))}>
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate(ROUTES.APP.MEMBERS))}>
            <Users className="mr-2 h-4 w-4" />
            Members
          </CommandItem>
        </CommandGroup>
        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => runCommand(() => setIssueCreateModalOpen(true))}>
            <Plus className="mr-2 h-4 w-4" />
            Create Issue
          </CommandItem>
        </CommandGroup>
        <CommandGroup heading="Recent Issues">
          {mockIssues.slice(0, 5).map((issue) => (
            <CommandItem
              key={issue.id}
              onSelect={() => runCommand(() => navigate(ROUTES.ISSUE.DETAIL(issue.id)))}
            >
              <FileText className="mr-2 h-4 w-4" />
              <span className="font-mono text-xs mr-2 text-muted-foreground">{issue.key}</span>
              <span className="truncate">{issue.title}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
