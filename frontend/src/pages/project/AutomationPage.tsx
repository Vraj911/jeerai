import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EmptyState } from '@/components/shared/EmptyState';
import {
  useAutomationRules,
  useCreateAutomationRule,
  useUpdateAutomationRule,
  useDeleteAutomationRule,
  useToggleAutomationRule,
} from '@/queries/automation.queries';
import { useUsers } from '@/queries/user.queries';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type {
  AutomationRule,
  TriggerType,
  ConditionType,
  ActionType,
} from '@/types/automation';
import type { User } from '@/types/user';
import { STATUS_LABELS, PRIORITY_LABELS } from '@/lib/constants';
import { Plus, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const TRIGGER_OPTIONS: { value: TriggerType; label: string }[] = [
  { value: 'issue_created', label: 'Issue Created' },
  { value: 'status_change', label: 'Status Changed' },
  { value: 'assignee_change', label: 'Assignee Updated' },
  { value: 'priority_change', label: 'Priority Changed' },
];
const CONDITION_OPTIONS: { value: ConditionType; label: string }[] = [
  { value: 'status_is', label: 'Status equals' },
  { value: 'priority_is', label: 'Priority equals' },
  { value: 'assignee_is', label: 'Assignee equals' },
  { value: 'label_contains', label: 'Label contains' },
];
const ACTION_OPTIONS: { value: ActionType; label: string }[] = [
  { value: 'change_status', label: 'Change Status' },
  { value: 'assign_user', label: 'Assign User' },
  { value: 'add_label', label: 'Add Label' },
  { value: 'send_notification', label: 'Send Notification' },
];
const STATUS_OPTIONS = Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label }));
const PRIORITY_OPTIONS = Object.entries(PRIORITY_LABELS).map(([value, label]) => ({ value, label }));
const EMPTY_TRIGGER_VALUE = '__any__';
const EMPTY_ACTION_VALUE = '__none__';
function findUserName(users: User[], id: string): string {
  return users.find((u) => u.id === id)?.name ?? id;
}
function formatTriggerValue(type: TriggerType, value: string, users: User[]): string {
  if (type === 'status_change') return STATUS_LABELS[value] ?? value;
  if (type === 'priority_change') return PRIORITY_LABELS[value] ?? value;
  if (type === 'assignee_change') return findUserName(users, value);
  return value || 'any';
}
function formatConditionValue(type: ConditionType, value: string, users: User[]): string {
  if (type === 'status_is') return STATUS_LABELS[value] ?? value;
  if (type === 'priority_is') return PRIORITY_LABELS[value] ?? value;
  if (type === 'assignee_is') return findUserName(users, value);
  return value;
}
function formatActionValue(type: ActionType, value: string, users: User[]): string {
  if (type === 'assign_user') return findUserName(users, value);
  if (type === 'change_status') return STATUS_LABELS[value] ?? value;
  return value;
}
function normalizeTriggerValueForState(type: TriggerType, value: string) {
  return type === 'issue_created' ? value || EMPTY_TRIGGER_VALUE : value;
}
function normalizeActionValueForState(type: ActionType, value: string) {
  return type === 'send_notification' ? value || EMPTY_ACTION_VALUE : value;
}
function normalizeTriggerValueForPayload(value: string) {
  return value === EMPTY_TRIGGER_VALUE ? '' : value;
}
function normalizeActionValueForPayload(value: string) {
  return value === EMPTY_ACTION_VALUE ? '' : value;
}
interface RuleBuilderProps {
  projectId: string;
  onClose: () => void;
  editRule?: AutomationRule | null;
  users: User[];
}
function RuleBuilder({ projectId, onClose, editRule, users }: RuleBuilderProps) {
  const { toast } = useToast();
  const createRule = useCreateAutomationRule();
  const updateRule = useUpdateAutomationRule();
  const [name, setName] = useState(editRule?.name ?? '');
  const [triggerType, setTriggerType] = useState<TriggerType>(
    (editRule?.trigger.type as TriggerType) ?? 'issue_created'
  );
  const [triggerValue, setTriggerValue] = useState(
    normalizeTriggerValueForState((editRule?.trigger.type as TriggerType) ?? 'issue_created', editRule?.trigger.value ?? '')
  );
  const [conditions, setConditions] = useState<Array<{ type: ConditionType; value: string }>>(
    editRule?.conditions ?? []
  );
  const [actionType, setActionType] = useState<ActionType>(
    (editRule?.action.type as ActionType) ?? 'change_status'
  );
  const [actionValue, setActionValue] = useState(
    normalizeActionValueForState((editRule?.action.type as ActionType) ?? 'change_status', editRule?.action.value ?? '')
  );
  const getTriggerValueOptions = () => {
    if (triggerType === 'status_change') return STATUS_OPTIONS;
    if (triggerType === 'priority_change') return PRIORITY_OPTIONS;
    if (triggerType === 'assignee_change') return users.map((u) => ({ value: u.id, label: u.name }));
    return [{ value: EMPTY_TRIGGER_VALUE, label: 'Any' }];
  };
  const getActionValueOptions = () => {
    if (actionType === 'change_status') return STATUS_OPTIONS;
    if (actionType === 'assign_user') return users.map((u) => ({ value: u.id, label: u.name }));
    if (actionType === 'add_label') return [{ value: 'critical', label: 'critical' }];
    return [{ value: EMPTY_ACTION_VALUE, label: 'No extra value' }];
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const payload = {
      name: name.trim(),
      projectId,
      trigger: { type: triggerType, value: normalizeTriggerValueForPayload(triggerValue) },
      conditions,
      action: { type: actionType, value: normalizeActionValueForPayload(actionValue) },
      enabled: true,
    };
    if (editRule) {
      updateRule.mutate({ id: editRule.id, data: payload }, { onSuccess: onClose });
      return;
    }
    createRule.mutate(payload, {
      onSuccess: () => {
        toast({ title: 'Rule created', description: 'Automation rule has been created.' });
        onClose();
      },
    });
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-md border p-4 bg-background">
      <div className="space-y-2">
        <Label>Rule Name</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Auto-assign on Review" />
      </div>
      <div className="space-y-3">
        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">WHEN</div>
        <div className="flex gap-2 flex-wrap">
          <Select
            value={triggerType}
            onValueChange={(v) => {
              const nextType = v as TriggerType;
              setTriggerType(nextType);
              setTriggerValue(normalizeTriggerValueForState(nextType, ''));
            }}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              {TRIGGER_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
          {getTriggerValueOptions().length > 0 && (
            <Select value={triggerValue} onValueChange={setTriggerValue}>
              <SelectTrigger className="w-32"><SelectValue placeholder="Select..." /></SelectTrigger>
              <SelectContent>
                {getTriggerValueOptions().map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">IF</div>
          <Button type="button" variant="ghost" size="sm" onClick={() => setConditions((p) => [...p, { type: 'status_is', value: 'todo' }])}>
            <Plus className="h-3.5 w-3.5 mr-1" />Add condition
          </Button>
        </div>
        {conditions.map((cond, i) => (
          <div key={i} className="flex gap-2 items-center">
            <Select value={cond.type} onValueChange={(v) => setConditions((p) => p.map((c, idx) => idx === i ? { ...c, type: v as ConditionType } : c))}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>{CONDITION_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={cond.value} onValueChange={(v) => setConditions((p) => p.map((c, idx) => idx === i ? { ...c, value: v } : c))}>
              <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                {cond.type === 'status_is' && STATUS_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                {cond.type === 'priority_is' && PRIORITY_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                {cond.type === 'assignee_is' && users.map((u) => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                {cond.type === 'label_contains' && <SelectItem value="critical">critical</SelectItem>}
              </SelectContent>
            </Select>
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setConditions((p) => p.filter((_, idx) => idx !== i))}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
      </div>
      <div className="space-y-3">
        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">THEN</div>
        <div className="flex gap-2 flex-wrap">
          <Select
            value={actionType}
            onValueChange={(v) => {
              const nextType = v as ActionType;
              setActionType(nextType);
              setActionValue(normalizeActionValueForState(nextType, ''));
            }}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>{ACTION_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={actionValue} onValueChange={setActionValue}>
            <SelectTrigger className="w-32"><SelectValue placeholder="Select..." /></SelectTrigger>
            <SelectContent>{getActionValueOptions().map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onClose}>Cancel</Button>
        <Button type="submit" size="sm" disabled={!name.trim()}>{editRule ? 'Update Rule' : 'Create Rule'}</Button>
      </div>
    </form>
  );
}
export default function AutomationPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: rules, isLoading } = useAutomationRules(projectId ?? '');
  const { data: users = [] } = useUsers();
  const toggleRule = useToggleAutomationRule();
  const deleteRule = useDeleteAutomationRule();
  const { toast } = useToast();
  const [builderOpen, setBuilderOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<AutomationRule | null>(null);
  if (isLoading) {
    return (
      <PageContainer title="Automation">
        <Skeleton className="h-48 w-full" />
      </PageContainer>
    );
  }
  const ruleList = rules ?? [];
  return (
    <PageContainer title="Automation">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            Create rules to automate workflows. Triggers fire when conditions are met.
          </p>
          <Button size="sm" onClick={() => { setEditingRule(null); setBuilderOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" />Create Rule
          </Button>
        </div>
        {builderOpen && (
          <RuleBuilder
            projectId={projectId ?? ''}
            users={users}
            onClose={() => {
              setBuilderOpen(false);
              setEditingRule(null);
            }}
            editRule={editingRule}
          />
        )}
        {ruleList.length === 0 && !builderOpen ? (
          <EmptyState
            title="No automation rules"
            description="Create automation rules to streamline your workflow."
          />
        ) : (
          <div className="space-y-3">
            {ruleList.map((rule) => (
              <div key={rule.id} className="rounded-md border p-4 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-sm font-medium">{rule.name}</h3>
                    <Switch
                      checked={rule.enabled}
                      onCheckedChange={(checked) => toggleRule.mutate({ id: rule.id, enabled: checked })}
                      aria-label={`Toggle ${rule.name}`}
                    />
                  </div>
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    <Badge variant="secondary">
                      WHEN {rule.trigger.type.replace(/_/g, ' ')}: {formatTriggerValue(rule.trigger.type as TriggerType, rule.trigger.value, users)}
                    </Badge>
                    {rule.conditions.length > 0 && (
                      rule.conditions.map((c, i) => (
                        <Badge key={i} variant="outline">
                          IF {c.type.replace(/_/g, ' ')}: {formatConditionValue(c.type as ConditionType, c.value, users)}
                        </Badge>
                      ))
                    )}
                    <Badge variant="secondary">
                      THEN {rule.action.type.replace(/_/g, ' ')}: {formatActionValue(rule.action.type as ActionType, rule.action.value, users)}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => { setEditingRule(rule); setBuilderOpen(true); }}>Edit</Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => deleteRule.mutate(rule.id, { onSuccess: () => toast({ title: 'Rule deleted' }) })} >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
