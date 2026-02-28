import { useQuery } from '@tanstack/react-query';
import { projectApi } from '@/api/project.api';

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: () => projectApi.getAll(),
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: ['project', id],
    queryFn: () => projectApi.getById(id),
    enabled: !!id,
  });
}
