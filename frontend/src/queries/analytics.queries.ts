import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/api/analytics.api';
export function useProjectAnalytics(projectId: string, userId?: string) {
  return useQuery({
    queryKey: ['analytics', projectId, userId],
    queryFn: () => analyticsApi.getProjectAnalytics(projectId),
    enabled: !!projectId && !!userId,
  });
}