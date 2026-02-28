import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCommandStore } from '@/store/command.store';
import { useUIStore } from '@/store/ui.store';
import { ROUTES } from '@/routes/routeConstants';
import { useIssues } from '@/queries/issue.queries';
import { useProjects } from '@/queries/project.queries';
import { fuzzyMatch } from '@/lib/search';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
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
  PanelTop,
} from 'lucide-react';

type PaletteItem = {
  id: string;
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  execute: () => void;
  shortcut?: string;
};

export function CommandPalette() {
  const { open, setOpen, query, setQuery } = useCommandStore();
  const { setIssueCreateModalOpen } = useUIStore();
  const navigate = useNavigate();
  const { data: issues = [] } = useIssues();
  const { data: projects = [] } = useProjects();

  const runCommand = (fn: () => void) => {
    setOpen(false);
    setQuery('');
    fn();
  };

  const navigationItems = useMemo<PaletteItem[]>(
    () => [
      {
        id: 'nav-dashboard',
        label: 'Dashboard',
        value: 'dashboard home',
        icon: LayoutDashboard,
        execute: () => navigate(ROUTES.APP.DASHBOARD),
      },
      {
        id: 'nav-projects',
        label: 'Projects',
        value: 'projects list',
        icon: FolderKanban,
        execute: () => navigate(ROUTES.APP.PROJECTS),
        shortcut: 'G P',
      },
      {
        id: 'nav-activity',
        label: 'Activity',
        value: 'activity feed',
        icon: Activity,
        execute: () => navigate(ROUTES.APP.ACTIVITY),
        shortcut: 'G A',
      },
      {
        id: 'nav-notifications',
        label: 'Notifications',
        value: 'notifications inbox',
        icon: Bell,
        execute: () => navigate(ROUTES.APP.NOTIFICATIONS),
      },
      {
        id: 'nav-members',
        label: 'Members',
        value: 'members users',
        icon: Users,
        execute: () => navigate(ROUTES.APP.MEMBERS),
      },
      {
        id: 'nav-ai',
        label: 'AI Workspace',
        value: 'ai workspace assistant',
        icon: Bot,
        execute: () => navigate(ROUTES.APP.AI),
      },
      {
        id: 'nav-settings',
        label: 'Workspace Settings',
        value: 'settings preferences',
        icon: Settings,
        execute: () => navigate(ROUTES.APP.WORKSPACE_SETTINGS),
      },
    ],
    [navigate]
  );

  const actionItems = useMemo<PaletteItem[]>(
    () => [
      {
        id: 'action-create',
        label: 'Create Issue',
        value: 'create issue new ticket',
        icon: Plus,
        execute: () => setIssueCreateModalOpen(true),
        shortcut: 'C',
      },
      {
        id: 'action-open-settings',
        label: 'Open Settings',
        value: 'open settings',
        icon: Settings,
        execute: () => navigate(ROUTES.APP.WORKSPACE_SETTINGS),
      },
    ],
    [navigate, setIssueCreateModalOpen]
  );

  const projectItems = useMemo<PaletteItem[]>(
    () =>
      projects.map((project) => ({
        id: `project-${project.id}`,
        label: `${project.key} ${project.name}`,
        value: `${project.key} ${project.name} switch project board`,
        icon: PanelTop,
        execute: () => navigate(ROUTES.PROJECT.BOARD(project.id)),
      })),
    [navigate, projects]
  );

  const issueItems = useMemo<PaletteItem[]>(
    () =>
      issues.map((issue) => ({
        id: `issue-${issue.id}`,
        label: `${issue.key} ${issue.title}`,
        value: `${issue.key} ${issue.title} issue ticket`,
        icon: FileText,
        execute: () => navigate(ROUTES.ISSUE.DETAIL(issue.id)),
      })),
    [issues, navigate]
  );

  const filteredNavigation = fuzzyMatch(query, navigationItems, (item) => item.value).slice(0, 8);
  const filteredActions = fuzzyMatch(query, actionItems, (item) => item.value).slice(0, 6);
  const filteredProjects = fuzzyMatch(query, projectItems, (item) => item.value).slice(0, 8);
  const filteredIssues = fuzzyMatch(query, issueItems, (item) => item.value).slice(0, 12);

  return (
    <CommandDialog open={open} onOpenChange={setOpen} aria-describedby={undefined}>
      <CommandInput
        placeholder="Search commands, issues, and projects..."
        aria-label="Command palette search"
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Navigation">
          {filteredNavigation.map((item) => (
            <CommandItem key={item.id} value={item.value} onSelect={() => runCommand(item.execute)}>
              <item.icon className="mr-2 h-4 w-4" />
              {item.label}
              {item.shortcut ? <CommandShortcut>{item.shortcut}</CommandShortcut> : null}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Actions">
          {filteredActions.map((item) => (
            <CommandItem key={item.id} value={item.value} onSelect={() => runCommand(item.execute)}>
              <item.icon className="mr-2 h-4 w-4" />
              {item.label}
              {item.shortcut ? <CommandShortcut>{item.shortcut}</CommandShortcut> : null}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Switch Project">
          {filteredProjects.map((item) => (
            <CommandItem key={item.id} value={item.value} onSelect={() => runCommand(item.execute)}>
              <item.icon className="mr-2 h-4 w-4" />
              <span className="truncate">{item.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Issues">
          {filteredIssues.map((item) => (
            <CommandItem key={item.id} value={item.value} onSelect={() => runCommand(item.execute)}>
              <item.icon className="mr-2 h-4 w-4" />
              <span className="truncate">{item.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
