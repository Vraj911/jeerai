import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { CommandPalette } from '@/components/layout/CommandPalette';
import { IssueCreateModal } from '@/features/issues/components/IssueCreateModal';
import { useUIStore } from '@/store/ui.store';

export function AppLayout() {
  const { issueCreateModalOpen, setIssueCreateModalOpen } = useUIStore();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;
      if (e.key === 'c' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setIssueCreateModalOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setIssueCreateModalOpen]);

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
