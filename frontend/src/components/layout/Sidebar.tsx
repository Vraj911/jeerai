import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/ui.store';
import { useNotificationStore } from '@/store/notification.store';
import { ROUTES } from '@/routes/routeConstants';
import { APP_NAME, SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from '@/lib/constants';
import {
  LayoutDashboard,
  FolderKanban,
  Activity,
  Bot,
  Bell,
  PanelLeftClose,
  PanelLeft,
  Users,
  Settings,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface NavItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  badge?: number;
  pulse?: boolean;
}

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, activityPulse, setActivityPulse } = useUIStore();
  const { notifications } = useNotificationStore();
  const location = useLocation();
  const unreadCount = notifications.filter((n) => !n.read).length;

  const navItems: NavItem[] = [
    { label: 'Dashboard', icon: LayoutDashboard, path: ROUTES.APP.DASHBOARD },
    { label: 'Projects', icon: FolderKanban, path: ROUTES.APP.PROJECTS },
    { label: 'Members', icon: Users, path: ROUTES.APP.MEMBERS },
    { label: 'Activity', icon: Activity, path: ROUTES.APP.ACTIVITY, pulse: activityPulse },
    { label: 'AI Workspace', icon: Bot, path: ROUTES.APP.AI },
    { label: 'Notifications', icon: Bell, path: ROUTES.APP.NOTIFICATIONS, badge: unreadCount },
  ];

  const bottomItems: NavItem[] = [
    { label: 'Settings', icon: Settings, path: ROUTES.APP.WORKSPACE_SETTINGS },
  ];

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  const renderItem = (item: NavItem) => {
    const active = isActive(item.path);
    const content = (
      <Link
        to={item.path}
        onClick={() => {
          if (item.path === ROUTES.APP.ACTIVITY) {
            setActivityPulse(false);
          }
        }}
        className={cn(
          'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-[border-color,background-color,filter] duration-200 border border-transparent relative',
          active
            ? 'bg-accent text-foreground font-medium border-border'
            : 'text-muted-foreground hover:bg-accent hover:text-foreground hover:brightness-[0.99] hover:border-border/70 active:brightness-95'
        )}
      >
        <item.icon className="h-4 w-4 shrink-0" />
        {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
        {item.pulse && (
          <span
            aria-label="New activity"
            className={cn(
              'h-2 w-2 rounded-full bg-primary shrink-0',
              sidebarCollapsed ? 'absolute top-1.5 right-1.5' : 'ml-auto'
            )}
          />
        )}
        {item.badge !== undefined && item.badge > 0 && (
          <span
            className={cn(
              'flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-medium',
              sidebarCollapsed ? 'absolute -top-0.5 -right-0.5 h-3.5 w-3.5' : 'ml-auto h-4 min-w-[16px] px-1'
            )}
          >
            {item.badge}
          </span>
        )}
      </Link>
    );

    if (sidebarCollapsed) {
      return (
        <Tooltip key={item.path} delayDuration={0}>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right" className="text-xs">
            {item.label}
          </TooltipContent>
        </Tooltip>
      );
    }

    return <div key={item.path}>{content}</div>;
  };

  return (
    <aside
      className="flex flex-col border-r bg-sidebar transition-[width] duration-200 ease-in-out shrink-0"
      style={{ width: sidebarCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH }}
    >
      <div className="flex h-12 items-center border-b px-3 gap-2">
        <div className="h-6 w-6 rounded-md bg-primary flex items-center justify-center text-[10px] font-bold text-primary-foreground shrink-0">
          J2
        </div>
        {!sidebarCollapsed && (
          <span className="text-sm font-semibold text-foreground truncate">
            {APP_NAME}
          </span>
        )}
        <button
          onClick={toggleSidebar}
          className="ml-auto p-1 rounded-md hover:bg-accent text-muted-foreground"
          aria-label="Toggle sidebar"
        >
          {sidebarCollapsed ? (
            <PanelLeft className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </button>
      </div>

      <nav className="flex-1 py-2 px-2 space-y-0.5" aria-label="Primary">
        {navItems.map(renderItem)}
      </nav>

      <div className="border-t py-2 px-2 space-y-0.5">
        {bottomItems.map(renderItem)}
      </div>
    </aside>
  );
}
