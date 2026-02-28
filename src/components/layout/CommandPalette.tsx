import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCommandStore } from '@/store/command.store';
import { useUIStore } from '@/store/ui.store';
import { ROUTES } from '@/routes/routeConstants';
import { useIssues } from '@/queries/issue.queries';
import { useProjects } from '@/queries/project.queries';
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
  Settings,
} from 'lucide-react';

export function CommandPalette() {
  const { open, setOpen } = useCommandStore();
  const { setIssueCreateModalOpen } = useUIStore();
  const navigate = useNavigate();
  const { data: issues = [] } = useIssues();
  const { data: projects = [] } = useProjects();

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
    <CommandDialog open={open} onOpenChange={setOpen} aria-describedby={undefined}>
      <CommandInput placeholder="Type a command or search issues..." aria-label="Command palette search" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          <CommandItem value="dashboard" onSelect={() => runCommand(() => navigate(ROUTES.APP.DASHBOARD))}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard
          </CommandItem>
          <CommandItem value="projects" onSelect={() => runCommand(() => navigate(ROUTES.APP.PROJECTS))}>
            <FolderKanban className="mr-2 h-4 w-4" />
            Projects
          </CommandItem>
          <CommandItem value="activity" onSelect={() => runCommand(() => navigate(ROUTES.APP.ACTIVITY))}>
            <Activity className="mr-2 h-4 w-4" />
            Activity
          </CommandItem>
          <CommandItem value="ai" onSelect={() => runCommand(() => navigate(ROUTES.APP.AI))}>
            <Bot className="mr-2 h-4 w-4" />
            AI Workspace
          </CommandItem>
          <CommandItem value="notifications" onSelect={() => runCommand(() => navigate(ROUTES.APP.NOTIFICATIONS))}>
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </CommandItem>
          <CommandItem value="members" onSelect={() => runCommand(() => navigate(ROUTES.APP.MEMBERS))}>
            <Users className="mr-2 h-4 w-4" />
            Members
          </CommandItem>
          <CommandItem value="settings" onSelect={() => runCommand(() => navigate(ROUTES.APP.WORKSPACE_SETTINGS))}>
            <Settings className="mr-2 h-4 w-4" />
            Workspace Settings
          </CommandItem>
        </CommandGroup>
        <CommandGroup heading="Actions">
          <CommandItem value="create issue" onSelect={() => runCommand(() => setIssueCreateModalOpen(true))}>
            <Plus className="mr-2 h-4 w-4" />
            Create Issue
          </CommandItem>
        </CommandGroup>
        <CommandGroup heading="Projects">
          {projects.slice(0, 5).map((project) => (
            <CommandItem
              key={project.id}
              value={`${project.key} ${project.name}`}
              onSelect={() => runCommand(() => navigate(ROUTES.PROJECT.BOARD(project.id)))}
            >
              <FolderKanban className="mr-2 h-4 w-4" />
              <span className="font-mono text-xs mr-2 text-muted-foreground">{project.key}</span>
              <span className="truncate">{project.name}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Issues">
          {issues.slice(0, 8).map((issue) => (
            <CommandItem
              key={issue.id}
              value={`${issue.key} ${issue.title}`}
              onSelect={() => runCommand(() => navigate(ROUTES.ISSUE.DETAIL(issue.id)))}
            >
              <FileText className="mr-2 h-4 w-4" />
              <span className="font-mono text-xs mr-2 text-muted-foreground shrink-0">{issue.key}</span>
              <span className="truncate">{issue.title}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
