import { mockActivities } from '@/lib/mockAdapter';
import type { Activity } from '@/types/activity';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const activityApi = {
  getAll: async (): Promise<Activity[]> => {
    await delay(200);
    return [...mockActivities];
  },

  getByProject: async (projectId: string): Promise<Activity[]> => {
    await delay(150);
    return mockActivities.filter((a) => a.projectId === projectId);
  },
};
