import { Plus } from 'lucide-react';
import { Button } from '@app/components/ui/Button';
import { TasksViewToggle } from '@app/components/tasks/TasksViewToggle';
import type { TasksHeaderProps } from '@app/types/tasks';

export function TasksHeader({ view, onViewChange, onCreate }: TasksHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-xl font-bold tracking-tight">Tasks</h1>
      <div className="flex flex-wrap items-center gap-2">
        <TasksViewToggle view={view} onChange={onViewChange} />
        <Button size="sm" onClick={onCreate}>
          <Plus className="h-4 w-4" />
          New Task
        </Button>
      </div>
    </div>
  );
}
