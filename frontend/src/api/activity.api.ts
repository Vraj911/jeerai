import { mockActivities, mockUsers } from '@/lib/mockAdapter';
import type { Activity } from '@/types/activity';
import type { Issue } from '@/types/issue';

const activities = mockActivities;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const activityApi = {
  getAll: async (): Promise<Activity[]> => {
    await delay(200);
    return activities
      .slice()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getByProject: async (projectId: string): Promise<Activity[]> => {
    await delay(150);
    return activities
      .filter((a) => a.projectId === projectId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  add: (activity: Omit<Activity, 'id'>): Activity => {
    const newActivity: Activity = {
      ...activity,
      id: `act-${Date.now()}`,
    };
    activities.unshift(newActivity);
    return newActivity;
  },

  addFromIssueUpdate: (issue: Issue, randomValue: number): Activity => {
    const actor = mockUsers[Math.floor(randomValue * mockUsers.length) % mockUsers.length];
    const templates: Array<{ type: Activity['type']; detail: string }> = [
      { type: 'status_changed', detail: `Updated status on ${issue.key}` },
      { type: 'assigned', detail: `Reassigned ${issue.key}` },
      { type: 'commented', detail: `Commented on ${issue.key}` },
    ];
    const selected = templates[Math.floor(randomValue * templates.length) % templates.length];
    return activityApi.add({
      type: selected.type,
      actor,
      targetId: issue.id,
      targetKey: issue.key,
      targetTitle: issue.title,
      detail: selected.detail,
      createdAt: new Date().toISOString(),
      projectId: issue.projectId,
    });
  },
};
