import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectApi } from '@/api/project.api';
import type { Project } from '@/types/project';

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

export function useUpdateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Pick<Project, 'name' | 'description'>> }) =>
      projectApi.update(id, data),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: ['projects'] });
      qc.invalidateQueries({ queryKey: ['project', updated.id] });
    },
  });
}
