import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  Target,
  Activity,
  BarChart3,
  Settings,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';
import { cn } from '@app/lib/cn';
import { useUiStore } from '@app/stores/uiStore';
import { Button } from '@app/components/ui/Button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@app/components/ui/Tooltip';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/tasks', label: 'Tasks', icon: CheckSquare },
  { to: '/planner', label: 'Planner', icon: Calendar },
  { to: '/goals', label: 'Goals', icon: Target },
  { to: '/activity', label: 'Activity', icon: Activity },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
];

function NavItem({
  to,
  label,
  icon: Icon,
  end,
  collapsed,
}: {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  end?: boolean;
  collapsed: boolean;
}) {
  const link = (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
          collapsed && 'justify-center px-0',
          isActive
            ? 'bg-teal-500/20 text-white'
            : 'text-[var(--sidebar-text)] hover:bg-white/10 hover:text-white',
        )
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-teal-400" />
          )}
          <Icon className={cn('h-5 w-5 shrink-0', isActive && 'text-teal-300')} />
          {!collapsed && <span>{label}</span>}
        </>
      )}
    </NavLink>
  );

  if (!collapsed) return link;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUiStore();

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          'sticky top-0 flex h-full shrink-0 flex-col self-start border-r border-white/5 bg-[var(--sidebar)] text-white transition-[width] duration-300 ease-out',
          sidebarCollapsed ? 'w-[68px]' : 'w-60',
        )}
      >
        <div
          className={cn(
            'flex h-16 items-center border-b border-white/10',
            sidebarCollapsed ? 'justify-center px-2' : 'justify-between px-4',
          )}
        >
          {!sidebarCollapsed && (
            <div className="min-w-0">
              <p className="truncate text-base font-bold tracking-tight">GoalOS</p>
              <p className="truncate text-[11px] text-[var(--sidebar-muted)]">Local-first focus</p>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="text-[var(--sidebar-text)] hover:bg-white/10 hover:text-white"
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </Button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-2">
          {navItems.map((item) => (
            <NavItem
              key={item.to}
              to={item.to}
              label={item.label}
              icon={item.icon}
              end={item.end}
              collapsed={sidebarCollapsed}
            />
          ))}
        </nav>
      </aside>
    </TooltipProvider>
  );
}
