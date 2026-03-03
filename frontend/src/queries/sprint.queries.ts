import { useQuery } from '@tanstack/react-query';
import { sprintApi } from '@/api/sprint.api';

export function useSprints(projectId?: string) {
  return useQuery({
    queryKey: ['sprints', projectId],
    queryFn: () => sprintApi.getAll(projectId),
  });
}
