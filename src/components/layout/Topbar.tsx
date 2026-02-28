import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUIStore } from '@/store/ui.store';
import { useCommandStore } from '@/store/command.store';
import { useThemeStore } from '@/store/theme.store';
import { useDebounce } from '@/hooks/useDebounce';
import { mockIssues, mockProjects, mockUsers } from '@/lib/mockAdapter';
import { ROUTES } from '@/routes/routeConstants';
import { Search, Plus, Command, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function Topbar() {
  const { setIssueCreateModalOpen, globalSearchOpen, setGlobalSearchOpen } = useUIStore();
  const { toggle: toggleCommand } = useCommandStore();
  const { theme, toggleTheme } = useThemeStore();
  const location = useLocation();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 200);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // "/" shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;
      if (e.key === '/' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setGlobalSearchOpen(true);
        setTimeout(() => inputRef.current?.focus(), 50);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setGlobalSearchOpen]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setGlobalSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [setGlobalSearchOpen]);

  const searchResults = debouncedQuery.length > 0 ? {
    issues: mockIssues.filter(
      (i) =>
        i.key.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        i.title.toLowerCase().includes(debouncedQuery.toLowerCase())
    ).slice(0, 5),
    projects: mockProjects.filter(
      (p) =>
        p.name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        p.key.toLowerCase().includes(debouncedQuery.toLowerCase())
    ).slice(0, 3),
    members: mockUsers.filter(
      (u) => u.name.toLowerCase().includes(debouncedQuery.toLowerCase())
    ).slice(0, 3),
  } : null;

  const hasResults = searchResults && (
    searchResults.issues.length > 0 ||
    searchResults.projects.length > 0 ||
    searchResults.members.length > 0
  );

  const pathSegments = location.pathname.split('/').filter(Boolean);

  const handleSearchSelect = (path: string) => {
    navigate(path);
    setGlobalSearchOpen(false);
    setSearchQuery('');
  };

  return (
    <header className="flex h-12 items-center border-b px-4 gap-2 shrink-0 bg-background">
      <div className="flex items-center gap-1 text-sm text-muted-foreground">
        {pathSegments.map((segment, i) => (
          <span key={i} className="flex items-center">
            {i > 0 && <span className="mx-1 text-border">/</span>}
            <span className={i === pathSegments.length - 1 ? 'text-foreground font-medium' : ''}>
              {segment.charAt(0).toUpperCase() + segment.slice(1)}
            </span>
          </span>
        ))}
      </div>

      <div className="flex-1" />

      {/* Search */}
      <div ref={searchRef} className="relative">
        <button
          onClick={() => {
            setGlobalSearchOpen(true);
            setTimeout(() => inputRef.current?.focus(), 50);
          }}
          className={cn(
            'flex items-center gap-2 rounded-md border px-3 py-1 text-sm text-muted-foreground hover:bg-accent transition-colors',
            globalSearchOpen && 'bg-accent'
          )}
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
          <div className="absolute top-full right-0 mt-1 w-80 rounded-md border bg-popover shadow-sm z-50">
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
                  }
                }}
              />
            </div>
            <div className="max-h-64 overflow-y-auto">
              {debouncedQuery.length > 0 && !hasResults && (
                <div className="p-3 text-sm text-muted-foreground text-center">
                  No results for "{debouncedQuery}"
                </div>
              )}
              {searchResults && searchResults.issues.length > 0 && (
                <div className="p-1">
                  <div className="px-2 py-1 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Issues</div>
                  {searchResults.issues.map((issue) => (
                    <button
                      key={issue.id}
                      onClick={() => handleSearchSelect(ROUTES.ISSUE.DETAIL(issue.id))}
                      className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-accent text-left"
                    >
                      <span className="font-mono text-xs text-muted-foreground shrink-0">{issue.key}</span>
                      <span className="truncate">{issue.title}</span>
                    </button>
                  ))}
                </div>
              )}
              {searchResults && searchResults.projects.length > 0 && (
                <div className="p-1 border-t">
                  <div className="px-2 py-1 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Projects</div>
                  {searchResults.projects.map((project) => (
                    <button
                      key={project.id}
                      onClick={() => handleSearchSelect(ROUTES.PROJECT.OVERVIEW(project.id))}
                      className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-accent text-left"
                    >
                      <span className="font-mono text-xs text-muted-foreground">{project.key}</span>
                      <span className="truncate">{project.name}</span>
                    </button>
                  ))}
                </div>
              )}
              {searchResults && searchResults.members.length > 0 && (
                <div className="p-1 border-t">
                  <div className="px-2 py-1 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Members</div>
                  {searchResults.members.map((user) => (
                    <div key={user.id} className="flex items-center gap-2 px-2 py-1.5 text-sm">
                      <div className="h-5 w-5 rounded-md bg-muted flex items-center justify-center text-[10px] font-medium">
                        {user.name.charAt(0)}
                      </div>
                      <span>{user.name}</span>
                    </div>
                  ))}
                </div>
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

      <Button size="sm" onClick={() => setIssueCreateModalOpen(true)} className="h-7 gap-1 text-xs">
        <Plus className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Create</span>
      </Button>

      <button onClick={toggleCommand} className="p-1.5 rounded-md hover:bg-accent text-muted-foreground" title="Command palette (⌘K)">
        <Command className="h-4 w-4" />
      </button>

      <button onClick={toggleTheme} className="p-1.5 rounded-md hover:bg-accent text-muted-foreground">
        {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
      </button>

      <div className="h-7 w-7 rounded-md bg-primary flex items-center justify-center text-xs font-medium text-primary-foreground ml-1">
        {mockUsers[0].name.charAt(0)}
      </div>
    </header>
  );
}
