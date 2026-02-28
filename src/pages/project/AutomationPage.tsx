import { useParams } from 'react-router-dom';
import { PageContainer } from '@/components/layout/PageContainer';
import { mockAutomationRules } from '@/lib/mockAdapter';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { EmptyState } from '@/components/shared/EmptyState';

export default function AutomationPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const rules = mockAutomationRules.filter((r) => r.projectId === projectId);

  return (
    <PageContainer title="Automation">
      {rules.length === 0 ? (
        <EmptyState
          title="No automation rules"
          description="Create automation rules to streamline your workflow."
          action={{ label: 'Create Rule', onClick: () => {} }}
        />
      ) : (
        <div className="space-y-3">
          {rules.map((rule) => (
            <div key={rule.id} className="rounded-md border p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium">{rule.name}</h3>
                <Switch checked={rule.enabled} />
              </div>
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <Badge variant="secondary">WHEN {rule.trigger.type.replace(/_/g, ' ')}</Badge>
                <span className="text-muted-foreground">→</span>
                {rule.conditions.map((c, i) => (
                  <Badge key={i} variant="outline">
                    IF {c.type.replace(/_/g, ' ')}
                  </Badge>
                ))}
                {rule.conditions.length > 0 && <span className="text-muted-foreground">→</span>}
                <Badge variant="secondary">THEN {rule.action.type.replace(/_/g, ' ')}</Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
