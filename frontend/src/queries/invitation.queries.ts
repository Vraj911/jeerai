import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { invitationApi } from '@/api/invitation.api';
import { useSessionStore } from '@/store/session.store';
export function useInvitations(workspaceId?: string) {
  const currentUser = useSessionStore((state) => state.currentUser);
  return useQuery({
    queryKey: ['workspace-invitations', workspaceId, currentUser?.id],
    queryFn: () => invitationApi.getWorkspaceInvitations(workspaceId!, currentUser!.id),
    enabled: !!workspaceId && !!currentUser?.id,
  });
}
export function useInvitation(token?: string) {
  return useQuery({
    queryKey: ['invitation', token],
    queryFn: () => invitationApi.getByToken(token!),
    enabled: !!token,
  });
}
export function useCreateInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: invitationApi.create,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['workspace-invitations', variables.workspaceId],
      });
    },
  });
}
export function useAcceptInvitation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: invitationApi.accept,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      queryClient.invalidateQueries({ queryKey: ['workspace-onboarding'] });
    },
  });
}
