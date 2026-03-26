import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { workspaceApi } from '@/api/workspace.api';
import { useSessionStore } from '@/store/session.store';

export function useWorkspaces() {
  const currentUser = useSessionStore((state) => state.currentUser);

  return useQuery({
    queryKey: ['workspaces', currentUser?.id],
    queryFn: () => workspaceApi.getAll(currentUser!.id),
    enabled: !!currentUser?.id,
  });
}

export function useCreateWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: workspaceApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      queryClient.invalidateQueries({ queryKey: ['workspace-onboarding'] });
    },
  });
}

export function useWorkspaceMembers(workspaceId?: string) {
  const currentUser = useSessionStore((state) => state.currentUser);

  return useQuery({
    queryKey: ['workspace-members', workspaceId, currentUser?.id],
    queryFn: () => workspaceApi.getMembers(workspaceId!, currentUser!.id),
    enabled: !!workspaceId && !!currentUser?.id,
  });
}

export function useWorkspaceDashboardAccess(workspaceId?: string) {
  const currentUser = useSessionStore((state) => state.currentUser);

  return useQuery({
    queryKey: ['workspace-dashboard-access', workspaceId, currentUser?.id],
    queryFn: () => workspaceApi.getDashboardAccess(workspaceId!, currentUser!.id),
    enabled: !!workspaceId && !!currentUser?.id,
  });
}

export function useWorkspaceOnboarding() {
  const currentUser = useSessionStore((state) => state.currentUser);

  return useQuery({
    queryKey: ['workspace-onboarding', currentUser?.id],
    queryFn: () => workspaceApi.getOnboardingStatus(currentUser!.id),
    enabled: !!currentUser?.id,
  });
}
