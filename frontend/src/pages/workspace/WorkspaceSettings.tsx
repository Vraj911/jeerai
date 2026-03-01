import { PageContainer } from '@/components/layout/PageContainer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function WorkspaceSettings() {
  return (
    <PageContainer title="Workspace Settings">
      <div className="max-w-lg space-y-6">
        <div className="space-y-2">
          <Label>Workspace Name</Label>
          <Input defaultValue="My Workspace" />
        </div>
        <div className="space-y-2">
          <Label>Workspace URL</Label>
          <Input defaultValue="my-workspace" disabled />
        </div>
        <Button size="sm">Save Changes</Button>
      </div>
    </PageContainer>
  );
}
