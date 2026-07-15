import { useLocation } from 'react-router-dom';
import { PanelLeft } from 'lucide-react';
import { useUiStore } from '@app/stores/uiStore';
import { Button } from '@app/components/ui/Button';

const titles: Record<string, string> = {
  '/': 'Dashboard',
  '/tasks': 'Tasks',
  '/planner': 'Planner',
  '/goals': 'Goals',
  '/activity': 'Activity',
  '/reports': 'Reports',
  '/settings': 'Settings',
};

export function TopBar() {
  const { pathname } = useLocation();
  const { sidebarCollapsed, toggleSidebar } = useUiStore();
  const title = titles[pathname] ?? 'GoalOS';

  return (
    <div className="flex h-14 shrink-0 items-center gap-3 border-b border-[var(--border)] bg-[var(--surface)]/80 px-4 backdrop-blur-md">
      {sidebarCollapsed && (
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          aria-label="Expand sidebar"
          className="text-[var(--text-muted)]"
        >
          <PanelLeft className="h-4 w-4" />
        </Button>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-[var(--text)]">{title}</p>
      </div>
      <p className="font-mono-metrics hidden text-xs text-[var(--text-muted)] sm:block">
        {new Date().toLocaleDateString(undefined, {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        })}
      </p>
    </div>
  );
}
