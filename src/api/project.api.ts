import { mockProjects } from '@/lib/mockAdapter';
import type { Project } from '@/types/project';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const projectApi = {
  getAll: async (): Promise<Project[]> => {
    await delay(200);
    return [...mockProjects];
  },

  getById: async (id: string): Promise<Project | undefined> => {
    await delay(100);
    return mockProjects.find((p) => p.id === id);
  },
};
