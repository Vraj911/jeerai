export type TriggerType = 'status_change' | 'issue_created' | 'assignee_change' | 'priority_change';
export type ConditionType = 'status_is' | 'priority_is' | 'assignee_is' | 'label_contains';
export type ActionType = 'change_status' | 'assign_user' | 'add_label' | 'send_notification';

export interface AutomationRule {
  id: string;
  name: string;
  projectId: string;
  trigger: { type: TriggerType; value: string };
  conditions: Array<{ type: ConditionType; value: string }>;
  action: { type: ActionType; value: string };
  enabled: boolean;
  createdAt: string;
}
