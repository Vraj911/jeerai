import { useQuery } from '@tanstack/react-query';
import { activityApi } from '@/api/activity.api';

export function useActivities() {
  return useQuery({
    queryKey: ['activities'],
    queryFn: () => activityApi.getAll(),
  });
}

export function useProjectActivities(projectId: string) {
  return useQuery({
    queryKey: ['activities', projectId],
    queryFn: () => activityApi.getByProject(projectId),
    enabled: !!projectId,
  });
}
