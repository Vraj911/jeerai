import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types/user';
import type { Workspace, WorkspaceRole } from '@/types/workspace';

interface SessionState {
  hasHydrated: boolean;
  currentUser: User | null;
  currentWorkspace: Workspace | null;
  currentRole: WorkspaceRole | null;
  token: string | null;
  setHasHydrated: (hasHydrated: boolean) => void;
  setCurrentUser: (user: User | null) => void;
  setCurrentWorkspace: (workspace: Workspace | null) => void;
  setCurrentRole: (role: WorkspaceRole | null) => void;
  setToken: (token: string | null) => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      hasHydrated: false,
      currentUser: null,
      currentWorkspace: null,
      currentRole: null,
      token: null,
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
      setCurrentUser: (currentUser) => set({ currentUser }),
      setCurrentWorkspace: (currentWorkspace) => set({ currentWorkspace }),
      setCurrentRole: (currentRole) => set({ currentRole }),
      setToken: (token) => set({ token }),
      clearSession: () => set({ currentUser: null, currentWorkspace: null, currentRole: null, token: null }),
    }),
    {
      name: 'jeerai-session',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
