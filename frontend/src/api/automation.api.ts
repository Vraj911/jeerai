import { mockAutomationRules as initialRules } from '@/lib/mockAdapter';
import type { AutomationRule } from '@/types/automation';

let rules = [...initialRules];

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const automationApi = {
  getByProject: async (projectId: string): Promise<AutomationRule[]> => {
    await delay(200);
    return rules.filter((r) => r.projectId === projectId);
  },

  create: async (data: Omit<AutomationRule, 'id' | 'createdAt'>): Promise<AutomationRule> => {
    await delay(200);
    const newRule: AutomationRule = {
      ...data,
      id: `auto-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    rules = [newRule, ...rules];
    return newRule;
  },

  update: async (id: string, data: Partial<AutomationRule>): Promise<AutomationRule> => {
    await delay(150);
    rules = rules.map((r) => (r.id === id ? { ...r, ...data } : r));
    const updated = rules.find((r) => r.id === id);
    if (!updated) throw new Error('Rule not found');
    return updated;
  },

  delete: async (id: string): Promise<void> => {
    await delay(100);
    rules = rules.filter((r) => r.id !== id);
  },

  toggle: async (id: string, enabled: boolean): Promise<AutomationRule> => {
    return automationApi.update(id, { enabled });
  },
};
