import { PageContainer } from '@/components/layout/PageContainer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useParams } from 'react-router-dom';
import { mockProjects } from '@/lib/mockAdapter';

export default function ProjectSettings() {
  const { projectId } = useParams<{ projectId: string }>();
  const project = mockProjects.find((p) => p.id === projectId);

  return (
    <PageContainer title="Settings">
      <Tabs defaultValue="general" className="max-w-lg">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>
        <TabsContent value="general" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Project Name</Label>
            <Input defaultValue={project?.name} />
          </div>
          <div className="space-y-2">
            <Label>Key</Label>
            <Input defaultValue={project?.key} disabled className="font-mono" />
          </div>
          <Button size="sm">Save</Button>
        </TabsContent>
        <TabsContent value="members" className="mt-4">
          <p className="text-sm text-muted-foreground">Member management available in Phase 2.</p>
        </TabsContent>
        <TabsContent value="permissions" className="mt-4">
          <p className="text-sm text-muted-foreground">Permission settings available in Phase 2.</p>
        </TabsContent>
        <TabsContent value="integrations" className="mt-4">
          <p className="text-sm text-muted-foreground">Integrations available in Phase 2.</p>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
