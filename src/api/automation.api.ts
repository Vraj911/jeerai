import { mockAutomationRules } from '@/lib/mockAdapter';
import type { AutomationRule } from '@/types/automation';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const automationApi = {
  getByProject: async (projectId: string): Promise<AutomationRule[]> => {
    await delay(200);
    return mockAutomationRules.filter((r) => r.projectId === projectId);
  },
};
