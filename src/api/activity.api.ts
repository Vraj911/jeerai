import { mockActivities as initialActivities, mockUsers, mockIssues } from '@/lib/mockAdapter';
import type { Activity } from '@/types/activity';

let activities = [...initialActivities];

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const activityApi = {
  getAll: async (): Promise<Activity[]> => {
    await delay(200);
    return [...activities].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  getByProject: async (projectId: string): Promise<Activity[]> => {
    await delay(150);
    return activities
      .filter((a) => a.projectId === projectId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  add: (activity: Omit<Activity, 'id'>): void => {
    const newActivity: Activity = {
      ...activity,
      id: `act-${Date.now()}`,
    };
    activities = [newActivity, ...activities];
  },

  simulateRandomEvent: (): void => {
    const issue = mockIssues[Math.floor(Math.random() * mockIssues.length)];
    const actor = mockUsers[Math.floor(Math.random() * mockUsers.length)];
    const types: Array<{ type: Activity['type']; detail: string }> = [
      { type: 'status_changed', detail: 'Changed status' },
      { type: 'assigned', detail: `Assigned to ${actor.name}` },
      { type: 'commented', detail: 'Added a comment' },
      { type: 'issue_created', detail: 'Created issue' },
    ];
    const chosen = types[Math.floor(Math.random() * types.length)];
    activityApi.add({
      type: chosen.type,
      actor,
      targetId: issue.id,
      targetKey: issue.key,
      targetTitle: issue.title,
      detail: chosen.detail,
      createdAt: new Date().toISOString(),
      projectId: issue.projectId,
    });
  },
};
