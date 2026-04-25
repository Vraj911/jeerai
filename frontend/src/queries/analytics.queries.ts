import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/api/analytics.api';
export function useProjectAnalytics(projectId: string) {
  return useQuery({
    queryKey: ['analytics', projectId],
    queryFn: () => analyticsApi.getProjectAnalytics(projectId),
    enabled: !!projectId,
  });
}
