import { useMemo } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useSessionStore } from '@/store/session.store';

function toWorkspaceSlug(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function WorkspaceSettings() {
  const currentWorkspace = useSessionStore((state) => state.currentWorkspace);

  const workspaceName = currentWorkspace?.name ?? '';
  const workspaceSlug = useMemo(() => toWorkspaceSlug(workspaceName), [workspaceName]);

  return (
    <PageContainer title="Workspace Settings">
      <div className="max-w-lg space-y-6">
        <div className="space-y-2">
          <Label>Workspace Name</Label>
          <Input value={workspaceName} disabled />
        </div>
        <div className="space-y-2">
          <Label>Workspace URL</Label>
          <Input value={workspaceSlug} disabled />
        </div>
        <Button size="sm" disabled>
          Save Changes
        </Button>
      </div>
    </PageContainer>
  );
}
