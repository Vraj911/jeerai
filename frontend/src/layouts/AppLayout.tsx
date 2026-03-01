import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRealtimeSimulation } from '@/hooks/useRealtimeSimulation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { CommandPalette } from '@/components/layout/CommandPalette';
import { IssueCreateModal } from '@/features/issues/components/IssueCreateModal';
import { useUIStore } from '@/store/ui.store';
import { useCommandStore } from '@/store/command.store';
import { ROUTES } from '@/routes/routeConstants';

export function AppLayout() {
  const navigate = useNavigate();
  const {
    issueCreateModalOpen,
    setIssueCreateModalOpen,
    setGlobalSearchOpen,
  } = useUIStore();
  const { setOpen: setCommandOpen } = useCommandStore();
  useRealtimeSimulation();

  useEffect(() => {
    let gPressedAt = 0;

    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;

      const key = e.key.toLowerCase();
      const hasCommand = e.metaKey || e.ctrlKey;

      if (hasCommand && key === 'k') {
        e.preventDefault();
        setCommandOpen(true);
        return;
      }

      if (!hasCommand && key === 'g') {
        gPressedAt = Date.now();
        return;
      }

      if (!hasCommand && Date.now() - gPressedAt < 1200) {
        if (key === 'p') {
          e.preventDefault();
          navigate(ROUTES.APP.PROJECTS);
          gPressedAt = 0;
          return;
        }
        if (key === 'b') {
          e.preventDefault();
          const currentProject = window.location.pathname.match(/\/app\/projects\/([^/]+)/)?.[1];
          navigate(ROUTES.PROJECT.BOARD(currentProject ?? 'proj-1'));
          gPressedAt = 0;
          return;
        }
        if (key === 'a') {
          e.preventDefault();
          navigate(ROUTES.APP.ACTIVITY);
          gPressedAt = 0;
          return;
        }
      }

      if (!hasCommand && key === 'c') {
        e.preventDefault();
        setIssueCreateModalOpen(true);
        return;
      }

      if (!hasCommand && key === '/') {
        e.preventDefault();
        setGlobalSearchOpen(true);
        window.dispatchEvent(new CustomEvent('jeera:focus-global-search'));
        return;
      }

      if (key === 'escape') {
        setGlobalSearchOpen(false);
        setCommandOpen(false);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [navigate, setCommandOpen, setGlobalSearchOpen, setIssueCreateModalOpen]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
      <CommandPalette />
      <IssueCreateModal
        open={issueCreateModalOpen}
        onOpenChange={setIssueCreateModalOpen}
      />
    </div>
  );
}
