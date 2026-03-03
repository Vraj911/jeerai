import { useState, useEffect } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useParams } from 'react-router-dom';
import { useProject, useUpdateProject } from '@/queries/project.queries';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';

const ROLES = ['Admin', 'Developer', 'Viewer'] as const;
const PERMISSIONS = ['Create issues', 'Edit issues', 'Delete issues', 'Manage project', 'View analytics'] as const;

const MOCK_INTEGRATIONS = [
  { id: 'github', name: 'GitHub', description: 'Link commits and pull requests' },
  { id: 'slack', name: 'Slack', description: 'Get notifications in channels' },
  { id: 'email', name: 'Email', description: 'Email notifications for updates' },
];

export default function ProjectSettings() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: project, isLoading } = useProject(projectId ?? '');
  const updateProject = useUpdateProject();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [memberRoles, setMemberRoles] = useState<Record<string, string>>({});
  const [permissionMatrix, setPermissionMatrix] = useState<Record<string, Record<string, boolean>>>({});
  const [integrations, setIntegrations] = useState<Record<string, boolean>>({
    github: false,
    slack: false,
    email: false,
  });

  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description);
    }
  }, [project]);

  if (isLoading || !project) {
    return (
      <PageContainer title="Settings">
        <Skeleton className="h-64 w-full" />
      </PageContainer>
    );
  }

  const projectName = name || project.name;
  const projectDesc = description !== '' ? description : project.description;
  const members = project.members;

  const handleSaveGeneral = () => {
    updateProject.mutate(
      { id: project.id, data: { name: projectName, description: projectDesc } },
      {
        onSuccess: () => {
          toast({ title: 'Settings saved', description: 'Project settings updated successfully.' });
        },
      }
    );
  };

  const handleRoleChange = (userId: string, role: string) => {
    setMemberRoles((prev) => ({ ...prev, [userId]: role }));
    toast({ title: 'Role updated', description: 'Member role has been changed.' });
  };

  const handleRemoveMember = (userId: string) => {
    toast({ title: 'Member removed', description: 'Member has been removed from the project.' });
  };

  const handlePermissionChange = (role: string, perm: string, checked: boolean) => {
    setPermissionMatrix((prev) => ({
      ...prev,
      [role]: { ...(prev[role] ?? {}), [perm]: checked },
    }));
    toast({ title: 'Permissions updated', description: 'Permission matrix has been updated.' });
  };

  const handleIntegrationToggle = (id: string, enabled: boolean) => {
    setIntegrations((prev) => ({ ...prev, [id]: enabled }));
    toast({
      title: enabled ? 'Integration enabled' : 'Integration disabled',
      description: `${MOCK_INTEGRATIONS.find((i) => i.id === id)?.name} has been ${enabled ? 'enabled' : 'disabled'}.`,
    });
  };

  return (
    <PageContainer title="Settings">
      <Tabs defaultValue="general" className="max-w-2xl">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>
        <TabsContent value="general" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Project Name</Label>
            <Input
              value={projectName}
              onChange={(e) => setName(e.target.value)}
              placeholder="Project name"
            />
          </div>
          <div className="space-y-2">
            <Label>Key</Label>
            <Input value={project.key} disabled className="font-mono" />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={projectDesc}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Project description"
              rows={3}
            />
          </div>
          <Button size="sm" onClick={handleSaveGeneral}>
            Save
          </Button>
        </TabsContent>
        <TabsContent value="members" className="mt-4">
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Member</th>
                  <th className="text-left p-3 font-medium">Role</th>
                  <th className="text-right p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr key={member.id} className="border-b last:border-0">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-[10px]">{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span>{member.name}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <Select
                        value={memberRoles[member.id] ?? 'Developer'}
                        onValueChange={(v) => handleRoleChange(member.id, v)}
                      >
                        <SelectTrigger className="h-8 w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ROLES.map((r) => (
                            <SelectItem key={r} value={r}>
                              {r}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-destructive hover:text-destructive"
                        onClick={() => handleRemoveMember(member.id)}
                      >
                        Remove
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
        <TabsContent value="permissions" className="mt-4">
          <div className="rounded-md border overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium w-32">Permission</th>
                  {ROLES.map((role) => (
                    <th key={role} className="text-center p-3 font-medium">
                      {role}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PERMISSIONS.map((perm) => (
                  <tr key={perm} className="border-b last:border-0">
                    <td className="p-3">{perm}</td>
                    {ROLES.map((role) => (
                      <td key={role} className="p-3 text-center">
                        <Checkbox
                          checked={permissionMatrix[role]?.[perm] ?? (role === 'Admin')}
                          onCheckedChange={(checked) =>
                            handlePermissionChange(role, perm, checked === true)
                          }
                          aria-label={`${perm} for ${role}`}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
        <TabsContent value="integrations" className="mt-4 space-y-4">
          {MOCK_INTEGRATIONS.map((int) => (
            <div
              key={int.id}
              className="flex items-center justify-between rounded-md border p-4"
            >
              <div>
                <p className="font-medium text-sm">{int.name}</p>
                <p className="text-xs text-muted-foreground">{int.description}</p>
              </div>
              <Switch
                checked={integrations[int.id] ?? false}
                onCheckedChange={(checked) => handleIntegrationToggle(int.id, checked)}
                aria-label={`Enable ${int.name}`}
              />
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}

