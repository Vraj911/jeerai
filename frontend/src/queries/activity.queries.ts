import { useQuery } from '@tanstack/react-query';
import { activityApi } from '@/api/activity.api';
export function useActivities(page = 0, size = 20) {
  return useQuery({
    queryKey: ['activities', page, size],
    queryFn: () => activityApi.getPage(page, size),
  });
}
export function useProjectActivities(projectId: string) {
  return useQuery({
    queryKey: ['activities', projectId],
    queryFn: () => activityApi.getByProject(projectId),
    enabled: !!projectId,
  });
}
