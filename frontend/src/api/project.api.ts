import { mockProjects as initialProjects } from '@/lib/mockAdapter';
import type { Project } from '@/types/project';

let projects = [...initialProjects];

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const projectApi = {
  getAll: async (): Promise<Project[]> => {
    await delay(200);
    return [...projects];
  },

  getById: async (id: string): Promise<Project | undefined> => {
    await delay(100);
    return projects.find((p) => p.id === id);
  },

  update: async (id: string, data: Partial<Pick<Project, 'name' | 'description'>>): Promise<Project> => {
    await delay(150);
    projects = projects.map((p) =>
      p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p
    );
    const updated = projects.find((p) => p.id === id);
    if (!updated) throw new Error('Project not found');
    return updated;
  },
};
