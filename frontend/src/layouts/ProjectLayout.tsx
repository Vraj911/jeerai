import { Outlet, useParams, NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Settings, Share2 } from 'lucide-react';
import { ROUTES } from '@/routes/routeConstants';
import { useProject } from '@/queries/project.queries';
import { useToast } from '@/hooks/use-toast';
const projectTabs = [
  { label: 'Overview', path: '' },
  { label: 'Board', path: '/board' },
  { label: 'Backlog', path: '/backlog' },
  { label: 'Issues', path: '/issues' },
  { label: 'Analytics', path: '/analytics' },
  { label: 'Automation', path: '/automation' },
];
export function ProjectLayout() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: project } = useProject(projectId ?? '');
  const { toast } = useToast();
  const basePath = `/app/projects/${projectId}`;
  const handleShare = async () => {
    if (!projectId) {
      return;
    }
    const shareUrl = `${window.location.origin}${basePath}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: project?.name ?? 'Project',
          text: `Open ${project?.name ?? 'this project'} in Jeerai`,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast({ title: 'Project link copied', description: shareUrl });
      }
    } catch (error) {
      if ((error as Error)?.name !== 'AbortError') {
        toast({ title: 'Share failed', description: 'Unable to share the project link.', variant: 'destructive' });
      }
    }
  };
  return (
    <div className="flex flex-col h-full">
      <div className="border-b bg-gradient-to-b from-muted/70 to-background">
        <div className="flex items-center justify-between px-6 py-2 gap-3">
          {project && (
            <div className="flex items-center gap-3 min-w-0">
              <Avatar className="h-7 w-7 rounded-md">
                <AvatarFallback className="rounded-md text-[11px] font-semibold">
                  {project.key.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate text-foreground">{project.name}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  {project.members.slice(0, 3).map((member) => (
                    <Avatar key={member.id} className="h-5 w-5 rounded-md border">
                      <AvatarFallback className="rounded-md text-[9px]">
                        {member.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {project.members.length > 3 && (
                    <span className="text-[10px] text-muted-foreground">+{project.members.length - 3}</span>
                  )}
                </div>
              </div>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              asChild>
              <NavLink to={ROUTES.PROJECT.SETTINGS(projectId ?? '')}>
                <Settings className="h-3.5 w-3.5 mr-1" />
                Settings
              </NavLink>
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => void handleShare()}>
              <Share2 className="h-3.5 w-3.5 mr-1" />
              Share
            </Button>
          </div>
        </div>
      </div>
      <div className="flex items-center border-b px-6 gap-1 overflow-x-auto shrink-0">
        {projectTabs.map((tab) => (
          <NavLink
            key={tab.path}
            to={`${basePath}${tab.path}`}
            end={tab.path === ''}
            className={({ isActive }) =>
              cn(
                'py-2.5 px-3 text-sm border-b-2 -mb-px whitespace-nowrap transition-colors',
                isActive
                  ? 'border-primary text-foreground font-medium'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )
            }>
            {tab.label}
          </NavLink>
        ))}
      </div>
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}
