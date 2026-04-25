import { create } from 'zustand';
import { persist } from 'zustand/middleware';
interface UIState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  collapsedBoardColumns: Record<string, boolean>;
  toggleBoardColumnCollapsed: (columnId: string) => void;
  setBoardColumnCollapsed: (columnId: string, collapsed: boolean) => void;
  issueCreateModalOpen: boolean;
  setIssueCreateModalOpen: (open: boolean) => void;
  projectCreateModalOpen: boolean;
  setProjectCreateModalOpen: (open: boolean) => void;
  globalSearchOpen: boolean;
  setGlobalSearchOpen: (open: boolean) => void;
  activityPulse: boolean;
  setActivityPulse: (active: boolean) => void;
}
export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      collapsedBoardColumns: {},
      toggleBoardColumnCollapsed: (columnId) =>
        set((s) => ({
          collapsedBoardColumns: {
            ...s.collapsedBoardColumns,
            [columnId]: !s.collapsedBoardColumns[columnId],
          },
        })),
      setBoardColumnCollapsed: (columnId, collapsed) =>
        set((s) => ({
          collapsedBoardColumns: {
            ...s.collapsedBoardColumns,
            [columnId]: collapsed,
          },
        })),
      issueCreateModalOpen: false,
      setIssueCreateModalOpen: (open) => set({ issueCreateModalOpen: open }),
      projectCreateModalOpen: false,
      setProjectCreateModalOpen: (open) => set({ projectCreateModalOpen: open }),
      globalSearchOpen: false,
      setGlobalSearchOpen: (open) => set({ globalSearchOpen: open }),
      activityPulse: false,
      setActivityPulse: (active) => set({ activityPulse: active }),
    }),
    {
      name: 'jeera2-ui',
      partialize: (s) => ({
        sidebarCollapsed: s.sidebarCollapsed,
        collapsedBoardColumns: s.collapsedBoardColumns,
      }),
    }
  )
);
