import { Outlet, useParams, NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { mockProjects } from '@/lib/mockAdapter';

const projectTabs = [
  { label: 'Overview', path: '' },
  { label: 'Board', path: '/board' },
  { label: 'Backlog', path: '/backlog' },
  { label: 'Issues', path: '/issues' },
  { label: 'Analytics', path: '/analytics' },
  { label: 'Automation', path: '/automation' },
  { label: 'Settings', path: '/settings' },
];

export function ProjectLayout() {
  const { projectId } = useParams<{ projectId: string }>();
  const project = mockProjects.find((p) => p.id === projectId);
  const basePath = `/app/projects/${projectId}`;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center border-b px-6 gap-1 overflow-x-auto shrink-0">
        {project && (
          <span className="text-sm font-medium mr-4 shrink-0 text-foreground">
            {project.name}
          </span>
        )}
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
            }
          >
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
