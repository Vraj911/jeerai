import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  issueCreateModalOpen: boolean;
  setIssueCreateModalOpen: (open: boolean) => void;
  projectCreateModalOpen: boolean;
  setProjectCreateModalOpen: (open: boolean) => void;
  globalSearchOpen: boolean;
  setGlobalSearchOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      issueCreateModalOpen: false,
      setIssueCreateModalOpen: (open) => set({ issueCreateModalOpen: open }),
      projectCreateModalOpen: false,
      setProjectCreateModalOpen: (open) => set({ projectCreateModalOpen: open }),
      globalSearchOpen: false,
      setGlobalSearchOpen: (open) => set({ globalSearchOpen: open }),
    }),
    {
      name: 'jeera2-ui',
      partialize: (s) => ({ sidebarCollapsed: s.sidebarCollapsed }),
    }
  )
);
