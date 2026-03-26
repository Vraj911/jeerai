import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUIStore } from '@/store/ui.store';
import { useCommandStore } from '@/store/command.store';
import { useThemeStore } from '@/store/theme.store';
import { useDebounce } from '@/hooks/useDebounce';
import { useUsers } from '@/queries/user.queries';
import { ROUTES } from '@/routes/routeConstants';
import { Search, Plus, Command, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { fuzzyMatch } from '@/lib/search';
import { useIssues } from '@/queries/issue.queries';
import { useProjects } from '@/queries/project.queries';
import { APP_NAME } from '@/lib/constants';
import { useSessionStore } from '@/store/session.store';

type SearchEntity =
  | { id: string; label: string; value: string; route: string; group: 'Issues'; meta: string }
  | { id: string; label: string; value: string; route: string; group: 'Projects'; meta: string }
  | { id: string; label: string; value: string; route: string; group: 'Members'; meta: string };

export function Topbar() {
  const { setIssueCreateModalOpen, globalSearchOpen, setGlobalSearchOpen } = useUIStore();
  const { setOpen: setCommandOpen } = useCommandStore();
  const { theme, toggleTheme } = useThemeStore();
  const currentRole = useSessionStore((state) => state.currentRole);
  const location = useLocation();
  const navigate = useNavigate();
  const { data: issues = [] } = useIssues();
  const { data: projects = [] } = useProjects();
  const { data: users = [] } = useUsers();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const debouncedQuery = useDebounce(searchQuery, 200);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const openListener = () => {
      setGlobalSearchOpen(true);
      setTimeout(() => inputRef.current?.focus(), 10);
    };
    window.addEventListener('jeera:focus-global-search', openListener);
    return () => window.removeEventListener('jeera:focus-global-search', openListener);
  }, [setGlobalSearchOpen]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setGlobalSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [setGlobalSearchOpen]);

  const issueItems = useMemo(
    () =>
      fuzzyMatch(
        debouncedQuery,
        issues.map((issue) => ({
          id: `issue-${issue.id}`,
          label: issue.title,
          value: `${issue.key} ${issue.title}`,
          route: ROUTES.ISSUE.DETAIL(issue.id),
          group: 'Issues' as const,
          meta: issue.key,
        })),
        (item) => item.value
      ).slice(0, 5),
    [debouncedQuery, issues]
  );

  const projectItems = useMemo(
    () =>
      fuzzyMatch(
        debouncedQuery,
        projects.map((project) => ({
          id: `project-${project.id}`,
          label: project.name,
          value: `${project.key} ${project.name}`,
          route: ROUTES.PROJECT.OVERVIEW(project.id),
          group: 'Projects' as const,
          meta: project.key,
        })),
        (item) => item.value
      ).slice(0, 4),
    [debouncedQuery, projects]
  );

  const memberItems = useMemo(
    () =>
      fuzzyMatch(
        debouncedQuery,
        users.map((user) => ({
          id: `member-${user.id}`,
          label: user.name,
          value: `${user.name} ${user.email}`,
          route: ROUTES.APP.MEMBERS,
          group: 'Members' as const,
          meta: user.email,
        })),
        (item) => item.value
      ).slice(0, 4),
    [debouncedQuery, users]
  );

  const groupedResults = useMemo(
    () => [
      { group: 'Issues' as const, items: issueItems },
      { group: 'Projects' as const, items: projectItems },
      { group: 'Members' as const, items: memberItems },
    ],
    [issueItems, memberItems, projectItems]
  );

  const flatResults = useMemo(
    () => groupedResults.flatMap((entry) => entry.items),
    [groupedResults]
  );

  useEffect(() => {
    setActiveIndex(0);
  }, [debouncedQuery, globalSearchOpen]);

  const pathSegments = location.pathname.split('/').filter(Boolean);

  const handleSearchSelect = (item: SearchEntity) => {
    navigate(item.route);
    setGlobalSearchOpen(false);
    setSearchQuery('');
  };

  const canCreateIssues = currentRole !== 'VIEWER';

  return (
    <header className="flex h-12 items-center border-b px-4 gap-2 shrink-0 bg-background/90">
      <div className="flex items-center gap-1 text-sm text-muted-foreground">
        {pathSegments.map((segment, i) => (
          <span key={segment + i} className="flex items-center">
            {i > 0 && <span className="mx-1 text-border">/</span>}
            <span className={i === pathSegments.length - 1 ? 'text-foreground font-medium' : ''}>
              {segment.charAt(0).toUpperCase() + segment.slice(1)}
            </span>
          </span>
        ))}
      </div>

      <div className="flex-1" />

      <div ref={searchRef} className="relative" role="combobox" aria-expanded={globalSearchOpen} aria-haspopup="listbox">
        <button
          onClick={() => {
            setGlobalSearchOpen(true);
            setTimeout(() => inputRef.current?.focus(), 10);
          }}
          className={cn(
            'flex items-center gap-2 rounded-md border px-3 py-1 text-sm text-muted-foreground hover:bg-accent transition-[background-color,border-color,filter] duration-200 hover:border-border/80 hover:brightness-[0.99]',
            globalSearchOpen && 'bg-accent'
          )}
          aria-label="Open global search"
        >
          <Search className="h-3.5 w-3.5" />
          {!globalSearchOpen && (
            <>
              <span className="hidden sm:inline">Search...</span>
              <kbd className="ml-2 text-[10px] border rounded px-1 py-0.5 hidden sm:inline">/</kbd>
            </>
          )}
        </button>

        {globalSearchOpen && (
          <div className="absolute top-full right-0 mt-1 w-96 rounded-md border bg-popover z-50">
            <div className="p-2 border-b">
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search issues, projects, members..."
                className="w-full text-sm bg-transparent outline-none placeholder:text-muted-foreground"
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setGlobalSearchOpen(false);
                    setSearchQuery('');
                    return;
                  }
                  if (e.key === 'ArrowDown' && flatResults.length > 0) {
                    e.preventDefault();
                    setActiveIndex((prev) => (prev + 1) % flatResults.length);
                    return;
                  }
                  if (e.key === 'ArrowUp' && flatResults.length > 0) {
                    e.preventDefault();
                    setActiveIndex((prev) => (prev - 1 + flatResults.length) % flatResults.length);
                    return;
                  }
                  if (e.key === 'Enter' && flatResults[activeIndex]) {
                    e.preventDefault();
                    handleSearchSelect(flatResults[activeIndex]);
                  }
                }}
              />
            </div>
            <div className="max-h-80 overflow-y-auto" role="listbox" aria-label="Search results">
              {debouncedQuery.length > 0 && flatResults.length === 0 && (
                <div className="p-3 text-sm text-muted-foreground text-center">
                  No results for "{debouncedQuery}"
                </div>
              )}
              {groupedResults.map(({ group, items }) =>
                items.length > 0 ? (
                  <div key={group} className="p-1 border-t first:border-t-0">
                    <div className="px-2 py-1 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{group}</div>
                    {items.map((item) => {
                      const index = flatResults.findIndex((entry) => entry.id === item.id);
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleSearchSelect(item)}
                          onMouseEnter={() => setActiveIndex(index)}
                          className={cn(
                            'w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md text-left transition-colors',
                            index === activeIndex ? 'bg-accent' : 'hover:bg-accent/80'
                          )}
                          role="option"
                          aria-selected={index === activeIndex}
                        >
                          <span className="font-mono text-xs text-muted-foreground shrink-0">{item.meta}</span>
                          <span className="truncate">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                ) : null
              )}
              {!debouncedQuery && (
                <div className="p-3 text-sm text-muted-foreground text-center">
                  Type to search...
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {canCreateIssues && (
        <Button size="sm" onClick={() => setIssueCreateModalOpen(true)} className="h-7 gap-1 text-xs">
          <Plus className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Create</span>
        </Button>
      )}

      <button
        onClick={() => setCommandOpen(true)}
        className="p-1.5 rounded-md hover:bg-accent text-muted-foreground"
        title="Command palette (Cmd/Ctrl+K)"
        aria-label="Open command palette"
      >
        <Command className="h-4 w-4" />
      </button>

      <button onClick={toggleTheme} className="p-1.5 rounded-md hover:bg-accent text-muted-foreground" aria-label="Toggle theme">
        {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
      </button>

      <img
        src={theme === 'light' ? '/JeerAi-light.png' : '/JeerAi.png'}
        alt={`${APP_NAME} logo`}
        className="h-9 w-9 rounded-md ml-1 object-contain"
      />
    </header>
  );
}

