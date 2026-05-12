import { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageContainer } from '@/components/layout/PageContainer';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useProject, useProjectPermissions, useUpdateProject, useUpdateProjectPermissions } from '@/queries/project.queries';
import { useWorkspaceMembers } from '@/queries/workspace.queries';
import { useSessionStore } from '@/store/session.store';
import type { ProjectPermissionKey, ProjectPermissions } from '@/types/project';
import type { WorkspaceRole } from '@/types/workspace';

const ROLES: WorkspaceRole[] = ['ADMIN', 'MEMBER', 'VIEWER'];
const PERMISSIONS: Array<{ key: ProjectPermissionKey; label: string }> = [
  { key: 'CREATE_ISSUES', label: 'Create issues' },
  { key: 'EDIT_ISSUES', label: 'Edit issues' },
  { key: 'DELETE_ISSUES', label: 'Delete issues' },
  { key: 'MANAGE_PROJECT', label: 'Manage project' },
  { key: 'VIEW_ANALYTICS', label: 'View analytics' },
];

export default function ProjectSettings() {
  const { projectId } = useParams<{ projectId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: project, isLoading } = useProject(projectId ?? '');
  const { data: projectPermissions } = useProjectPermissions(projectId);
  const updateProject = useUpdateProject();
  const updateProjectPermissions = useUpdateProjectPermissions();
  const currentWorkspace = useSessionStore((state) => state.currentWorkspace);
  const currentRole = useSessionStore((state) => state.currentRole);
  const { data: workspaceMembers = [] } = useWorkspaceMembers(currentWorkspace?.id);
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [permissionMatrix, setPermissionMatrix] = useState<ProjectPermissions['permissions']>({} as ProjectPermissions['permissions']);
  const [permissionDirty, setPermissionDirty] = useState(false);
  const [activeTab, setActiveTab] = useState(() => searchParams.get('tab') ?? 'general');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'general' || tab === 'members' || tab === 'permissions') {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description);
    }
  }, [project]);

  useEffect(() => {
    if (projectPermissions?.permissions) {
      setPermissionMatrix(projectPermissions.permissions);
      setPermissionDirty(false);
    }
  }, [projectPermissions]);

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

  const handlePermissionChange = (role: WorkspaceRole, perm: ProjectPermissionKey, checked: boolean) => {
    setPermissionMatrix((prev) => ({
      ...prev,
      [role]: { ...(prev[role] ?? {}), [perm]: checked },
    }));
    setPermissionDirty(true);
  };

  const handleSavePermissions = () => {
    updateProjectPermissions.mutate(
      { id: project.id, data: { projectId: project.id, permissions: permissionMatrix } },
      {
        onSuccess: () => {
          setPermissionDirty(false);
          toast({ title: 'Permissions saved', description: 'Project permissions updated successfully.' });
        },
      }
    );
  };

  const onTabChange = (v: string) => {
    setActiveTab(v);
    const next = new URLSearchParams(searchParams);
    if (v === 'general') next.delete('tab');
    else next.set('tab', v);
    setSearchParams(next, { replace: true });
  };

  return (
    <PageContainer title="Settings">
      <Tabs value={activeTab} onValueChange={onTabChange} className="max-w-2xl">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Project Name</Label>
            <Input value={projectName} onChange={(e) => setName(e.target.value)} placeholder="Project name" />
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
          <div className="mb-4 rounded-md border p-3 text-sm text-muted-foreground">
            Project members are currently inherited from the workspace. Roles shown here are workspace roles, not a separate project-specific permission model.
          </div>
          <div className="rounded-md border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Member</th>
                  <th className="text-left p-3 font-medium">Workspace Role</th>
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
                      {(() => {
                        const workspaceMember = workspaceMembers.find((entry) => entry.user.id === member.id);
                        const isLead = project.lead?.id === member.id;
                        return (
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{workspaceMember?.role ?? 'MEMBER'}</Badge>
                            {isLead && <Badge variant="outline">Project Lead</Badge>}
                          </div>
                        );
                      })()}
                    </td>
                    <td className="p-3 text-right text-muted-foreground">Manage in workspace settings</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="permissions" className="mt-4 space-y-4">
          <div className="flex items-center justify-between gap-3 rounded-md border p-3 text-sm">
            <div className="text-muted-foreground">These permissions are persisted and enforced by the backend.</div>
            <Button size="sm" onClick={handleSavePermissions} disabled={!permissionDirty || updateProjectPermissions.isPending}>
              Save permissions
            </Button>
          </div>
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
                {PERMISSIONS.map(({ key, label }) => (
                  <tr key={key} className="border-b last:border-0">
                    <td className="p-3">{label}</td>
                    {ROLES.map((role) => (
                      <td key={role} className="p-3 text-center">
                        <Checkbox
                          checked={permissionMatrix[role]?.[key] ?? false}
                          onCheckedChange={(checked) => handlePermissionChange(role, key, checked === true)}
                          aria-label={`${label} for ${role}`}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
